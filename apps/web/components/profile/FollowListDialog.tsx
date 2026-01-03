"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getFollowers, getFollowing, User } from "@/actions/user_actions"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface FollowListDialogProps {
  userId: string
  type: "followers" | "following"
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FollowListDialog({ userId, type, open, onOpenChange }: FollowListDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && userId) {
      setLoading(true)
      const fetchData = async () => {
        const data = type === "followers" 
          ? await getFollowers(userId) 
          : await getFollowing(userId)
        setUsers(data)
        setLoading(false)
      }
      fetchData()
    }
  }, [open, userId, type])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">{type}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {loading ? (
             <div className="flex justify-center p-4">
                 <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
          ) : users.length === 0 ? (
             <div className="text-center text-muted-foreground p-4">
                 No {type} yet.
             </div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <Link href={`/${user.username || user._id}`} onClick={() => onOpenChange(false)}>
                    <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.firstname[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Link href={`/${user.username || user._id}`} onClick={() => onOpenChange(false)} className="font-bold hover:underline truncate">
                        {user.firstname} {user.lastname}
                    </Link>
                    <span className="text-sm text-muted-foreground truncate">@{user.username}</span>
                </div>
                {/* Could add follow/unfollow button here too, but keeping it simple for now */}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
