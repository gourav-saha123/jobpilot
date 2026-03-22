"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter()
  const { update } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    skills: user?.skills || "",
    qualification: user?.qualification || "",
    department: user?.department || "",
    passoutYear: user?.passoutYear || "",
    experienceYears: user?.experienceYears || "",
    bio: user?.bio || "",
    location: user?.location || "",
    linkedinUrl: user?.linkedinUrl || "",
    githubUrl: user?.githubUrl || "",
    jobType: user?.jobType || "Remote",
    expectedSalary: user?.expectedSalary || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        await update() 
        alert("Profile updated effectively! Your matches are being prioritized.")
        router.push("/jobs")
      } else {
        alert("Failed to update profile")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-white/90 border-b border-white/5 pb-2">Professional Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Technical Skills</label>
            <input name="skills" value={formData.skills} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="e.g. React, TypeScript, Node.js, AWS" />
            <p className="mt-2 text-xs text-gray-500 italic">Separate skills with commas to help our scraper match you better.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Qualification</label>
              <input name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="B.Tech" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Passout Year</label>
              <input name="passoutYear" value={formData.passoutYear} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="2024" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Department / Stream</label>
            <input name="department" value={formData.department} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="Computer Science" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Experience (Years)</label>
            <input name="experienceYears" value={formData.experienceYears} onChange={handleChange} required type="number" step="0.5" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-all" placeholder="0" />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-white/90 border-b border-white/5 pb-2">Preferences & Socials</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Short Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all resize-none" placeholder="Briefly describe your expertise..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Target Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="Remote / City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Job Type</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn URL</label>
              <input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">GitHub URL</label>
              <input name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Expected Salary (Annual)</label>
            <input name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-white/40 transition-all" placeholder="e.g. $120k / ₹15 LPA" />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button disabled={loading} type="submit" className="w-full md:w-auto bg-white text-black font-bold px-12 py-4 rounded-lg hover:bg-gray-200 transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-white/5">
          {loading ? "Syncing Profile..." : "Save Profile & Find Matches"}
        </button>
      </div>
    </form>
  )
}
