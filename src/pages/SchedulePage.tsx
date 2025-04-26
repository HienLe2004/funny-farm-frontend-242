"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import axios from "axios"

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
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// API base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL // Update with your actual API URL

// Schedule types
const SCHEDULE_TYPES = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  ONCE: "ONCE",
}

// Weekday options
const WEEKDAYS = [
  { value: "MONDAY", label: "Thứ Hai" },
  { value: "TUESDAY", label: "Thứ Ba" },
  { value: "WEDNESDAY", label: "Thứ Tư" },
  { value: "THURSDAY", label: "Thứ Năm" },
  { value: "FRIDAY", label: "Thứ Sáu" },
  { value: "SATURDAY", label: "Thứ Bảy" },
  { value: "SUNDAY", label: "Chủ Nhật" },
]

// Schedule interface
interface Schedule {
  id: number
  device: {
    id: number
    room: {
      id: number
      name: string
      email: string
    }
    name: string
    status: string
    feedsList: Record<string, number>
  }
  status: string
  description: string
  scheduleType: string
  startDate?: string
  endDate?: string
  weekDay?: string
  time_from: string
  time_to: string
}

// Schedule form interface
interface ScheduleForm {
  id_device: number
  feedId: number
  status: string
  description: string
  scheduleType: string
  weekDay?: string
  startDate?: string
  endDate?: string
  time_from: string
  time_to: string
}

// Device interface
interface Device {
  id: number
  name: string
  feedsList: Record<
    string,
    {
      feedId: number
      threshold_max: number
      threshold_min: number
    }
  >
}

// Room interface
interface Room {
  roomId: number
  roomName: string
}

