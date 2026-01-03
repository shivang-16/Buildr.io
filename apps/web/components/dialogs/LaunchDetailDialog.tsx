"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Launch } from "@/actions/launch_actions"
import { ExternalLink, Github, Globe, ArrowUp, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface LaunchDetailDialogProps {
  launch: Launch
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpvote: () => void
  currentUserId?: string | null
}

export function LaunchDetailDialog({ 
  launch, 
  open, 
  onOpenChange,
  onUpvote,
  currentUserId
}: LaunchDetailDialogProps) {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)
  
  const isUpvoted = currentUserId ? launch.upvotes.includes(currentUserId) : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-[#0D0D0D] text-white">
        
        {/* Header Image / Cover */}
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-gray-900 to-[#0D0D0D]">
          {launch.image ? (
             <div className="absolute inset-0 flex items-center justify-center p-8">
               <div className="relative h-full w-full max-w-sm aspect-square shadow-2xl rounded-xl overflow-hidden">
                 <Image 
                   src={launch.image} 
                   alt={launch.name} 
                   fill 
                   className="object-contain" 
                   priority
                 />
               </div>
             </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold opacity-10">{launch.name[0]}</span>
            </div>
          )}
          
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors z-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{launch.name}</h1>
              <p className="text-xl text-muted-foreground">{launch.tagline}</p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={launch.author.avatar} />
                        <AvatarFallback>{launch.author.firstname[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{launch.author.firstname} {launch.author.lastname}</span>
                </div>
                
                {launch.isOpenSource && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                        <Github className="h-3 w-3" /> Open Source
                    </span>
                )}
                
                <span className="text-sm text-muted-foreground">• {new Date(launch.launchDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[140px]">
              <Button 
                onClick={onUpvote}
                className={`h-12 text-lg font-bold rounded-lg transition-colors ${
                  isUpvoted
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                <ArrowUp className={`mr-2 h-5 w-5 ${isUpvoted ? "fill-current" : ""}`} />
                {isUpvoted ? "Upvoted" : "Upvote"} {launch.upvoteCount}
              </Button>
              
              <div className="flex gap-2">
                 {launch.url && (
                    <Button variant="outline" className="flex-1 border-gray-700 hover:bg-gray-800 hover:text-white" asChild>
                        <a href={launch.url} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-2 h-4 w-4" /> Visit
                        </a>
                    </Button>
                 )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                <div>
                    <h3 className="text-lg font-bold mb-3">About</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {launch.description || launch.tagline}
                    </p>
                </div>

                {/* Gallery */}
                {launch.gallery && launch.gallery.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold mb-3">Gallery</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {launch.gallery.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedGalleryImage(img)}
                                >
                                    <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             {/* Sidebar Info */}
             <div className="space-y-6">
                {/* Tech Stack */}
                {launch.builtWith.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3 tracking-wider">Built With</h3>
                        <div className="flex flex-wrap gap-2">
                            {launch.builtWith.map((tech, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-gray-800 text-sm text-gray-300 border border-gray-700">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {launch.categories.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3 tracking-wider">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {launch.categories.map((cat, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-gray-800 text-sm text-gray-300 border border-gray-700">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Lightbox for Gallery */}
      {selectedGalleryImage && (
          <Dialog open={!!selectedGalleryImage} onOpenChange={() => setSelectedGalleryImage(null)}>
              <DialogContent className="max-w-[90vw] max-h-[90vh] bg-black border-none p-0 flex items-center justify-center">
                  <div className="relative w-full h-[80vh]">
                      <Image 
                        src={selectedGalleryImage} 
                        alt="Gallery Fullscreen" 
                        fill 
                        className="object-contain" 
                      />
                  </div>
              </DialogContent>
          </Dialog>
      )}
    </Dialog>
  )
}
