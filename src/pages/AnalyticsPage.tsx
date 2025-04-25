"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, subDays, isSameDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyticsChart } from "@/components/AnalyticsChart"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"

// Sensor thresholds
const thresholds = {
  temperature: { min: 15, max: 25 },
  humidity: { min: 40, max: 70 },
  light: { min: 10, max: 90 },
}

// Generate analytics data for a specific day
const generateAnalyticsData = (selectedDate:Date, sensorType:string) => {
  if (!selectedDate) {
    return {
      data: [],
      analytics: { max: 0, min: 0, avg: 0 },
      thresholdStatus: { belowMin: false, aboveMax: false },
    }
  }

  // Seed random based on date and sensor type for consistent results
  let seed = selectedDate.getTime() + sensorType.charCodeAt(0)
  const random = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  // Generate data points
  const data = []

  // Generate data for each hour of the day with 5-minute intervals
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      // Add 1-3 data points per 5 minutes with random second offsets
      const pointsPerSlot = Math.floor(random() * 3) + 1

      for (let i = 0; i < pointsPerSlot; i++) {
        const seconds = Math.floor(random() * 60)

        // Create actual date object for this data point
        const dataPointDate = new Date(selectedDate)
        dataPointDate.setHours(hour, minute, seconds)

        // Format for display in tooltip
        const displayTime = format(dataPointDate, "HH:mm:ss")

        // Time value in hours (decimal) for positioning on chart
        const timeValue = hour + minute / 60 + seconds / 3600

        // Generate value based on sensor type with more variation
        let value:number = 0
        if (sensorType === "temperature") {
          // Temperature follows a sine wave pattern with daily cycles plus random noise
          value = 15 + Math.sin((hour / 24) * Math.PI * 2) * 5 + (random() * 6 - 3)
          // Add some micro-variations
          value += Math.sin((minute / 60) * Math.PI) * 0.5
        } else if (sensorType === "humidity") {
          // Humidity is inversely related to temperature with more variation
          value = 60 - Math.sin((hour / 24) * Math.PI * 2) * 15 + (random() * 12 - 6)
          // Add some micro-variations
          value += Math.sin((minute / 60) * Math.PI * 2) * 2
        } else if (sensorType === "light") {
          // Light follows daylight patterns with sharp day/night transitions
          if (hour >= 6 && hour <= 18) {
            // Daytime - bell curve with peak at noon
            const hourFromNoon = Math.abs(hour - 12)
            value = 80 - hourFromNoon * hourFromNoon * 2 + (random() * 20 - 10)
            // Add cloud cover simulation
            if (random() > 0.7) value *= 0.5 + random() * 0.3
          } else {
            // Nighttime - low light with occasional spikes
            value = random() * 5 + (random() > 0.9 ? random() * 15 : 0)
          }
        }

        // Ensure values are within reasonable ranges
        if (sensorType === "temperature") {
          value = Math.max(5, Math.min(35, value))
        } else {
          value = Math.max(0, Math.min(100, value))
        }

        data.push({
          timeValue,
          fullTimeValue: dataPointDate.getTime(),
          displayTime,
          value: Number.parseFloat(value.toFixed(1)),
          hour,
          minute,
        })
      }
    }
  }

  // Sort by time value
  data.sort((a, b) => a.timeValue - b.timeValue)

  // Calculate analytics
  const values = data.map((d) => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const avg = Number.parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1))

  // Check thresholds
  const threshold = thresholds[sensorType as keyof typeof thresholds]
  const belowMin = min < threshold.min
  const aboveMax = max > threshold.max

  return {
    data,
    analytics: { max, min, avg },
    thresholdStatus: { belowMin, aboveMax },
  }
}

