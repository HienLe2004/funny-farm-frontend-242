import { Droplet, Droplets, Lightbulb, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow, formatDistanceToNowStrict, parseISO } from "date-fns";
import mqtt from "mqtt"

export default function SensorReadings () {
    const [sensorValues, setSensorValues] = useState({
        "light":0,
        "hum":0,
        "temp":0,
        "soil":0
    })
    const [lastUpdatedDate, setLastUpdatedDate] = useState(new Date())
    const [tick,setTick] = useState(0)
    useEffect(() => {
        const groupKey = 'da'
        const feedKeyList = ['hum', 'light', 'temp', 'soil']
        const connectAdafruitMQTT = () => {
            const mqttBrokerUrl = 'mqtt://io.adafruit.com'
            const mqttUsername =  ''
            const mqttUserKey = ''
            const client = mqtt.connect(mqttBrokerUrl, {
                username: mqttUsername,
                password: mqttUserKey
            })
            client.on('connect', () => {
                console.log('Connected to Adafruit IO MQTT')
                for (let i = 0; i < feedKeyList.length; i++) {
                    client.subscribe(`${mqttUsername}/feeds/${groupKey}.${feedKeyList[i]}`)
                }
            })
            client.on('message', (topic,message) => {
                const feedKey = topic.split('/')[2].split('.')[1]
                console.log(`Received message on topic ${feedKey} : ${message.toString()}`)
                setSensorValues(prev => ({...prev, [feedKey]:message.toString()}))
                setLastUpdatedDate(new Date())
            })
            client.on('error', (error) => {
                console.log(`MQTT ERROR: ${error}`)
            })
            client.on('disconnect', () => {
                console.log('Disconneted from Adafruit IO MQTT')
            })
        }
        async function getCurrentSensorValue () {
            const apiUrl = 'https://io.adafruit.com/api/v2/'
            const feedUsername = ''
            const feedUserKey = ''
            const updatedDates = []
            let latestDate = new Date()
            for (let i = 0; i < feedKeyList.length; i++) {
                const response = await fetch(`${apiUrl}/${feedUsername}/feeds/${groupKey}.${feedKeyList[i]}/data/last`, {
                    method: 'GET',
                    headers: {
                        'x-aio-key': feedUserKey
                    }
                })
                if (!response.ok) {
                    console.log(`HTTP ERROR! status ${response.status}`)
                    return response.json()
                }
                const data = await response.json()
                setSensorValues(prev => ({...prev, [feedKeyList[i]]:data.value}))
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
        getCurrentSensorValue()
        connectAdafruitMQTT()
        return (() => clearInterval(interval))
    }, [])
    
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mr-2"/>
                    <span className="text-sm font-medium">Light</span>
                </div>
                <div className="font-bold">{sensorValues.light}%</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Droplet className="h-5 w-5 text-blue-500 mr-2"/>
                    <span className="text-sm font-medium">Humid</span>
                </div>
                <div className="font-bold">{sensorValues.hum}%</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-red-500 mr-2"/>
                    <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="font-bold">{sensorValues.temp}°C</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Droplets className="h-5 w-5 text-cyan-500 mr-2"/>
                    <span className="text-sm font-medium">Soil moisture</span>
                </div>
                <div className="font-bold">{sensorValues.soil}%</div>
            </div>
            <div className="pt-2">
                <div className="text-xs text-muted-foreground">Last updated: {formatDistanceToNowStrict(lastUpdatedDate, { addSuffix: true})}</div>
            </div>
        </div>
    )
}