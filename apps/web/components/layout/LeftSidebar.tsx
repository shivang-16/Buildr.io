"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bell, Bookmark, MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
]

export function LeftSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-[275px] flex-shrink-0 flex-col justify-between border-r bg-background px-4 py-4 lg:flex">
      <div className="flex flex-col gap-4">
        <Link href="/feed" className="ml-4 w-fit p-2 hover:bg-accent rounded-full">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 dark:fill-white fill-black"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
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
                <Icon className="h-7 w-7" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Button className="mt-4 w-full rounded-full text-lg font-bold h-12">
          Post
        </Button>
      </div>

      <div className="mb-4">
        <Button variant="ghost" className="flex h-auto w-full items-center justify-start gap-3 rounded-full px-4 py-3 hover:bg-accent">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-bold">Shivang Yadav</span>
            <span className="text-muted-foreground">@16_shivang</span>
          </div>
          <MoreHorizontal className="ml-auto h-5 w-5" />
        </Button>
      </div>
    </aside>
  )
}
