import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import { chromium } from "playwright"

const prisma = new PrismaClient()

// Helper to parse experience strings (e.g., "3+ years", "2-5 years", "Entry level")
function parseExperience(exp: string): number {
  if (!exp) return 0;
  const lowerExp = exp.toLowerCase();
  
  if (lowerExp.includes('entry') || lowerExp.includes('junior') || lowerExp.includes('associate')) return 1;
  if (lowerExp.includes('mid')) return 3;
  if (lowerExp.includes('senior')) return 5;
  if (lowerExp.includes('lead') || lowerExp.includes('staff')) return 8;
  if (lowerExp.includes('principal') || lowerExp.includes('architect')) return 10;

  const match = exp.match(/(\d+)/);
  if (match) {
    const years = parseInt(match[1]);
    return years;
  }
  return 0;
}

const NEGATIVE_KEYWORDS = ["sales", "marketing", "hr", "recruiter", "talent acquisition", "accountant", "customer support", "bpo", "telecaller"];
const TECH_ROLES = ["developer", "engineer", "software", "frontend", "backend", "fullstack", "architect", "programmer", "coder", "devops", "cloud", "data", "qa", "tester", "ui", "ux", "designer"];

export async function GET(req: Request) {
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

  const userExp = parseInt(dbUser.experienceYears || "0")
  const skills = dbUser.skills || "developer"
  const searchSkills = skills.split(',').map((s: string) => s.trim())

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (status: string, jobs?: any[]) => {
        controller.enqueue(encoder.encode(JSON.stringify({ status, jobs }) + "\n"));
      };

      let browser;
      let allScrapedJobs: any[] = [];
      
      try {
        sendUpdate("Launching secure discovery engine...");
        browser = await chromium.launch({ 
          headless: true,
          args: ["--disable-http2"] 
        })
        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 720 }
        })
        const page = await context.newPage()

        // Phase 1: WWR RSS (Global Remote)
        sendUpdate("Checking WeWorkRemotely for remote matches...");
        try {
          const wwrRes = await fetch("https://weworkremotely.com/categories/remote-programming-jobs.rss")
          const wwreXml = await wwrRes.text()
          const items = wwreXml.split('<item>')
          items.shift() 
          for (const item of items) {
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
            const linkMatch = item.match(/<link>(.*?)<\/link>/)
            if (titleMatch && linkMatch) {
              const [company, title] = titleMatch[1].split(':').map((s: string) => s.trim())
              allScrapedJobs.push({
                title: title || company,
                company: title ? company : "WWR",
                location: "Remote",
                description: `High-quality remote role.`,
                experience: "Mid/Senior",
                salary: "Competitive",
                applyUrl: linkMatch[1]
              })
            }
          }
        } catch (e) { console.error("WWR failed", e) }

        // Phase 2: Iterate ALL skills (Top 3 per skill)
        for (const skill of searchSkills) {
          sendUpdate(`Deep searching for: ${skill}...`);
          
          let skillJobsCount = 0;

          // LinkedIn
          try {
            await page.waitForTimeout(Math.random() * 1000 + 500);
            await page.goto(`https://www.linkedin.com/jobs/search?keywords=${skill}&location=India&f_WT=2`, { waitUntil: "networkidle", timeout: 45000 });
            const liJobs = await page.evaluate(() => {
              const cards = document.querySelectorAll('.base-card');
              return Array.from(cards).map(card => ({
                title: card.querySelector('.base-search-card__title')?.textContent?.trim() || "",
                company: card.querySelector('.base-search-card__subtitle')?.textContent?.trim() || "",
                link: card.querySelector('a')?.getAttribute('href') || "",
                loc: card.querySelector('.job-search-card__location')?.textContent?.trim() || "Remote"
              })).filter(j => (j.title && j.company && j.link));
            });

            for (const job of liJobs) {
              if (skillJobsCount >= 3) break;
              allScrapedJobs.push({
                title: job.title, company: job.company, location: job.loc,
                description: `LinkedIn discovery for ${skill}.`,
                experience: "Open", salary: "Competitive", applyUrl: job.link.split('?')[0]
              });
              skillJobsCount++;
            }
          } catch (e) { console.warn(`LinkedIn failed for ${skill}`) }

          // Remote.co (only if we need more for this skill)
          if (skillJobsCount < 3) {
            try {
              await page.waitForTimeout(Math.random() * 1000 + 500);
              await page.goto(`https://remote.co/remote-jobs/search?search_keywords=${skill}`, { waitUntil: "networkidle", timeout: 40000 });
              const rcoJobs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.job_listing')).map(el => ({
                  title: el.querySelector('h3')?.textContent?.trim() || "",
                  company: el.querySelector('.company > strong')?.textContent?.trim() || "",
                  link: el.querySelector('a')?.getAttribute('href') || ""
                })).filter(j => (j.title && j.company && j.link));
              });

              for (const job of rcoJobs) {
                if (skillJobsCount >= 3) break;
                allScrapedJobs.push({
                  title: job.title, company: job.company, location: "Remote",
                  description: `Remote.co discovery for ${skill}.`,
                  experience: "Open", salary: "Competitive", applyUrl: `https://remote.co${job.link}`
                });
                skillJobsCount++;
              }
            } catch (e) { console.warn(`Remote.co failed for ${skill}`) }
          }
        }

        // Phase 3: Hacker News
        sendUpdate("Checking Hacker News tech board...");
        try {
          await page.goto(`https://news.ycombinator.com/jobs`, { waitUntil: "networkidle", timeout: 30000 });
          const hnJobs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.athing')).map(node => {
              const a = node.querySelector('.titleline > a');
              return a ? { t: a.textContent?.trim() || "", u: a.getAttribute('href') || "" } : null;
            }).filter(Boolean);
          });
          for (const job of hnJobs) {
            if (!job) continue;
            allScrapedJobs.push({
              title: job.t, company: job.t.split(" Is ")[0] || "Found on HN",
              location: "Remote", description: "Hacker News tech role.",
              experience: "Open", salary: "Competitive",
              applyUrl: job.u.startsWith('http') ? job.u : 'https://news.ycombinator.com/' + job.u
            });
          }
        } catch (e) { console.warn("HN failed") }

        sendUpdate("Filtering results for your experience level...");
        
        // Final Deduplication & Strict Relevance/Experience Filtering
        const uniqueJobs = Array.from(new Map(allScrapedJobs.map(j => [j.applyUrl, j])).values());
        const finalJobs = uniqueJobs.filter(job => {
          const title = job.title.toLowerCase();
          const jobExp = parseExperience(job.experience || "");
          
          // 1. Strict Experience Filter: Max userExp + 1
          let experienceMatch = jobExp <= (userExp + 1);
          
          // 2. Seniority Guard: If user is junior, block senior/lead titles
          if (userExp <= 1 && (title.includes("senior") || title.includes("lead") || title.includes("staff") || title.includes("principal"))) {
            experienceMatch = false;
          }

          // 3. Relevance Filter: Blacklist non-tech categories
          const isBlacklisted = NEGATIVE_KEYWORDS.some(kw => title.includes(kw));
          
          // 4. Tech Focus: Title must be tech-related or contain a skill
          const isTechRole = TECH_ROLES.some(role => title.includes(role));
          const matchesSkill = searchSkills.some((skill: string) => title.includes(skill.toLowerCase()));

          const locationMatch = job.location.toLowerCase().includes("india") || job.location.toLowerCase().includes("remote") || job.location.toLowerCase().includes("global");
          
          return experienceMatch && !isBlacklisted && (isTechRole || matchesSkill) && locationMatch;
        });

        // Save to DB
        sendUpdate("Saving optimized matches...");
        const savedJobs = [];
        for (const job of finalJobs.slice(0, 30)) {
          try {
            const saved = await prisma.job.create({
              data: {
                title: job.title, company: job.company, location: job.location,
                description: job.description, experience: job.experience,
                salary: job.salary, applyUrl: job.applyUrl
              }
            });
            savedJobs.push(saved);
          } catch (e) { /* duplicate */ }
        }

        sendUpdate("Discovery complete!", savedJobs.length > 0 ? savedJobs : finalJobs.slice(0, 10));

      } catch (error) {
        console.error("Critical error:", error);
        sendUpdate("Error during discovery. Showing cached jobs.");
      } finally {
        if (browser) await browser.close();
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    },
  });
}
