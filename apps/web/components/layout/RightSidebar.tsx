"use client"

import { useEffect, useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllUsers, toggleFollow, User } from "@/actions/user_actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

export function RightSidebar() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Fetch 5 users to have enough suggestions
        const res = await getAllUsers(1, 5)
        if (res.success && res.users) {
          setUsers(res.users)
        }
      } catch (error) {
        console.error("Failed to fetch suggestions", error)
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

    try {
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
    } catch (error) {
       console.error(error)
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
    <aside className="sticky top-0 z-20 hidden h-screen w-[350px] shrink-0 flex-col gap-4 overflow-y-auto border-l bg-background px-4 py-4 lg:flex">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search" className="rounded-full bg-secondary pl-10" />
      </div>

      <Card className="bg-secondary/40 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">What&apos;s happening</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">No trending topics yet</p>
        </CardContent>
      </Card>

      <Card className="bg-secondary/40 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
             <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
             </div>
          ) : users.length === 0 ? (
             <p className="text-muted-foreground text-sm">No suggestions yet</p>
          ) : (
             users.slice(0, 4).map(user => (
               <div key={user._id} className="flex items-center justify-between gap-2">
                 <div className="flex items-center gap-2 overflow-hidden">
                    <Link href={`/user/${user.username}`}>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.firstname[0]}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex flex-col overflow-hidden">
                        <Link href={`/user/${user.username}`} className="font-bold hover:underline text-sm truncate leading-none">
                            {user.firstname} {user.lastname}
                        </Link>
                        <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
                    </div>
                 </div>
                 <Button 
                    variant={user.isFollowing ? "outline" : "default"} 
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs font-bold ${user.isFollowing ? "bg-background hover:bg-red-50 hover:text-red-500 hover:border-red-500" : ""}`}
                    onClick={() => handleFollow(user._id)}
                 >
                    {user.isFollowing ? "Unfollow" : "Follow"}
                 </Button>
               </div>
             ))
          )}
        </CardContent>
      </Card>
      
      <footer className="text-xs text-muted-foreground flex flex-wrap gap-2 px-2">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Cookie Policy</span>
          <span>© 2026 Social</span>
      </footer>
    </aside>
  )
}
