"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// API base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

// Schedule types
const SCHEDULE_TYPES = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  ONCE: "ONCE",
}

// Weekday options with Vietnamese labels
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

interface DeviceScheduleWithRoomIdProps {
  deviceId: string
  roomId: number
}

export function DeviceScheduleWithRoomId({ deviceId, roomId }: DeviceScheduleWithRoomIdProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { month: now.getMonth() + 1, year: now.getFullYear() }
  })

  // Helper to get auth token
  const getAuthToken = () => localStorage.getItem("authToken")

  // Fetch schedules for the device
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!deviceId || !roomId) {
        setError("Device ID and Room ID are required")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        setError("Authentication token not found")
        setLoading(false)
        return
      }

      try {
        // Fetch all schedules for the room for the current month/year
        const response = await fetch(
          `${API_BASE_URL}/schedule?month=${currentMonth.month}&year=${currentMonth.year}&id_room=${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch schedules: ${response.status}`)
        }

        const data = await response.json()

        if (data.code === 200) {
          // Filter schedules for the specific device
          const deviceSchedules = data.schedules
            ? data.schedules.filter((schedule: Schedule) => schedule.device.id.toString() === deviceId)
            : []
          setSchedules(deviceSchedules)
        } else {
          throw new Error(data.message || "Failed to fetch schedules")
        }
      } catch (err) {
        console.error("Error fetching schedules:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [deviceId, roomId, currentMonth])

  // Get schedule type display text
  const getScheduleTypeText = (schedule: Schedule) => {
    switch (schedule.scheduleType) {
      case SCHEDULE_TYPES.DAILY:
        return "Hằng ngày"
      case SCHEDULE_TYPES.WEEKLY:
        return `Hằng tuần (${WEEKDAYS.find((day) => day.value === schedule.weekDay)?.label || schedule.weekDay})`
      case SCHEDULE_TYPES.ONCE:
        return `Một lần (${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)})`
      default:
        return schedule.scheduleType
    }
  }

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: vi })
    } catch (e) {
      return dateStr
    }
  }

  // Format time helper
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5) // Format HH:MM from HH:MM:SS
  }

  // Get schedule status badge
  const getStatusBadge = (status: string) => {
    return status === "ACTIVE" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Hoạt động</Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
        Không hoạt động
      </Badge>
    )
  }

  // Change month handler
  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      let newMonth = prev.month + delta
      let newYear = prev.year

      if (newMonth > 12) {
        newMonth = 1
        newYear += 1
      } else if (newMonth < 1) {
        newMonth = 12
        newYear -= 1
      }

      return { month: newMonth, year: newYear }
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Tháng {currentMonth.month}/{currentMonth.year}
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
            Tháng trước
          </Button>
          <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
            Tháng sau
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Calendar className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Không có lịch</h3>
          <p className="text-sm text-muted-foreground">Thiết bị này chưa có lịch nào trong tháng này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatTime(schedule.time_from)} - {formatTime(schedule.time_to)}
                  </span>
                </div>
                {getStatusBadge(schedule.status)}
              </div>
              <p className="mt-1 text-sm">{schedule.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{getScheduleTypeText(schedule)}</span>
                <span className="text-xs text-muted-foreground">ID: {schedule.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
