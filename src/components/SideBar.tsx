import { Button } from "@/components/ui/button"
import { BarChart3, Calendar, Droplet, Droplets, Fan, Gauge, Home, Lightbulb, PanelLeft, PanelLeftClose, Thermometer } from "lucide-react";
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
export default function SideBar() {
    const location = useLocation();
    const currentPath = location.pathname
    const [collapsed, setCollapsed] = useState(false);
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
                                <Home className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>{!collapsed && "Overview"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/schedule" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/schedule">
                                <Calendar className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Schedule"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/analytics" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/analytics">
                                <BarChart3 className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Analytics"}
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-4 py-2">
                    {!collapsed && <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Sensors</h2>}
                    <div className="space-y-1">
                        <Button variant={currentPath === "/devices/light-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/light-sensor">
                                <Lightbulb className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Light sensor"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/humidity-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/humidity-sensor">
                                <Droplet className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Humidity sensor"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/temperature-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/temperature-sensor">
                                <Thermometer className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Temperature sensor"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/soil-moisture-sensor" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/soil-moisture-sensor">
                                <Droplets className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Soil moisture sensor"}
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-4 py-2">
                    {!collapsed && <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Devices</h2>}
                    <div className="space-y-1">
                        <Button variant={currentPath === "/devices/pump-1" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/pump-1">
                                <Gauge className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Pump 1"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/pump-2" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/pump-2">
                                <Gauge className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Pump 2"}
                            </Link>
                        </Button>
                        <Button variant={currentPath === "/devices/fan" ? "default":"ghost"} asChild
                        className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}>
                            <Link to="/devices/fan">
                                <Fan className={cn("h-4 w-4", collapsed ? "mr-0":"mr-2")}/>
                                {!collapsed && "Fan"}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}