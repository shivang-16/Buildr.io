"use client"

import { useEffect, useState } from "react"
import { getAllUsers, toggleFollow, User } from "@/actions/user_actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ExplorePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getAllUsers()
        if (res.success && res.users) {
          setUsers(res.users)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleFollow = async (userId: string) => {
    // Optimistic update
    setUsers(prevUsers => prevUsers.map(user => {
      if (user._id === userId) {
        return { ...user, isFollowing: !user.isFollowing }
      }
      return user
    }))

    const res = await toggleFollow(userId)
    if (!res.success) {
      toast.error("Failed to update follow status")
      // Revert
      setUsers(prevUsers => prevUsers.map(user => {
        if (user._id === userId) {
          return { ...user, isFollowing: !user.isFollowing }
        }
        return user
      }))
    }
  }

  return (
    <div className="flex flex-col w-full pb-20 sm:pb-0">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <h2 className="text-xl font-bold">Explore</h2>
      </header>
      
      <div className="flex flex-col p-4 gap-4">
        {loading ? (
           <div className="flex justify-center p-8">
               <Loader2 className="h-6 w-6 animate-spin text-primary" />
           </div>
        ) : users.length === 0 ? (
           <div className="text-center text-muted-foreground">
               No users found.
           </div>
        ) : (
           users.map(user => (
             <div key={user._id} className="flex items-center gap-3 border-b pb-4 last:border-0">
                <Link href={`/${user.username}`}>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.firstname[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Link href={`/${user.username}`} className="font-bold hover:underline truncate">
                        {user.firstname} {user.lastname}
                    </Link>
                    <span className="text-sm text-muted-foreground truncate">@{user.username}</span>
                    {user.bio && <p className="text-sm truncate mt-1">{user.bio}</p>}
                </div>
                <Button 
                    variant={user.isFollowing ? "outline" : "default"} 
                    className={`rounded-full font-bold w-24 ${user.isFollowing ? "bg-background hover:bg-red-50 hover:text-red-500 hover:border-red-500" : ""}`}
                    onClick={() => handleFollow(user._id)}
                >
                    {user.isFollowing ? "Unfollow" : "Follow"}
                </Button>
             </div>
           ))
        )}
      </div>
    </div>
  )
}
