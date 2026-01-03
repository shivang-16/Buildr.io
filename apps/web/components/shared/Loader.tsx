import { Loader2 } from "lucide-react"

export default function Loader() {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
