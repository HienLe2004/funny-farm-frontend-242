import { Activity, AlertTriangle, Check, Clock, Info, X } from "lucide-react"

const deviceLogs = {
  "light-sensor": [
    { time: "Today, 10:23 AM", event: "Value changed to 75%", type: "info" },
    { time: "Today, 08:15 AM", event: "Value changed to 68%", type: "info" },
    { time: "Yesterday, 06:45 PM", event: "Value changed to 15%", type: "info" },
    { time: "Yesterday, 12:30 PM", event: "Sensor calibration", type: "success" },
    { time: "2023-10-20, 09:15 AM", event: "Low light warning", type: "warning" },
  ],
  "humidity-sensor": [
    { time: "Today, 10:23 AM", event: "Value changed to 58%", type: "info" },
    { time: "Today, 08:15 AM", event: "Value changed to 60%", type: "info" },
    { time: "Yesterday, 06:45 PM", event: "Value changed to 62%", type: "info" },
    { time: "Yesterday, 12:30 PM", event: "Sensor calibration", type: "success" },
    { time: "2023-10-20, 09:15 AM", event: "High humidity warning", type: "warning" },
  ],
  "temperature-sensor": [
    { time: "Today, 10:23 AM", event: "Value changed to 23.5°C", type: "info" },
    { time: "Today, 08:15 AM", event: "Value changed to 22.8°C", type: "info" },
    { time: "Yesterday, 06:45 PM", event: "Value changed to 20.5°C", type: "info" },
    { time: "Yesterday, 12:30 PM", event: "Sensor calibration", type: "success" },
    { time: "2023-10-20, 09:15 AM", event: "High temperature warning", type: "warning" },
  ],
  "soil-moisture-sensor": [
    { time: "Today, 10:23 AM", event: "Value changed to 58%", type: "info" },
    { time: "Today, 08:15 AM", event: "Value changed to 60%", type: "info" },
    { time: "Yesterday, 06:45 PM", event: "Value changed to 62%", type: "info" },
    { time: "Yesterday, 12:30 PM", event: "Sensor calibration", type: "success" },
    { time: "2023-10-20, 09:15 AM", event: "High soil moisture warning", type: "warning" },
  ],
  "pump-1": [
    { time: "Today, 09:00 AM", event: "Turned off", type: "info" },
    { time: "Today, 06:00 AM", event: "Turned on", type: "info" },
    { time: "Yesterday, 09:00 PM", event: "Turned off", type: "info" },
    { time: "Yesterday, 06:00 PM", event: "Turned on", type: "info" },
    { time: "2023-10-20, 10:15 AM", event: "Maintenance check", type: "success" },
  ],
  "pump-2": [
    { time: "Today, 08:00 AM", event: "Turned off", type: "info" },
    { time: "Today, 05:00 AM", event: "Turned on", type: "info" },
    { time: "Yesterday, 08:00 PM", event: "Turned off", type: "info" },
    { time: "Yesterday, 05:00 PM", event: "Turned on", type: "info" },
    { time: "2023-10-19, 11:30 AM", event: "Pump malfunction", type: "error" },
  ],
  fan: [
    { time: "Today, 11:00 AM", event: "Turned off", type: "info" },
    { time: "Today, 07:00 AM", event: "Turned on", type: "info" },
    { time: "Yesterday, 10:00 PM", event: "Turned off", type: "info" },
    { time: "Yesterday, 04:00 PM", event: "Turned on", type: "info" },
    { time: "2023-10-18, 02:45 PM", event: "Maintenance check", type: "success" },
  ],
}

// Get icon based on log type
const getLogIcon = (type: string) => {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />
    case "success":
      return <Check className="h-4 w-4 text-green-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "error":
      return <X className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

export function DeviceLog({ deviceId }: { deviceId: string }) {
  const logs = deviceLogs[deviceId as keyof typeof deviceLogs] || []

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No logs available</div>
      ) : (
        logs.map((log, index) => (
          <div key={index} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="mt-0.5">{getLogIcon(log.type)}</div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{log.event}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {log.time}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
