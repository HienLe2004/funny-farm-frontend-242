import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info } from "lucide-react"
import { Link, useParams } from "react-router-dom"

const devices = {
    "light-sensor": {
      name: "Light Sensor",
      type: "sensor",
      value: "75%",
      status: "active",
      lastUpdated: "2 minutes ago",
      color: "text-yellow-500",
    },
    "humidity-sensor": {
      name: "Humidity Sensor",
      type: "sensor",
      value: "58%",
      status: "active",
      lastUpdated: "2 minutes ago",
      color: "text-blue-500",
    },
    "temperature-sensor": {
      name: "Temperature Sensor",
      type: "sensor",
      value: "23.5°C",
      status: "active",
      lastUpdated: "2 minutes ago",
      color: "text-red-500",
    },
    "pump-1": {
      name: "Pump 1",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "15 minutes ago",
      color: "text-green-500",
    },
    "pump-2": {
      name: "Pump 2",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "1 hour ago",
      color: "text-green-500",
    },
    fan: {
      name: "Fan",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "30 minutes ago",
      color: "text-purple-500",
    },
  }
export default function DeviceDetailPage () {
    const {id} = useParams();
    const device = devices[id as keyof typeof devices]
    if (!device) {
        return<>Not found</>
    }
    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex-1">
                <section className="w-full py-6 md:py-12">
                    <div className="container px-4 md:px-6">
                        <div>
                            <Button variant="ghost" size="icon" asChild className="mr-2">
                                <Link to="/devices">
                                    <ArrowLeft className="h-4 w-4"/>
                                    <span className="sr-only">Back</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Status</CardTitle>
                                <CardDescription>Current device information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Current Value:</span>
                                        <span className="font-bold">{device.value}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Status:</span>
                                        <span 
                                            className={`font-medium ${device.status === "active"?"text-green-500":"text-red-500"}`}>
                                            {device.status === "active"?"Active":"Inactive"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Last Updated:</span>
                                        <span className="text-sm text-muted-foreground">{device.lastUpdated}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Type:</span>
                                        <span className="text-sm capitalize">{device.type}</span>
                                    </div>
                                </div>
                                {device.type==="actuator"&&(
                                    <Button className="mt-4 w-full">
                                        {device.status==="active"?"Turn Off":"Turn On"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle>Quick Information</CardTitle>
                                <CardDescription>Device overview and actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <div>
                                        <Info className="h-6 w-6 text-blue-500"/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    )
}