# JobPilot

JobPilot is a modern, minimalist job board platform built with Next.js. It features integrated user authentication, a dark minimal UI, PostgreSQL profiles via Prisma, and an intelligent Playwright jobs scraper that automatically fetches roles tailored to your exact skills.

## Features
- **Modern Minimal UI**: Sleek, distrasction-free black background and unified dark aesthetic powered by Tailwind v4.
- **Secure Authentication**: Google sign-in integrated natively with `next-auth`.
- **User Profiles**: PostgreSQL-backed user profiles collecting dynamic skills and experience data.
- **Automated Web Scraping**: An API route powered by **Playwright** that seamlessly searches and retrieves recommended job postings (via Hacker News Jobs) based explicitly on an individual user's skills.

## Technologies Used
- Next.js (App Router)
- React & Tailwind CSS
- Prisma ORM & PostgreSQL
- NextAuth.js
- Playwright (Headless Web Scraping)

---

## How to Run Locally

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- A local PostgreSQL database (or a remote Postgres connection string)

### 2. First-time Setup
Install all dependencies (including Prisma and Playwright):
```bash
npm install
npx playwright install chromium
```

### 3. Environment Variables
Create a `.env` file in the root directory and populate it with your specific credentials:

```bash
# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobpilot?schema=public"

# NextAuth Global Settings
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_token"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 4. Database Migration
Push the Prisma schematic directly to your database:
```bash
npx prisma db push
```

### 5. Running the Application
Start the Next.js development server:
```bash
npm run dev
```

The application will be live at `http://localhost:3000`. 
- **Login**: Use your Google Account.
- **Profile**: You'll be prompted to complete your profile with your specific skills.
- **Scraping**: Once your profile is complete, navigate to the Jobs section and click "Find Matches" to activate the Playwright scraper!
