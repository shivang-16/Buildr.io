"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { likePost } from "@/actions/post_actions"
import { cn } from "@/lib/utils"

interface PostProps {
  id: string
  avatarSrc?: string
  name: string
  handle: string
  time: string
  content: string
  imageSrc?: string
  stats: {
    replies: number
    reposts: number
    likes: number
    views: string
  }
  isLiked?: boolean
  showActions?: boolean
}

export function Post({ 
  id,
  avatarSrc, 
  name, 
  handle, 
  time, 
  content, 
  imageSrc, 
  stats,
  isLiked = false,
  showActions = true
}: PostProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(stats.likes)
  const [isPending, startTransition] = useTransition()

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a button
    if ((e.target as HTMLElement).closest('button')) return
    router.push(`/post/${id}`)
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      const result = await likePost(id)
      if (result.success) {
        setLiked(result.liked)
        setLikeCount(result.likeCount)
      }
    })
  }

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/post/${id}`)
  }

  return (
    <article 
      onClick={handlePostClick}
      className="flex gap-4 border-b p-4 transition-colors hover:bg-accent/10 cursor-pointer"
    >
      <div className="shrink-0">
        <Avatar>
          <AvatarImage src={avatarSrc} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-2 w-full min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2">
            <span className="font-bold hover:underline truncate">{name}</span>
            <span className="text-muted-foreground truncate">{handle}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground hover:underline whitespace-nowrap">{time}</span>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-base break-words">{content}</p>

        {/* Optional Image */}
        {imageSrc && (
             <div className="mt-2 rounded-2xl border overflow-hidden">
                <img src={imageSrc} alt="Post content" className="w-full object-cover max-h-[500px]" />
             </div>
        )}

        {/* Actions Footer */}
        {showActions && (
          <div className="mt-2 flex justify-between text-muted-foreground max-w-md">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReply}
              className="group flex items-center gap-1 px-0 hover:text-blue-500 hover:bg-transparent"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                   <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-xs">{stats.replies}</span>
            </Button>

            <Button variant="ghost" size="sm" className="group flex items-center gap-1 px-0 hover:text-green-500 hover:bg-transparent">
               <div className="p-2 rounded-full group-hover:bg-green-500/10">
                 <Repeat2 className="h-4 w-4" />
               </div>
              <span className="text-xs">{stats.reposts}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              disabled={isPending}
              className={cn(
                "group flex items-center gap-1 px-0 hover:bg-transparent",
                liked ? "text-pink-500" : "hover:text-pink-500"
              )}
            >
               <div className="p-2 rounded-full group-hover:bg-pink-500/10">
                 <Heart className={cn("h-4 w-4", liked && "fill-current")} />
               </div>
              <span className="text-xs">{likeCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="group flex items-center gap-1 px-0 hover:text-blue-500 hover:bg-transparent">
               <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                 <BarChart2 className="h-4 w-4" />
               </div>
              <span className="text-xs">{stats.views}</span>
            </Button>

            <div className="flex">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-500 hover:bg-blue-500/10 rounded-full">
                    <Bookmark className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-500 hover:bg-blue-500/10 rounded-full">
                    <Share className="h-4 w-4" />
                </Button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
