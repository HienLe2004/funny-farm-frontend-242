import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts"

// Format time for x-axis ticks
const formatXAxisTick = (tickValue:number, isSingleDay:Date) => {
  if (isSingleDay) {
    // For single day view, show hours in 24-hour format
    return `${Math.floor(tickValue)}:00`
  } else {
    // For date range view (legacy support)
    return `${Math.floor(tickValue)}:00`
  }
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, sensorType, isSingleDay } : CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Get the display time from the data point
    const displayTime = payload[0].payload.displayTime
    const unit = sensorType === "temperature" ? "°C" : "%"

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-medium">{displayTime}</p>
        {payload.map((entry:any, index:any) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">{sensorType.charAt(0).toUpperCase() + sensorType.slice(1)}:</span>
            <span>
              {entry.value} {unit}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Get color based on sensor type
const getSensorColor = (sensorType:string|any) => {
  if (sensorType === "temperature") return "#ef4444"
  if (sensorType === "humidity") return "#3b82f6"
  if (sensorType === "light") return "#eab308"
  return "#64748b"
}
interface CustomTooltipProps extends TooltipProps<number, string> {
  sensorType: "temperature" | "humidity" | "light" | string;
  isSingleDay?: boolean;
}
export function AnalyticsChart({ data, ticks, sensorType, thresholds, dateRange, isSingleDay = false } : {
    data:any, ticks:any, sensorType:any, thresholds:any, dateRange:any, isSingleDay:any
}) {
  const color = getSensorColor(sensorType)
  const unit = sensorType === "temperature" ? "°C" : "%"

  // Calculate domain for X axis
  const xDomain = isSingleDay ? [0, 24] : [0, 24] // Default to 24 hours for single day

  return (
    <ResponsiveContainer height="100%" width="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timeValue"
          ticks={ticks}
          tickFormatter={(value) => formatXAxisTick(value, isSingleDay)}
          type="number"
          domain={xDomain}
          allowDataOverflow
          label={{ value: "Time (hours)", position: "insideBottomRight", offset: -5 }}
        />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(value) => `${value}${sensorType === "temperature" ? "°" : "%"}`}
          label={{
            value:
              sensorType === "temperature"
                ? "Temperature (°C)"
                : sensorType === "humidity"
                  ? "Humidity (%)"
                  : "Light (%)",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />
        <Tooltip content={(props) => <CustomTooltip {...props as CustomTooltipProps}  sensorType={sensorType} isSingleDay={isSingleDay} />} />
        <Legend />
        <ReferenceLine
          y={thresholds?.min}
          stroke="#3b82f6"
          strokeDasharray="3 3"
          label={{ value: `Min: ${thresholds?.min}${unit}`, fill: "#3b82f6", position: "insideBottomLeft" }}
        />
        <ReferenceLine
          y={thresholds?.max}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{ value: `Max: ${thresholds?.max}${unit}`, fill: "#ef4444", position: "insideTopLeft" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          activeDot={{ r: 4 }}
          name={sensorType.charAt(0).toUpperCase() + sensorType.slice(1)}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
