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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        await update() // Force NextAuth to refetch session from DB so profileComplete is true globally
        alert("Profile updated successfully!")
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
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Skills (Comma separated)</label>
        <input name="skills" value={formData.skills} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" placeholder="React, Node.js, Python" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Qualification</label>
        <input name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" placeholder="e.g. B.Tech" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
        <input name="department" value={formData.department} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" placeholder="e.g. Computer Science" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Passout Year</label>
        <input name="passoutYear" value={formData.passoutYear} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" placeholder="e.g. 2024" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Experience Years</label>
        <input name="experienceYears" value={formData.experienceYears} onChange={handleChange} required type="number" step="0.5" className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" placeholder="e.g. 2" />
      </div>
      <button disabled={loading} type="submit" className="bg-white text-black font-semibold py-3 rounded-md mt-4 hover:bg-gray-200 transition-colors disabled:opacity-50">
        {loading ? "Saving..." : "Complete Profile & Go to Jobs"}
      </button>
    </form>
  )
}
