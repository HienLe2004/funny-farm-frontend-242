"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { Bounce, toast, ToastContainer } from "react-toastify"

interface TaskForm {
  deviceId:number,
  feedId:number,
  feedKey:string,
  status:string,
  description:string,
  scheduleType:string,
  startDate:string,
  endDate:string,
  startTime:string,
  endTime:string,
  weekDay:string
}
function formatLocalDate(dateString: string) : string {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parts[0];
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }
  return '';
}
export function DeviceSchedule({ feedKey }: { feedKey: string }) {
  const navigate = useNavigate();
  const [ticks,setTicks] = useState(0)
  const [open, setOpen] = useState(false)
  const [schedules, setSchedules] = useState<any[]>([])
  const [feedId, setFeedId] = useState(0)
  const [deviceId, setDeviceId] = useState(0)
  const [taskForm, setTaskForm] = useState<TaskForm>({
    deviceId:0,
    feedId:0,
    feedKey:"pump1",
    status:"ACTIVE",
    description:"",
    scheduleType:"DAILY",
    startDate:"",
    endDate:"",
    startTime:"",
    endTime:"",
    weekDay:"MONDAY"
  })
  const [actuatorKeys, setActuatorKeys] = useState({
    "pump1":{feedId:0, deviceId:0},
    "pump2":{feedId:0, deviceId:0},
    "fan":{feedId:0, deviceId:0}
  })
  const isActuator = feedKey.includes("pump") || feedKey.includes("fan")
  const createNewTask = async () => {
    console.log(taskForm)
    const token = sessionStorage.getItem('accessToken')
    let requestBody = {}
    if (taskForm.scheduleType=="ONCE") {
      requestBody = {
        "id_device": taskForm.deviceId,
        "feedId": taskForm.feedId,
        "status": taskForm.status,
        "description": taskForm.description,
        "scheduleType": taskForm.scheduleType,
        "startDate": taskForm.startDate,
        "endDate": taskForm.endDate,
        "time_from": taskForm.startTime,
        "time_to": taskForm.endTime
      }
    }
    else if (taskForm.scheduleType == "WEEKLY") {
      requestBody = {
        "id_device": taskForm.deviceId,
        "feedId": taskForm.feedId,
        "status": taskForm.status,
        "description": taskForm.description,
        "scheduleType": taskForm.scheduleType,
        "weekDay": taskForm.weekDay,
        "time_from": taskForm.startTime,
        "time_to": taskForm.endTime
      }
    }
    else if (taskForm.scheduleType == "DAILY") {
      requestBody = {
        "id_device": taskForm.deviceId,
        "feedId": taskForm.feedId,
        "status": taskForm.status,
        "description": taskForm.description,
        "scheduleType": taskForm.scheduleType,
        "time_from": taskForm.startTime,
        "time_to": taskForm.endTime
      }
    }
    const response = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/schedule/create`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })
    // console.log(response)
    toast(`Tạo lịch mới ${response.ok ? 'thành công' : 'thất bại'}!`, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
    if (!response.ok && response.status == 401) {
      navigate("/login")
    }
    setTicks(prev => prev + 1)
    setOpen(false)
  }
  const deleteScheduleByTaskId = async (taskId:string) => {
    const deleteTask = schedules.find((task:any) => {return task.id == taskId})
    const token = sessionStorage.getItem('accessToken')
    const response = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/schedule/${deleteTask.scheduleId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    toast(`Xóa lịch ${response.ok ? 'thành công' : 'thất bại'}!`, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
    if (!response.ok && response.status == 401) {
      navigate("/login")
    }
    setTicks(prev => prev + 1)
  }
  if (!isActuator) {
    return (
      <div className="text-center py-4 text-muted-foreground">Lập lịch chỉ dành cho thiết bị điều khiển</div>
    )
  }
  useEffect(()=>{
    const getDeviceList = async () => {
      const roomId = sessionStorage.getItem("roomId")
      if (!roomId) {
          console.log("MISSING GROUP KEY")
          return
      }
      const token = sessionStorage.getItem("accessToken")
      if (!token) {
        navigate("/login")
        return
      }
      const roomResponse = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/devices/room/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const roomData = await roomResponse.json()
      // console.log(roomData)
      if (roomData.listDeviceDTO.length > 0) {
        const deviceDataList = {
          "pump1":{feedId:0, deviceId:0},
          "pump2":{feedId:0, deviceId:0},
          "fan":{feedId:0, deviceId:0}
        }
        const listDeviceDTO = roomData.listDeviceDTO
        listDeviceDTO.map((deviceDTO:any) => {
          if (deviceDTO.type == "CONTROL") {
            const deviceFeedKey = Object.keys(deviceDTO.feedsList)[0]
            Object.keys(deviceDataList).forEach((device) => {
              if (deviceFeedKey.split(".")[1].includes(device)) {
                deviceDataList[device as keyof typeof deviceDataList]['deviceId'] = deviceDTO.id
                deviceDataList[device as keyof typeof deviceDataList]['feedId'] = deviceDTO.feedsList[deviceFeedKey].feedId
              }
              if (device == feedKey) {
                setDeviceId(deviceDTO.id)
                setFeedId(deviceDTO.feedsList[deviceFeedKey].feedId)
              }
            })
          }
        })
        setActuatorKeys(deviceDataList)
        setTaskForm(prev => ({...prev, ['deviceId']:deviceDataList.pump1.deviceId, ['feedId']:deviceDataList.pump1.feedId}))
      }
      else {
        console.log("Room has no device")
      }
    }
    getDeviceList()
  },[])
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Các lịch đã lập</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm lịch
            </Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm lịch mới</DialogTitle>
                <DialogDescription>Tạo một lịch mới cho thiết bị.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Tên lịch</Label>
                  <Input id="startTime" type="text" defaultValue={taskForm.description } onChange={(e) => {
                    setTaskForm(prev => ({...prev, ['description']:e.target.value}))
                  }}/>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="action">Hành động</Label>
                  <Select defaultValue={taskForm.status} onValueChange={(value) => {
                    setTaskForm(prev => ({...prev, ['status']:value}))
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hành động" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Bật</SelectItem>
                      <SelectItem value="INACTIVE">Tắt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="action">Loại lịch</Label>
                  <Select defaultValue={taskForm.scheduleType} onValueChange={(value)=>setTaskForm(prev => ({...prev, ['scheduleType']:value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại lịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Hằng ngày</SelectItem>
                      <SelectItem value="WEEKLY">Hằng tuần</SelectItem>
                      <SelectItem value="ONCE">Một lần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Từ</Label>
                    <Input id="startTime" type="time" defaultValue={taskForm.startTime} onChange={(e) => {
                      setTaskForm((prev)=>({...prev,['startTime']:e.target.value}))
                    }}/>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Đến</Label>
                    <Input id="endTime" type="time" defaultValue={taskForm.endTime} onChange={(e) => {
                      setTaskForm((prev)=>({...prev,['endTime']:e.target.value}))
                    }}/>
                  </div>
                </div>
                {taskForm.scheduleType === "WEEKLY" && (
                  <div className="grid gap-2">
                    <Label htmlFor="action">Ngày trong tuần</Label>
                    <Select defaultValue={taskForm.weekDay} onValueChange={(value)=>{
                      setTaskForm(prev=>({...prev,['weekDay']:value}))
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngày trong tuần" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONDAY">Thứ 2</SelectItem>
                        <SelectItem value="TUESDAY">Thứ 3</SelectItem>
                        <SelectItem value="WEDNESDAY">Thứ 4</SelectItem>
                        <SelectItem value="THURSDAY">Thứ 5</SelectItem>
                        <SelectItem value="FRIDAY">Thứ 6</SelectItem>
                        <SelectItem value="SATURDAY">Thứ 7</SelectItem>
                        <SelectItem value="SUNDAY">Chủ nhật</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {taskForm.scheduleType === "ONCE" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Ngày bắt đầu</Label>
                      <Input id="startDate" type="date" defaultValue={formatLocalDate(new Date().toLocaleDateString())}
                        onChange={(e) => {setTaskForm((prev) => ({...prev, ['startDate']:e.target.value}))}}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">Ngày kết thúc</Label>
                      <Input id="endDate" type="date"
                        onChange={(e) => {setTaskForm((prev) => ({...prev, ['endDate']:e.target.value}))}}
                      />
                    </div>
                  </div>
                )}
              </div> 
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={createNewTask}>Lưu lịch</Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">Không có lịch</div>
      ) : (
        <div className="grid gap-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium">{schedule.action}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {schedule.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {schedule.days.join(", ")}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
        </div>
      )}
    </div>
  )
}
