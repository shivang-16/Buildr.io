"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RightSidebar() {
  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-[350px] shrink-0 flex-col gap-4 overflow-y-auto border-l bg-background px-4 py-4 lg:flex">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search" className="rounded-full bg-secondary pl-10" />
      </div>

      <Card className="bg-secondary/40 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">What&apos;s happening</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">No trending topics yet</p>
        </CardContent>
      </Card>

      <Card className="bg-secondary/40 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">No suggestions yet</p>
        </CardContent>
      </Card>
      
      <footer className="text-xs text-muted-foreground flex flex-wrap gap-2 px-2">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Cookie Policy</span>
          <span>© 2026 Social</span>
      </footer>
    </aside>
  )
}
