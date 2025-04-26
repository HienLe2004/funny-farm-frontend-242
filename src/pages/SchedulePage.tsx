"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Link, useNavigate } from "react-router-dom"
import { Bounce, toast, ToastContainer } from "react-toastify"

// Function to get tasks for a specific date
const getTasksForDate = (date: Date, scheduleData: ScheduleData|any) => {
  if (!date) return []
  const formattedDate = date.toDateString()
  const scheduleItem = scheduleData?.find((item:ScheduleSingleData) => item.date.toDateString() === formattedDate)
  return scheduleItem ? scheduleItem.tasks : []
}

// Get device Vietnamese name
const getDeviceVName = (deviceKey: string) => {
  if (deviceKey.includes("fan")) return "Quạt"
  if (deviceKey.includes("1")) return "Máy bơm 1"
  if (deviceKey.includes("2")) return "Máy bơm 2"
  return "NULL"
}
function addTimeToDate(dateObject:Date|null, timeString:string) {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.error("Invalid time format");
    return null; // Or throw an error
  }
  const newDate = new Date(dateObject?dateObject:new Date()); // Create a copy to avoid modifying the original
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  newDate.setSeconds(0); // Optionally set seconds and milliseconds to 0
  newDate.setMilliseconds(0);
  return newDate;
}
// Custom calendar component
const CustomCalendar = ({ selectedDate, onSelectDate, scheduleData }: { selectedDate: Date; onSelectDate: (date: Date) => void; scheduleData: ScheduleData|any }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const days = generateCalendarDays()

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>
        <h3 className="font-medium">{currentMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</h3>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          Sau
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div key={day} className="font-medium text-sm py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-24 p-1 bg-gray-50 rounded-md"></div>
          }
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()
          const isToday = day.toDateString() === new Date().toDateString()
          const dayTasks = getTasksForDate(day, scheduleData)
          // console.log(dayTasks)
          return (
            <TooltipProvider key={day.toDateString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`h-24 p-1 rounded-md border overflow-hidden text-left transition-colors ${
                      isSelected ? "border-primary bg-primary/10" : "border-border"
                    } ${isToday ? "bg-blue-50" : ""}`}
                    onClick={() => onSelectDate(day)}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>{day.getDate()}</div>
                      
                      {(dayTasks.length>0)&&<div className="mt-2">
                        <div className={`${dayTasks[0].date.valueOf() < new Date().valueOf() ? 'bg-green-400' : 'bg-red-400'} w-6 h-6 text-white text-xs flex justify-center items-center rounded-full text-center`}>
                          {dayTasks.length}
                        </div>
                      </div>}
                    </div>
                  </button>
                </TooltipTrigger>
                {dayTasks.length > 0 && (
                  <TooltipContent side="right" className=" p-0">
                    <div className="p-2 bg-popover border-2 text-red-500">
                      <div className="font-medium mb-1">
                        {day.toLocaleDateString("vi-VN", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.map((task:Task) => (
                          <div key={task.id} className="flex justify-between gap-2 text-sm">
                            <span
                              className={`font-medium ${task.deviceKey.includes("pump") ? "text-green-600" : "text-purple-600"}`}
                            >
                              {getDeviceVName(task.deviceKey)}
                            </span>
                            <span>
                              {task.startTime} - {task.endTime} - {task.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}
type ScheduleSingleData = {
  date: Date;
  tasks: Task[];
}
type ScheduleData = ScheduleSingleData[];
type ScheduleItem = {
  id: string;
  feedId: number;
  status: boolean;
  name: string;
  deviceKey: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  type: 'ONCE' | 'WEEKLY' | 'DAILY';
  weekDay?: string;
};
type Task = {
  id: string;
  scheduleId: string;
  feedId: number;
  status: boolean;
  name: string;
  deviceKey: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'ONCE' | 'WEEKLY' | 'DAILY';
};

type MonthlyTasks = Task[];
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
function dayStringToDayValue(dayString:string) {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const upperCaseDayString = dayString.toUpperCase();
  const dayIndex = days.indexOf(upperCaseDayString);
  return dayIndex !== -1 ? dayIndex : undefined;
}
function generateMonthlyTasks(
  formattedSchedules: ScheduleItem[],
  year: number,
  month: number
): MonthlyTasks {
  console.log("create task for " + year + " " + month)
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const tasks: MonthlyTasks = [];
  // console.log(firstDayOfMonth)
  // console.log(lastDayOfMonth)
  formattedSchedules.forEach((schedule:ScheduleItem) => {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const createTask = (date: Date): Task => ({
      id: `${schedule.id}-${date.toLocaleDateString().slice(0, 10)}`,
      feedId: schedule.feedId,
      scheduleId: schedule.id,
      status: schedule.status,
      name: schedule.name,
      deviceKey: schedule.deviceKey,
      date: new Date(date),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      type: schedule.type,
    });

    if (schedule.type === 'ONCE') {
      let currentDate = new Date(firstDayOfMonth);
      while (currentDate <= lastDayOfMonth) {
        if (currentDate > endDate) {
          break
        }
        if (currentDate.valueOf() >= startDate.valueOf()) {
          tasks.push(createTask(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (schedule.type === 'WEEKLY' && schedule.weekDay) {
      const targetDay = dayStringToDayValue(schedule.weekDay);
      let currentDate = new Date(firstDayOfMonth);
      while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate > lastDayOfMonth) {
          break;
        }
      }
      while (currentDate <= lastDayOfMonth) {
        tasks.push(createTask(currentDate));
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else if (schedule.type === 'DAILY') {
      let currentDate = new Date(firstDayOfMonth);
      while (currentDate <= lastDayOfMonth) {
        if (currentDate >= firstDayOfMonth) {
          tasks.push(createTask(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });
  return tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
}
function vietnameseDateStringToDate(dateString:string) {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
}
function createSchedule(tasks: Task[]): ScheduleData {
  const scheduleMap = new Map<string, Task[]>();
  // console.log(tasks)
  for (const task of tasks) {
    const dateKey = task.date.toLocaleDateString();
    // console.log(dateKey)
    // console.log(vietnameseDateStringToDate(dateKey))
    if (scheduleMap.has(dateKey)) {
      scheduleMap.get(dateKey)!.push(task);
    } else {
      scheduleMap.set(dateKey, [task]);
    }
  }
  const scheduleData: ScheduleData = [];
  for (const [dateString, taskList] of scheduleMap.entries()) {
    scheduleData.push({
      date: vietnameseDateStringToDate(dateString),
      tasks: taskList,
    });
  }
  // console.log(scheduleData)
  // Optionally sort the schedule data by date
  scheduleData.sort((a, b) => a.date.getTime() - b.date.getTime());
  return scheduleData;
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
function getGlobalDate(dateString:string) :Date{
  const offsetTime = 7 * 60 * 60 * 1000
  const vDate = new Date(new Date(dateString).getTime() - offsetTime)
  return vDate
}
export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)
  const [scheduleData, setScheduleDate] = useState<ScheduleData|any>()
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
  const [ticks, setTicks] = useState(0)
  const [actuatorKeys, setActuatorKeys] = useState({
    "pump1":{feedId:0, deviceId:0},
    "pump2":{feedId:0, deviceId:0},
    "fan":{feedId:0, deviceId:0}
  })
  const navigate = useNavigate()
  const tasks = date ? getTasksForDate(date, scheduleData) : []
  const createNewTask = async () => {
    // console.log(taskForm)
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
    const deleteTask = tasks.find((task:any) => {return task.id == taskId})
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
  useEffect(()=>{
    const roomKey = sessionStorage.getItem("roomKey")
    if (!roomKey) {
      console.log("MISSING GROUP KEY")
      return
    }
    const getTasksForMonth = async () => {
      const token = sessionStorage.getItem("accessToken")
      const response = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/schedule?month=${date.getMonth()+1}&year=${date.getFullYear()}&id_room=1`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      })
      if (!response.ok) {
        if (response.status == 401) {
          navigate("/login")
        }
      }
      const data = await response.json()
      const schedules = data.schedules
      const formattedSchedules = schedules.map((schedule:any):ScheduleItem => ({
        "id":schedule.id,
        "feedId":schedule.feedId, 
        "status":schedule.status=="ACTIVE",
        "name":schedule.description,
        "deviceKey":Object.keys(schedule.device.feedsList)[0].split(".")[1],
        "startDate":getGlobalDate(schedule.startDate),
        "endDate":getGlobalDate(schedule.endDate),
        "startTime":schedule.time_from,
        "endTime":schedule.time_to,
        "type":schedule.scheduleType,
        "weekDay":schedule?.weekDay
      }))
      const allTasks = generateMonthlyTasks(formattedSchedules, date.getFullYear(), date.getMonth() + 1)
      setScheduleDate(createSchedule(allTasks));
    }
    getTasksForMonth()
  },[date.getMonth(), date.getFullYear(), ticks])
  useEffect(() => {
    setTaskForm(prev => ({...prev, ['startDate']:formatLocalDate(date.toLocaleDateString())}))
  }, [date,ticks])
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <section className="w-full py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" asChild className="mr-2">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Lập lịch</h1>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Lịch mới
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
                      <Label htmlFor="device">Thiết bị</Label>
                      <Select defaultValue={taskForm.feedKey} onValueChange={(value:string) => {
                        const deviceId = actuatorKeys[value as keyof typeof actuatorKeys].deviceId
                        const feedId = actuatorKeys[value as keyof typeof actuatorKeys].feedId
                        setTaskForm(prev => ({...prev, ['deviceId']:deviceId, ['feedId']:feedId, ['feedKey']:value}))
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thiết bị" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pump1">Máy bơm 1</SelectItem>
                          <SelectItem value="pump2">Máy bơm 2</SelectItem>
                          <SelectItem value="fan">Quạt</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <Input id="startDate" type="date" defaultValue={formatLocalDate(date.toLocaleDateString())}
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

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch</CardTitle>
                  <CardDescription>Xem và chọn ngày có lịch</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomCalendar selectedDate={date} onSelectDate={setDate} scheduleData={scheduleData}/>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {date
                      ? date.toLocaleDateString("vi-VN", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Chưa ngày nào được chọn"}
                  </CardTitle>
                  <CardDescription>
                    {tasks.length} lịch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Không có lịch cho ngày này</p>
                      <Button className="mt-4" onClick={() => setOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                         Thêm lịch
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all">Tất cả</TabsTrigger>
                          <TabsTrigger value="pumps">Máy bơm</TabsTrigger>
                          <TabsTrigger value="fan">Quạt</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-4 space-y-4">
                          {tasks.map((task:Task) => (
                            <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                              <div>
                                <div className="font-medium">
                                  {task.startTime.substring(0, 5)} - {task.endTime.substring(0, 5)} - {task.name} - {task.type} - {getDeviceVName(task.deviceKey)}
                                </div>
                              </div>
                              <div className="flex">
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600"
                                  onClick={()=>{deleteScheduleByTaskId(task.id)}}
                                >
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="pumps" className="mt-4 space-y-4">
                          {tasks
                            .filter((task:Task) => task.deviceKey.includes("pump"))
                            .map((task:Task) => (
                              <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                                <div>
                                  <div className="font-medium">
                                    {task.startTime.substring(0, 5)} - {task.endTime.substring(0, 5)} - {task.name} - {getDeviceVName(task.deviceKey)}
                                  </div>
                                </div>
                                <div className="flex">
                                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600"
                                    onClick={()=>{deleteScheduleByTaskId(task.id)}}
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </TabsContent>
                        <TabsContent value="fan" className="mt-4 space-y-4">
                          {tasks
                            .filter((task:Task) => task.deviceKey.includes("fan"))
                            .map((task:Task) => (
                              <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                                <div>
                                  <div className="font-medium">
                                    {task.startTime.substring(0, 5)} - {task.endTime.substring(0, 5)} - {task.name} - {getDeviceVName(task.deviceKey)}
                                  </div>
                                </div>
                                <div className="flex">
                                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600"
                                    onClick={()=>{deleteScheduleByTaskId(task.id)}}
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
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
  )
}
