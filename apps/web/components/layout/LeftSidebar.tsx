"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, Bell, Bookmark, MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreatePostDialog } from "@/components/dialogs/CreatePostDialog"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
]

import { getNotifications } from "@/actions/notification_actions"
// ...

export function LeftSidebar() {
  const pathname = usePathname()
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [user, setUser] = useState<{firstname: string, lastname?: string, username?: string, avatar?: string} | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Only fetch client-side for sidebar display
    const fetchUser = async () => {
        try {
            // We can import getCurrentUser from user_actions but need to dynamic import or use effect
            const { getCurrentUser } = await import("@/actions/user_actions")
            const res = await getCurrentUser()
            if (res.success && res.user) {
                setUser(res.user)
            }
        } catch (e) {
            console.error(e)
        }
    }
    
    const fetchNotificationsCount = async () => {
         try {
             // Import getNotifications dynamically or use top level import if possible (it's server action so strict import is fine usually)
             // But we used import in function body for getCurrentUser earlier to avoid cyclic deps or server/client mix? No, getCurrentUser is server action.
             // We can just call getNotifications if imported.
             const res = await getNotifications(1, 1)
             if (res.success && 'unreadCount' in res) {
                 setUnreadCount(res.unreadCount as number)
             }
         } catch (e) {
             console.error(e)
         }
    }

    fetchUser()
    fetchNotificationsCount()
  }, [])

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-[275px] flex-shrink-0 flex-col justify-between border-r bg-background px-4 py-4 lg:flex">
      <div className="flex flex-col gap-4">
        <Link href="/feed" className="ml-4 w-fit p-2 hover:bg-accent rounded-full">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 dark:fill-white fill-black"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
        </Link>
        
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-fit items-center gap-4 rounded-full px-4 py-3 text-xl transition-colors hover:bg-accent ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                <div className="relative">
                    <Icon className="h-7 w-7" />
                    {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background box-content" />
                    )}
                </div>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Button 
          onClick={() => setCreatePostOpen(true)}
          className="mt-4 w-full rounded-full text-lg font-bold h-12"
        >
          Post
        </Button>
      </div>

      <div className="mb-4">
        <Link href={user?.username ? `/${user.username}` : "/feed"}>
            <Button variant="ghost" className="flex h-auto w-full items-center justify-start gap-3 rounded-full px-4 py-3 hover:bg-accent">
                <Avatar>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.firstname?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                    <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[130px] text-left">
                        {user ? `${user.firstname} ${user.lastname || ""}` : "Loading..."}
                    </span>
                    <span className="text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-[130px] text-left">
                        @{user?.username || "loading"}
                    </span>
                </div>
                <MoreHorizontal className="ml-auto h-5 w-5 shrink-0" />
            </Button>
        </Link>
      </div>

      <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </aside>
  )
}
