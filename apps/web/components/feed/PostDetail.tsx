"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, ArrowUp, ArrowDown, Bookmark, Share, ArrowLeft, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createPost, upvotePost, downvotePost } from "@/actions/post_actions"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Media {
  type: "image";
  url: string;
  publicId: string;
  altText?: string;
  width?: number;
  height?: number;
}

interface PostDetailProps {
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
}

export function PostDetail({ 
  id,
  avatarSrc, 
  name, 
  handle, 
  time, 
  content, 
  media = [],
  stats,
  userVote = null
}: PostDetailProps) {
  const router = useRouter()
  const [vote, setVote] = useState<"upvote" | "downvote" | null>(userVote)
  const [upvoteCount, setUpvoteCount] = useState(stats.upvotes)
  const [downvoteCount, setDownvoteCount] = useState(stats.downvotes)
  const [replyContent, setReplyContent] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleUpvote = async () => {
    startTransition(async () => {
      const result = await upvotePost(id)
      if (result.success) {
        setVote(result.upvoted ? "upvote" : null)
        setUpvoteCount(result.upvoteCount)
        setDownvoteCount(result.downvoteCount)
      }
    })
  }

  const handleDownvote = async () => {
    startTransition(async () => {
      const result = await downvotePost(id)
      if (result.success) {
        setVote(result.downvoted ? "downvote" : null)
        setUpvoteCount(result.upvoteCount)
        setDownvoteCount(result.downvoteCount)
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

        {/* Media Images */}
        {media.length > 0 && (
          <div className={cn(
            "mt-3 rounded-2xl overflow-hidden border gap-1 grid",
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
            <span className="font-bold">{stats.comments}</span>
            <span className="text-muted-foreground">Comments</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{upvoteCount}</span>
            <span className="text-muted-foreground">Upvotes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{downvoteCount}</span>
            <span className="text-muted-foreground">Downvotes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="py-2 flex justify-around border-b text-muted-foreground">
          <Button variant="ghost" size="icon" className="rounded-full hover:text-blue-500 hover:bg-blue-500/10">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleUpvote}
            disabled={isPending}
            className={cn(
              "rounded-full hover:bg-orange-500/10",
              vote === "upvote" ? "text-orange-500" : "hover:text-orange-500"
            )}
          >
            <ArrowUp className={cn("h-5 w-5", vote === "upvote" && "fill-current")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownvote}
            disabled={isPending}
            className={cn(
              "rounded-full hover:bg-blue-500/10",
              vote === "downvote" ? "text-blue-500" : "hover:text-blue-500"
            )}
          >
            <ArrowDown className={cn("h-5 w-5", vote === "downvote" && "fill-current")} />
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
