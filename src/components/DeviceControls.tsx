import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Fan, Gauge } from "lucide-react"
import mqtt from "mqtt"
import { formatDistanceToNowStrict, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
export default function DeviceControls() {
    const [actuatorValues, setActuatorValues] = useState({
        "pump1":false,
        "pump2":false,
        "fan":false
    })
    const [lastUpdatedDate, setLastUpdatedDate] = useState(new Date())
    const [tick,setTick] = useState(0)
    const userAIOUsername = import.meta.env.VITE_USERAIOUSERNAME?import.meta.env.VITE_USERAIOUSERNAME:""
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY?import.meta.env.VITE_USERAIOUSERKEY:""
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME?import.meta.env.VITE_OWNERAIOUSERNAME:""
    const [groupKey, setGroupKey] =  useState("")
    const feedKeyList = ['pump1', 'pump2', 'fan']

    const handleSwitch = async (type:string, value:boolean)  => {
        console.log(`Switch ${type} ${value?1:0}`)
        if (groupKey == "") {
            console.log("MISSING GROUP KEY")
            return
        }
        if (userAIOUsername == "" || userAIOUserkey == "" || ownerAIOUsername == "") {
            console.log("INVALID KEY")
            return
        }
        setActuatorValues(prev => ({...prev, [type]:value}))
        const apiUrl = 'https://io.adafruit.com/api/v2/'
        const response = await fetch(`${apiUrl}/${ownerAIOUsername}/feeds/${groupKey}.${type}/data`, {
            method: 'POST',
            headers: {
                "x-aio-key": userAIOUserkey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"value":value?1:0})
        })
        if (!response.ok) {
            console.log(`HTTP ERROR! status ${response.status}`)
            return response.json()
        }
    }

    useEffect(() => {
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
                for (let i = 0; i < feedKeyList.length; i++) {
                    client.subscribe(`${ownerAIOUsername}/feeds/${roomKey}.${feedKeyList[i]}`)
                }
            })
            client.on('message', (topic,message) => {
                const feedKey = topic.split('/')[2].split('.')[1]
                console.log(`Received message on topic ${feedKey} : ${message.toString()}`)
                setActuatorValues(prev => ({...prev, [feedKey]:(message.toString() == "1")}))
                setLastUpdatedDate(new Date())
            })
            client.on('error', (error) => {
                console.log(`MQTT ERROR: ${error}`)
            })
            client.on('disconnect', () => {
                console.log('Disconneted from Adafruit IO MQTT')
                for (let i = 0; i < feedKeyList.length; i++) {
                    client.unsubscribe(`${ownerAIOUsername}/feeds/${roomKey}.${feedKeyList[i]}`)
                }
            })
        }
        async function getCurrentActuatorValue () {
            const apiUrl = 'https://io.adafruit.com/api/v2/'
            const updatedDates = []
            let latestDate = new Date()
            for (let i = 0; i < feedKeyList.length; i++) {
                const response = await fetch(`${apiUrl}/${ownerAIOUsername}/feeds/${roomKey}.${feedKeyList[i]}/data/last`, {
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
                setActuatorValues(prev => ({...prev, [feedKeyList[i]]:(data.value == "1")}))
                updatedDates.push(parseISO(data['updated_at']))
                for (let i = 0; i < updatedDates.length; i++) {
                    if (i == 0) {
                        latestDate = updatedDates[i]
                    }
                    else if (updatedDates[i] > latestDate) {
                        latestDate = updatedDates[i]
                    }
                }
                setLastUpdatedDate(latestDate)
            }
        }
        const interval = setInterval(() => {
            setTick((prev) => prev + 1)
        }, 1000);

        getCurrentActuatorValue()
        connectAdafruitMQTT()
        return () => {
            clearInterval(interval);
        }
    }, [])



    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Gauge className="text-green-500 h-5 w-5"/>
                    <Label htmlFor="pump1" className="text-sm font-medium">
                        Máy bơm 1
                    </Label>
                </div>
                <Switch id="pump1" checked={actuatorValues.pump1} onCheckedChange={(checked)=>{handleSwitch("pump1",checked)}}/>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Gauge className="text-green-500 h-5 w-5"/>
                    <Label htmlFor="pump2" className="text-sm font-medium">
                        Máy bơm 2
                    </Label>
                </div>
                <Switch id="pump2" checked={actuatorValues.pump2} onCheckedChange={(checked)=>{handleSwitch("pump2",checked)}}/>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Fan className="text-purple-500 h-5 w-5"/>
                    <Label htmlFor="fan" className="text-sm font-medium">
                        Quạt
                    </Label>
                </div>
                <Switch id="fan" checked={actuatorValues.fan} onCheckedChange={(checked)=>{handleSwitch("fan",checked)}}/>
            </div>
            <div className="pt-2">
                <div className="text-xs text-muted-foreground">Cập nhật lần cuối: {formatDistanceToNowStrict(lastUpdatedDate, { addSuffix: true, locale: vi})}</div>
            </div>
        </div>
    )
}