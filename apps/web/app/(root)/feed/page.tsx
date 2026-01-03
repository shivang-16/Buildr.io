import { Feed } from "@/components/feed/Feed"
import { getFeedPosts } from "@/actions/post_actions"

export default async function FeedPage() {
  const data = await getFeedPosts()
  
  return <Feed initialPosts={data.posts || []} />
}
