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
                                <p className="mt-2 text-muted-foreground">Theo dõi và quản lý thiết bị IoTs</p>
                            </div>
                            <div className="flex gap-2 flex-col md:flex-row">
                                <Button asChild variant="outline">
                                    <Link to="/schedule">
                                        Xem lịch
                                        <ArrowRight/>
                                    </Link>
                                </Button>
                                <Button asChild >
                                    <Link to="/devices">
                                        Các thiết bị
                                        <ArrowRight/>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="mt-8 grid gap-6 md:grid-cols-2"> {/*lg:grid-cols-3*/}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Thông tin môi trường</CardTitle>
                                    <CardDescription>Thông tin cảm biến</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SensorReadings/>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Điều khiển thiết bị</CardTitle>
                                    <CardDescription>Quản lý thiết bị điều khiển</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeviceControls/>
                                </CardContent>
                            </Card>
                            {/* <Card>
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
                            </Card> */}
                        </div>
                        <div className="mt-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Biểu đồ tổng quan</CardTitle>
                                    <CardDescription>Thông tin thiết bị trong 24 giờ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <OverviewChart/>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-semibold">Truy cập nhanh</CardTitle>
                                    <CardDescription>Xem chi tiết thiết bị</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                        <Button variant="outline">
                                            <Link to="/devices/light-sensor" className="flex-1 text-left">
                                                <span className="mr-2 h-4 w-4 text-yellow-500">●</span>
                                                Cảm biến ánh sáng
                                            </Link>
                                        </Button>
                                        <Button variant="outline">
                                            <Link to="/devices/humidity-sensor" className="flex-1 text-left">
                                                <span className="mr-2 h-4 w-4 text-blue-500">●</span>
                                                Cảm biến độ ẩm không khí
                                            </Link>
                                        </Button>
                                        <Button variant="outline">
                                            <Link to="/devices/temperature-sensor" className="flex-1 text-left">
                                                <span className="mr-2 h-4 w-4 text-red-500">●</span>
                                                Cảm biến nhiệt độ
                                            </Link>
                                        </Button>
                                        <Button variant="outline">
                                            <Link to="/devices/soil-moisture-sensor" className="flex-1 text-left">
                                                <span className="mr-2 h-4 w-4 text-cyan-500">●</span>
                                                Cảm biến độ ẩm đất
                                            </Link>
                                        </Button>
                                        <Button variant="outline">
                                            <Link to="/devices/pump-1" className="flex-1 text-left">
                                                <span className="mr-2 h-4 w-4 text-green-500">●</span>
                                                Máy bơm 1
                                            </Link>
                                        </Button>
                                        <Button variant="outline">
                                            <Link to="/devices/pump-2" className="flex-1 text-left">
                                                <span className="mr-2 h-4 w-4 text-green-500">●</span>
                                                Máy bơm 2
                                            </Link>
                                        </Button>
                                        <Button variant="outline">
                                            <Link to="/devices/fan" className="flex-1 text-left">
                                                <span className="mr-2 h-4 w-4 text-purple-500">●</span>
                                                Quạt
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