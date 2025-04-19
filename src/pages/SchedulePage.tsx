"use client"

import { useState } from "react"
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
import { Link } from "react-router-dom"

// Sample schedule data
const scheduleData = [
  {
    date: new Date(2025, 3, 15),
    tasks: [
      { id: 1, time: "06:00", device: "Pump 1", action: "On" },
      { id: 2, time: "09:00", device: "Pump 1", action: "Off" },
    ],
  },
  {
    date: new Date(2025, 3, 16),
    tasks: [
      { id: 3, time: "05:00", device: "Pump 2", action: "On" },
      { id: 4, time: "08:00", device: "Pump 2", action: "Off" },
      { id: 5, time: "07:00", device: "Fan", action: "On" },
      { id: 6, time: "11:00", device: "Fan", action: "Off" },
    ],
  },
  {
    date: new Date(2025, 3, 17),
    tasks: [
      { id: 7, time: "06:00", device: "Pump 1", action: "On" },
      { id: 8, time: "09:00", device: "Pump 1", action: "Off" },
      { id: 9, time: "16:00", device: "Fan", action: "On" },
      { id: 10, time: "22:00", device: "Fan", action: "Off" },
    ],
  },
  {
    date: new Date(2025, 3, 18),
    tasks: [
      { id: 11, time: "05:00", device: "Pump 2", action: "On" },
      { id: 12, time: "08:00", device: "Pump 2", action: "Off" },
    ],
  },
  {
    date: new Date(2025, 3, 19),
    tasks: [
      { id: 13, time: "06:00", device: "Pump 1", action: "On" },
      { id: 14, time: "09:00", device: "Pump 1", action: "Off" },
      { id: 15, time: "07:00", device: "Fan", action: "On" },
      { id: 16, time: "11:00", device: "Fan", action: "Off" },
    ],
  },
]

// Function to get tasks for a specific date
const getTasksForDate = (date: Date) => {
  if (!date) return []
  const formattedDate = date.toDateString()
  const scheduleItem = scheduleData.find((item) => item.date.toDateString() === formattedDate)
  console.log("current" + date.toDateString())
    scheduleData.map((item) => {console.log(item.date.toDateString())})
  console.log(scheduleItem)
  return scheduleItem ? scheduleItem.tasks : []
}

// Function to check if a date has tasks
const hasTasksOnDate = (date: Date) => {
  const formattedDate = date.toDateString()
  return scheduleData.some((item) => item.date.toDateString() === formattedDate)
}

// Get device color
const getDeviceColor = (device: string) => {
  if (device.includes("Pump")) return "bg-green-100 text-green-800"
  if (device.includes("Fan")) return "bg-purple-100 text-purple-800"
  return "bg-gray-100 text-gray-800"
}

// Custom calendar component
const CustomCalendar = ({ selectedDate, onSelectDate }: { selectedDate: Date; onSelectDate: (date: Date) => void }) => {
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
          const dayTasks = getTasksForDate(day)

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
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs mb-1 truncate rounded px-1 ${getDeviceColor(task.device)}`}
                          >
                            {task.time} {task.device.split(" ")[0]} {task.action}
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
                        {dayTasks.map((task) => (
                          <div key={task.id} className="flex justify-between text-sm">
                            <span
                              className={`font-medium ${task.device.includes("Pump") ? "text-green-600" : "text-purple-600"}`}
                            >
                              {task.device}
                            </span>
                            <span>
                              {task.time} - {task.action}
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

export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)

  const tasks = date ? getTasksForDate(date) : []

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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Ngầy</Label>
                        <Input id="date" type="date" defaultValue={date.toISOString().split("T")[0]} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="time">Thời gian</Label>
                        <Input id="time" type="time" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Repeat</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <label
                            key={day}
                            className="flex items-center space-x-2 border rounded-md px-3 py-1 cursor-pointer hover:bg-muted"
                          >
                            <input type="checkbox" className="rounded" />
                            <span>{day}</span>
                          </label>
                        ))}
                      </div>
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
                  <CustomCalendar selectedDate={date} onSelectDate={setDate} />
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
                          {tasks.map((task) => (
                            <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                              <div>
                                <div className="font-medium">
                                  {task.time} - {task.device}
                                </div>
                                <div className="text-sm text-muted-foreground">{task.action}</div>
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
                            .filter((task) => task.device.includes("Pump"))
                            .map((task) => (
                              <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                                <div>
                                  <div className="font-medium">
                                    {task.time} - {task.device}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{task.action}</div>
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
                            .filter((task) => task.device === "Fan")
                            .map((task) => (
                              <div key={task.id} className="flex justify-between items-center border rounded-lg p-4">
                                <div>
                                  <div className="font-medium">
                                    {task.time} - {task.device}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{task.action}</div>
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
