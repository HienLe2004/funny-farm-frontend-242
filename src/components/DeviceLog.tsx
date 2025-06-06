import { Activity, AlertTriangle, Check, Clock, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// Get icon based on log type
const getLogIcon = (type: string) => {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />
    case "success":
      return <Check className="h-4 w-4 text-green-500" />
    case "TRIGGER_MAX":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "TRIGGER_MIN":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}
interface Log {
  event:string,
  type:string,
  time:string
}
export function DeviceLog({ deviceFeedKey }: { deviceFeedKey: string }) {
  const navigate = useNavigate()
  const [logs,setLogs] = useState<Log[]>([])
  const [, setGroupKey] =  useState("")
  
  useEffect(()=>{
    const roomKey = sessionStorage.getItem("roomKey")
    if (!roomKey) {
      console.log("MISSING GROUP KEY")
      return
    }
    else {
      setGroupKey(roomKey)
    }
    const getDeviceLog = async() => {
      const token = sessionStorage.getItem("accessToken")
      if (!token) {
        navigate("/login")
      }
      else {
        setGroupKey(roomKey)
      }
      const response = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/logs/feed/${roomKey}.${deviceFeedKey}`,{
        method:'GET',
        headers:{
          "Authorization": `Bearer ${token}`
        }
      })
      if (!response.ok && response.status == 401) {
        navigate("/login")
        return
      }
      console.log(response)
      const data = await response.json()
      console.log(data)
      const logDTOs = data.listLogDTO ? data.listLogDTO : []
      setLogs(logDTOs.map((logDTO:any) => {
        let eventString = ""
        if (logDTO.logType == "DATA") {
          eventString = `Giá trị hiện tại là ${logDTO.value}`
        }
        else if (logDTO.logType == "TRIGGER_MAX") {
          eventString = `Giá trị hiện tại (${logDTO.value}) vượt ngưỡng MAX`
        }
        else if (logDTO.logType == "TRIGGER_MIN") {
          eventString = `Giá trị hiện tại (${logDTO.value}) vượt ngưỡng MIN`
        }
        return {"type":logDTO.logType,"event":eventString,"time":logDTO.createdAt}
      }))
      // console.log(logDTOs)
    }
    getDeviceLog()
  },[deviceFeedKey])
  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">Trống</div>
      ) : (
        logs.map((log, index) => (
          <div key={index} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="mt-0.5">{getLogIcon(log?.type)}</div>
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
