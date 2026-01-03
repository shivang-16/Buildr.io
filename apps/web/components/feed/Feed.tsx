"use client"

import { useState, useTransition } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Post } from "./Post"
import { Image as ImageIcon, Loader2, X } from "lucide-react"
import { Post as PostType } from "@/actions/post_actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

interface FeedProps {
  initialPosts?: PostType[]
}

export function Feed({ initialPosts = [] }: FeedProps) {
  const [tab, setTab] = useState<"for-you" | "following">("for-you")
  const [posts, setPosts] = useState<PostType[]>(initialPosts)
  const [newPostContent, setNewPostContent] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + images.length > 4) {
      toast.error("Maximum 4 images allowed")
      return
    }

    // Validate file size (15MB max)
    const validFiles = files.filter((file) => {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 15MB per image.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setImages((prev) => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim() && images.length === 0) return

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("content", newPostContent)
        images.forEach((image) => {
          formData.append("images", image)
        })

        const response = await fetch("/api/posts", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()
        if (result.success && result.post) {
          setPosts([result.post, ...posts])
          setNewPostContent("")
          setImages([])
          setImagePreviews([])
          router.refresh()
        } else {
          toast.error(result.message || "Failed to create post")
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to create post")
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
                maxLength={2000}
             />

             {/* Image Previews */}
             {imagePreviews.length > 0 && (
               <div className={`grid gap-2 ${
                 imagePreviews.length === 1 ? "grid-cols-1" :
                 imagePreviews.length === 2 ? "grid-cols-2" :
                 "grid-cols-2"
               } max-h-[200px] overflow-hidden rounded-2xl border`}>
                 {imagePreviews.map((preview, index) => (
                   <div key={index} className="relative aspect-video">
                     <Image
                       src={preview}
                       alt={`Preview ${index + 1}`}
                       fill
                       className="object-cover"
                     />
                     <button
                       onClick={() => removeImage(index)}
                       className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                     >
                       <X className="h-4 w-4" />
                     </button>
                   </div>
                 ))}
               </div>
             )}

             <div className="flex items-center justify-between border-t pt-3">
                 <div className="flex gap-2 text-primary">
                    <input
                      type="file"
                      id="feed-image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={images.length >= 4}
                    />
                    <label htmlFor="feed-image-upload">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                        asChild
                        disabled={images.length >= 4}
                      >
                        <span>
                          <ImageIcon className="h-5 w-5" />
                        </span>
                      </Button>
                    </label>
                 </div>
                 <div className="flex items-center gap-3">
                   {newPostContent.length > 0 && (
                     <span className={`text-sm ${newPostContent.length > 1900 ? 'text-destructive' : 'text-muted-foreground'}`}>
                       {2000 - newPostContent.length}
                     </span>
                   )}
                   <Button 
                     onClick={handleCreatePost}
                     disabled={isPending || (!newPostContent.trim() && images.length === 0)}
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
                media={post.media}
                stats={{
                  comments: post.replies?.length || 0,
                  upvotes: post.upvoteCount || 0,
                  downvotes: post.downvoteCount || 0,
                  views: formatViews(post.viewCount || 0),
                }}
                userVote={post.upvotes?.includes("current-user-id") ? "upvote" : post.downvotes?.includes("current-user-id") ? "downvote" : null}
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
