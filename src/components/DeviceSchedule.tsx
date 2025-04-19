"use client"

import { useState } from "react"
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

// Sample schedule data for different devices
const deviceSchedules = {
  "pump-1": [
    { id: 1, time: "06:00 AM", action: "Turn On", days: ["Mon", "Wed", "Fri"] },
    { id: 2, time: "09:00 AM", action: "Turn Off", days: ["Mon", "Wed", "Fri"] },
    { id: 3, time: "06:00 PM", action: "Turn On", days: ["Tue", "Thu"] },
    { id: 4, time: "09:00 PM", action: "Turn Off", days: ["Tue", "Thu"] },
  ],
  "pump-2": [
    { id: 1, time: "05:00 AM", action: "Turn On", days: ["Tue", "Thu", "Sat"] },
    { id: 2, time: "08:00 AM", action: "Turn Off", days: ["Tue", "Thu", "Sat"] },
    { id: 3, time: "05:00 PM", action: "Turn On", days: ["Mon", "Wed", "Fri"] },
    { id: 4, time: "08:00 PM", action: "Turn Off", days: ["Mon", "Wed", "Fri"] },
  ],
  "fan": [
    { id: 1, time: "07:00 AM", action: "Turn On", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: 2, time: "11:00 AM", action: "Turn Off", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: 3, time: "04:00 PM", action: "Turn On", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: 4, time: "10:00 PM", action: "Turn Off", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  ],
}

export function DeviceSchedule({ deviceId }: { deviceId: string }) {
  const [open, setOpen] = useState(false)
  const schedules = deviceSchedules[deviceId as keyof typeof deviceSchedules] || []

  // Only show schedule for actuators (pumps and fan)
  const isActuator = deviceId.includes("pump") || deviceId.includes("fan")

  if (!isActuator) {
    return (
      <div className="text-center py-4 text-muted-foreground">Lập lịch chỉ dành cho thiết bị điều khiển</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Scheduled Tasks</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm lịch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lịch mới</DialogTitle>
              <DialogDescription>Thêm lịch mới cho thiết bị này.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="action">Hoạt động</Label>
                <Select defaultValue="on">
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">Bật</SelectItem>
                    <SelectItem value="off">Tắt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Thời gian</Label>
                <Input id="time" type="time" />
              </div>
              <div className="grid gap-2">
                <Label>Days</Label>
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
        </div>
      )}
    </div>
  )
}
