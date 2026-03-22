import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import { chromium } from "playwright"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!dbUser || !dbUser.profileComplete) {
      return NextResponse.json({ error: "Profile incomplete" }, { status: 403 })
    }

    const skills = dbUser.skills || "developer"
    // Use the first skill as search term to keep it simple
    const searchTerm = skills.split(',')[0].trim().toLowerCase()

    let browser;
    let scrapedJobs = [];
    try {
      console.log(`Starting Playwright search for: ${searchTerm}`)
      browser = await chromium.launch({ headless: true })
      const page = await browser.newPage()
      
      // Hacker News Jobs doesn't aggressively block headless Playwright
      await page.goto(`https://news.ycombinator.com/jobs`, {
        waitUntil: "domcontentloaded",
        timeout: 30000 
      })

      // Extract job information
      scrapedJobs = await page.evaluate((term) => {
        const jobNodes = document.querySelectorAll('.athing')
        const items: any[] = []
        jobNodes.forEach((node) => {
          const titleEl = node.querySelector('.titleline > a')
          if (titleEl) {
            const title = titleEl.textContent?.trim() || "Unknown Title"
            const url = titleEl.getAttribute('href') || ""
            
            // Only keep jobs that somewhat match their skills, or keep all if term is generic
            if (term && !title.toLowerCase().includes(term) && !title.toLowerCase().includes("engineer") && term !== "developer") {
              return;
            }

            items.push({
              title: title,
              company: title.split(" Is ")[0] || title.split(" is ")[0] || "Found on Hacker News",
              location: "Remote / Flexible",
              description: `View application details at: ${url.startsWith('http') ? url : 'https://news.ycombinator.com/' + url}`,
              experience: "Open",
              salary: "Competitive"
            })
          }
        })
        
        // Return top 8 results
        return items.slice(0, 8)
      }, searchTerm)

    } catch (scrapingError: any) {
      console.error("Playwright scraping error:", scrapingError)
      return NextResponse.json({ error: "Failed to scrape jobs: " + scrapingError.message }, { status: 500 })
    } finally {
      if (browser) {
        await browser.close()
      }
    }

    // Save scraped jobs to Prisma DB as required by "user prisma (postgresql) to store it all"
    const savedJobs = []
    for (const job of scrapedJobs) {
      try {
        const saved = await prisma.job.create({
          data: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            experience: job.experience,
            salary: job.salary
          }
        })
        savedJobs.push(saved)
      } catch (dbErr) {
        console.error("Failed to save job to DB:", dbErr)
      }
    }

    return NextResponse.json({ success: true, jobs: savedJobs.length > 0 ? savedJobs : scrapedJobs })

  } catch (error) {
    console.error("Jobs error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
