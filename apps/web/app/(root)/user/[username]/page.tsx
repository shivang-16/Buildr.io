import { getUserProfile, getCurrentUser } from "@/actions/user_actions"
import { UserProfile } from "@/components/profile/UserProfile"
import { notFound } from "next/navigation"

interface UserPageProps {
  params: Promise<{ username: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params
  
  // Get user profile
  const userData = await getUserProfile(username)
  
  if (!userData.success || !userData.user) {
    notFound()
  }

  // Get current logged in user to check if this is own profile
  const currentUserData = await getCurrentUser()
  const isOwnProfile = currentUserData.success && 
    currentUserData.user?._id === userData.user._id

  return (
    <UserProfile 
      user={userData.user}
      isOwnProfile={isOwnProfile}
      currentUserId={currentUserData.user?._id}
    />
  )
}
