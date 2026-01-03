"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    // Validate file size (15MB max)
    const validFiles = files.filter((file) => {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 15MB per image.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Please add some content or an image");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("content", content);
        images.forEach((image) => {
          formData.append("images", image);
        });

        const response = await fetch("/api/posts", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Post created successfully!");
          setContent("");
          setImages([]);
          setImagePreviews([]);
          onOpenChange(false);
          router.refresh();
        } else {
          toast.error(result.message || "Failed to create post");
        }
      } catch (error) {
        toast.error("Failed to create post");
        console.error(error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>SY</AvatarFallback>
          </Avatar>

          <div className="flex w-full flex-col gap-4">
            <textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-transparent text-xl placeholder:text-muted-foreground focus:outline-none resize-none min-h-[120px] w-full"
              maxLength={2000}
            />

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className={`grid gap-2 ${
                imagePreviews.length === 1 ? "grid-cols-1" :
                imagePreviews.length === 2 ? "grid-cols-2" :
                "grid-cols-2"
              } max-h-[300px] overflow-hidden rounded-2xl border`}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-video">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="dialog-image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={images.length >= 4}
                />
                <label htmlFor="dialog-image-upload">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                    asChild
                    disabled={images.length >= 4}
                  >
                    <span>
                      <ImageIcon className="h-5 w-5" />
                    </span>
                  </Button>
                </label>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span className={`text-sm ${content.length > 1900 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {2000 - content.length}
                  </span>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || (!content.trim() && images.length === 0)}
                  className="rounded-full bg-primary px-6 font-bold text-primary-foreground"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
