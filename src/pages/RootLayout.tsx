import SideBar from "@/components/SideBar"
import type React from "react"

export default function RootLayout({ children } : { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <SideBar/>
            <div className="flex-1">{children}</div>
        </div>
    )
}
