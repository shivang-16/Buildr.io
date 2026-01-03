"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { followUser, User } from "@/actions/user_actions"

interface UserProfileProps {
  user: User
  isOwnProfile: boolean
  currentUserId?: string
}

export function UserProfile({ user, isOwnProfile, currentUserId }: UserProfileProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(
    currentUserId ? user.followers?.includes(currentUserId) : false
  )
  const [followerCount, setFollowerCount] = useState(user.followers?.length || 0)
  const [isPending, startTransition] = useTransition()

  const handleFollow = () => {
    startTransition(async () => {
      const result = await followUser(user._id)
      if (result.success) {
        setIsFollowing(result.isFollowing)
        setFollowerCount(prev => result.isFollowing ? prev + 1 : prev - 1)
      }
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const displayName = `${user.firstname} ${user.lastname || ""}`.trim()
  const handle = user.username || user.firstname.toLowerCase()

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">{displayName}</h2>
          <span className="text-sm text-muted-foreground">0 posts</span>
        </div>
      </header>

      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/30 to-primary/10" />

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <Avatar className="absolute -top-16 h-32 w-32 border-4 border-background">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-4xl">{displayName[0]}</AvatarFallback>
        </Avatar>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" size="icon" className="rounded-full">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          {isOwnProfile ? (
            <Button variant="outline" className="rounded-full font-bold">
              Edit profile
            </Button>
          ) : (
            <Button 
              onClick={handleFollow}
              disabled={isPending}
              variant={isFollowing ? "outline" : "default"}
              className="rounded-full font-bold min-w-[100px]"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* User Info */}
        <div className="mt-8 space-y-3">
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">@{handle}</p>
          </div>

          {user.bio && (
            <p className="text-base">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-bold">{user.following?.length || 0}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-bold">{followerCount}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex border-b">
          <div className="flex-1 py-4 text-center font-bold border-b-2 border-primary cursor-pointer">
            Posts
          </div>
          <div className="flex-1 py-4 text-center text-muted-foreground hover:bg-accent/50 cursor-pointer">
            Replies
          </div>
          <div className="flex-1 py-4 text-center text-muted-foreground hover:bg-accent/50 cursor-pointer">
            Likes
          </div>
        </div>
      </div>

      {/* Posts will go here */}
      <div className="p-8 text-center text-muted-foreground">
        <p>No posts yet</p>
      </div>
    </div>
  )
}
