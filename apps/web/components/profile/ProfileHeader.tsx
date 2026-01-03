"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarDays, Link as LinkIcon, MapPin, MoreHorizontal, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { FollowListDialog } from "./FollowListDialog"
import { EditProfileDialog } from "./EditProfileDialog"
import { User } from "@/actions/user_actions"

interface ProfileHeaderProps {
  id: string
  name: string
  handle: string
  avatarSrc?: string
  bannerSrc?: string
  bio?: string
  location?: string
  website?: string
  joinDate: string
  following: number
  followers: number
  isOwner: boolean
  isFollowing: boolean
  onFollow: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  userFull?: User // Full user object for editing
  onUpdate?: (user: User) => void
}

export function ProfileHeader({
  id,
  name,
  handle,
  avatarSrc,
  bannerSrc,
  bio,
  location,
  website,
  joinDate,
  following,
  followers,
  isOwner,
  isFollowing,
  onFollow,
  activeTab,
  onTabChange,
  userFull,
  onUpdate
}: ProfileHeaderProps) {
  const [followDialogType, setFollowDialogType] = useState<"followers" | "following" | null>(null)
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  return (
    <div className="flex flex-col border-b border-border">
      {/* Sticky Top Nav */}
      <div className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-background/80 px-4 backdrop-blur-md">
         <Link href="/feed">
            <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
            </Button>
         </Link>
         <div className="flex flex-col">
            <div className="flex items-center gap-1">
                <h2 className="text-xl font-bold leading-5">{name}</h2>
                {/* Verified Icon (optional/logic based) */}
                <svg viewBox="0 0 24 24" aria-label="Verified account" className="h-5 w-5 fill-blue-500"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.755 2.73 1.844 3.475-.12.44-.192.905-.192 1.393 0 2.21 1.71 4 3.82 4 .47 0 .92-.086 1.335-.25.753 1.96 2.508 3.328 4.57 3.328 2.064 0 3.82-1.37 4.572-3.33.415.166.865.25 1.335.25 2.11 0 3.818-1.79 3.818-4 0-.488-.073-.956-.192-1.396 1.09-.745 1.845-2.018 1.845-3.475zM10.59 16.4l-4.24-4.247 1.415-1.414 2.825 2.827 5.66-5.656 1.413 1.414-7.072 7.077z"></path></g></svg>
            </div>
         </div>
         <div className="ml-auto flex gap-4">
             <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-5 w-5" />
             </Button>
             <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
             </Button>
         </div>
      </div>

      {/* Banner */}
      <div className="h-32 sm:h-48 w-full bg-slate-700">
         {bannerSrc ? <img src={bannerSrc} alt="Banner" className="h-full w-full object-cover" /> : null}
      </div>

      {/* Avatar & Edit Profile/Follow */}
      <div className="relative flex justify-between px-4 pb-4">
          <div className="absolute -top-10 sm:-top-16 rounded-full border-4 border-background bg-background">
             <Avatar className="h-20 w-20 sm:h-32 sm:w-32">
                <AvatarImage src={avatarSrc} className="object-cover" />
                <AvatarFallback>{name[0]}</AvatarFallback>
             </Avatar>
          </div>
          <div className="ml-auto mt-4">
              {isOwner ? (
                <Button 
                    variant="outline" 
                    className="rounded-full font-bold"
                    onClick={() => setEditProfileOpen(true)}
                >
                    Edit profile
                </Button>
              ) : (
                <Button 
                    variant={isFollowing ? "outline" : "default"} 
                    className={`rounded-full font-bold w-24 ${isFollowing ? "bg-background hover:bg-red-50 hover:text-red-500 hover:border-red-500" : ""}`}
                    onClick={onFollow}
                >
                    {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
          </div>
      </div>

      {/* User Info */}
      <div className="px-4 pb-4 mt-2 sm:mt-0">
          <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                 <h2 className="text-xl font-bold">{name}</h2>
              </div>
              <span className="text-muted-foreground">{handle}</span>
          </div>

          {bio && <p className="mt-4 whitespace-pre-wrap">{bio}</p>}

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {location && (
                  <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                  </div>
              )}
              {website && (
                  <div className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      <a href={`https://${website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">{website}</a>
                  </div>
              )}
               <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>Joined {joinDate}</span>
              </div>
          </div>

          <div className="mt-4 flex gap-4 text-sm">
              <div 
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                  onClick={() => setFollowDialogType("following")}
              >
                  <span className="font-bold text-foreground">{following}</span>
                  <span className="text-muted-foreground">Following</span>
              </div>
               <div 
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                  onClick={() => setFollowDialogType("followers")}
               >
                  <span className="font-bold text-foreground">{followers}</span>
                  <span className="text-muted-foreground">Followers</span>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
         {["Posts", "Replies"].map((tab) => (
             <div 
                key={tab} 
                className="flex-1 cursor-pointer py-4 text-center hover:bg-accent/50 transition-colors relative"
                onClick={() => onTabChange(tab)}
            >
                 <span className={activeTab === tab ? "font-bold text-foreground" : "font-medium text-muted-foreground"}>{tab}</span>
                 {activeTab === tab && <div className="absolute bottom-0 h-1 w-full rounded-full bg-primary" />}
             </div>
         ))}
      </div>

      <FollowListDialog 
        userId={id} 
        open={!!followDialogType} 
        type={followDialogType || "followers"} 
        onOpenChange={(open) => !open && setFollowDialogType(null)} 
      />
      
      {userFull && onUpdate && (
          <EditProfileDialog 
            open={editProfileOpen} 
            onOpenChange={setEditProfileOpen}
            user={userFull}
            onUpdate={onUpdate}
          />
      )}
    </div>
  )
}
