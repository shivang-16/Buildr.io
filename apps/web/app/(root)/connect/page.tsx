"use client"

import { UserItem } from "@/components/user/UserItem"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

const SUGGESTED_USERS = [
  {
    name: "Sneha Farkya",
    handle: "@sneha_farkya",
    avatarSrc: "https://github.com/shadcn.png",
    bio: "Open for Technical writer role, DevRel and Frontend Engineer role | Ex-Qoruz | Freelancer | Musicforlife | Open Source enthusiast | Hackathons",
    isFollowing: false
  },
  {
    name: "Ankur Gupta",
    handle: "@ankurg132",
    avatarSrc: "https://github.com/vercel.png",
    bio: "Flutter Developer at Internshala. Github Campus Expert, Organizer ML Bhopal. Into Android, Flutter, Open Source and Communities.",
    isFollowing: false
  },
  {
    name: "Aashrya Shrivastava",
    handle: "@aashryaa",
    avatarSrc: "https://github.com/nextjs.png", // using generic for demo
    bio: "Video Content Creator • Content @CoinDCX • Contributor @SuperteamIN",
    isFollowing: false
  },
  {
    name: "Manishi",
    handle: "@0xManishi",
    avatarSrc: "https://github.com/shadcn.png",
    bio: "Designerd",
    isFollowing: false
  },
  {
    name: "Bhopal DAO | Hiring",
    handle: "@Bhopal_DAO",
    avatarSrc: "https://github.com/vercel.png",
    bio: "Builders and Creators DAO • Events, Sessions and Community of Expert Creators and Builders • Content & Growth • TG Alpha -> t.me/BhopalDAO",
    isFollowing: false
  },
   {
    name: "Rajeev",
    handle: "@RadzhivDev",
    avatarSrc: "https://github.com/radzhiv.png",
    bio: "engineering, techie, building wrapper for another wrapper...",
    isFollowing: false
  }
]

export default function ConnectPage() {
  return (
    <div className="flex flex-col w-full min-h-screen border-r border-border">
       <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
          <Link href="/feed">
             <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-col">
             <h2 className="text-xl font-bold leading-5">Connect</h2>
          </div>
          <div className="ml-auto">
             <Settings className="h-5 w-5" />
          </div>
       </header>
       
       <div className="flex items-center border-b font-medium text-muted-foreground">
          <div className="flex-1 cursor-pointer p-4 text-center hover:bg-accent/50">
             <span className="font-bold text-foreground border-b-4 border-primary pb-3.5">Who to follow</span>
          </div>
          <div className="flex-1 cursor-pointer p-4 text-center hover:bg-accent/50">
             <span>Creators for you</span>
          </div>
       </div>

       <div className="flex flex-col pb-20 sm:pb-0">
           <h3 className="px-4 py-3 text-xl font-bold">Suggested for you</h3>
           {SUGGESTED_USERS.map((user, i) => (
               <UserItem key={i} {...user} />
           ))}
       </div>
    </div>
  )
}
