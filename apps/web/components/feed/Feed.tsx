"use client"

import { useState, useTransition } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Post } from "./Post"
import { Image as ImageIcon, Smile, MapPin, Calendar, FileType, Loader2 } from "lucide-react"
import { createPost, Post as PostType } from "@/actions/post_actions"
import { useRouter } from "next/navigation"

interface FeedProps {
  initialPosts?: PostType[]
}

export function Feed({ initialPosts = [] }: FeedProps) {
  const [tab, setTab] = useState<"for-you" | "following">("for-you")
  const [posts, setPosts] = useState<PostType[]>(initialPosts)
  const [newPostContent, setNewPostContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    startTransition(async () => {
      const result = await createPost(newPostContent)
      if (result.success && result.post) {
        setPosts([result.post, ...posts])
        setNewPostContent("")
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col w-full border-b border-border">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex h-14 w-full items-center border-b bg-background/80 backdrop-blur-md">
        <div 
            className="flex h-full w-full cursor-pointer items-center justify-center hover:bg-accent/50 transition-colors"
            onClick={() => setTab("for-you")}
        >
          <div className="relative flex h-full items-center">
             <span className={tab === "for-you" ? "font-bold" : "font-medium text-muted-foreground"}>For you</span>
             {tab === "for-you" && <div className="absolute bottom-0 h-1 w-full rounded-full bg-primary" />}
          </div>
        </div>
        <div 
            className="flex h-full w-full cursor-pointer items-center justify-center hover:bg-accent/50 transition-colors"
            onClick={() => setTab("following")}
        >
          <div className="relative flex h-full items-center">
             <span className={tab === "following" ? "font-bold" : "font-medium text-muted-foreground"}>Following</span>
             {tab === "following" && <div className="absolute bottom-0 h-1 w-full rounded-full bg-primary" />}
          </div>
        </div>
      </header>

      {/* Input Area */}
      <div className="flex gap-4 border-b p-4">
         <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>SY</AvatarFallback>
         </Avatar>
         <div className="flex w-full flex-col gap-4">
             <textarea 
                placeholder="What's happening?" 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="bg-transparent text-xl placeholder:text-muted-foreground focus:outline-none resize-none min-h-[60px]"
                maxLength={280}
             />
             <div className="flex items-center justify-between border-t pt-3">
                 <div className="flex gap-2 text-primary">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                        <ImageIcon className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                        <FileType className="h-5 w-5" />
                    </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                        <Smile className="h-5 w-5" />
                    </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                        <Calendar className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                        <MapPin className="h-5 w-5" />
                    </Button>
                 </div>
                 <div className="flex items-center gap-3">
                   {newPostContent.length > 0 && (
                     <span className={`text-sm ${newPostContent.length > 260 ? 'text-destructive' : 'text-muted-foreground'}`}>
                       {280 - newPostContent.length}
                     </span>
                   )}
                   <Button 
                     onClick={handleCreatePost}
                     disabled={isPending || !newPostContent.trim()}
                     className="rounded-full bg-primary px-4 font-bold text-primary-foreground"
                   >
                     {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                   </Button>
                 </div>
             </div>
         </div>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col">
          {posts.map(post => (
              <Post 
                key={post._id} 
                id={post._id}
                avatarSrc={post.author.avatar}
                name={`${post.author.firstname} ${post.author.lastname || ""}`.trim()}
                handle={`@${post.author.username || post.author.firstname.toLowerCase()}`}
                time={formatRelativeTime(post.createdAt)}
                content={post.content}
                stats={{
                  replies: post.replies?.length || 0,
                  reposts: post.reposts?.length || 0,
                  likes: post.likes?.length || 0,
                  views: formatViews(post.viewCount || 0),
                }}
              />
          ))}
          {posts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No posts yet. Be the first to post!</p>
            </div>
          )}
      </div>
    </div>
  )
}
