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

// const scheduleData = [
//   {
//     date: new Date(2025, 3, 15),
//     tasks: [
//       { id: 1, start_time: "06:00", end_time: "06:20", device: "May bom 1", name: "Tuoi cay sang", deviceKey: "pump1" },
//       { id: 2, start_time: "10:50", end_time: "11:00", device: "May bom 2", name: "Tuoi cay trua", deviceKey: "pump2" },
//       { id: 3, start_time: "14:50", end_time: "14:00", device: "Quat", name: "Quat cay chieu", deviceKey: "fan" },
//     ],
//   }
// ]

// Function to get tasks for a specific date
const getTasksForDate = (date: Date, scheduleData: ScheduleData|any) => {
  if (!date) return []
  const formattedDate = date.toDateString()
  const scheduleItem = scheduleData?.find((item:ScheduleSingleData) => item.date.toDateString() === formattedDate)
  // console.log("current" + date.toDateString())
  // scheduleData.map((item) => {console.log(item.date.toDateString())})
  // console.log(scheduleItem)
  return scheduleItem ? scheduleItem.tasks : []
}

// Function to check if a date has tasks
// const hasTasksOnDate = (date: Date) => {
//   const formattedDate = date.toDateString()
//   return scheduleData.some((item) => item.date.toDateString() === formattedDate)
// }

// Get device color
const getDeviceColor = (device: string) => {
  if (device.includes("pump")) return "bg-green-100 text-green-800"
  if (device.includes("fan")) return "bg-purple-100 text-purple-800"
  return "bg-gray-100 text-gray-800"
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
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
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
                      <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {dayTasks.slice(0, 2).map((task:Task) => (
                          <div
                            key={task.id}
                            className={`text-xs mb-1 truncate rounded px-1 ${getDeviceColor(task.deviceKey)}`}
                          >
                            {task.name}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayTasks.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </button>
                </TooltipTrigger>
                {dayTasks.length > 0 && (
                  <TooltipContent side="right" className="w-64 p-0">
                    <div className="p-2 bg-popover text-red-500">
                      <div className="font-medium mb-1">
                        {day.toLocaleDateString("vi-VN", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.map((task:Task) => (
                          <div key={task.id} className="flex justify-between text-sm">
                            <span
                              className={`font-medium ${task.deviceKey.includes("pump") ? "text-green-600" : "text-purple-600"}`}
                            >
                              {task.deviceKey}
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
function generateMonthlyTasks(
  formattedSchedules: ScheduleItem[],
  year: number,
  month: number
): MonthlyTasks {
  console.log("create task for " + year + " " + month)
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 1);
  const tasks: MonthlyTasks = [];

  formattedSchedules.forEach((schedule:ScheduleItem) => {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);

    const createTask = (date: Date): Task => ({
      id: `${schedule.id}-${date.toISOString().slice(0, 10)}`,
      feedId: schedule.feedId,
      status: schedule.status,
      name: schedule.name,
      deviceKey: schedule.deviceKey,
      date: new Date(date),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      type: schedule.type,
    });

    if (schedule.type === 'ONCE') {
      if (startDate >= firstDayOfMonth && startDate <= lastDayOfMonth) {
        tasks.push(createTask(startDate));
      }
    } else if (schedule.type === 'WEEKLY' && schedule.weekDay) {
      const startOfMonthDay = firstDayOfMonth.getDay();
      const targetDay = parseInt(schedule.weekDay, 10);

      let currentDate = new Date(firstDayOfMonth);
      while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate > lastDayOfMonth) {
          break;
        }
      }

      while (currentDate <= lastDayOfMonth && currentDate <= endDate) {
        if (currentDate >= startDate) {
          tasks.push(createTask(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else if (schedule.type === 'DAILY') {
      let currentDate = new Date(startDate);
      while (currentDate <= lastDayOfMonth && currentDate <= endDate) {
        if (currentDate >= firstDayOfMonth) {
          tasks.push(createTask(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });

  return tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
}
function createSchedule(tasks: Task[]): ScheduleData {
  const scheduleMap = new Map<string, Task[]>();

  for (const task of tasks) {
    // Create a string representation of the date to use as the key in the map
    const dateKey = task.date.toDateString();

    if (scheduleMap.has(dateKey)) {
      scheduleMap.get(dateKey)!.push(task);
    } else {
      scheduleMap.set(dateKey, [task]);
    }
  }

  const scheduleData: ScheduleData = [];
  for (const [dateString, taskList] of scheduleMap.entries()) {
    scheduleData.push({
      date: new Date(dateString),
      tasks: taskList,
    });
  }

  // Optionally sort the schedule data by date
  scheduleData.sort((a, b) => a.date.getTime() - b.date.getTime());

  return scheduleData;
}
export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)
  const [scheduleData, setScheduleDate] = useState<ScheduleData|any>()
  const [scheduleForm, setScheduleForm] = useState({
    deviceId:0,
    feedId:0,
    status:"",
    description:"",
    scheduleType:"",
    startDate:new Date(),
    endDate:new Date(),
    weekDay:""
  })
  const navigate = useNavigate()
  const tasks = date ? getTasksForDate(date, scheduleData) : []
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
      console.log(schedules)
      const formattedSchedules = schedules.map((schedule:any):ScheduleItem => ({
        "id":schedule.id,
        "feedId":schedule.feedId, 
        "status":schedule.status=="ACTIVE",
        "name":schedule.description,
        "deviceKey":Object.keys(schedule.device.feedsList)[0].split(".")[1],
        "startDate":new Date(schedule.startDate),
        "endDate":new Date(schedule.endDate),
        "startTime":schedule.time_from,
        "endTime":schedule.time_to,
        "type":schedule.scheduleType,
        "weekDay":schedule?.weekDay
      }))
      const allTasks = generateMonthlyTasks(formattedSchedules, date.getFullYear(), date.getMonth() + 1)
      setScheduleDate(createSchedule(allTasks));
      // console.log(formattedSchedules)
    }
    getTasksForMonth()
  },[date.getMonth(), date.getFullYear()])
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
                      <Label htmlFor="device">Thiết bị</Label>
                      <Select>
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
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hành động" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on">Bật</SelectItem>
                          <SelectItem value="off">Tắt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="action">Loại lịch</Label>
                      <Select>
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
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Ngày bắt đầu</Label>
                        <Input id="date" type="date" defaultValue={date.toISOString().split("T")[0]} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="time">Từ</Label>
                        <Input id="time" type="time" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="time">Đến</Label>
                        <Input id="time" type="time" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="action">Ngày trong tuần</Label>
                      <Select>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={() => setOpen(false)}>Lưu lịch</Button>
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
                    {tasks.length} {/*tasks.length === 1 ? "task" : "tasks"*/} lịch
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
                                  {task.startTime} - {task.endTime} - {task.name} - {task.deviceKey}
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
                          ))}
                        </TabsContent>
                        <TabsContent value="pumps" className="mt-4 space-y-4">
                          {tasks
                            .filter((task:Task) => task.deviceKey.includes("pump"))
                            .map((task:Task) => (
                              <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                                <div>
                                  <div className="font-medium">
                                    {task.startTime} - {task.endTime} - {task.name} - {task.deviceKey}
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
                            ))}
                        </TabsContent>
                        <TabsContent value="fan" className="mt-4 space-y-4">
                          {tasks
                            .filter((task:Task) => task.deviceKey.includes("fan"))
                            .map((task:Task) => (
                              <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                                <div>
                                  <div className="font-medium">
                                    {task.startTime} - {task.endTime} - {task.name} - {task.deviceKey}
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
    </div>
  )
}