// Fix the date mismatch issue by standardizing date handling
// Update the getTasksForDate function to handle dates consistently
const getTasksForDate = (schedules: Schedule[], date: Date) => {
  if (!date || !schedules.length) return []

  // Create a date string in YYYY-MM-DD format without timezone issues
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`

  return schedules.filter((schedule) => {
    // For DAILY schedules, they happen every day
    if (schedule.scheduleType === "DAILY") {
      return true
    }

    // For WEEKLY schedules, check if the weekday matches
    if (schedule.scheduleType === "WEEKLY") {
      const weekdayMap: Record<string, number> = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
      }
      return weekdayMap[schedule.weekDay || ""] === date.getDay()
    }

    // For ONCE schedules, check if the date is within the range
    if (schedule.scheduleType === "ONCE" && schedule.startDate && schedule.endDate) {
      return formattedDate >= schedule.startDate && formattedDate <= schedule.endDate
    }

    return false
  })
}

// Function to check if a date has tasks
const hasTasksOnDate = (schedules: Schedule[], date: Date) => {
  return getTasksForDate(schedules, date).length > 0
}

// Get device color
const getDeviceColor = (deviceName: string) => {
  if (deviceName.toLowerCase().includes("pump")) return "bg-green-100 text-green-800"
  if (deviceName.toLowerCase().includes("fan")) return "bg-purple-100 text-purple-800"
  return "bg-gray-100 text-gray-800"
}

// Fix the month navigation issue by updating the handleMonthChange function
// Update the CustomCalendar component to properly handle month changes
const CustomCalendar = ({
  selectedDate,
  onSelectDate,
  schedules,
  onMonthChange,
}: {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  schedules: Schedule[]
  onMonthChange: (date: Date) => void
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Initialize with the same month as the selected date
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Update currentMonth when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [selectedDate])

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
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(newMonth)
    // Fetch schedules for the new month
    onMonthChange(newMonth)
  }

  // Navigate to next month
  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(newMonth)
    // Fetch schedules for the new month
    onMonthChange(newMonth)
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

          // Compare dates without time components
          const isSelected =
            selectedDate &&
            day.getDate() === selectedDate.getDate() &&
            day.getMonth() === selectedDate.getMonth() &&
            day.getFullYear() === selectedDate.getFullYear()

          // Compare with today's date without time components
          const today = new Date()
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear()

          const dayTasks = getTasksForDate(schedules, day)

          return (
            <TooltipProvider key={`day-${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}>
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
                            className={`text-xs mb-1 truncate rounded px-1 ${getDeviceColor(task.device.name)}`}
                          >
                            {task.time_from.substring(0, 5)} {task.device.name.split(" ")[0]}
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
                    <div className="p-2 bg-popover">
                      <div className="font-medium mb-1">
                        {day.toLocaleDateString("vi-VN", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.map((task) => (
                          <div key={task.id} className="flex justify-between text-sm">
                            <span className={`font-medium ${getDeviceColor(task.device.name)}`}>
                              {task.device.name}
                            </span>
                            <span>
                              {task.time_from.substring(0, 5)} - {task.time_to.substring(0, 5)}
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
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])

  // Form state
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    id_device: 0,
    feedId: 0,
    status: "ACTIVE",
    description: "",
    scheduleType: SCHEDULE_TYPES.DAILY,
    time_from: "",
    time_to: "",
  })

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms()
  }, [])

  // Fetch schedules when room is selected
  useEffect(() => {
    if (selectedRoomId) {
      fetchSchedules()
      fetchDevices()
    }
  }, [selectedRoomId, date])

  const getAuthToken = () => localStorage.getItem("authToken")

  // Fetch rooms
  const fetchRooms = async () => {
    const token = getAuthToken()
    if (!token) {
      toast({ title: "Lỗi", description: "Token không hợp lệ.", variant: "destructive" })
      return
    }
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.code === 200) {
        setRooms(response.data.listRoom)
        if (response.data.listRoom.length > 0) {
          const firstRoomId = response.data.listRoom[0]?.roomId
          if (firstRoomId !== undefined) {
            setSelectedRoomId(firstRoomId)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách phòng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch devices for selected room
  const fetchDevices = async () => {
    if (!selectedRoomId) return
    const token = getAuthToken()
    if (!token) {
      toast({ title: "Lỗi", description: "Token không hợp lệ.", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/devices/room/${selectedRoomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.code === 200) {
        setDevices(response.data.listDeviceDTO || [])
      }
    } catch (error) {
      console.error("Error fetching devices:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thiết bị",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fix the handleMonthChange function in the main component
  // Update the fetchSchedules function to use the month and year from the provided date
  const fetchSchedules = async (targetDate = date) => {
    if (!selectedRoomId) return
    const token = getAuthToken()
    if (!token) {
      toast({ title: "Lỗi", description: "Token không hợp lệ.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const month = targetDate.getMonth() + 1 // JavaScript months are 0-indexed
      const year = targetDate.getFullYear()

      const response = await axios.get(
        `${API_BASE_URL}/schedule?month=${month}&year=${year}&id_room=${selectedRoomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.code === 200) {
        setSchedules(response.data.schedules || [])
      }
    } catch (error) {
      console.error("Error fetching schedules:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the handleMonthChange function to properly update the date and fetch schedules
  const handleMonthChange = (newDate: Date) => {
    // Update the selected date to the first day of the new month
    const updatedDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
    setDate(updatedDate)
    // Fetch schedules for the new month
    fetchSchedules(updatedDate)
  }

  // Create schedule
  const createSchedule = async () => {
    const token = getAuthToken()
    if (!token) {
      toast({ title: "Lỗi", description: "Token không hợp lệ.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/schedule/create`, scheduleForm, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.code === 200) {
        toast({
          title: "Thành công",
          description: "Đã tạo lịch mới",
        })
        setOpen(false)
        fetchSchedules() // Refresh schedules
      } else if (response.data.code === 4002) {
        toast({
          title: "Lỗi",
          description: "Thời gian lịch bị trùng lặp",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Lỗi",
          description: response.data.message || "Không thể tạo lịch mới",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
      const errorDesc =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Không thể tạo lịch mới"
      toast({
        title: "Lỗi",
        description: errorDesc,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createSchedule()
  }

  // Handle form input changes
  const handleInputChange = (field: keyof ScheduleForm, value: any) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }))
  }

  // Handle device selection
  const handleDeviceSelect = (deviceId: number) => {
    const device = devices.find((d) => d.id === deviceId)
    if (device && device.feedsList) {
      // Get the first feed from the device's feeds list
      const firstFeedKey = Object.keys(device.feedsList)[0]
      const firstFeed = device.feedsList[firstFeedKey]

      setScheduleForm((prev) => ({
        ...prev,
        id_device: deviceId,
        feedId: firstFeed.feedId,
      }))
    }
  }

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Reset form to defaults
      const defaultDevice = devices.length > 0 ? devices[0] : null
      let defaultFeedId = 0

      if (defaultDevice && Object.keys(defaultDevice.feedsList).length > 0) {
        const firstFeedKey = Object.keys(defaultDevice.feedsList)[0]
        defaultFeedId = defaultDevice.feedsList[firstFeedKey].feedId
      }

      setScheduleForm({
        id_device: defaultDevice?.id || 0,
        feedId: defaultFeedId,
        status: "ACTIVE",
        description: "",
        scheduleType: SCHEDULE_TYPES.DAILY,
        time_from: "",
        time_to: "",
      })
    }
    setOpen(open)
  }

  // Get tasks for the selected date
  const tasks = getTasksForDate(schedules, date)

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
              <div className="flex items-center gap-2">
                <Select value={selectedRoomId?.toString()} onValueChange={(value) => setSelectedRoomId(Number(value))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.roomId} value={room.roomId.toString()}>
                        {room.roomName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={open} onOpenChange={handleOpenChange}>
                  <DialogTrigger asChild>
                    <Button disabled={!selectedRoomId || devices.length === 0}>
                      <Plus className="mr-2 h-4 w-4" />
                      Lịch mới
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm lịch mới</DialogTitle>
                      <DialogDescription>Tạo một lịch mới cho thiết bị.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="device">Thiết bị</Label>
                          <Select
                            value={scheduleForm.id_device.toString()}
                            onValueChange={(value) => handleDeviceSelect(Number(value))}
                          >
                            <SelectTrigger id="device">
                              <SelectValue placeholder="Chọn thiết bị" />
                            </SelectTrigger>
                            <SelectContent>
                              {devices.map((device) => (
                                <SelectItem key={device.id} value={device.id.toString()}>
                                  {device.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="description">Mô tả</Label>
                          <Textarea
                            id="description"
                            value={scheduleForm.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Nhập mô tả cho lịch"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="status">Trạng thái</Label>
                          <Select
                            value={scheduleForm.status}
                            onValueChange={(value) => handleInputChange("status", value)}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Loại lịch</Label>
                          <RadioGroup
                            value={scheduleForm.scheduleType}
                            onValueChange={(value) => handleInputChange("scheduleType", value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={SCHEDULE_TYPES.DAILY} id="daily" />
                              <Label htmlFor="daily">Hằng ngày</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={SCHEDULE_TYPES.WEEKLY} id="weekly" />
                              <Label htmlFor="weekly">Hằng tuần</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={SCHEDULE_TYPES.ONCE} id="once" />
                              <Label htmlFor="once">Một lần</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Conditional fields based on schedule type */}
                        {scheduleForm.scheduleType === SCHEDULE_TYPES.WEEKLY && (
                          <div className="grid gap-2">
                            <Label htmlFor="weekDay">Ngày trong tuần</Label>
                            <Select
                              value={scheduleForm.weekDay}
                              onValueChange={(value) => handleInputChange("weekDay", value)}
                            >
                              <SelectTrigger id="weekDay">
                                <SelectValue placeholder="Chọn ngày trong tuần" />
                              </SelectTrigger>
                              <SelectContent>
                                {WEEKDAYS.map((day) => (
                                  <SelectItem key={day.value} value={day.value}>
                                    {day.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {scheduleForm.scheduleType === SCHEDULE_TYPES.ONCE && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="startDate">Ngày bắt đầu</Label>
                              <Input
                                id="startDate"
                                type="date"
                                value={scheduleForm.startDate}
                                onChange={(e) => handleInputChange("startDate", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="endDate">Ngày kết thúc</Label>
                              <Input
                                id="endDate"
                                type="date"
                                value={scheduleForm.endDate}
                                onChange={(e) => handleInputChange("endDate", e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="time_from">Thời gian bắt đầu</Label>
                            <Input
                              id="time_from"
                              type="time"
                              value={scheduleForm.time_from}
                              onChange={(e) => handleInputChange("time_from", e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="time_to">Thời gian kết thúc</Label>
                            <Input
                              id="time_to"
                              type="time"
                              value={scheduleForm.time_to}
                              onChange={(e) => handleInputChange("time_to", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} type="button">
                          Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Đang lưu..." : "Lưu lịch"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch</CardTitle>
                  <CardDescription>Xem và chọn ngày có lịch</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-[400px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <CustomCalendar
                      selectedDate={date}
                      onSelectDate={setDate}
                      schedules={schedules}
                      onMonthChange={handleMonthChange}
                    />
                  )}
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
                  <CardDescription>{tasks.length} lịch</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Không có lịch cho ngày này</p>
                      <Button
                        className="mt-4"
                        onClick={() => setOpen(true)}
                        disabled={!selectedRoomId || devices.length === 0}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm lịch
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all">Tất cả</TabsTrigger>
                          <TabsTrigger value="active">Hoạt động</TabsTrigger>
                          <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-4 space-y-4">
                          {tasks.map((task) => (
                            <ScheduleItem key={task.id} schedule={task} onDelete={fetchSchedules} />
                          ))}
                        </TabsContent>
                        <TabsContent value="active" className="mt-4 space-y-4">
                          {tasks
                            .filter((task) => task.status === "ACTIVE")
                            .map((task) => (
                              <ScheduleItem key={task.id} schedule={task} onDelete={fetchSchedules} />
                            ))}
                        </TabsContent>
                        <TabsContent value="inactive" className="mt-4 space-y-4">
                          {tasks
                            .filter((task) => task.status === "INACTIVE")
                            .map((task) => (
                              <ScheduleItem key={task.id} schedule={task} onDelete={fetchSchedules} />
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

// Schedule Item Component
function ScheduleItem({ schedule, onDelete }: { schedule: Schedule; onDelete: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [updatedSchedule, setUpdatedSchedule] = useState<ScheduleForm>({
    id_device: schedule.device.id,
    feedId: Object.values(schedule.device.feedsList)[0].feedId, // Extract feedId from the object
    status: schedule.status,
    description: schedule.description,
    scheduleType: schedule.scheduleType,
    weekDay: schedule.weekDay,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    time_from: schedule.time_from,
    time_to: schedule.time_to,
  })

  const getAuthToken = () => localStorage.getItem("authToken")

  // Delete schedule
  const handleDelete = async () => {
    const token = getAuthToken()
    if (!token) {
      toast({ title: "Lỗi", description: "Token không hợp lệ.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await axios.delete(`${API_BASE_URL}/schedule/${schedule.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.code === 200) {
        toast({
          title: "Thành công",
          description: "Đã xóa lịch",
        })
        onDelete() // Refresh schedules
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa lịch",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update schedule
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getAuthToken()
    if (!token) {
      toast({ title: "Lỗi", description: "Token không hợp lệ.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await axios.put(`${API_BASE_URL}/schedule/${schedule.id}`, updatedSchedule, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.code === 200) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật lịch",
        })
        setUpdateDialogOpen(false)
        onDelete() // Refresh schedules
      } else if (response.data.code === 4002) {
        toast({
          title: "Lỗi",
          description: "Thời gian lịch bị trùng lặp",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật lịch",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field: keyof ScheduleForm, value: any) => {
    setUpdatedSchedule((prev) => ({ ...prev, [field]: value }))
  }

  // Get schedule type display text
  const getScheduleTypeText = () => {
    switch (schedule.scheduleType) {
      case SCHEDULE_TYPES.DAILY:
        return "Hằng ngày"
      case SCHEDULE_TYPES.WEEKLY:
        return `Hằng tuần (${WEEKDAYS.find((day) => day.value === schedule.weekDay)?.label || schedule.weekDay})`
      case SCHEDULE_TYPES.ONCE:
        return `Một lần (${schedule.startDate} - ${schedule.endDate})`
      default:
        return schedule.scheduleType
    }
  }

  return (
    <div className="flex justify-between items-center border rounded-lg p-4">
      <div>
        <div className="font-medium">
          {schedule.time_from.substring(0, 5)} - {schedule.time_to.substring(0, 5)} | {schedule.device.name}
        </div>
        <div className="text-sm text-muted-foreground">{schedule.description}</div>
        <div className="text-xs mt-1 flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full ${schedule.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
          >
            {schedule.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{getScheduleTypeText()}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => setUpdateDialogOpen(true)}>
          Sửa
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Đang xóa..." : "Xóa"}
        </Button>
      </div>

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật lịch</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin lịch.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="update-description">Mô tả</Label>
                <Textarea
                  id="update-description"
                  value={updatedSchedule.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Nhập mô tả cho lịch"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="update-status">Trạng thái</Label>
                <Select value={updatedSchedule.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger id="update-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on schedule type */}
              {updatedSchedule.scheduleType === SCHEDULE_TYPES.WEEKLY && (
                <div className="grid gap-2">
                  <Label htmlFor="update-weekDay">Ngày trong tuần</Label>
                  <Select
                    value={updatedSchedule.weekDay}
                    onChange={(e) => handleInputChange("weekDay", e.target.value)}
                  >
                    <SelectTrigger id="update-weekDay">
                      <SelectValue placeholder="Chọn ngày trong tuần" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {updatedSchedule.scheduleType === SCHEDULE_TYPES.ONCE && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="update-startDate">Ngày bắt đầu</Label>
                    <Input
                      id="update-startDate"
                      type="date"
                      value={updatedSchedule.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="update-endDate">Ngày kết thúc</Label>
                    <Input
                      id="update-endDate"
                      type="date"
                      value={updatedSchedule.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="update-time_from">Thời gian bắt đầu</Label>
                  <Input
                    id="update-time_from"
                    type="time"
                    value={updatedSchedule.time_from}
                    onChange={(e) => handleInputChange("time_from", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="update-time_to">Thời gian kết thúc</Label>
                  <Input
                    id="update-time_to"
                    type="time"
                    value={updatedSchedule.time_to}
                    onChange={(e) => handleInputChange("time_to", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)} type="button">
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
