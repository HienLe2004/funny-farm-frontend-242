import SideBar from "@/components/SideBar"
import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function RootLayout({ children } : { children: React.ReactNode }) {
    const navigation = useNavigate()
    useEffect(() => {
        const CheckLogin = () => {
            const accessToken = sessionStorage.getItem("accessToken")
            if (accessToken) {
                console.log("Already log in")
            }
            else {
                console.log("Have not logged in")
                navigation("/login")
            }
        }
        CheckLogin()
    },[])
    return (
        <div className="flex min-h-screen">
            <SideBar/>
            <div className="flex-1">{children}</div>
        </div>
    )
}
