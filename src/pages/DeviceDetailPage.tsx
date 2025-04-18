import DeviceChart from "@/components/DeviceChart";
import { DeviceLog } from "@/components/DeviceLog";
import { DeviceSchedule } from "@/components/DeviceSchedule";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, History, Info } from "lucide-react"
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
                <div className="flex flex-row items-center">
                    <Button variant="ghost" size="icon" asChild className="mr-2">
                      <Link to="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                      </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                      <span className={device.color}>●</span> {device.name}
                    </h1>
                </div>
    
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-semibold">Status</CardTitle>
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
                            className={`font-medium ${device.status === "active" ? "text-green-500" : "text-gray-500"}`}
                          >
                            {device.status === "active" ? "Active" : "Inactive"}
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
                      {device.type === "actuator" && (
                        <Button className="mt-4 w-full">{device.status === "active" ? "Turn Off" : "Turn On"}</Button>
                      )}
                    </CardContent>
                  </Card>
    
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-semibold">Quick Information</CardTitle>
                      <CardDescription>Device overview and actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <Info className="h-6 w-6 text-blue-500" />
                          <div>
                            <h3 className="font-medium">Device ID</h3>
                            <p className="text-sm text-muted-foreground">IOT-{id?.toUpperCase()}-001</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <Clock className="h-6 w-6 text-orange-500" />
                          <div>
                            <h3 className="font-medium">Uptime</h3>
                            <p className="text-sm text-muted-foreground">14 days, 6 hours</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <History className="h-6 w-6 text-purple-500" />
                          <div>
                            <h3 className="font-medium">Last Maintenance</h3>
                            <p className="text-sm text-muted-foreground">2023-10-15</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <Calendar className="h-6 w-6 text-green-500" />
                          <div>
                            <h3 className="font-medium">Next Scheduled Task</h3>
                            <p className="text-sm text-muted-foreground">Tomorrow, 08:00 AM</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
    
                <div className="mt-6">
                  <Tabs defaultValue="chart">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="chart">Chart</TabsTrigger>
                      <TabsTrigger value="log">Activity Log</TabsTrigger>
                      <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Historical Data</CardTitle>
                          <CardDescription>7-day data visualization</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DeviceChart deviceId={id?id:""} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="log" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Activity Log</CardTitle>
                          <CardDescription>Recent device activities and events</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DeviceLog deviceId={id?id:""} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="schedule" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Device Schedule</CardTitle>
                          <CardDescription>Upcoming scheduled tasks for this device</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DeviceSchedule deviceId={id?id:""} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </section>
          </main>
        </div>
      )
}