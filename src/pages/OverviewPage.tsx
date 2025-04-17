import DeviceControls from "@/components/DeviceControls"
import OverviewChart from "@/components/OverviewChart"
import SensorReadings from "@/components/SensorReadings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
export default function OverviewPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                <section className="w-full py-6 md:py-12">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold tracking-tighter text-wrap sm:text-4xl md:text-5xl">Funny Farm Dashboard</h1>
                                <p className="mt-2 text-muted-foreground">Monitor and control farm devices</p>
                            </div>
                            <div className="flex gap-2 flex-col md:flex-row">
                                <Button asChild variant="outline">
                                    <Link to="/schedule">
                                        View Schedule
                                        <ArrowRight/>
                                    </Link>
                                </Button>
                                <Button asChild >
                                    <Link to="/devices">
                                        All Devices
                                        <ArrowRight/>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Environment</CardTitle>
                                    <CardDescription>Current sensor readings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SensorReadings/>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Device controls</CardTitle>
                                    <CardDescription>Manage farm devices</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeviceControls/>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">LED Display</CardTitle>
                                    <CardDescription>Current message on LED screen</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-black p-4 rounded-md">
                                            <p className="text-green-500 font-mono text-center">FARM SYSTEM ACTIVE</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Sensor Data Overview</CardTitle>
                                    <CardDescription>24-hour sensor readings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <OverviewChart/>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Quick Access</CardTitle>
                                    <CardDescription>View device details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                        <Button variant="outline" className="justify-start">
                                            <Link to="/device/light-sensor">
                                                <span className="mr-2 h-4 w-4 text-yellow-500">●</span>
                                                Light sensor
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Link to="/device/humid-sensor">
                                                <span className="mr-2 h-4 w-4 text-blue-500">●</span>
                                                Humidity sensor
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Link to="/device/humid-sensor">
                                                <span className="mr-2 h-4 w-4 text-red-500">●</span>
                                                Temperature sensor
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Link to="/device/soil-moisture-sensor">
                                                <span className="mr-2 h-4 w-4 text-cyan-500">●</span>
                                                Soil moisture sensor
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Link to="/device/humid-sensor">
                                                <span className="mr-2 h-4 w-4 text-green-500">●</span>
                                                Pump 1
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Link to="/device/humid-sensor">
                                                <span className="mr-2 h-4 w-4 text-green-500">●</span>
                                                Pump 2
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Link to="/device/humid-sensor">
                                                <span className="mr-2 h-4 w-4 text-purple-500">●</span>
                                                Fan
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}