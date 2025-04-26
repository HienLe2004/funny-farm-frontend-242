import DeviceChart from "@/components/DeviceChart";
import { DeviceLog } from "@/components/DeviceLog";
import { DeviceSchedule } from "@/components/DeviceSchedule";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNowStrict } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, History, Info } from "lucide-react"
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"

export default function DeviceDetailPage () {
    const {id} = useParams();
    const [tick,setTick] = useState(0)
    const navigate = useNavigate()
    const feedKeyList = {
      'light-sensor':'light',
      'humidity-sensor':'hum',
      'temperature-sensor':'temp',
      'soil-moisture-sensor':'soil',
      'pump-1':'pump1',
      'pump-2':'pump2',
      'fan':'fan'
    }
    const [devices,setDevices] = useState({
      "light-sensor": {
        name: "Cảm biến ánh sáng",
        unit: "%",
        type: "sensor",
        color: "text-yellow-500",
        value: "0",
        lastUpdated: new Date(),
        status: "active"
      },
      "humidity-sensor": {
        name: "Cảm biến độ ẩm không khí",
        unit: "%",
        type: "sensor",
        color: "text-blue-500",
        value: "0",
        lastUpdated: new Date(),
        status: "active"
      },
      "temperature-sensor": {
        name: "Cảm biến nhiệt độ",
        unit: "°C",
        type: "sensor",
        color: "text-red-500",
        value: "0",
        lastUpdated: new Date(),
        status: "active"
      },
      "soil-moisture-sensor": {
        name: "Cám biến độ ẩm đất",
        unit: "%",
        type: "sensor",
        color: "text-cyan-500",
        value: "0",
        lastUpdated: new Date(),
        status: "active"
      },
      "pump-1": {
        name: "Máy bơm 1",
        unit: "",
        type: "actuator",
        color: "text-green-500",
        value: "0",
        lastUpdated: new Date(),
        status: "inactive"
      },
      "pump-2": {
        name: "Máy bơm 2",
        unit: "",
        type: "actuator",
        color: "text-green-500",
        value: "0",
        lastUpdated: new Date(),
        status: "inactive"
      },
      "fan": {
        name: "Quạt",
        unit: "",
        type: "actuator",
        color: "text-purple-500",
        value: "0",
        lastUpdated: new Date(),
        status: "inactive"
      },
    })

    const [device,setDevice] = useState(devices[id as keyof typeof devices])
    if (!device) {
        return<>Not found</>
    }
    const userAIOUsername = import.meta.env.VITE_USERAIOUSERNAME?import.meta.env.VITE_USERAIOUSERNAME:""
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY?import.meta.env.VITE_USERAIOUSERKEY:""
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME?import.meta.env.VITE_OWNERAIOUSERNAME:""
    const [groupKey, setGroupKey] =  useState("")
    const [feedKey, setFeedKey] = useState(feedKeyList[id as keyof typeof feedKeyList])
    const handleClick = async () => {
      if (groupKey == "") {
        console.log("MISSING GROUP KEY")
        return
      }
      if (device.type == "sensor") {
        console.log("Can not turn on/off sensor")
        return
      }
      const apiUrl = 'https://io.adafruit.com/api/v2/'
      const response = await fetch(`${apiUrl}/${ownerAIOUsername}/feeds/${groupKey}.${feedKey}/data`,  {
        method: 'POST',
        headers: {
            "x-aio-key": userAIOUserkey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"value":device.value=="0"?1:0})
      })
      if (!response.ok) {
          console.log(`HTTP ERROR! status ${response.status}`)
          return response.json()
      }
    }
    useEffect(()=>{
      const roomKey = sessionStorage.getItem("roomKey")
      if (!roomKey) {
        console.log("MISSING GROUP KEY")
        return
      }
      else {
        setGroupKey(roomKey)
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
              client.subscribe(`${ownerAIOUsername}/feeds/${roomKey}.${feedKey}`)
          })
          client.on('message', (topic,message) => {
              const feedKey = topic.split('/')[2].split('.')[1]
              console.log(`Received message on topic ${feedKey} : ${message.toString()}`)
              if (device.type == 'actuator') {
                setDevice(prev => ({...prev, value:message.toString(), lastUpdated: new Date(), status:message.toString()==="0"?"inactive":"active"}))
              }
              else {
                setDevice(prev => ({...prev, value:message.toString(), lastUpdated: new Date()}))
              }
          })
          client.on('error', (error) => {
              console.log(`MQTT ERROR: ${error}`)
          })
          client.on('disconnect', () => {
              console.log('Disconneted from Adafruit IO MQTT')
              client.unsubscribe(`${ownerAIOUsername}/feeds/${roomKey}.${feedKey}`)
          })
      }
      const getDeviceData = async()=>{
        const apiUrl = 'https://io.adafruit.com/api/v2/'
        const response = await fetch(`${apiUrl}/${ownerAIOUsername}/feeds/${roomKey}.${feedKey}`)
        if (!response.ok) {
          console.log("HTTP ERROR! status " + response.status)
        } 
        const data = await response.json()
        if (device.type == "actuator") {
          setDevice(prev => ({...prev, value:data['last_value'], lastUpdated:data['updated_at'], status:data['last_value']=="0"?"inactive":"active"}))
        }
        else {
          setDevice(prev => ({...prev, value:data['last_value'], lastUpdated:data['updated_at']}))
        }
        // console.log(data)
      }
      
      const interval = setInterval(() => {
        setTick(prev => prev + 1)
      }, 1000);
      connectAdafruitMQTT()
      getDeviceData()
      return (() => {
        clearInterval(interval)
      })
    },[feedKey])
    useEffect(()=>{
      setDevice(devices[id as keyof typeof devices])
      setFeedKey(feedKeyList[id as keyof typeof feedKeyList])
    },[id])
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
                      <CardTitle className="text-2xl font-semibold">Trạng thái</CardTitle>
                      <CardDescription>Thông tin hiện tại</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Giá trị hiện tại:</span>
                          <span className="font-bold">{device.value}{device.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Trạng thái:</span>
                          <span
                            className={`font-medium ${device.status === "active" ? "text-green-500" : "text-gray-500"}`}
                          >
                            {device.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Cập nhật lần cuối:</span>
                          <span className="text-sm text-muted-foreground">{formatDistanceToNowStrict(device.lastUpdated, { addSuffix: true, locale: vi})}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Loại thiết bị:</span>
                          <span className="text-sm">{device.type=="sensor"?"Cảm biến":"Điều khiển"}</span>
                        </div>
                      </div>
                      {device.type === "actuator" && (
                        <Button className="mt-4 w-full" onClick={handleClick}>{device.status === "active" ? "Turn Off" : "Turn On"}</Button>
                      )}
                    </CardContent>
                  </Card>
    
                  {/* <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-semibold">Thông tin khác</CardTitle>
                      <CardDescription>Thông tin khác về thiết bị</CardDescription>
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
                  </Card> */}
                </div>
    
                <div className="mt-6">
                  <Tabs defaultValue="chart">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
                      <TabsTrigger value="log">Nhật ký hoạt động</TabsTrigger>
                      {/* <TabsTrigger value="schedule">Lập lịch</TabsTrigger> */}
                    </TabsList>
                    <TabsContent value="chart" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Lịch sử dữ liệu</CardTitle>
                          <CardDescription>Biểu đồ dữ liệu 7 ngày</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DeviceChart deviceId={id?id:""} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="log" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Nhật ký hoạt động</CardTitle>
                          <CardDescription>Hoạt động và sự kiện gần đây</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DeviceLog deviceFeedKey={feedKey?feedKey:""} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    {/* <TabsContent value="schedule" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Lịch của thiết bị</CardTitle>
                          <CardDescription>Các lịch sắp tới của thiết bị</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DeviceSchedule feedKey={feedKey?feedKey:""}/>
                        </CardContent>
                      </Card>
                    </TabsContent> */}
                  </Tabs>
                </div>
              </div>
            </section>
          </main>
        </div>
      )
}