"use client"

import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { Post } from "@/components/feed/Post"
import { Pin } from "lucide-react"

const USER_DATA = {
  name: "Shivang Yadav",
  handle: "@16_shivang",
  avatarSrc: "https://github.com/shadcn.png",
  bannerSrc: "/banner-placeholder.png", // We don't have a real banner, maybe use css gradient in component
  bio: "20, Building @beetleai_dev | @leadlly_ed | Full stack developer\ngithub.com/shivang-16",
  location: "India",
  website: "shivangyadav.com",
  joinDate: "August 2021",
  following: 650,
  followers: 3403,
}

const PINNED_POST = {
  id: 11,
  avatarSrc: "https://github.com/shadcn.png",
  name: "Shivang Yadav",
  handle: "@16_shivang",
  time: "Nov 5, 2025",
  content: "I am building an AI code reviewer - beetleai.dev\n\nUnderstands the intent behind each change, has access to the entire repository context (mapping full files to comparing diffs)\nComments and suggests fixes wherever needed - by understanding the impact of each change",
  imageSrc: "/post-preview.png", // We can leave this or put a placeholder
  stats: { replies: 4, reposts: 34, likes: 6400, views: "34K" }
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col w-full pb-20 sm:pb-0">
        <ProfileHeader {...USER_DATA} />

        <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted-foreground">
             <Pin className="h-3 w-3 fill-current" />
             <span>Pinned</span>
        </div>
        
        <Post {...PINNED_POST} />
        
        {/* More posts would go here */}
        <div className="p-8 text-center text-muted-foreground">
            No more posts.
        </div>
    </div>
  )
}
