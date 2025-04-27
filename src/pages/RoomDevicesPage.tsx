"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, PlusCircle, Trash2, CheckCircle2, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import DeviceCard from "@/components/DeviceCard" // Import the new component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import AddDeviceToRoomForm from "@/components/AddDeviceToRoomForm"

const API_BASE_URL = "http://localhost:8080/smart-farm"

// Define interfaces for the data structures based on API responses
interface DeviceFeedDetail {
  feedId: number
  threshold_max?: number
  threshold_min?: number
}

interface Device {
  id: number
  roomId?: number | null // Can be null if unassigned
  name: string
  type: string // "SENSOR", "CONTROL", etc.
  status: string // "ACTIVE", "INACTIVE"
  feedsList: { [key: string]: DeviceFeedDetail }
}

interface ApiResponse<T> {
  name: string
  code: number
  message: string
  authenticated?: boolean
  currentPage?: number
  totalPages?: number
  totalElements?: number
  listDeviceDTO?: T[]
  // Add other potential fields if needed
}

export default function RoomDevicesPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [assignedDevices, setAssignedDevices] = useState<Device[]>([])
  const [unassignedDevices, setUnassignedDevices] = useState<Device[]>([])
  const [selectedUnassignedDevice, setSelectedUnassignedDevice] = useState<string>("") // Store the ID as string
  const [loadingAssigned, setLoadingAssigned] = useState(false)
  const [loadingUnassigned, setLoadingUnassigned] = useState(false)
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [loadingDismiss, setLoadingDismiss] = useState<number | null>(null) // Store ID of device being dismissed
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string>("") // State for room name
  const [dialogOpen, setDialogOpen] = useState(false)

  const getAuthToken = () => localStorage.getItem("authToken")

  // --- Fetch Room Details ---
  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) return
    const token = getAuthToken()
    if (!token) {
      navigate("/auth")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ApiResponse<never> = await response.json() // Use ApiResponse with never for T

      if (response.ok && data.code === 200 && data.name) {
        setRoomName(data.name)
      } else if (response.status === 404) {
        setError(`Room with ID ${roomId} not found.`)
        setRoomName("Unknown Room") // Set a default or error name
      } else {
        // Handle other errors if needed
        console.warn("Could not fetch room name:", data.message)
        setRoomName(`Room ${roomId}`) // Fallback name
      }
    } catch (err) {
      console.error("Fetch room details error:", err)
      // Don't necessarily set the main page error, maybe just log or use fallback name
      setRoomName(`Room ${roomId}`) // Fallback name on fetch error
    }
  }, [roomId, navigate])

  // --- Fetch Assigned Devices ---
  const fetchAssignedDevices = useCallback(async () => {
    if (!roomId) return
    setLoadingAssigned(true)
    setError(null) // Clear previous errors before fetching
    const token = getAuthToken()
    if (!token) {
      navigate("/auth")
      return
    }

    try {
      // Fetch ALL assigned devices for the room (adjust size if pagination is needed later)
      const response = await fetch(`${API_BASE_URL}/devices/room/${roomId}?page=0&size=50`, {
        // Increased size
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ApiResponse<Device> = await response.json()

      if (response.ok && data.code === 200) {
        setAssignedDevices(data.listDeviceDTO || [])
        if (data.message === "No devices found") {
          setAssignedDevices([]) // Ensure empty array if no devices
        }
      } else if (response.status === 404) {
        setError(`Room with ID ${roomId} not found when fetching devices.`)
        setAssignedDevices([])
      } else {
        throw new Error(data.message || `Failed to fetch assigned devices. Status: ${response.status}`)
      }
    } catch (err) {
      console.error("Fetch assigned devices error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching devices.")
      setAssignedDevices([]) // Clear devices on error
    } finally {
      setLoadingAssigned(false)
    }
  }, [roomId, navigate])

  // --- Fetch Unassigned Devices ---
  const fetchUnassignedDevices = useCallback(async () => {
    setLoadingUnassigned(true)
    const token = getAuthToken()
    if (!token) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/devices/unassign?page=0&size=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ApiResponse<Device> = await response.json()

      if (response.ok && data.code === 200) {
        setUnassignedDevices(data.listDeviceDTO || [])
        if (data.message === "No devices found") {
          setUnassignedDevices([])
        }
      } else {
        setError(
          (currentError) =>
            currentError || data.message || `Failed to fetch unassigned devices. Status: ${response.status}`,
        )
        setUnassignedDevices([])
      }
    } catch (err) {
      console.error("Fetch unassigned devices error:", err)
      setError(
        (currentError) =>
          currentError ||
          (err instanceof Error ? err.message : "An unexpected error occurred fetching unassigned devices."),
      )
      setUnassignedDevices([])
    } finally {
      setLoadingUnassigned(false)
    }
  }, [])

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetchRoomDetails() // Fetch room name first or concurrently
    fetchAssignedDevices()
    fetchUnassignedDevices()
    // Simplify dependencies: fetch functions are stable due to useCallback
  }, [roomId, fetchRoomDetails, fetchAssignedDevices, fetchUnassignedDevices])

  // --- Assign Device ---
  const handleAssignDevice = async () => {
    if (!selectedUnassignedDevice || !roomId) {
      setError("Please select a device to assign.")
      return
    }
    setLoadingAssign(true)
    setError(null)
    setSuccessMessage(null)
    const token = getAuthToken()

    try {
      const response = await fetch(`${API_BASE_URL}/devices/assign-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: Number.parseInt(roomId, 10),
          deviceId: Number.parseInt(selectedUnassignedDevice, 10),
        }),
      })
      const data: ApiResponse<any> = await response.json()

      if (response.ok && data.code === 200) {
        setSuccessMessage(data.message || "Device assigned successfully!")
        setSelectedUnassignedDevice("") // Reset selection
        // Refresh both lists
        fetchAssignedDevices()
        fetchUnassignedDevices()
        setTimeout(() => setSuccessMessage(null), 3000) // Clear success message after 3s
      } else {
        throw new Error(data.message || `Failed to assign device. Status: ${response.status}`)
      }
    } catch (err) {
      console.error("Assign device error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred during assignment.")
    } finally {
      setLoadingAssign(false)
    }
  }

  // --- Dismiss Device ---
  const handleDismissDevice = async (deviceIdToDismiss: number) => {
    setLoadingDismiss(deviceIdToDismiss)
    setError(null)
    setSuccessMessage(null)
    const token = getAuthToken()

    try {
      // *** Check API Endpoint: Docs say POST /dismiss-room/{deviceId} ***
      const response = await fetch(`${API_BASE_URL}/devices/dismiss-room/${deviceIdToDismiss}`, {
        method: "POST", // Confirm this matches your backend API
        headers: {
          Authorization: `Bearer ${token}`,
          // No 'Content-Type' needed for POST without body usually
        },
      })
      const data: ApiResponse<any> = await response.json()

      if (response.ok && data.code === 200) {
        setSuccessMessage(data.message || "Device dismissed successfully!")
        // Refresh both lists
        fetchAssignedDevices()
        fetchUnassignedDevices()
        setTimeout(() => setSuccessMessage(null), 3000) // Clear success message
      } else {
        throw new Error(data.message || `Failed to dismiss device. Status: ${response.status}`)
      }
    } catch (err) {
      console.error("Dismiss device error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred during dismissal.")
    } finally {
      setLoadingDismiss(null) // Clear loading state
    }
  }

  // --- Render Logic ---
  const renderAssignedDevices = () => {
    if (loadingAssigned) {
      // Show skeleton loaders for cards
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="w-full max-w-sm">
              <CardHeader className="p-4 bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-8 w-20 mt-1" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-1 ml-auto" />
                  <Skeleton className="h-5 w-24 mt-1 ml-auto" />
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )
    }

    if (assignedDevices.length === 0 && !error) {
      // Check !error to avoid showing "No devices" when there's a fetch error
      return <p className="text-muted-foreground text-center py-4">No devices currently assigned to this room.</p>
    }

    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {assignedDevices.map((device) => (
          <div key={device.id} className="relative group">
            {/* Pass the roomId from useParams as a prop */}
            <DeviceCard device={device} currentRoomId={roomId ? parseInt(roomId, 10) : undefined} />
            {/* Dismiss Button - Appears on hover */}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-7 w-7"
              onClick={() => handleDismissDevice(device.id)}
              disabled={loadingDismiss === device.id}
              title="Dismiss from Room"
            >
              {loadingDismiss === device.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </motion.div>
    )
  }

  const renderAssignSection = () => {
    if (loadingUnassigned) {
      return <Skeleton className="h-10 w-full" />
    }
    if (unassignedDevices.length === 0) {
      return <p className="text-muted-foreground text-sm">No unassigned devices available.</p>
    }
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <Label htmlFor="assign-device-select" className="mb-1 sm:mb-0">
          Assign Device:
        </Label>
        <Select value={selectedUnassignedDevice} onValueChange={setSelectedUnassignedDevice}>
          <SelectTrigger id="assign-device-select" className="flex-grow">
            <SelectValue placeholder="Select an unassigned device..." />
          </SelectTrigger>
          <SelectContent>
            {unassignedDevices.map((device) => (
              <SelectItem key={device.id} value={device.id.toString()}>
                {device.name} ({device.type}) - ID: {device.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAssignDevice}
          disabled={!selectedUnassignedDevice || loadingAssign}
          className="w-full sm:w-auto"
        >
          {loadingAssign ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          Assign to Room
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link to="/rooms">
            {" "}
            {/* Assuming the rooms list page is /rooms */}
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Rooms</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{roomName ? `Devices in ${roomName}` : `Loading Room ${roomId}...`}</h1>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default" className="mb-4 bg-green-100 border-green-300 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Assign Device Section */}
      <div className="mb-6 p-4 border rounded-lg bg-card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Assign New Device</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Device
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Device to {roomName}</DialogTitle>
                <DialogDescription>Create a new device and automatically assign it to this room.</DialogDescription>
              </DialogHeader>
              <AddDeviceToRoomForm
                roomId={roomId}
                onSuccess={(message) => {
                  setSuccessMessage(message)
                  setDialogOpen(false)
                  fetchAssignedDevices() // Refresh assigned devices
                  fetchUnassignedDevices() // Refresh unassigned devices as well
                  setTimeout(() => setSuccessMessage(null), 3000)
                }}
                onError={setError}
              />
            </DialogContent>
          </Dialog>
        </div>
        {renderAssignSection()}
      </div>

      {/* Assigned Devices Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Assigned Devices</h2>
        {renderAssignedDevices()}
      </div>

      {/* Removed the Tabs section as we are showing cards directly */}
    </div>
  )
}