export default function AnalyticsPage() {
  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [sensorType, setSensorType] = useState("temperature")
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Generate data based on selected date and sensor type
  useEffect(() => {
    if (selectedDate) {
      const data = generateAnalyticsData(selectedDate, sensorType)
      setAnalyticsData(data)
    }
  }, [selectedDate, sensorType])

  // Navigate to previous day
  const goToPreviousDay = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 1))
  }

  // Navigate to next day (but not beyond today)
  const goToNextDay = () => {
    const nextDay = addDays(selectedDate, 1)
    if (nextDay <= new Date()) {
      setSelectedDate(nextDay)
    }
  }

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null
    if (newDate && newDate <= new Date()) {
      setSelectedDate(newDate)
    }
  }

  // Format selected date for display
  const formattedDate = selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"

  // Format date for input value
  const inputDateValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""

  // Generate ticks for the chart - hours of the day
  const generateTicks = () => {
    return [0, 3, 6, 9, 12, 15, 18, 21, 24]
  }

  const ticks = generateTicks()

  if (!analyticsData) {
    return <div className="flex min-h-screen items-center justify-center">Loading analytics data...</div>
  }

  const { data, analytics, thresholdStatus } = analyticsData

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
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Analytics</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-3">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
                  <div>
                    <CardTitle>Daily Sensor Data</CardTitle>
                    <CardDescription>Detailed hourly analytics</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <Select value={sensorType} onValueChange={setSensorType}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select sensor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="humidity">Humidity</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={goToPreviousDay} aria-label="Previous day">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="grid gap-1.5">
                        <Label htmlFor="date" className="sr-only">
                          Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={inputDateValue}
                          onChange={handleDateChange}
                          max={format(new Date(), "yyyy-MM-dd")}
                          className="w-[160px]"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextDay}
                        disabled={isSameDay(selectedDate, new Date())}
                        aria-label="Next day"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <AnalyticsChart
                      data={data}
                      ticks={ticks}
                      sensorType={sensorType}
                      thresholds={thresholds[sensorType as keyof typeof thresholds]}
                      dateRange={null}
                      isSingleDay={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Summary</CardTitle>
                  <CardDescription>{formattedDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Maximum Value:</span>
                      <span className="font-bold">
                        {analytics.max} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Minimum Value:</span>
                      <span className="font-bold">
                        {analytics.min} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Average Value:</span>
                      <span className="font-bold">
                        {analytics.avg} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Data Points:</span>
                      <span className="font-bold">{data.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Threshold Status:</span>
                      <div className="flex gap-2">
                        {!thresholdStatus.belowMin && !thresholdStatus.aboveMax ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Normal
                          </Badge>
                        ) : (
                          <>
                            {thresholdStatus.belowMin && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                Below Min
                              </Badge>
                            )}
                            {thresholdStatus.aboveMax && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                                Above Max
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Threshold Settings</CardTitle>
                  <CardDescription>Current threshold configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Lower Threshold:</span>
                      <span className="font-bold">
                        {thresholds[sensorType as keyof typeof thresholds].min} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Upper Threshold:</span>
                      <span className="font-bold">
                        {thresholds[sensorType as keyof typeof thresholds].max} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        Configure Thresholds
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alerts</CardTitle>
                  <CardDescription>Threshold violations</CardDescription>
                </CardHeader>
                <CardContent>
                  {thresholdStatus.belowMin || thresholdStatus.aboveMax ? (
                    <div className="space-y-4">
                      {thresholdStatus.belowMin && (
                        <Alert variant="destructive" className="bg-blue-50 text-blue-800 border-blue-200">
                          <AlertTitle className="flex items-center">
                            Low {sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} Alert
                          </AlertTitle>
                          <AlertDescription>
                            {sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} dropped below minimum threshold
                            of {thresholds[sensorType as keyof typeof thresholds].min} {sensorType === "temperature" ? "°C" : "%"}.
                          </AlertDescription>
                        </Alert>
                      )}
                      {thresholdStatus.aboveMax && (
                        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                          <AlertTitle className="flex items-center">
                            High {sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} Alert
                          </AlertTitle>
                          <AlertDescription>
                            {sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} exceeded maximum threshold of{" "}
                            {thresholds[sensorType as keyof typeof thresholds].max} {sensorType === "temperature" ? "°C" : "%"}.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                      No alerts for this period
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
