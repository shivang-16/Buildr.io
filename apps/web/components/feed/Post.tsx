"use client"


import{Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowUp, ArrowDown, BarChart2, Bookmark, Share, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { upvotePost, downvotePost } from "@/actions/post_actions"
import { toggleBookmark } from "@/actions/user_actions"

import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface Media {
  type: "image";
  url: string;
  publicId: string;
  altText?: string;
  width?: number;
  height?: number;
}

interface PostProps {
  id: string
  avatarSrc?: string
  name: string
  handle: string
  time: string
  content: string
  media?: Media[]
  stats: {
    comments: number
    upvotes: number
    downvotes: number
    views: string
  }
  userVote?: "upvote" | "downvote" | null
  isBookmarked?: boolean
  showActions?: boolean
}


export function Post({ 
  id,
  avatarSrc, 
  name, 
  handle, 
  time, 
  content, 
  media = [],
  stats,
  userVote = null,
  isBookmarked = false,
  showActions = true
}: PostProps) {
  const router = useRouter()
  const [vote, setVote] = useState<"upvote" | "downvote" | null>(userVote)
  const [upvoteCount, setUpvoteCount] = useState(stats.upvotes)
  const [downvoteCount, setDownvoteCount] = useState(stats.downvotes)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isPending, startTransition] = useTransition()

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a button
    if ((e.target as HTMLElement).closest('button')) return
    router.push(`/post/${id}`)
  }

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      const result = await upvotePost(id)
      if (result.success) {
        setVote(result.upvoted ? "upvote" : null)
        setUpvoteCount(result.upvoteCount)
        setDownvoteCount(result.downvoteCount)
      }
    })
  }

  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      const result = await downvotePost(id)
      if (result.success) {
        setVote(result.downvoted ? "downvote" : null)
        setUpvoteCount(result.upvoteCount)
        setDownvoteCount(result.downvoteCount)
      }
    })
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // Optimistic update
    setBookmarked(!bookmarked)
    
    // We don't need transition here necessarily as it's just a toggle
    const result = await toggleBookmark(id)
    if (!result.success) {
      setBookmarked(!bookmarked) // Revert on failure
    }
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
        <Link href={`/${handle.replace("@", "")}`} onClick={(e) => e.stopPropagation()}>
          <Avatar>
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
        </Link>
      </div>

      <div className="flex flex-col gap-2 w-full min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2">
            <Link href={`/${handle.replace("@", "")}`} onClick={(e) => e.stopPropagation()} className="font-bold hover:underline truncate">
              {name}
            </Link>
            <Link href={`/${handle.replace("@", "")}`} onClick={(e) => e.stopPropagation()} className="text-muted-foreground truncate">
              {handle}
            </Link>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground hover:underline whitespace-nowrap">{time}</span>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-base break-words">{content}</p>

        {/* Media Images */}
        {media.length > 0 && (
          <div className={cn(
            "mt-2 rounded-2xl overflow-hidden border gap-1 grid",
            media.length === 1 ? "grid-cols-1" : media.length === 2 ? "grid-cols-2" : "grid-cols-2"
          )}>
            {media.map((item, index) => (
              <div 
                key={item.publicId} 
                className={cn(
                  "relative",
                  media.length === 1 ? "aspect-video max-h-[500px]" : "aspect-square"
                )}
              >
                <Image
                  src={item.url}
                  alt={item.altText || `Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
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
              <span className="text-xs">{stats.comments}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleUpvote}
              disabled={isPending}
              className={cn(
                "group flex items-center gap-1 px-0 hover:bg-transparent",
                vote === "upvote" ? "text-orange-500" : "hover:text-orange-500"
              )}
            >
               <div className="p-2 rounded-full group-hover:bg-orange-500/10">
                 <ArrowUp className={cn("h-4 w-4", vote === "upvote" && "fill-current")} />
               </div>
              <span className="text-xs">{upvoteCount}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDownvote}
              disabled={isPending}
              className={cn(
                "group flex items-center gap-1 px-0 hover:bg-transparent",
                vote === "downvote" ? "text-blue-500" : "hover:text-blue-500"
              )}
            >
               <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                 <ArrowDown className={cn("h-4 w-4", vote === "downvote" && "fill-current")} />
               </div>
              <span className="text-xs">{downvoteCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="group flex items-center gap-1 px-0 hover:text-blue-500 hover:bg-transparent">
               <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                 <BarChart2 className="h-4 w-4" />
               </div>
              <span className="text-xs">{stats.views}</span>
            </Button>

            <div className="flex">
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={handleBookmark}
                   className={cn(
                     "h-8 w-8 hover:text-blue-500 hover:bg-blue-500/10 rounded-full",
                     bookmarked && "text-blue-500"
                   )}
                >
                    <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
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
