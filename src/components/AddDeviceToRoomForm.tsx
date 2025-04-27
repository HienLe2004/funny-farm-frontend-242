"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, PlusCircle, Trash2, Loader2 } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog"

const API_BASE_URL = "http://localhost:8080/smart-farm"

// Define types for the form data
interface FeedInput {
  id: number // Unique ID for React key prop
  feedName: string
  feedId: string // Keep as string for input, parse later
  threshold_max: string // Keep as string for input, parse later
  threshold_min: string // Keep as string for input, parse later
}

interface FeedsList {
  [key: string]: {
    feedId: number
    threshold_max: number
    threshold_min: number
  }
}

// interface Device {
//   id: number
//   roomId?: number | null // Can be null if unassigned
//   name: string
//   type: string // "SENSOR", "CONTROL", etc.
//   status: string // "ACTIVE", "INACTIVE"
//   feedsList: { [key: string]: any }
// }

// interface ApiResponse<T> {
//   code: number
//   message: string
//   authenticated?: boolean
//   currentPage?: number
//   totalPages?: number
//   totalElements?: number
//   listDeviceDTO?: T[]
//   // Add other potential fields if needed
// }

interface AddDeviceToRoomFormProps {
  roomId: string | undefined
  onSuccess: (message: string) => void
  onError: (message: string | null) => void
}

