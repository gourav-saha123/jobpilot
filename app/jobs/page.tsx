"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function JobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
    } else if (status === "authenticated") {
      // @ts-ignore
      if (!session?.user?.profileComplete) {
        router.push("/profile")
      }
    }
  }, [status, session, router])

  const findJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/jobs/scrape")
      const data = await res.json()
      if (data.jobs) {
        setJobs(data.jobs)
      }
    } catch (err) {
      console.error(err)
      alert("Error finding jobs")
    } finally {
      setLoading(false)
    }
  }

  // @ts-ignore
  if (status === "loading" || (status === "authenticated" && !session?.user?.profileComplete)) {
    return <div className="p-6">Loading module...</div>
  }

  return (
    <div className="py-10 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Recommended Jobs</h1>
          {/* @ts-ignore */}
          <p className="text-gray-400">Based on your skills: <span className="text-white font-medium">{session?.user?.skills || "Not provided"}</span></p>
        </div>
        <button 
          onClick={findJobs} 
          disabled={loading}
          className="bg-white text-black font-semibold px-5 py-2.5 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {loading ? "Scraping jobs..." : "Find Matches"}
        </button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job: any, i: number) => (
          <div key={i} className="group border border-white/10 p-6 rounded-xl bg-[#0a0a0a] hover:bg-[#111] transition-colors shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-1 group-hover:text-gray-300 transition-colors">{job.title}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
              <span className="font-medium text-gray-300">{job.company}</span>
              <span>•</span>
              <span>{job.location}</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{job.description}</p>
          </div>
        ))}
        {jobs.length === 0 && !loading && (
          <div className="py-12 text-center border border-white/5 rounded-xl bg-[#0a0a0a]">
            <p className="text-gray-500">No jobs found. Click "Find Matches" to search using Playwright.</p>
          </div>
        )}
      </div>
    </div>
  )
}
