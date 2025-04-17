import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export default function OverviewChart () {
    const data = {
        all: [
          { time: "00:00", temperature: 18, humidity: 65, light: 0,  soil: 20},
          { time: "03:00", temperature: 17, humidity: 68, light: 0,  soil: 40},
          { time: "06:00", temperature: 16, humidity: 70, light: 10, soil: 10},
          { time: "09:00", temperature: 19, humidity: 65, light: 50, soil: 60},
          { time: "12:00", temperature: 23, humidity: 55, light: 90, soil: 52},
          { time: "15:00", temperature: 25, humidity: 50, light: 80, soil: 29},
          { time: "18:00", temperature: 22, humidity: 55, light: 30, soil: 13},
          { time: "21:00", temperature: 20, humidity: 60, light: 5,  soil: 40},
        ],
        temperature: [
          { time: "00:00", value: 18 },
          { time: "03:00", value: 17 },
          { time: "06:00", value: 16 },
          { time: "09:00", value: 19 },
          { time: "12:00", value: 23 },
          { time: "15:00", value: 25 },
          { time: "18:00", value: 22 },
          { time: "21:00", value: 20 },
        ],
        humidity: [
          { time: "00:00", value: 65 },
          { time: "03:00", value: 68 },
          { time: "06:00", value: 70 },
          { time: "09:00", value: 65 },
          { time: "12:00", value: 55 },
          { time: "15:00", value: 50 },
          { time: "18:00", value: 55 },
          { time: "21:00", value: 60 },
        ],
        light: [
          { time: "00:00", value: 0 },
          { time: "03:00", value: 0 },
          { time: "06:00", value: 10 },
          { time: "09:00", value: 50 },
          { time: "12:00", value: 90 },
          { time: "15:00", value: 80 },
          { time: "18:00", value: 30 },
          { time: "21:00", value: 5 },
        ],
        pump1: [
          { time: "00:00", value: 0 },
          { time: "03:00", value: 0 },
          { time: "06:00", value: 1 },
          { time: "09:00", value: 0 },
          { time: "12:00", value: 0 },
          { time: "15:00", value: 0 },
          { time: "18:00", value: 1 },
          { time: "21:00", value: 0 },
        ],
        pump2: [
          { time: "00:00", value: 0 },
          { time: "03:00", value: 0 },
          { time: "06:00", value: 0 },
          { time: "09:00", value: 1 },
          { time: "12:00", value: 0 },
          { time: "15:00", value: 0 },
          { time: "18:00", value: 0 },
          { time: "21:00", value: 1 },
        ],
        fan: [
          { time: "00:00", value: 0 },
          { time: "03:00", value: 0 },
          { time: "06:00", value: 0 },
          { time: "09:00", value: 0 },
          { time: "12:00", value: 1 },
          { time: "15:00", value: 1 },
          { time: "18:00", value: 0 },
          { time: "21:00", value: 0 },
        ],
      }
    return (
        <div className="w-[calc(100vw_-_160px)] md:w-full overflow-auto ">
            <Tabs defaultValue="all" className="min-w-[700px]">
                <TabsList className="grid grid-cols-8 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="light">Light</TabsTrigger>
                    <TabsTrigger value="humidity">Humidity</TabsTrigger>
                    <TabsTrigger value="temperature">Temperature</TabsTrigger>
                    <TabsTrigger value="soil-moisture">Soil moisture</TabsTrigger>
                    <TabsTrigger value="pump1">Pump 1</TabsTrigger>
                    <TabsTrigger value="pump2">Pump 2</TabsTrigger>
                    <TabsTrigger value="fan">Fan</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="h-[300px]">
                    <ChartContainer config={{
                        light: {label: "Light", color: "#eab308"},
                        humidity: {label: "Humidity", color: "#3b82f6"},
                        temperature: {label: "Temperature", color: "#ef4444"},
                        soil: {label: "Soil moisture", color: "#06b6d4"}
                    }} className="h-full w-full">
                        <ResponsiveContainer>
                            <LineChart data={data.all} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="light" stroke="var(--color-light)" activeDot={{ r: 8 }} name="Light (%)"/>
                                <Line type="monotone" dataKey="humidity" stroke="var(--color-humidity)" activeDot={{ r: 8 }} name="Humidity (%)"/>
                                <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" activeDot={{ r: 8 }} name="Temperature (°C)"/>
                                <Line type="monotone" dataKey="soil" stroke="var(--color-soil)" activeDot={{ r: 8 }} name="Soil moisture (%)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="light" className="h-[300px] w-full">
                    <ChartContainer config={{
                        light: {label: "Light", color: "#eab308"}
                    }} className="h-full">
                        <ResponsiveContainer width="100%" height="100%" className="w-1">
                            <LineChart data={data.all} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="light" stroke="var(--color-light)" activeDot={{ r: 8 }} name="Light (%)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="humidity" className="h-[300px] w-full">
                    <ChartContainer config={{
                        humidity: {label: "Humidity", color: "#3b82f6"},
                    }} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.all} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="humidity" stroke="var(--color-humidity)" activeDot={{ r: 8 }} name="Humidity (%)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="temperature" className="h-[300px] w-full">
                    <ChartContainer config={{
                        temperature: {label: "Temperature", color: "#ef4444"},
                    }} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.all} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" activeDot={{ r: 8 }} name="Temperature (°C)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="soil-moisture" className="h-[300px] w-full">
                    <ChartContainer config={{
                        soil: {label: "Soil moisture", color: "#06b6d4"}
                    }} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.all} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="soil" stroke="var(--color-soil)" activeDot={{ r: 8 }} name="Soil moisture (%)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="pump1" className="h-[300px] w-full">
                    <ChartContainer config={{
                        value: {label: "Pump 1", color: "#22c55e"},
                    }} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.pump1} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="stepAfter" dataKey="value" stroke="var(--color-value)" activeDot={{ r: 8 }} name="Pump 1 (On/Off)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="pump2" className="h-[300px] w-full">
                    <ChartContainer config={{
                        value: {label: "Pump 2", color: "#22c55e"},
                    }} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.pump2} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="stepAfter" dataKey="value" stroke="var(--color-value)" activeDot={{ r: 8 }} name="Pump 2 (On/Off)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="fan" className="h-[300px] w-full ">
                    <ChartContainer config={{
                        value: {label: "Fan", color: "#a855f7"},
                    }} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.fan} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent/>}/>
                                <Legend/>
                                <Line type="stepAfter" dataKey="value" stroke="var(--color-value)" activeDot={{ r: 8 }} name="Fan (On/Off)"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </TabsContent>
            </Tabs>
        </div>
    )
}