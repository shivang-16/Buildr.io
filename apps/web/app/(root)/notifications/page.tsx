"use client"

import { useEffect, useState } from "react"
import { getNotifications, markAsRead, Notification } from "@/actions/notification_actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Heart, MessageCircle, UserPlus, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchNotifications() {
      const res = await getNotifications()
      if (res.success && 'notifications' in res) {
        setNotifications(res.notifications as Notification[])
        // Optionally mark all as read when page opens
        // markAsRead("all")
      }
      setLoading(false)
    }
    fetchNotifications()
  }, [])

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif._id)
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n))
    }

    if (notif.type === "follow") {
        router.push(`/${notif.sender.username}`)
    } else if (notif.post) {
        router.push(`/post/${notif.post._id}`)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 fill-red-500 text-red-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 fill-blue-500 text-blue-500" />
      case "follow":
        return <UserPlus className="h-5 w-5 text-purple-600" />
      default:
        return null
    }
  }

  const getMessage = (notif: Notification) => {
    const name = <span className="font-bold">{notif.sender.firstname} {notif.sender.lastname}</span>
    
    switch (notif.type) {
      case "like":
        return <span>{name} liked your post.</span>
      case "comment":
        return <span>{name} commented on your post.</span>
      case "follow":
        return <span>{name} followed you.</span>
      default:
        return <span>{name} interacted with you.</span>
    }
  }

  return (
    <div className="flex flex-col w-full pb-20 sm:pb-0">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
         <Link href="/feed">
            <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
            </Button>
         </Link>
         <h2 className="text-xl font-bold">Notifications</h2>
      </header>
      
      <div className="flex flex-col">
        {loading ? (
           <div className="flex justify-center p-8">
               <Loader2 className="h-6 w-6 animate-spin text-primary" />
           </div>
        ) : notifications.length === 0 ? (
           <div className="p-8 text-center text-muted-foreground">
               No notifications yet.
           </div>
        ) : (
           notifications.map(notif => (
             <div 
                key={notif._id} 
                className={`flex gap-4 border-b p-4 cursor-pointer hover:bg-accent/50 transition-colors ${!notif.isRead ? "bg-accent/10" : ""}`}
                onClick={() => handleNotificationClick(notif)}
             >
                <div className="shrink-0 mt-1">
                   {getIcon(notif.type)}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                         <Avatar className="h-8 w-8">
                             <AvatarImage src={notif.sender.avatar} />
                             <AvatarFallback>{notif.sender.firstname[0]}</AvatarFallback>
                         </Avatar>
                         <p className="text-sm">
                             {getMessage(notif)}
                         </p>
                    </div>
                    {notif.post && (
                        <p className="text-sm text-muted-foreground line-clamp-1 border-l-2 border-muted pl-2">
                            {notif.post.content}
                        </p>
                    )}
                </div>
             </div>
           ))
        )}
      </div>
    </div>
  )
}
