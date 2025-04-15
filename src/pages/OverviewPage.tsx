import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
export default function OverviewPage() {
    return (
        <div className="min-h-screen w-full">
            <main>
                <section>
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Funny Farm Dashboard</h1>
                                <p className="mt-2">Monitor and control farm devices</p>
                            </div>
                            <div className="flex items-center gap-2 bg-green-200">
                                <button className="bg-green-500 p-2 rounded-xl border-1">To schedule</button>
                                <button className="bg-green-500 p-2 rounded-xl border-1">To all devices</button>
                            </div>
                        </div>
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle>Environment</CardTitle>
                                    <CardDescription>Current sensor readings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    SensorReadings
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Device controls</CardTitle>
                                    <CardDescription>Manage farm devices</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    DeviceControls
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>LED Display</CardTitle>
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
                                <CardHeader>
                                    <CardTitle>Sensor Data Overview</CardTitle>
                                    <CardDescription>24-hour sensor readings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    chart
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Access</CardTitle>
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