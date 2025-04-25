import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Droplet, Droplets, Fan, Gauge, Lightbulb, Thermometer } from "lucide-react";
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function DevicesPage () {
    const [tick,setTick] = useState(0)
    const feedKeyList = {
        'light-sensor':'light',
        'humidity-sensor':'hum',
        'temperature-sensor':'temp',
        'soil-moisture-sensor':'soil',
        'pump-1':'pump1',
        'pump-2':'pump2',
        'fan':'fan'
    }
    const staticDevices = {
        "light":
        {
            id: "light-sensor",
            name: "Cảm biến ánh sáng",
            type: "sensor",
            icon: Lightbulb,
            unit: "%",
            color: "text-yellow-500",
            bgColor: "bg-yellow-50",
        },
        "hum":
        {
            id: "humidity-sensor",
            name: "Cảm biến độ ẩm không khí",
            type: "sensor",
            icon: Droplet,
            unit: "%",
            color: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        "temp":
        {
            id: "temperature-sensor",
            name: "Cảm biến nhiệt độ",
            type: "sensor",
            icon: Thermometer,
            unit: "°C",
            color: "text-red-500",
            bgColor: "bg-red-50",
        },
        "soil":
        {
            id: "soil-moisture-sensor",
            name: "Cảm biến độ ẩm đất",
            type: "sensor",
            icon: Droplets,
            unit: "%",
            color: "text-cyan-500",
            bgColor: "bg-cyan-50",
        },
        "pump1":
        {
            id: "pump-1",
            name: "Máy bơm 1",
            type: "actuator",
            icon: Gauge,
            unit: "",
            color: "text-green-500",
            bgColor: "bg-green-50",
        },
        "pump2":
        {
            id: "pump-2",
            name: "Máy bơm 2",
            type: "actuator",
            icon: Gauge,
            unit: "",
            color: "text-green-500",
            bgColor: "bg-green-50",
        },
        "fan":
        {
            id: "fan",
            name: "Quạt",
            type: "actuator",
            icon: Fan,
            unit: "",
            color: "text-purple-500",
            bgColor: "bg-purple-50",
        }
    }
    const [devices,setDevices] = useState({
        "light":
        {
          id: "light-sensor",
          value: "0",
          status: "active",
          lastUpdated: new Date(),
        },
        "hum":
        {
          id: "humidity-sensor",
          value: "0",
          status: "active",
          lastUpdated: new Date(),
        },
        "temp":
        {
          id: "temperature-sensor",
          value: "0",
          status: "active",
          lastUpdated: new Date(),
        },
        "soil":
        {
          id: "soil-moisture-sensor",
          value: "0", 
          status: "active",
          lastUpdated: new Date(),
        },
        "pump1":
        {
          id: "pump-1",
          value: "Off",
          status: "inactive",
          lastUpdated: new Date(),
        },
        "pump2":
        {
          id: "pump-2",
          value: "Off",
          status: "inactive",
          lastUpdated: new Date(),
        },
        "fan":
        {
          id: "fan",
          value: "Off",
          status: "inactive",
          lastUpdated: new Date(),
        }
    })
    const userAIOUsername = import.meta.env.VITE_USERAIOUSERNAME?import.meta.env.VITE_USERAIOUSERNAME:""
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY?import.meta.env.VITE_USERAIOUSERKEY:""
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME?import.meta.env.VITE_OWNERAIOUSERNAME:""
    useEffect(() => {
        const roomKey = sessionStorage.getItem("roomKey")
        if (!roomKey) {
            console.log("MISSING GROUP KEY")
            return
        }
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
                for (let i = 0; i < Object.keys(feedKeyList).length; i++) {
                    const feedKey = feedKeyList[Object.keys(feedKeyList)[i] as keyof typeof feedKeyList] 
                    client.subscribe(`${ownerAIOUsername}/feeds/${roomKey}.${feedKey}`)
                }
            })
            client.on('message', (topic,message) => {
                const feedKey:string = topic.split('/')[2].split('.')[1]
                console.log(`Received message on topic ${feedKey} : ${message.toString()}`)
                if (staticDevices[feedKey as keyof typeof staticDevices]['type'] == "actuator") {
                    setDevices(prev => ({...prev, [feedKey]:{...[feedKey], value:message.toString(), lastUpdated:new Date(), status:message.toString()=="0"?"inactive":"active" }})) 
                }
                else {
                    setDevices(prev => ({...prev, [feedKey]:{...[feedKey], value:message.toString(), lastUpdated:new Date(), status:"active" }})) 
                }
            })
            client.on('error', (error) => {
                console.log(`MQTT ERROR: ${error}`)
            })
            client.on('disconnect', () => {
                console.log('Disconneted from Adafruit IO MQTT')
                for (let i = 0; i < Object.keys(feedKeyList).length; i++) {
                    const feedKey = feedKeyList[Object.keys(feedKeyList)[i] as keyof typeof feedKeyList] 
                    client.unsubscribe(`${ownerAIOUsername}/feeds/${roomKey}.${feedKey}`)
                }
            })
        }
        async function getCurrentDeviceValues () {
            const apiUrl = 'https://io.adafruit.com/api/v2/'
            for (let i = 0; i < Object.keys(feedKeyList).length; i++) {
                const feedKey = feedKeyList[Object.keys(feedKeyList)[i] as keyof typeof feedKeyList] 
                const response = await fetch(`${apiUrl}/${ownerAIOUsername}/feeds/${roomKey}.${feedKey}/data/last`, {
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
                // console.log(data)
                if (staticDevices[feedKey as keyof typeof staticDevices]['type'] == "actuator") {
                    setDevices(prev => ({...prev, [feedKey]:{...[feedKey], value:data['value'], lastUpdated:new Date(data['updated_at']), status:data['value']=="0"?"inactive":"active" }})) 
                }
                else {
                    setDevices(prev => ({...prev, [feedKey]:{...[feedKey], value:data['value'], lastUpdated:new Date(data['updated_at']), status:"active" }})) 
                }
            }

        }
        const interval = setInterval(() => {
            setTick((prev) => prev + 1)
        }, 1000);
        getCurrentDeviceValues()
        setTimeout(() => {
            connectAdafruitMQTT()
        }, 1000);
        return () => {
            clearInterval(interval); 
        }
    },[])
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
                                Tất cả thiết bị
                            </h1>
                        </div>
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.keys(devices)?.map((deviceKey) => {
                                const device = devices[deviceKey as keyof typeof devices]
                                const staticDevice = staticDevices[deviceKey as keyof typeof staticDevices]
                                return(
                                <Card key={deviceKey} className="">
                                    <CardHeader className={`${staticDevice.bgColor}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center" key={deviceKey}>
                                                    <staticDevice.icon className={`h-5 w-5 ${staticDevice.color} mr-2`}/>
                                                    {staticDevice.name}
                                                </CardTitle>
                                                <CardDescription className="capitalize">{staticDevice.type}</CardDescription>
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
                                                    Giá trị hiện tại
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {device.value}{staticDevice.unit}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    Cập nhật
                                                </div>
                                                <div className="text-sm">
                                                    {formatDistanceToNowStrict(device.lastUpdated, { addSuffix: true, locale: vi})}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t p-4">
                                        <Button variant="ghost" className="w-full" asChild>
                                            <Link to={`/devices/${staticDevice.id}`}>
                                                Chi tiết
                                                <ArrowRight className="w-4 h-4 ml-2"/>
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )})}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}