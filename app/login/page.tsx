"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/") // redirect to home
    }
  }, [session, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="border border-white/10 bg-[#0a0a0a] p-10 rounded-2xl flex flex-col items-center max-w-sm w-full shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Sign in to discover roles curated for your specific expertise.</p>
        
        {!session && (
          <button
            onClick={() => signIn("google")}
            className="w-full py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  )
}