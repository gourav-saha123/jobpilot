import { chromium } from "playwright";

async function test_scrape() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`https://news.ycombinator.com/jobs`);

  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.athing')).map(el => {
      const titleEl = el.querySelector('.titleline > a');
      return titleEl ? titleEl.textContent?.trim() : null;
    }).filter(Boolean);
  });
  
  console.log("Found:", jobs.length);
  console.log(jobs.slice(0, 3));
  
  await browser.close();
}

test_scrape().catch(console.error);
