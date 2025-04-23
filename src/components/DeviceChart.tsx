import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
  
// Get color based on device type
const getDeviceColor = (deviceId: string) => {
if (deviceId.includes("light")) return "#eab308"
if (deviceId.includes("humidity")) return "#3b82f6"
if (deviceId.includes("temperature")) return "#ef4444"
if (deviceId.includes("soil-moisture")) return "#06b6d4"
if (deviceId.includes("pump")) return "#22c55e"
if (deviceId.includes("fan")) return "#a855f7"
return "#64748b"
}

// Get value label based on device type
const getValueLabel = (deviceId: string) => {
    if (deviceId.includes("light")) return "Ánh sáng (%)"
    if (deviceId.includes("humidity")) return "Độ ẩm không khí (%)"
    if (deviceId.includes("temperature")) return "Nhiệt độ (°C)"
    if (deviceId.includes("soil-moisture")) return "Độ ẩm đất (%)"
    if (deviceId.includes("pump") || deviceId.includes("fan")) return "Trạng thái (Bật/Tắt)"
    return "Value"
}

// Get line type based on device type
const getLineType = (deviceId: string) => {
    if (deviceId.includes("light")) return "monotone"
    if (deviceId.includes("humidity")) return "monotone"
    if (deviceId.includes("temperature")) return "monotone"
    if (deviceId.includes("soil-moisture")) return "monotone"
    if (deviceId.includes("pump") || deviceId.includes("fan")) return "stepAfter"
    return "monotone"
}

// Get feedKey based on device type
const getFeedKey = (deviceId: string) => {
    if (deviceId.includes("light")) return "light"
    if (deviceId.includes("humidity")) return "hum"
    if (deviceId.includes("temperature")) return "temp"
    if (deviceId.includes("soil-moisture")) return "soil"
    if (deviceId.includes("pump-1")) return "pump1"
    if (deviceId.includes("pump-2")) return "pump2"
    if (deviceId.includes("fan")) return "fan"
    return "Value"
}

export default function DeviceChart({ deviceId }: { deviceId: string }) {
    const color = getDeviceColor(deviceId)
    const valueLabel = getValueLabel(deviceId)
    const lineType = getLineType(deviceId)
    const [feedKey,setFeedKey] = useState(getFeedKey(deviceId))
    const [deviceData,setDeviceData] = useState<{time:string,value:Number}[]>([])
    const [tick,setTick] = useState(0)
    const userAIOUsername = import.meta.env.VITE_USERAIOUSERNAME?import.meta.env.VITE_USERAIOUSERNAME:""
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY?import.meta.env.VITE_USERAIOUSERKEY:""
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME?import.meta.env.VITE_OWNERAIOUSERNAME:""
    useEffect(()=>{
        const roomKey = sessionStorage.getItem("roomKey")
        if (!roomKey) {
            console.log("MISSING GROUP KEY")
            return
        }
        const getDeviceData = async () => {
            if (feedKey == "Value") {
                return
            }
            const apiUrl = 'https://io.adafruit.com/api/v2/'
            let currentDate = new Date()
            let sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
            const response = await fetch(`${apiUrl}/${ownerAIOUsername}/feeds/${roomKey}.${feedKey}/data`, {
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
                return (createdDataDate < currentDate && createdDataDate > sevenDaysAgo);
            })
            realValues.reverse()
            // console.log(realValues)
            setDeviceData( 
                realValues.map((day:{'created_at':string, 'value':string}) => 
                    ({"time":day['created_at'], "value":Number(day['value'])})
            ))
        }
        getDeviceData()
    },[feedKey])
    useEffect(()=>{
        setFeedKey(getFeedKey(deviceId))
    },[deviceId])
return (
    <div className="h-[300px] w-full">
    <ChartContainer config={{light: {label: "Light", color: "#eab308"}}} className="h-full w-full">
        <LineChart
        data={deviceData}
        margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
        }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short"
            })}} />
        <YAxis />
        <Tooltip content={
            <ChartTooltipContent labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleTimeString("vi-VN", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
            })}} />
        }/>
        <Legend />
        <Line type={lineType} dataKey="value" stroke={color} activeDot={{ r: 8 }} name={valueLabel} />
        </LineChart>
    </ChartContainer>
    </div>
    )
}
  