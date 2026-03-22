import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ProfileForm from "@/components/ProfileForm"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <p className="p-6">Not logged in</p>
  }

  // Fetch the latest user data from the DB to pass to the form
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  return (
    <div className="py-10 max-w-6xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Profile</h1>
      
      <div className="flex items-center gap-6 mb-12 p-6 rounded-xl border border-white/10 bg-[#0a0a0a]">
        {session.user?.image ? (
          <img
            src={session.user.image as string}
            alt="Profile"
            className="w-24 h-24 rounded-full border border-white/10"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
            {session.user?.name?.charAt(0) || "U"}
          </div>
        )}
        
        <div>
          <p className="text-2xl font-bold">{session.user?.name}</p>
          <p className="text-gray-400">{session.user?.email}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Complete Your Profile</h2>
      <p className="text-gray-400 mb-8">You must complete this form to access the personalized Jobs portal.</p>
      
      <ProfileForm user={dbUser} />
    </div>
  )
}