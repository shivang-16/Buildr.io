"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, Bell, Bookmark, Search, PlusCircle, Rocket } from "lucide-react"
import { getNotifications } from "@/actions/notification_actions"
import { CreatePostDialog } from "@/components/dialogs/CreatePostDialog"

const bottomNavItems = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: Rocket, label: "Builder Pad", href: "/launchpad" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [createPostOpen, setCreatePostOpen] = useState(false)

  useEffect(() => {
    const fetchNotificationsCount = async () => {
         try {
             const res = await getNotifications(1, 1)
             if (res.success && 'unreadCount' in res) {
                 setUnreadCount(res.unreadCount as number)
             }
         } catch (e) {
             console.error(e)
         }
    }

    fetchNotificationsCount()
  }, [])

  return (
    <>
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background/80 backdrop-blur-md lg:hidden">
        {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            // Insert Post button in middle (optional, but typical for social apps)
            // Or just keep standard items.
            // Let's stick to the 4 items requested + maybe a post button?
            // The user didn't ask for a post button in the nav, but "Left Sidebar should comes below".
            // Left Sidebar has a "Post" button.
            
            return (
            <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground ${
                isActive ? "text-primary" : ""
                }`}
            >
                <div className="relative">
                    <Icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
                    {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                </div>
            </Link>
            )
        })}
        
        {/* Floating Action Button for Post (often separate on mobile) or inline */}
        {/* If we strictly follow "Left sidebar content", we should probably have a Post button. 
            I'll add a floating button or just an extra icon for Post. 
            Let's add a Post icon in the Nav for better UX. */}
            
            <button 
                onClick={() => setCreatePostOpen(true)}
                className="absolute bottom-20 right-4 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center lg:hidden"
            >
                <PlusCircle className="h-6 w-6" />
            </button>
        </nav>
        
        <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </>
  )
}
