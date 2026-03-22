import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { 
      skills, 
      qualification, 
      department, 
      passoutYear, 
      experienceYears,
      bio,
      location,
      linkedinUrl,
      githubUrl,
      jobType,
      expectedSalary
    } = data

    const updatedUser = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        skills,
        qualification,
        department,
        passoutYear,
        experienceYears,
        bio,
        location,
        linkedinUrl,
        githubUrl,
        jobType,
        expectedSalary,
        profileComplete: true,
      },
      create: {
        email: session.user.email,
        name: session.user.name || "User",
        skills,
        qualification,
        department,
        passoutYear,
        experienceYears,
        bio,
        location,
        linkedinUrl,
        githubUrl,
        jobType,
        expectedSalary,
        profileComplete: true,
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
