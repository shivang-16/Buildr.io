"use client"

import { useEffect, useState } from "react"
import { getBookmarks } from "@/actions/user_actions"
import { Post } from "@/components/feed/Post"
import { Post as PostType } from "@/actions/post_actions"
import { getCurrentUser } from "@/actions/user_actions"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BookmarksPage() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    async function fetchData() {
        // Fetch current user ID for vote status
        const userRes = await getCurrentUser()
        if (userRes.success && userRes.user) {
            setCurrentUserId(userRes.user._id)
        }

        const res = await getBookmarks()
        if (res.success) {
          setPosts(res.posts)
        }
        setLoading(false)
    }
    fetchData()
  }, [])

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

  return (
    <div className="flex flex-col w-full pb-20 sm:pb-0">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
         <Link href="/feed">
            <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
            </Button>
         </Link>
         <div className="flex flex-col">
            <h2 className="text-xl font-bold">Bookmarks</h2>
            <span className="text-xs text-muted-foreground">@{currentUserId ? "your_handle" : "user"}</span>
         </div>
      </header>
      
      {loading ? (
           <div className="flex justify-center p-8">
               <Loader2 className="h-6 w-6 animate-spin text-primary" />
           </div>
        ) : posts.length === 0 ? (
           <div className="p-8 text-center text-muted-foreground">
               You haven't bookmarked any posts yet.
           </div>
        ) : (
           posts.map(post => (
              <Post 
                key={post._id}
                id={post._id}
                avatarSrc={post.author.avatar}
                name={`${post.author.firstname} ${post.author.lastname || ""}`.trim()}
                handle={`@${post.author.username || post.author.firstname.toLowerCase()}`}
                time={formatRelativeTime(post.createdAt)}
                content={post.content}
                media={post.media}
                stats={{
                  comments: post.replies?.length || 0,
                  upvotes: post.upvoteCount || 0,
                  downvotes: post.downvoteCount || 0,
                  views: formatViews(post.viewCount || 0),
                  // We could pass isBookmarked here if Post supported it.
                  // We'll update Post component next.
                }}
                userVote={post.upvotes?.includes(currentUserId) ? "upvote" : post.downvotes?.includes(currentUserId) ? "downvote" : null}
                isBookmarked={true} // Since this is bookmarks page
              />
           ))
        )}
    </div>
  )
}
