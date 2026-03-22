"use client"

import Link from 'next/link'
import { signOut, useSession } from "next-auth/react"

const Navbar = () => {
  const { data: session } = useSession()

  return (
    <nav className='mx-4 flex justify-between items-center py-4 border-b border-white/10 sticky top-0 z-50 bg-black/80 backdrop-blur-md'>
      <div>
        <Link href="/">
          <h1 className='pl-4 text-xl lg:text-2xl font-bold tracking-tighter text-white hover:text-gray-300 transition-colors'>
            JobPilot.
          </h1>
        </Link>
      </div>
      <div>
        <ul className='flex items-center space-x-6 text-sm font-medium text-gray-400'>
          <li>
            <Link href="/" className='hover:text-white transition-colors duration-200'>Home</Link>
          </li>
          {session ? (
            <li>
              <Link href="/profile" className='hover:text-white transition-colors duration-200'>Profile</Link>
            </li>
          ) : (
            <li>
              <Link href="/login" className='hover:text-white transition-colors duration-200'>Login</Link>
            </li>
          )}
          {session && (
            <li>
              <button 
                onClick={() => signOut()} 
                className='px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-200'
              >
                Sign out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
