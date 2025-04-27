import { Button } from "@/components/ui/button"
// Import Warehouse icon
import { Activity, BarChart3, Calendar, Droplet, Droplets, Fan, Gauge, Home, LogOut, Lightbulb, PanelLeft, PanelLeftClose, Thermometer, Warehouse, Zap } from "lucide-react";
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast";
import DarkModeButton from "./DarkModeButton";

export default function SideBar() {
    const location = useLocation();
    const currentPath = location.pathname
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const [currentRoomId, setCurrentRoomId] = useState(0);
    
    const handleLogout = () => {
        // Clear authentication data
        sessionStorage.removeItem("accessToken")
        sessionStorage.removeItem("roomId")
        sessionStorage.removeItem("roomkey")
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        })
        // Redirect to login page
        navigate("/login")
      }
    useEffect(() => {
      const roomId = sessionStorage.getItem('roomId') || ""
      setCurrentRoomId(parseInt(roomId,10))
    }, [])
    
    return (
        <div className={cn("relative min-h-screen border-r transition-all duration-300", collapsed ? "w-16" : "w-64")}>
            <Button variant="ghost" size="icon"
            className="absolute right-[-12px] top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
            onClick={()=>{setCollapsed(!collapsed)}}>
                {collapsed ? <PanelLeft className="h-3 w-3"/> : <PanelLeftClose className="h-3 w-3"/>}
            </Button>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <h2 className={cn("mb-2 px-2 text-xl font-semibold tracking-tight",
                        collapsed && "text-center text-sm"
                    )}>
                        {collapsed ? "IoT" : "Funny Farm"}
                    </h2>
                    <div className="space-y-1">
                        <Button variant={currentPath === "/" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/">
                                <Home className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>{!collapsed && "Tổng quan"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/schedule" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/schedule">
                                <Calendar className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Lập lịch"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/statistics" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/statistics">
                                <BarChart3 className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Thống kê"}
                            </Link>
                        </Button>
                        {/* Add the new Rooms (Phòng) link here */}
                        <Button variant={currentPath === "/rooms" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/rooms">
                                <Warehouse className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Phòng"}
                            </Link>
                        </Button>
                        {/* Add the new Triggers link here */}
                        <Button variant={currentPath === "/triggers" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/triggers">
                                <Zap className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Trigger"}
                            </Link>
                        </Button>
                        {/* Add the new Logs (Nhật ký) link here */}
                        <Button variant={currentPath === "/logs" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/logs">
                                <Activity className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Nhật ký"}
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-4 py-2">
                    {!collapsed && <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Cảm biến</h2>}
                    <div className="space-y-1">
                        <Button variant={currentPath === "/devices/light-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/light-sensor">
                                <Lightbulb className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Ánh sáng"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/humidity-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/humidity-sensor">
                                <Droplet className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Độ ẩm kk"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/temperature-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/temperature-sensor">
                                <Thermometer className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Nhiệt độ"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/soil-moisture-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/soil-moisture-sensor">
                                <Droplets className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Độ ẩm đất"}
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-4 py-2">
                    {!collapsed && <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Thiết bị điều khiển</h2>}
                    <div className="space-y-1">
                        <Button variant={currentPath === "/devices/pump-1" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/pump-1">
                                <Gauge className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Máy bơm 1"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/pump-2" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/pump-2">
                                <Gauge className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Máy bơm 2"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/fan" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/fan">
                                <Fan className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Quạt"}
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="bottom-4 left-0 right-0 px-4">
                    <DarkModeButton collapsed={collapsed}/>
                    <Button
                        variant="ghost"
                        className={cn(
                        "w-full text-red-500 hover:text-red-600 hover:bg-red-50",
                        collapsed ? "justify-center px-2" : "justify-start",
                        )}
                        onClick={handleLogout}
                    >
                        <LogOut className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                        {!collapsed && "Thoát"}
                    </Button>
                </div>
            </div>
        </div>
    )
}