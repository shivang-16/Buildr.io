"use client"

import { useEffect, useState } from "react"
import { getLaunches, toggleUpvote, Launch, checkCanLaunch } from "@/actions/launch_actions"
import { getCurrentUser } from "@/actions/user_actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ArrowUp, ExternalLink, Eye, Bookmark } from "lucide-react"
import { toast } from "sonner"
import { LaunchDialog } from "@/components/dialogs/LaunchDialog"
import { LaunchDetailDialog } from "@/components/dialogs/LaunchDetailDialog"
import Image from "next/image"

export default function LaunchpadPage() {
  const [launches, setLaunches] = useState<Launch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null)
  const [canLaunch, setCanLaunch] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchLaunches()
    checkLaunchStatus()
    fetchUser()
  }, [selectedDate])

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser()
      if (res.success && res.user) {
        setCurrentUserId(res.user._id)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // Timer countdown to midnight
    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchLaunches = async () => {
    setLoading(true)
    try {
      const res = await getLaunches(selectedDate.toISOString())
      if (res.success && res.launches) {
        setLaunches(res.launches)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const checkLaunchStatus = async () => {
    try {
      const res = await checkCanLaunch()
      if (res.success) {
        setCanLaunch(res.canLaunch || false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpvote = async (e: React.MouseEvent, launchId: string) => {
    e.stopPropagation()
    try {
      const res = await toggleUpvote(launchId)
      if (res.success && res.launch) {
        setLaunches(prev => prev.map(l => 
          l._id === launchId ? res.launch! : l
        ).sort((a, b) => b.upvoteCount - a.upvoteCount))
        
        if (selectedLaunch && selectedLaunch._id === launchId) {
            setSelectedLaunch(res.launch)
        }
      } else {
        toast.error(res.message || "Failed to upvote")
      }
    } catch (error) {
      toast.error("Failed to upvote")
    }
  }

  const handleLaunchClick = (launch: Launch) => {
    setSelectedLaunch(launch)
    setDetailDialogOpen(true)
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    
    if (compareDate.getTime() === today.getTime()) {
      return "Today"
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (compareDate.getTime() === yesterday.getTime()) {
      return "Yesterday"
    }
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (compareDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow"
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex flex-col w-full pb-20 sm:pb-0">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
        <h2 className="text-xl font-bold">Launchpad</h2>
        {canLaunch && (
          <Button 
            onClick={() => setLaunchDialogOpen(true)}
            className="rounded-full bg-green-600 hover:bg-green-700"
          >
            Launch →
          </Button>
        )}
      </header>

      {/* Timer & Day Navigation */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-muted-foreground">Voting will close in</span>
          </div>
        </div>
        <div className="text-2xl font-bold mb-4">
          {timeLeft.days}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDay("prev")}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold">{formatDate(selectedDate)}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDay("next")}
            className="rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Launches List */}
      <div className="flex flex-col p-4 gap-3">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading...
          </div>
        ) : launches.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No launches for this day yet.
          </div>
        ) : (
          launches.map((launch, index) => {
            const isUpvoted = currentUserId ? launch.upvotes.includes(currentUserId) : false;
            return (
            <Card 
              key={launch._id} 
              className="hover:shadow-md transition-all cursor-pointer h-[120px]"
              onClick={() => handleLaunchClick(launch)}
            >
              <div className="flex gap-4 p-4 h-full">
                {/* Rank */}
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground font-medium w-6">#{index + 1}</span>
                </div>

                {/* Image */}
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                    {launch.image ? (
                      <Image 
                        src={launch.image} 
                        alt={launch.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {launch.name[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-base mb-1 truncate">{launch.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 truncate">{launch.tagline}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {launch.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      {launch.upvoteCount}
                    </span>
                    <div className="flex gap-1">
                      {launch.categories.slice(0, 2).map((cat, i) => (
                        <span key={i} className="text-muted-foreground">
                          {cat}
                          {i < Math.min(launch.categories.length - 1, 1) && ","}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upvote */}
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleUpvote(e, launch._id)}
                    className={`rounded-lg h-16 w-16 flex flex-col gap-0 transition-colors ${
                      isUpvoted 
                        ? "bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500/20 hover:text-green-500" 
                        : "hover:border-primary"
                    }`}
                  >
                    <ArrowUp className={`h-4 w-4 ${isUpvoted ? "fill-current" : ""}`} />
                    <span className="font-bold text-lg">{launch.upvoteCount}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )})
        )}
      </div>

      <LaunchDialog 
        open={launchDialogOpen} 
        onOpenChange={setLaunchDialogOpen}
        onSuccess={() => {
          fetchLaunches()
          checkLaunchStatus()
        }}
      />

      {selectedLaunch && (
        <LaunchDetailDialog
          launch={selectedLaunch}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          currentUserId={currentUserId}
          onUpvote={async () => {
            try {
              const res = await toggleUpvote(selectedLaunch._id)
              if (res.success && res.launch) {
                setSelectedLaunch(res.launch)
                setLaunches(prev => prev.map(l => 
                  l._id === selectedLaunch._id ? res.launch! : l
                ).sort((a, b) => b.upvoteCount - a.upvoteCount))
              }
            } catch (error) {
              toast.error("Failed to upvote")
            }
          }}
        />
      )}
    </div>
  )
}