export default function AddDeviceToRoomForm({ roomId, onSuccess, onError }: AddDeviceToRoomFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  // State for dynamic feeds
  const [feeds, setFeeds] = useState<FeedInput[]>([
    { id: Date.now(), feedName: "", feedId: "", threshold_max: "", threshold_min: "" }, // Start with one feed entry
  ])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const getAuthToken = () => localStorage.getItem("authToken")

  // Function to add a new feed input group
  const addFeed = () => {
    setFeeds([...feeds, { id: Date.now(), feedName: "", feedId: "", threshold_max: "", threshold_min: "" }])
  }

  // Function to remove a feed input group by its unique id
  const removeFeed = (idToRemove: number) => {
    if (feeds.length > 1) {
      // Prevent removing the last feed entry
      setFeeds(feeds.filter((feed) => feed.id !== idToRemove))
    } else {
      setFormError("At least one feed is required.")
    }
  }

  // Function to handle changes in feed inputs
  const handleFeedChange = (id: number, field: keyof Omit<FeedInput, "id">, value: string) => {
    setFeeds(feeds.map((feed) => (feed.id === id ? { ...feed, [field]: value } : feed)))
    // Clear error when user starts typing
    if (formError) setFormError(null)
  }

  // Function to fetch unassigned devices and find the newly created one
  // const findNewlyCreatedDevice = async (deviceName: string): Promise<number | null> => {
  //   const token = getAuthToken()

  //   try {
  //     console.log("Fetching unassigned devices to find newly created device:", deviceName)
  //     const response = await fetch(`${API_BASE_URL}/devices/unassign?page=0&size=50`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })

  //     const data: ApiResponse<Device> = await response.json()

  //     if (response.ok && data.code === 200 && data.listDeviceDTO) {
  //       console.log("Unassigned devices:", data.listDeviceDTO)

  //       // Find the device with matching name
  //       const newDevice = data.listDeviceDTO.find((device) => device.name === deviceName)

  //       if (newDevice) {
  //         console.log("Found newly created device:", newDevice)
  //         return newDevice.id
  //       } else {
  //         console.error("Could not find newly created device with name:", deviceName)
  //         return null
  //       }
  //     } else {
  //       console.error("Failed to fetch unassigned devices:", data.message)
  //       return null
  //     }
  //   } catch (err) {
  //     console.error("Error fetching unassigned devices:", err)
  //     return null
  //   }
  // }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setFormError(null)
    onError(null) // Clear page-level error

    if (!roomId) {
      setFormError("Room ID is missing. Please try again.")
      setLoading(false)
      return
    }

    // --- Build feedsList object from state ---
    const feedsList: FeedsList = {}
    let validationError = null

    for (const feed of feeds) {
      if (!feed.feedName.trim()) {
        validationError = "Feed Name cannot be empty."
        break
      }
      if (feedsList[feed.feedName]) {
        validationError = `Duplicate Feed Name found: "${feed.feedName}". Feed names must be unique.`
        break
      }
      if (!feed.feedId || !feed.threshold_max || !feed.threshold_min) {
        validationError = `All fields (Feed ID, Max Threshold, Min Threshold) are required for feed "${feed.feedName}".`
        break
      }

      const feedIdNum = Number.parseInt(feed.feedId, 10)
      const maxNum = Number.parseFloat(feed.threshold_max)
      const minNum = Number.parseFloat(feed.threshold_min)

      if (isNaN(feedIdNum) || isNaN(maxNum) || isNaN(minNum)) {
        validationError = `Feed ID, Max Threshold, and Min Threshold must be valid numbers for feed "${feed.feedName}".`
        break
      }
      if (minNum >= maxNum) {
        validationError = `Min Threshold must be less than Max Threshold for feed "${feed.feedName}".`
        break
      }

      feedsList[feed.feedName] = {
        feedId: feedIdNum,
        threshold_max: maxNum,
        threshold_min: minNum,
      }
    }

    if (validationError) {
      setFormError(validationError)
      setLoading(false)
      return
    }
    // --- End building feedsList ---

    const deviceData = { name, type, feedsList }
    const token = getAuthToken()
    // const deviceName = name // Store the name to find it later - Removed as findNewlyCreatedDevice is not used in this flow

    try {
      // Step 1: Add the device
      console.log("Creating device with data:", deviceData)
      const addResponse = await fetch(`${API_BASE_URL}/devices/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deviceData),
      })

      const addData = await addResponse.json()
      console.log("Device creation response:", addData)

      if (!(addResponse.ok && addData.code === 200)) {
        throw new Error(addData.message || `Failed to create device. Status: ${addResponse.status}`)
      }

      // --- Call onSuccess and reset form on success ---
      onSuccess(addData.message || "Device created successfully!")
      setName("")
      setType("")
      setFeeds([{ id: Date.now(), feedName: "", feedId: "", threshold_max: "", threshold_min: "" }]) // Reset feeds to initial state
      // No need to call findNewlyCreatedDevice here if the goal is just to add and close

    } catch (err) {
      console.error("Add device error:", err) // Changed log message slightly
      onError(err instanceof Error ? err.message : "An unexpected error occurred while creating the device.") // Updated error message
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {formError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Form Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      {/* Device Name and Type Inputs */}
      <div className="space-y-2">
        <Label htmlFor="deviceName">Device Name</Label>
        <Input
          id="deviceName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          placeholder="e.g., Living Room Sensor"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deviceType">Device Type</Label>
        <Select value={type} onValueChange={setType} required disabled={loading}>
          <SelectTrigger id="deviceType">
            <SelectValue placeholder="Select device type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SENSOR">SENSOR</SelectItem>
            <SelectItem value="CONTROL">CONTROL</SelectItem>
            <SelectItem value="SENSOR_TRIGGER">SENSOR_TRIGGER</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Feed Inputs */}
      <Label>Feeds</Label>
      {feeds.map((feed, _) => (
        <div key={feed.id} className="border p-4 rounded-md space-y-3 relative mb-3">
          {feeds.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => removeFeed(feed.id)}
              disabled={loading}
              aria-label="Remove Feed"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`feedName-${feed.id}`}>Feed Name</Label>
              <Input
                id={`feedName-${feed.id}`}
                value={feed.feedName}
                onChange={(e) => handleFeedChange(feed.id, "feedName", e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., temperature"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`feedId-${feed.id}`}>Feed ID</Label>
              <Input
                id={`feedId-${feed.id}`}
                type="number"
                value={feed.feedId}
                onChange={(e) => handleFeedChange(feed.id, "feedId", e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., 3023664"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`thresholdMin-${feed.id}`}>Min Threshold</Label>
              <Input
                id={`thresholdMin-${feed.id}`}
                type="number"
                step="any"
                value={feed.threshold_min}
                onChange={(e) => handleFeedChange(feed.id, "threshold_min", e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., 10.5"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`thresholdMax-${feed.id}`}>Max Threshold</Label>
              <Input
                id={`thresholdMax-${feed.id}`}
                type="number"
                step="any"
                value={feed.threshold_max}
                onChange={(e) => handleFeedChange(feed.id, "threshold_max", e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., 30.0"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Feed Button */}
      <Button type="button" variant="outline" onClick={addFeed} disabled={loading} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Feed
      </Button>

      {/* Submit Button */}
      <DialogFooter className="mt-4 pt-4 border-t">
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" /> Create
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  )
}
