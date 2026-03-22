"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function JobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 5

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
    setJobs([])
    setStatusMessage("Initializing discovery...")
    try {
      const res = await fetch("/api/jobs/scrape")
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No reader")

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter(Boolean)
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.status) setStatusMessage(data.status)
            if (data.jobs) setJobs(data.jobs)
          } catch (e) {
            console.warn("Parse error in stream", e)
          }
        }
      }
    } catch (err) {
      console.error(err)
      alert("Error finding jobs")
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage
  const indexOfFirstJob = indexOfLastJob - jobsPerPage
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob)
  const totalPages = Math.ceil(jobs.length / jobsPerPage)

  // @ts-ignore
  if (status === "loading" || (status === "authenticated" && !session?.user?.profileComplete)) {
    return <div className="p-6">Loading module...</div>
  }

  return (
    <div className="py-10 max-w-4xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 bg-[#0a0a0a] p-8 rounded-3xl border border-white/5">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Job Discovery</h1>
          {/* @ts-ignore */}
          <p className="text-gray-400 text-lg">Matching roles for <span className="text-white font-bold">{session?.user?.skills?.split(',')[0] || "you"}</span> and more.</p>
        </div>
        <button 
          onClick={findJobs} 
          disabled={loading}
          className="w-full sm:w-auto bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-gray-200 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-3 group"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
              Discovering...
            </>
          ) : (
            <>
              Find Better Matches
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="mb-12 flex flex-col items-center justify-center py-12 border border-white/5 rounded-3xl bg-[#0a0a0a] animate-pulse">
          <div className="text-xl font-bold text-white mb-2">{statusMessage}</div>
          <div className="text-gray-500 text-sm">Our AI is scanning remote boards & tech hubs</div>
        </div>
      )}

      <div className="grid gap-8">
        {currentJobs.map((job: any, i: number) => (
          <div key={i} className="group border border-white/5 p-8 rounded-3xl bg-[#0a0a0a] hover:bg-[#111] transition-all duration-500 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-white/10">
                  {job.location.includes("Remote") ? "Remote" : "Hybrid/On-site"}
                </span>
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                   Best Match
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-400 mb-6">
                <span className="font-bold text-gray-100 bg-white/5 px-2 py-1 rounded-lg">{job.company}</span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {job.salary}
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-2xl line-clamp-2">{job.description}</p>
            </div>

            {job.applyUrl && (
              <a 
                href={job.applyUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl active:scale-95 whitespace-nowrap"
              >
                Apply Direct
              </a>
            )}
          </div>
        ))}

        {jobs.length > jobsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-12 pb-20">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl disabled:opacity-30 hover:bg-white/5 transition-colors font-bold"
            >
              Previous
            </button>
            <span className="text-gray-400 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl disabled:opacity-30 hover:bg-white/5 transition-colors font-bold"
            >
              Next
            </button>
          </div>
        )}

        {jobs.length === 0 && !loading && (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50 backdrop-blur-sm shadow-inner">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 text-gray-500 border border-white/10">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <p className="text-white text-xl font-black mb-2">No matches found yet</p>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">Update your skills in profile or tap "Find Better Matches" to scan the deep web for new openings.</p>
          </div>
        )}
      </div>
    </div>
  )
}
