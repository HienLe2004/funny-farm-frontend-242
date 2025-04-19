import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { parseISO } from "date-fns";
export default function OverviewChart () {
    interface Data {
        "time":string, value:number|null
    }
    interface DeviceData {
        [key: string]: Data[]|[]; 
    }
    const [sensorValues, setSensorValues] = useState<DeviceData>({
            "light":[],
            "hum":[],
            "temp":[],
            "soil":[],
            "fan":[],
            "pump1":[],
            "pump2":[]
        })
    const [tick,setTick] = useState(0)
    const userAIOUsername = import.meta.env.VITE_USERAIOUSERNAME?import.meta.env.VITE_USERAIOUSERNAME:""
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY?import.meta.env.VITE_USERAIOUSERKEY:""
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME?import.meta.env.VITE_OWNERAIOUSERNAME:""
    const [groupKey, setGroupKey] = useState('da')
    const feedKeyList = ['light', 'hum', 'temp', 'soil', 'pump1', 'pump2', 'fan']
    
    useEffect(() => {
        if (userAIOUsername == "" || userAIOUserkey == "" || ownerAIOUsername == "") {
            console.log("INVALID KEY")
            return
        }
        const mqttBrokerUrl = 'mqtt://io.adafruit.com'
        const client = mqtt.connect(mqttBrokerUrl, {
            username: userAIOUsername,
            password: userAIOUserkey
        })
        const connectAdafruitMQTT = () => {
            client.on('connect', () => {
                console.log('Connected to Adafruit IO MQTT')
                for (let i = 0; i < feedKeyList.length; i++) {
                    client.subscribe(`${ownerAIOUsername}/feeds/${groupKey}.${feedKeyList[i]}`)
                }
            })
            client.on('message', (topic,message) => {
                const feedKey:string = topic.split('/')[2].split('.')[1]
                console.log(`Received message on topic ${feedKey} : ${message.toString()}`)
                let values:Data[] = sensorValues[feedKey]
                let newTime:string = (new Date()).toISOString()
                if (values.length > 0 && new Date(newTime).getTime() - new Date(values[values.length - 1].time).getTime() > 2000) {
                    // console.log("Duplicate data");
                    values[values.length - 1].value = Number(message.toString())
                }
                else {
                    // console.log("New data" + values.length)
                    values.push({time: new Date().toISOString(),value:Number(message.toString())})
                }
                getTwentyFourHoursDeviceValues(feedKey)
            })
            client.on('error', (error) => {
                console.log(`MQTT ERROR: ${error}`)
            })
            client.on('disconnect', () => {
                console.log('Disconneted from Adafruit IO MQTT')
                for (let i = 0; i < feedKeyList.length; i++) {
                    client.unsubscribe(`${ownerAIOUsername}/feeds/${groupKey}.${feedKeyList[i]}`)
                }
            })
        }
        async function getTwentyFourHoursDeviceValues (feedKey:string) {
            const apiUrl = 'https://io.adafruit.com/api/v2/'
            let currentDate = new Date()
            let twentyFourHoursAgo = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))
            const response = await fetch(`${apiUrl}/${ownerAIOUsername}/feeds/${groupKey}.${feedKey}/data`, {
                method: 'GET',
                headers: {
                    'x-aio-key': userAIOUserkey
                }
            })
            if (!response.ok) {
                console.log(`HTTP ERROR! status ${response.status}`)
                return response.json()
            }
            const data = await response.json()
            let realValues = data.filter((day:{'created_at':string, 'value':string}) => { 
                const createdDataDate = new Date(day['created_at'])
                return (createdDataDate < currentDate && createdDataDate > twentyFourHoursAgo);
            })
            realValues.reverse()
            setSensorValues(prev => ({...prev, 
                [feedKey]:realValues.map((day:{'created_at':string, 'value':string}) => 
                    ({"time":day['created_at'], "value":Number(day['value'])})
            )}))
        }
        const interval = setInterval(() => {
            setTick((prev) => prev + 1)
        }, 1000);
        for (let i = 0; i < feedKeyList.length; i++) {
            getTwentyFourHoursDeviceValues(feedKeyList[i])
        }
        connectAdafruitMQTT()
        return () => {
            clearInterval(interval); 
        }
    }, [])
    
    return (
        <div className="w-[calc(100vw_-_160px)] md:w-full overflow-auto ">
            <Tabs defaultValue="light" className="min-w-[700px]">
                <TabsList className="grid grid-cols-7 mb-4">
                    {/* <TabsTrigger value="all">All</TabsTrigger> */}
                    <TabsTrigger value="light">Ánh sáng</TabsTrigger>
                    <TabsTrigger value="humidity">Độ ẩm kk</TabsTrigger>
                    <TabsTrigger value="temperature">Nhiệt độ</TabsTrigger>
                    <TabsTrigger value="soil-moisture">Độ ẩm đất</TabsTrigger>
                    <TabsTrigger value="pump1">Bơm 1</TabsTrigger>
                    <TabsTrigger value="pump2">Bơm 2</TabsTrigger>
                    <TabsTrigger value="fan">Quạt</TabsTrigger>
                </TabsList>
                {/* <TabsContent value="all" className="h-[300px]">
                    <ChartContainer config={{
                        light: {label: "Light", color: "#eab308"},
                        humidity: {label: "Humidity", color: "#3b82f6"},
                        temperature: {label: "Temperature", color: "#ef4444"},
                        soil: {label: "Soil moisture", color: "#06b6d4"}
                    }} className="h-full w-full">
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
                    </ChartContainer>
                </TabsContent> */}
                <TabsContent value="light" className="h-[300px]">
                    <ChartContainer config={{
                        light: {label: "Light", color: "#eab308"}
                    }} className="h-full w-full">
                            <LineChart data={sensorValues['light']} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tickMargin={8} minTickGap={32}
                                    tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric"
                                    })
                                }}/>
                                <YAxis/>
                                <Tooltip content={
                                    <ChartTooltipContent labelFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric"
                                    })}} />
                                }/>
                                <Legend/>
                                <Line type="monotone" dataKey="value" stroke="var(--color-light)" activeDot={{ r: 8 }} name="Ánh sáng (%)"/>
                            </LineChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="humidity" className="h-[300px]">
                    <ChartContainer config={{
                        humidity: {label: "Humidity", color: "#3b82f6"},
                    }} className="h-full w-full">
                            <LineChart data={sensorValues["hum"]} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tickMargin={8} minTickGap={32}
                                    tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric"
                                    })
                                }}/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent labelFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric"
                                    })
                                }}/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="value" stroke="var(--color-humidity)" activeDot={{ r: 8 }} name="Độ ẩm không khí (%)"/>
                            </LineChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="temperature" className="h-[300px]">
                    <ChartContainer config={{
                        temperature: {label: "Temperature", color: "#ef4444"},
                    }} className="h-full w-full">
                            <LineChart data={sensorValues["temp"]} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tickMargin={8} minTickGap={32}
                                    tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric"
                                    })
                                }}/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent labelFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric"
                                    })
                                }}/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="value" stroke="var(--color-temperature)" activeDot={{ r: 8 }} name="Nhiệt độ (°C)"/>
                            </LineChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="soil-moisture" className="h-[300px]">
                    <ChartContainer config={{
                        soil: {label: "Soil moisture", color: "#06b6d4"}
                    }} className="h-full w-full">
                            <LineChart data={sensorValues["soil"]} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tickMargin={8} minTickGap={32}
                                    tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric"
                                    })
                                }}/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent labelFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric"
                                    })
                                }}/>}/>
                                <Legend/>
                                <Line type="monotone" dataKey="value" stroke="var(--color-soil)" activeDot={{ r: 8 }} name="Độ ẩm đất (%)"/>
                            </LineChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="pump1" className="h-[300px]">
                    <ChartContainer config={{
                        value: {label: "Pump 1", color: "#22c55e"},
                    }} className="h-full w-full">
                            <LineChart data={sensorValues['pump1']} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tickMargin={8} minTickGap={32}
                                    tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric"
                                    })
                                }}/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent labelFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric"
                                    })
                                }}/>}/>
                                <Legend/>
                                <Line type="stepAfter" dataKey="value" stroke="var(--color-value)" activeDot={{ r: 8 }} name="Máy bơm 1 (Bật/Tắt)"/>
                            </LineChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="pump2" className="h-[300px]">
                    <ChartContainer config={{
                        value: {label: "Pump 2", color: "#22c55e"},
                    }} className="h-full w-full">
                            <LineChart data={sensorValues['pump2']} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tickMargin={8} minTickGap={32}
                                    tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric"
                                    })
                                }}/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent labelFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric"
                                    })
                                }}/>}/>
                                <Legend/>
                                <Line type="stepAfter" dataKey="value" stroke="var(--color-value)" activeDot={{ r: 8 }} name="Máy bơm 2 (Bật/Tắt)"/>
                            </LineChart>
                    </ChartContainer>
                </TabsContent>
                <TabsContent value="fan" className="h-[300px]">
                    <ChartContainer config={{
                        value: {label: "Fan", color: "#a855f7"},
                    }} className="h-full w-full">
                            <LineChart data={sensorValues['fan']} margin={{top:5, right:30, left:10, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tickMargin={8} minTickGap={32}
                                    tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric"
                                    })
                                }}/>
                                <YAxis/>
                                <Tooltip content={<ChartTooltipContent labelFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleTimeString("vi-VN", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric"
                                    })
                                }}/>}/>
                                <Legend/>
                                <Line type="stepAfter" dataKey="value" stroke="var(--color-value)" activeDot={{ r: 8 }} name="Quạt (Bật/Tắt)"/>
                            </LineChart>
                    </ChartContainer>
                </TabsContent>
            </Tabs>
        </div>
    )
}