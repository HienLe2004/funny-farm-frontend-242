import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Droplet, Droplets, Fan, Gauge, Lightbulb, Thermometer } from "lucide-react";
import { Link } from "react-router-dom";
// Device data
const devices = [
    {
      id: "light-sensor",
      name: "Light Sensor",
      type: "sensor",
      value: "75%",
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Lightbulb,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      id: "humidity-sensor",
      name: "Humidity Sensor",
      type: "sensor",
      value: "58%",
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Droplet,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "temperature-sensor",
      name: "Temperature Sensor",
      type: "sensor",
      value: "23.5°C",
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Thermometer,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      id: "soil-moisture-sensor",
      name: "Soil Moisture Sensor",
      type: "sensor",
      value: "58%", 
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Droplets,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      id: "pump-1",
      name: "Pump 1",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "15 minutes ago",
      icon: Gauge,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "pump-2",
      name: "Pump 2",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "1 hour ago",
      icon: Gauge,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "fan",
      name: "Fan",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "30 minutes ago",
      icon: Fan,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ]
export default function DevicesPage () {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex-1">
                <section className="w-full py-6 md:py-12">
                    <div className="container px-4 md:px-6">
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" asChild className="mr-2">
                                <Link to="/">
                                    <ArrowLeft/>
                                    <span className="sr-only">Back</span>
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                                All Devices
                            </h1>
                        </div>
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {devices.map((device) => (
                                <Card key={device.id} className="">
                                    <CardHeader className={`${device.bgColor}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center">
                                                    <device.icon className={`h-5 w-5 ${device.color} mr-2`}/>
                                                    {device.name}
                                                </CardTitle>
                                                <CardDescription className="capitalize">{device.type}</CardDescription>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium
                                             ${device.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {device.status === "active" ? "Active" : "Inactive"}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    Current Value
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {device.value}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    Last Updated
                                                </div>
                                                <div className="text-sm">
                                                    {device.lastUpdated}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t p-4">
                                        <Button variant="ghost" className="w-full" asChild>
                                            <Link to={`/devices/${device.id}`}>
                                                View Details
                                                <ArrowRight className="w-4 h-4 ml-2"/>
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}