"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { Post } from "@/components/feed/Post"
import { Loader2 } from "lucide-react"
import { getCurrentUser, getUserPosts, getUserProfile, toggleFollow, User } from "@/actions/user_actions"
import { Post as PostType } from "@/actions/post_actions"
import { useParams } from "next/navigation"

export default function ProfilePage() {
  const { userName } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Posts")
  const [isFollowing, setIsFollowing] = useState(false)

  const username = Array.isArray(userName) ? userName[0] : (userName ?? "")
  // Decode username incase it has special chars like @ (though URL usually doesn't have @)
  const decodedUsername = decodeURIComponent(username)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch profile
        const profileRes = await getUserProfile(decodedUsername)
        if (profileRes.success && profileRes.user) {
          setUser(profileRes.user)
          setIsFollowing(!!profileRes.isFollowing)
        }

        // Fetch current user (to check ownership)
        const currentUserRes = await getCurrentUser()
        if (currentUserRes.success && currentUserRes.user) {
          setCurrentUser(currentUserRes.user)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    if (decodedUsername) {
      fetchData()
    }
  }, [decodedUsername])

  // Fetch posts when user or tab changes
  useEffect(() => {
    async function fetchPosts() {
      if (!user?._id) return
      
      setPostsLoading(true)
      try {
        const type = activeTab === "Replies" ? "replies" : "posts"
        const res = await getUserPosts(user._id, type)
        if (res.success) {
          setPosts(res.posts)
        } else {
          setPosts([])
        }
      } catch (error) {
        console.error(error)
      } finally {
        setPostsLoading(false)
      }
    }

    if (user) {
      fetchPosts()
    }
  }, [user, activeTab])

  const handleFollow = async () => {
    if (!user?._id) return

    // Optimistic update
    const newIsFollowing = !isFollowing
    setIsFollowing(newIsFollowing)
    
    // Update follower count locally
    setUser(prev => prev ? {
      ...prev,
      followers: newIsFollowing 
        ? [...(prev.followers || []), "temp-id"] 
        : (prev.followers || []).slice(0, -1) // simple subtraction
    } : null)

    const res = await toggleFollow(user._id)
    if (!res.success) {
        // Revert on failure
        setIsFollowing(!newIsFollowing)
        // Re-fetch profile to get accurate counts
        const profileRes = await getUserProfile(decodedUsername)
        if (profileRes.success && profileRes.user) {
          setUser(profileRes.user)
        }
    }
  }

  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex w-full h-[50vh] items-center justify-center text-muted-foreground">
        User not found
      </div>
    )
  }

  const isOwner = currentUser?._id === user._id

  return (
    <div className="flex flex-col w-full pb-20 sm:pb-0">
        <ProfileHeader 
            id={user._id}
            name={`${user.firstname} ${user.lastname || ""}`.trim()}
            handle={`@${user.username}`}
            avatarSrc={user.avatar}
            bio={user.bio}
            location={user.location}
            website={user.website}
            joinDate={new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            following={user.following?.length || 0}
            followers={user.followers?.length || 0} // Note: This length might be just IDs. For creating follower count
            isOwner={isOwner}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userFull={user}
            onUpdate={(updatedUser) => setUser(updatedUser)}
        />

        {/* Pinned Post (Optional - we can hide if no pinned logic yet) */}
        {/* <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted-foreground">
             <Pin className="h-3 w-3 fill-current" />
             <span>Pinned</span>
        </div> */}
        
        {postsLoading ? (
             <div className="flex justify-center p-8">
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
             </div>
        ) : posts.length > 0 ? (
            posts.map(post => {
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
                        userVote={post.upvotes?.includes(currentUser?._id || "") ? "upvote" : post.downvotes?.includes(currentUser?._id || "") ? "downvote" : null}
                     />
                )
            })
        ) : (
            <div className="p-8 text-center text-muted-foreground">
                No {activeTab.toLowerCase()} yet.
            </div>
        )}
    </div>
  )
}
