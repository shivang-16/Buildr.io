import { ReactNode } from "react"
import { LeftSidebar } from "./LeftSidebar"
import { RightSidebar } from "./RightSidebar"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex justify-center w-full min-h-screen bg-background text-foreground">
        {/* Max width container - centered */}
        <div className="flex w-full max-w-[1300px] mx-auto">
            
            {/* Left Sidebar - fixed width */}
            <LeftSidebar />
            
            {/* Main Content - flexible but constrained */}
            <main className="flex flex-1 flex-col lg:max-w-[600px] lg:border-x border-border min-h-screen pb-20 sm:pb-0">
                {children}
            </main>

            {/* Right Sidebar - fixed width */}
            <RightSidebar />
        </div>
    </div>
  )
}
