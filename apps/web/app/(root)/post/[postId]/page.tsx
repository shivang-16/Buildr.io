import { getPost } from "@/actions/post_actions"
import { Post } from "@/components/feed/Post"
import { PostDetail } from "@/components/feed/PostDetail"
import { notFound } from "next/navigation"

interface PostPageProps {
  params: Promise<{ postId: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params
  const data = await getPost(postId)

  if (!data || !data.post) {
    notFound()
  }

  const { post, replies = [] } = data

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

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
    <div className="flex flex-col w-full min-h-screen">
      {/* Post Detail */}
      <PostDetail
        id={post._id}
        avatarSrc={post.author.avatar}
        name={`${post.author.firstname} ${post.author.lastname || ""}`.trim()}
        handle={`@${post.author.username || post.author.firstname.toLowerCase()}`}
        time={formatTime(post.createdAt)}
        content={post.content}
        stats={{
          replies: post.replies?.length || 0,
          reposts: post.reposts?.length || 0,
          likes: post.likes?.length || 0,
          views: formatViews(post.viewCount || 0),
        }}
      />

      {/* Replies */}
      {replies.length > 0 && (
        <div className="flex flex-col">
          {replies.map((reply) => (
            <Post
              key={reply._id}
              id={reply._id}
              avatarSrc={reply.author.avatar}
              name={`${reply.author.firstname} ${reply.author.lastname || ""}`.trim()}
              handle={`@${reply.author.username || reply.author.firstname.toLowerCase()}`}
              time={formatRelativeTime(reply.createdAt)}
              content={reply.content}
              stats={{
                replies: reply.replies?.length || 0,
                reposts: reply.reposts?.length || 0,
                likes: reply.likes?.length || 0,
                views: formatViews(reply.viewCount || 0),
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
