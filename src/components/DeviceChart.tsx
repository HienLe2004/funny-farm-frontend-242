import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
  

const deviceData = {
"light-sensor": [
    { date: "Mon", value: 65 },
    { date: "Tue", value: 70 },
    { date: "Wed", value: 80 },
    { date: "Thu", value: 75 },
    { date: "Fri", value: 68 },
    { date: "Sat", value: 72 },
    { date: "Sun", value: 75 },
],
"humidity-sensor": [
    { date: "Mon", value: 55 },
    { date: "Tue", value: 58 },
    { date: "Wed", value: 60 },
    { date: "Thu", value: 62 },
    { date: "Fri", value: 59 },
    { date: "Sat", value: 57 },
    { date: "Sun", value: 58 },
],
"temperature-sensor": [
    { date: "Mon", value: 21 },
    { date: "Tue", value: 22 },
    { date: "Wed", value: 24 },
    { date: "Thu", value: 23 },
    { date: "Fri", value: 22 },
    { date: "Sat", value: 20 },
    { date: "Sun", value: 21 },
],
"soil-moisture-sensor": [
    { date: "Mon", value: 55 },
    { date: "Tue", value: 58 },
    { date: "Wed", value: 60 },
    { date: "Thu", value: 62 },
    { date: "Fri", value: 59 },
    { date: "Sat", value: 57 },
    { date: "Sun", value: 58 },
],
"pump-1": [
    { date: "Mon", value: 0 },
    { date: "Tue", value: 1 },
    { date: "Wed", value: 1 },
    { date: "Thu", value: 0 },
    { date: "Fri", value: 1 },
    { date: "Sat", value: 0 },
    { date: "Sun", value: 0 },
],
"pump-2": [
    { date: "Mon", value: 1 },
    { date: "Tue", value: 0 },
    { date: "Wed", value: 0 },
    { date: "Thu", value: 1 },
    { date: "Fri", value: 0 },
    { date: "Sat", value: 1 },
    { date: "Sun", value: 0 },
],
"fan": [
    { date: "Mon", value: 0 },
    { date: "Tue", value: 0 },
    { date: "Wed", value: 1 },
    { date: "Thu", value: 1 },
    { date: "Fri", value: 1 },
    { date: "Sat", value: 0 },
    { date: "Sun", value: 0 },
],
}
  
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
if (deviceId.includes("light")) return "Light (%)"
if (deviceId.includes("humidity")) return "Humidity (%)"
if (deviceId.includes("temperature")) return "Temperature (°C)"
if (deviceId.includes("soil-moisture")) return "Soil moisture (%)"
if (deviceId.includes("pump") || deviceId.includes("fan")) return "Status (On/Off)"
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

export default function DeviceChart({ deviceId }: { deviceId: string }) {
const data = deviceData[deviceId as keyof typeof deviceData] || []
const color = getDeviceColor(deviceId)
const valueLabel = getValueLabel(deviceId)
const lineType = getLineType(deviceId)

return (
    <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
        <LineChart
        data={data}
        margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
        }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type={lineType} dataKey="value" stroke={color} activeDot={{ r: 8 }} name={valueLabel} />
        </LineChart>
    </ResponsiveContainer>
    </div>
    )
}
  