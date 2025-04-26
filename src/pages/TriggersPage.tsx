"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, PlusCircle, Edit, Trash2, AlertCircle, Check } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

interface Trigger {
  id: number
  status: string
  condition: string
  sensorFeedKey: string
  controlFeedKey: string
  valueSend: string
}

interface Room {
  roomId: number
  roomName: string
}

interface FeedDTO {
  feedKey: string
  deviceName: string
}

interface FeedResponse {
  code: number
  message: string
  authenticated: boolean
  listFeedDTO?: FeedDTO[]
}

interface ApiResponse<T> {
  code: number
  message: string
  authenticated: boolean
  currentPage?: number
  totalPages?: number
  totalElements?: number
  listDeviceTriggersDTO?: T[]
}

const getAuthToken = () => localStorage.getItem("authToken")

export default function TriggersPage() {
  const navigate = useNavigate()
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // State for rooms
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")

  // State for feed keys
  const [sensorFeeds, setSensorFeeds] = useState<FeedDTO[]>([])
  const [controlFeeds, setControlFeeds] = useState<FeedDTO[]>([])

  // State for Add Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newTrigger, setNewTrigger] = useState<Omit<Trigger, "id" | "status">>({
    condition: "MAX",
    sensorFeedKey: "",
    controlFeedKey: "",
    valueSend: "1",
  })

  // State for Update Dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null)
  const [updatedTrigger, setUpdatedTrigger] = useState<Trigger>({
    id: 0,
    status: "ACTIVE",
    condition: "MAX",
    sensorFeedKey: "",
    controlFeedKey: "",
    valueSend: "1",
  })

  // Fetch triggers when deviceId changes
  useEffect(() => {
    if (deviceId) {
      fetchTriggers()
    }
  }, [deviceId, currentPage, pageSize])

  // Fetch rooms when component mounts
  useEffect(() => {
    fetchRooms()
  }, [])

  // Fetch sensor and control feeds when selectedRoomId changes
  useEffect(() => {
    if (selectedRoomId) {
      fetchSensorFeeds(selectedRoomId)
      fetchControlFeeds(selectedRoomId)
    }
  }, [selectedRoomId])

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setError(null)
    setTimeout(() => setSuccessMessage(null), 4000)
  }

  const showError = (message: string) => {
    setError(message)
    setSuccessMessage(null)
    setTimeout(() => setError(null), 5000)
  }

  const fetchTriggers = async () => {
    if (!deviceId) return

    setLoading(true)
    clearMessages()
    const token = getAuthToken()
    if (!token) {
      showError("Không tìm thấy token xác thực.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/triggers/device/${deviceId}?page=${currentPage}&size=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // --- Add more detailed error logging ---
      if (!response.ok) {
        let errorBody: any = null // Use 'any' or a more specific error type
        try {
          // Try to clone the response before reading the body
          const clonedResponse = response.clone()
          errorBody = await clonedResponse.json() // Try to parse JSON error
        } catch (e) {
          try {
            // If JSON parsing fails, try reading as text from the original response
            errorBody = await response.text() // Fallback to text error
          } catch (e2) {
            console.error("Failed to read error response body:", e2)
          }
        }
        // Log detailed info
        console.error(
          `Fetch triggers failed! URL: ${response.url}, Status: ${response.status}, StatusText: ${response.statusText}, Response Body:`,
          errorBody,
        )
        // Use the parsed message if available, otherwise construct one
        const errorMessage = errorBody?.message || `Không thể lấy danh sách trigger. Trạng thái: ${response.status}`
        showError(errorMessage)
        setTriggers([]) // Clear triggers on error
        setTotalPages(1)
        setCurrentPage(0)
        return // Stop processing on error
      }
      // --- End detailed error logging ---

      // If response.ok, proceed to parse JSON
      const data: ApiResponse<Trigger> = await response.json()

      if (response.ok && data.code === 200) {
        if (data.message === "No triggers found for this device") {
          setTriggers([])
        } else {
          setTriggers(data.listDeviceTriggersDTO || [])
          setCurrentPage(data.currentPage || 0)
          setTotalPages(data.totalPages || 1)
        }
      } else {
        showError(data.message || `Không thể lấy danh sách trigger. Trạng thái: ${response.status}`)
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách trigger:", err)
      showError("Đã xảy ra lỗi không mong muốn khi lấy danh sách trigger.")
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    clearMessages()
    const token = getAuthToken()
    if (!token) {
      showError("Không tìm thấy token xác thực.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        showError(`Không thể lấy danh sách phòng. Trạng thái: ${response.status}`)
        return
      }

      const data = await response.json()
      if (data.code === 200) {
        setRooms(data.listRoom || [])
      } else {
        showError(data.message || "Không thể lấy danh sách phòng.")
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phòng:", err)
      showError("Đã xảy ra lỗi không mong muốn khi lấy danh sách phòng.")
    }
  }

  const fetchSensorFeeds = async (roomId: string) => {
    if (!roomId) return

    clearMessages()
    const token = getAuthToken()
    if (!token) {
      showError("Không tìm thấy token xác thực.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/triggers/room-sensor/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        showError(`Không thể lấy danh sách cảm biến. Trạng thái: ${response.status}`)
        setSensorFeeds([])
        return
      }

      const data: FeedResponse = await response.json()
      if (data.code === 200) {
        if (data.message === "No sensor feeds of this room is found") {
          setSensorFeeds([])
        } else {
          setSensorFeeds(data.listFeedDTO || [])
        }
      } else {
        showError(data.message || "Không thể lấy danh sách cảm biến.")
        setSensorFeeds([])
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cảm biến:", err)
      showError("Đã xảy ra lỗi không mong muốn khi lấy danh sách cảm biến.")
      setSensorFeeds([])
    }
  }

  const fetchControlFeeds = async (roomId: string) => {
    if (!roomId) return

    clearMessages()
    const token = getAuthToken()
    if (!token) {
      showError("Không tìm thấy token xác thực.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/triggers/room-control/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        showError(`Không thể lấy danh sách thiết bị điều khiển. Trạng thái: ${response.status}`)
        setControlFeeds([])
        return
      }

      const data: FeedResponse = await response.json()
      if (data.code === 200) {
        if (data.message === "No control feeds of this room is found") {
          setControlFeeds([])
        } else {
          setControlFeeds(data.listFeedDTO || [])
        }
      } else {
        showError(data.message || "Không thể lấy danh sách thiết bị điều khiển.")
        setControlFeeds([])
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thiết bị điều khiển:", err)
      showError("Đã xảy ra lỗi không mong muốn khi lấy danh sách thiết bị điều khiển.")
      setControlFeeds([])
    }
  }

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId)
    // Reset feed key selections in the new trigger form
    setNewTrigger({
      ...newTrigger,
      sensorFeedKey: "",
      controlFeedKey: "",
    })
  }

  const handleAddTrigger = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    clearMessages()
    const token = getAuthToken()
    if (!token) {
      showError("Không tìm thấy token xác thực.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/triggers/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTrigger),
      })
      const data: ApiResponse<never> = await response.json()

      if (response.ok && data.code === 200) {
        showSuccess(data.message || "Thêm trigger thành công!")
        setAddDialogOpen(false)
        setNewTrigger({
          condition: "MAX",
          sensorFeedKey: "",
          controlFeedKey: "",
          valueSend: "1",
        })
        fetchTriggers()
      } else {
        showError(data.message || `Không thể thêm trigger. Trạng thái: ${response.status}`)
      }
    } catch (err) {
      console.error("Lỗi khi thêm trigger:", err)
      showError("Đã xảy ra lỗi không mong muốn khi thêm trigger.")
    } finally {
      setLoading(false)
    }
  }

  const openUpdateDialog = (trigger: Trigger) => {
    setSelectedTrigger(trigger)
    setUpdatedTrigger({ ...trigger })

    // Find the room ID for this trigger by looking at the sensor feed key
    // This is a workaround since we don't have direct room ID in the trigger
    // You may need to adjust this logic based on your actual data structure
    const roomIdFromSensorKey = trigger.sensorFeedKey.split(".")[0]
    if (roomIdFromSensorKey) {
      // Find the room with this key or ID
      const room = rooms.find(
        (r) =>
          r.roomId.toString() === roomIdFromSensorKey ||
          r.roomName.toLowerCase().includes(roomIdFromSensorKey.toLowerCase()),
      )
      if (room) {
        setSelectedRoomId(room.roomId.toString())
      }
    }

    setUpdateDialogOpen(true)
    clearMessages()
  }

  const handleUpdateTrigger = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    clearMessages()
    const token = getAuthToken()
    if (!token) {
      showError("Không tìm thấy token xác thực.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/triggers/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTrigger),
      })
      const data: ApiResponse<never> = await response.json()

      if (response.ok && data.code === 200) {
        showSuccess(data.message || "Cập nhật trigger thành công!")
        setUpdateDialogOpen(false)
        setSelectedTrigger(null)
        fetchTriggers()
      } else {
        showError(data.message || `Không thể cập nhật trigger. Trạng thái: ${response.status}`)
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trigger:", err)
      showError("Đã xảy ra lỗi không mong muốn khi cập nhật trigger.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrigger = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trigger này không?")) {
      return
    }

    setLoading(true)
    clearMessages()
    const token = getAuthToken()
    if (!token) {
      showError("Không tìm thấy token xác thực.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/triggers/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data: ApiResponse<never> = await response.json()

      if (response.ok && data.code === 200) {
        showSuccess(data.message || "Xóa trigger thành công!")
        fetchTriggers()
      } else {
        showError(data.message || `Không thể xóa trigger. Trạng thái: ${response.status}`)
      }
    } catch (err) {
      console.error("Lỗi khi xóa trigger:", err)
      showError("Đã xảy ra lỗi không mong muốn khi xóa trigger.")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <section className="w-full py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" asChild className="mr-2">
                  <Link to="/">
                    <ArrowLeft />
                    <span className="sr-only">Quay lại</span>
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Quản lý Trigger</h1>
              </div>
            </div>

            {/* Device ID Input */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="deviceId">ID Thiết bị</Label>
                  <Input
                    id="deviceId"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="Nhập ID thiết bị để xem trigger"
                  />
                </div>
                <Button onClick={fetchTriggers} disabled={!deviceId || loading} className="mt-6">
                  {loading ? "Đang tải..." : "Tìm kiếm"}
                </Button>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-6">
                      <PlusCircle className="mr-2 h-4 w-4" /> Thêm Trigger
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm Trigger mới</DialogTitle>
                      <DialogDescription>Điền thông tin để thêm trigger mới.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddTrigger}>
                      <div className="space-y-4 py-4">
                        {/* Room Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="roomId">Phòng</Label>
                          <Select value={selectedRoomId} onValueChange={handleRoomChange}>
                            <SelectTrigger id="roomId">
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
                        </div>

                        {/* Condition */}
                        <div className="space-y-2">
                          <Label htmlFor="condition">Điều kiện</Label>
                          <Select
                            value={newTrigger.condition}
                            onValueChange={(value) => setNewTrigger({ ...newTrigger, condition: value })}
                          >
                            <SelectTrigger id="condition">
                              <SelectValue placeholder="Chọn điều kiện" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MAX">MAX</SelectItem>
                              <SelectItem value="MIN">MIN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sensor Feed Key */}
                        <div className="space-y-2">
                          <Label htmlFor="sensorFeedKey">Feed Key (Cảm biến)</Label>
                          <Select
                            value={newTrigger.sensorFeedKey}
                            onValueChange={(value) => setNewTrigger({ ...newTrigger, sensorFeedKey: value })}
                            disabled={sensorFeeds.length === 0}
                          >
                            <SelectTrigger id="sensorFeedKey">
                              <SelectValue
                                placeholder={sensorFeeds.length === 0 ? "Không có cảm biến" : "Chọn cảm biến"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {sensorFeeds.map((feed) => (
                                <SelectItem key={feed.feedKey} value={feed.feedKey}>
                                  {feed.feedKey} - {feed.deviceName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Control Feed Key */}
                        <div className="space-y-2">
                          <Label htmlFor="controlFeedKey">Feed Key (Thiết bị điều khiển)</Label>
                          <Select
                            value={newTrigger.controlFeedKey}
                            onValueChange={(value) => setNewTrigger({ ...newTrigger, controlFeedKey: value })}
                            disabled={controlFeeds.length === 0}
                          >
                            <SelectTrigger id="controlFeedKey">
                              <SelectValue
                                placeholder={
                                  controlFeeds.length === 0
                                    ? "Không có thiết bị điều khiển"
                                    : "Chọn thiết bị điều khiển"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {controlFeeds.map((feed) => (
                                <SelectItem key={feed.feedKey} value={feed.feedKey}>
                                  {feed.feedKey} - {feed.deviceName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value to Send */}
                        <div className="space-y-2">
                          <Label htmlFor="valueSend">Giá trị gửi</Label>
                          <Input
                            id="valueSend"
                            value={newTrigger.valueSend}
                            onChange={(e) => setNewTrigger({ ...newTrigger, valueSend: e.target.value })}
                            placeholder="Ví dụ: 1"
                          />
                        </div>

                        {/* Informational Note */}
                        <Alert variant="info" className="bg-blue-50 mt-4">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm">
                            Nhập vào feed key(Cảm biến) và Feed Key (Thiết bị điều khiển), khi cảm biến đạt đến mốc quy
                            định max min thì sẽ trigger thiết bị điều khiển.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={
                            loading || !selectedRoomId || !newTrigger.sensorFeedKey || !newTrigger.controlFeedKey
                          }
                        >
                          {loading ? "Đang thêm..." : "Thêm Trigger"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Display Success/Error Messages */}
            {successMessage && (
              <Alert variant="default" className="mb-4 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Thành công</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Triggers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách Trigger</CardTitle>
                <CardDescription>
                  {deviceId ? `Các trigger cho thiết bị ID: ${deviceId}` : "Nhập ID thiết bị để xem danh sách trigger"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : triggers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Điều kiện</TableHead>
                        <TableHead>Feed Key (Cảm biến)</TableHead>
                        <TableHead>Feed Key (Thiết bị điều khiển)</TableHead>
                        <TableHead>Giá trị gửi</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {triggers.map((trigger) => (
                        <TableRow key={trigger.id}>
                          <TableCell>{trigger.id}</TableCell>
                          <TableCell>
                            <Badge variant={trigger.status === "ACTIVE" ? "default" : "secondary"}>
                              {trigger.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell>{trigger.condition}</TableCell>
                          <TableCell>{trigger.sensorFeedKey}</TableCell>
                          <TableCell>{trigger.controlFeedKey}</TableCell>
                          <TableCell>{trigger.valueSend}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => openUpdateDialog(trigger)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Sửa</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteTrigger(trigger.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Xóa</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : deviceId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không tìm thấy trigger nào cho thiết bị này
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nhập ID thiết bị để xem danh sách trigger
                  </div>
                )}

                {/* Pagination */}
                {triggers.length > 0 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink isActive={currentPage === i} onClick={() => handlePageChange(i)}>
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={
                              currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Update Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cập nhật Trigger</DialogTitle>
                  <DialogDescription>Cập nhật thông tin cho trigger.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpdateTrigger}>
                  <div className="space-y-4 py-4">
                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="update-status">Trạng thái</Label>
                      <Select
                        value={updatedTrigger.status}
                        onValueChange={(value) => setUpdatedTrigger({ ...updatedTrigger, status: value })}
                      >
                        <SelectTrigger id="update-status">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                          <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                      <Label htmlFor="update-condition">Điều kiện</Label>
                      <Select
                        value={updatedTrigger.condition}
                        onValueChange={(value) => setUpdatedTrigger({ ...updatedTrigger, condition: value })}
                      >
                        <SelectTrigger id="update-condition">
                          <SelectValue placeholder="Chọn điều kiện" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAX">MAX</SelectItem>
                          <SelectItem value="MIN">MIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sensor Feed Key */}
                    <div className="space-y-2">
                      <Label htmlFor="update-sensorFeedKey">Feed Key (Cảm biến)</Label>
                      <Select
                        value={updatedTrigger.sensorFeedKey}
                        onValueChange={(value) => setUpdatedTrigger({ ...updatedTrigger, sensorFeedKey: value })}
                        disabled={sensorFeeds.length === 0}
                      >
                        <SelectTrigger id="update-sensorFeedKey">
                          <SelectValue placeholder={sensorFeeds.length === 0 ? "Không có cảm biến" : "Chọn cảm biến"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sensorFeeds.map((feed) => (
                            <SelectItem key={feed.feedKey} value={feed.feedKey}>
                              {feed.feedKey} - {feed.deviceName}
                            </SelectItem>
                          ))}
                          {/* Keep the current value if not in the list */}
                          {updatedTrigger.sensorFeedKey &&
                            !sensorFeeds.some((feed) => feed.feedKey === updatedTrigger.sensorFeedKey) && (
                              <SelectItem value={updatedTrigger.sensorFeedKey}>
                                {updatedTrigger.sensorFeedKey} (Hiện tại)
                              </SelectItem>
                            )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Control Feed Key */}
                    <div className="space-y-2">
                      <Label htmlFor="update-controlFeedKey">Feed Key (Thiết bị điều khiển)</Label>
                      <Select
                        value={updatedTrigger.controlFeedKey}
                        onValueChange={(value) => setUpdatedTrigger({ ...updatedTrigger, controlFeedKey: value })}
                        disabled={controlFeeds.length === 0}
                      >
                        <SelectTrigger id="update-controlFeedKey">
                          <SelectValue
                            placeholder={
                              controlFeeds.length === 0 ? "Không có thiết bị điều khiển" : "Chọn thiết bị điều khiển"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {controlFeeds.map((feed) => (
                            <SelectItem key={feed.feedKey} value={feed.feedKey}>
                              {feed.feedKey} - {feed.deviceName}
                            </SelectItem>
                          ))}
                          {/* Keep the current value if not in the list */}
                          {updatedTrigger.controlFeedKey &&
                            !controlFeeds.some((feed) => feed.feedKey === updatedTrigger.controlFeedKey) && (
                              <SelectItem value={updatedTrigger.controlFeedKey}>
                                {updatedTrigger.controlFeedKey} (Hiện tại)
                              </SelectItem>
                            )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value to Send */}
                    <div className="space-y-2">
                      <Label htmlFor="update-valueSend">Giá trị gửi</Label>
                      <Input
                        id="update-valueSend"
                        value={updatedTrigger.valueSend}
                        onChange={(e) => setUpdatedTrigger({ ...updatedTrigger, valueSend: e.target.value })}
                      />
                    </div>

                    {/* Informational Note */}
                    <Alert variant="info" className="bg-blue-50 mt-4">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        Nhập vào feed key(Cảm biến) và Feed Key (Thiết bị điều khiển), khi cảm biến đạt đến mốc quy định
                        max min thì sẽ trigger thiết bị điều khiển.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Đang cập nhật..." : "Cập nhật Trigger"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>
    </div>
  )
}
