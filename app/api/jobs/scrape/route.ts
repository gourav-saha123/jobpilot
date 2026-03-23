import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import { chromium } from "playwright"

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser?.profileComplete) return NextResponse.json({ error: "Profile incomplete" }, { status: 403 })

  const skill = (dbUser.skills || "Developer").split(',')[0].trim()
  const browser = await chromium.launch({ headless: true })
  
  try {
    const page = await browser.newPage()
    await page.goto(`https://www.linkedin.com/jobs/search?keywords=${skill}&location=India&f_WT=2`, { waitUntil: "networkidle" })
    
    const rawJobs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.base-card')).map(card => ({
        title: card.querySelector('.base-search-card__title')?.textContent?.trim() || "",
        company: card.querySelector('.base-search-card__subtitle')?.textContent?.trim() || "",
        link: card.querySelector('a')?.getAttribute('href')?.split('?')[0] || "",
        location: card.querySelector('.job-search-card__location')?.textContent?.trim() || "Remote"
      })).filter(j => j.title && j.company && j.link)
    })

    const jobs = []
    for (const job of rawJobs.slice(0, 10)) {
      try {
        const saved = await prisma.job.create({
          data: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: `Remote ${skill} role found via LinkedIn.`,
            experience: "Entry/Mid",
            salary: "Competitive",
            applyUrl: job.link
          }
        })
        jobs.push(saved)
      } catch (e) { /* duplicate */ }
    }

    return NextResponse.json({ jobs: jobs.length > 0 ? jobs : rawJobs.slice(0, 5) })
  } catch (error) {
    console.error("Scrape error:", error)
    return NextResponse.json({ error: "Discovery failed" }, { status: 500 })
  } finally {
    await browser.close()
  }
}
