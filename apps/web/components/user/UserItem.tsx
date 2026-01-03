"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface UserItemProps {
  name: string
  handle: string
  bio: string
  avatarSrc: string
  isFollowing?: boolean
}

export function UserItem({ name, handle, bio, avatarSrc, isFollowing }: UserItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                 <span className="font-bold hover:underline">{name}</span>
                 {/* Optional: Verified badge */}
             </div>
             <span className="text-muted-foreground">{handle}</span>
             <p className="text-sm">{bio}</p>
          </div>
      </div>
      <Button 
        variant={isFollowing ? "outline" : "secondary"} 
        className={isFollowing ? "rounded-full font-bold border-muted-foreground" : "rounded-full font-bold bg-foreground text-background hover:bg-foreground/90"}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  )
}
