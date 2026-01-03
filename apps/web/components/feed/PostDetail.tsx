"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share, ArrowLeft, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createPost, likePost } from "@/actions/post_actions"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PostDetailProps {
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
}

export function PostDetail({ 
  id,
  avatarSrc, 
  name, 
  handle, 
  time, 
  content, 
  imageSrc, 
  stats,
  isLiked = false
}: PostDetailProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(stats.likes)
  const [replyContent, setReplyContent] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleLike = async () => {
    startTransition(async () => {
      const result = await likePost(id)
      if (result.success) {
        setLiked(result.liked)
        setLikeCount(result.likeCount)
      }
    })
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return

    startTransition(async () => {
      const result = await createPost(replyContent, id)
      if (result.success) {
        setReplyContent("")
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Post</h2>
      </header>

      {/* Main Post */}
      <article className="flex flex-col p-4 border-b">
        {/* Author Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold hover:underline cursor-pointer">{name}</span>
                <span className="text-muted-foreground text-sm">{handle}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="mt-3 text-xl whitespace-pre-wrap break-words">{content}</p>

        {/* Optional Image */}
        {imageSrc && (
          <div className="mt-3 rounded-2xl border overflow-hidden">
            <img src={imageSrc} alt="Post content" className="w-full object-cover max-h-[500px]" />
          </div>
        )}

        {/* Time */}
        <div className="mt-3 flex items-center gap-1 text-muted-foreground text-sm">
          <span>{time}</span>
          <span>·</span>
          <span className="font-bold text-foreground">{stats.views}</span>
          <span>Views</span>
        </div>

        {/* Stats Bar */}
        <div className="mt-3 py-3 flex gap-4 border-t border-b text-sm">
          <div className="flex items-center gap-1">
            <span className="font-bold">{stats.replies}</span>
            <span className="text-muted-foreground">Replies</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{stats.reposts}</span>
            <span className="text-muted-foreground">Reposts</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{likeCount}</span>
            <span className="text-muted-foreground">Likes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="py-2 flex justify-around border-b text-muted-foreground">
          <Button variant="ghost" size="icon" className="rounded-full hover:text-blue-500 hover:bg-blue-500/10">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:text-green-500 hover:bg-green-500/10">
            <Repeat2 className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLike}
            disabled={isPending}
            className={cn(
              "rounded-full hover:bg-pink-500/10",
              liked ? "text-pink-500" : "hover:text-pink-500"
            )}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:text-blue-500 hover:bg-blue-500/10">
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:text-blue-500 hover:bg-blue-500/10">
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </article>

      {/* Reply Input */}
      <div className="flex gap-3 p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-center gap-3">
          <Input
            placeholder="Post your reply"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="flex-1 bg-transparent border-none text-lg placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <Button 
            onClick={handleReply}
            disabled={isPending || !replyContent.trim()}
            className="rounded-full px-4 font-bold"
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  )
}
