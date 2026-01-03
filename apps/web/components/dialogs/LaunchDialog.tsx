"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, X, ImageIcon, Upload } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const launchSchema = z.object({
  name: z.string().min(1, "Project name is required").max(45, "Max 45 characters"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  tagline: z.string().min(1, "Tagline is required").max(60, "Max 60 characters"),
  categories: z.string().optional(), // Handled separately
  builtWith: z.string().optional(), // Handled separately
  isOpenSource: z.boolean().default(false),
  description: z.string().max(5000, "Max 5000 characters").optional(),
})

type LaunchFormData = z.infer<typeof launchSchema>

interface LaunchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LaunchDialog({ open, onOpenChange, onSuccess }: LaunchDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryInput, setCategoryInput] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [techInput, setTechInput] = useState("")
  const [techs, setTechs] = useState<string[]>([])
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [gallery, setGallery] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const router = useRouter()

  const form = useForm<LaunchFormData>({
    resolver: zodResolver(launchSchema),
    defaultValues: {
      name: "",
      url: "",
      tagline: "",
      categories: "",
      builtWith: "",
      isOpenSource: false,
      description: "",
    },
  })

  // Logo selection
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be less than 5MB")
      return
    }

    setLogo(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Gallery selection
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + gallery.length > 5) {
      toast.error("Maximum 5 gallery images allowed")
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setGallery(prev => [...prev, ...validFiles])
    
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const addCategory = () => {
    if (categoryInput.trim() && categories.length < 3) {
      setCategories([...categories, categoryInput.trim()])
      setCategoryInput("")
    }
  }

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const addTech = () => {
    if (techInput.trim() && techs.length < 10) {
      setTechs([...techs, techInput.trim()])
      setTechInput("")
    }
  }

  const removeTech = (index: number) => {
    setTechs(techs.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: LaunchFormData) => {
    if (!logo) {
      toast.error("Please upload a logo/icon for your project")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("tagline", data.tagline)
      if (data.url) formData.append("url", data.url)
      if (data.description) formData.append("description", data.description)
      formData.append("isOpenSource", String(data.isOpenSource))
      
      categories.forEach(cat => formData.append("categories[]", cat))
      techs.forEach(tech => formData.append("builtWith[]", tech))
      
      formData.append("image", logo)
      gallery.forEach(img => formData.append("gallery", img))

      const response = await fetch("/api/launches", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Launch created successfully!")
        form.reset()
        setCategories([])
        setTechs([])
        setLogo(null)
        setLogoPreview(null)
        setGallery([])
        setGalleryPreviews([])
        onOpenChange(false)
        onSuccess?.()
        router.refresh()
      } else {
        toast.error(result.message || "Failed to create launch")
      }
    } catch (error) {
      toast.error("Failed to create launch")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Launch Your Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Logo Upload - Left Column */}
              <div className="flex flex-col items-center gap-2">
                <FormLabel>Logo <span className="text-red-500">*</span></FormLabel>
                <div onClick={() => document.getElementById('logo-upload')?.click()} className="cursor-pointer relative h-32 w-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex items-center justify-center bg-muted/50 overflow-hidden">
                   {logoPreview ? (
                     <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                   ) : (
                     <div className="flex flex-col items-center text-muted-foreground">
                       <Upload className="h-8 w-8 mb-2" />
                       <span className="text-xs">Upload</span>
                     </div>
                   )}
                </div>
                <input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoSelect}
                />
              </div>

              {/* Main Fields - Right Column */}
              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" maxLength={45} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="A short catchphrase..." maxLength={60} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-2">
               <FormLabel>Gallery <span className="text-xs text-muted-foreground">(Optional, max 5)</span></FormLabel>
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image src={preview} alt={`Gallery ${idx}`} fill className="object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {galleryPreviews.length < 5 && (
                    <div onClick={() => document.getElementById('gallery-upload')?.click()} className="cursor-pointer aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex items-center justify-center bg-muted/50">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <input 
                          id="gallery-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGallerySelect}
                        />
                    </div>
                  )}
               </div>
            </div>

            {/* Config: Categories & Tech */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Category(ies) <span className="text-xs text-muted-foreground">(Max 3)</span></FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCategory()
                      }
                    }}
                    placeholder="Add category"
                    disabled={categories.length >= 3}
                  />
                  <Button type="button" onClick={addCategory} disabled={categories.length >= 3 || !categoryInput.trim()}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-secondary text-sm flex items-center gap-2">
                      {cat} <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeCategory(index)} />
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Built with <span className="text-xs text-muted-foreground">(Max 10)</span></FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTech()
                      }
                    }}
                    placeholder="Add tech"
                    disabled={techs.length >= 10}
                  />
                  <Button type="button" onClick={addTech} disabled={techs.length >= 10 || !techInput.trim()}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-2">
                      {tech} <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTech(index)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="isOpenSource"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">This project is open source</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-xs text-muted-foreground">(Recommended)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your project..." className="min-h-[150px]" maxLength={5000} {...field} />
                  </FormControl>
                  <div className="text-xs text-muted-foreground text-right">{field.value?.length || 0}/5000</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Launching...</> : "Launch Project 🚀"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
