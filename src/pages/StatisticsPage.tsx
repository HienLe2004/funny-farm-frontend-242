"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, subDays, isSameDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyticsChart } from "@/components/AnalyticsChart"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"

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
  const belowMin = min < threshold?.min
  const aboveMax = max > threshold?.max

  return {
    data,
    analytics: { max, min, avg },
    thresholdStatus: { belowMin, aboveMax },
  }
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
export default function StatisticsPage() {
  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [sensorType, setSensorType] = useState("temp")
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [sensorFeedIds, setSensorFeedIds] = useState({
    "light":0, "temp":0, "hum":0, "soil":0, "ready":0
  })
  const navigate = useNavigate()
  useEffect(()=>{
  },[])
  useEffect(() => {
    if (selectedDate) {
      const data = generateAnalyticsData(selectedDate, sensorType)
      setAnalyticsData(data)
    }
    const token = sessionStorage.getItem("accessToken")
    if (!token) {
      navigate("/login")
      return
    }
    const roomId = sessionStorage.getItem("roomId")
    if (!roomId) {
        console.log("MISSING GROUP KEY")
        return
    }
    const getDeviceList = async () => {
      const roomResponse = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/devices/room/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!roomResponse.ok && roomResponse.status == 401) {
        navigate("/login")
        return
      }
      const roomData = await roomResponse.json()
      if (roomData.listDeviceDTO.length > 0) {
        const deviceDataList = {
          "light":0, "temp":0, "hum":0, "soil":0, "ready":0
        }
        const listDeviceDTO = roomData.listDeviceDTO
        listDeviceDTO.map((deviceDTO:any) => {
          if (deviceDTO.type == "SENSOR") {
            const deviceFeedKey = Object.keys(deviceDTO.feedsList)[0]
            Object.keys(deviceDataList).forEach((device) => {
              if (deviceFeedKey.split(".")[1].includes(device)) {
                deviceDataList[device as keyof typeof deviceDataList] = deviceDTO.feedsList[deviceFeedKey].feedId
              }
            })
          }
        })
        deviceDataList.ready = 1
        setSensorFeedIds(deviceDataList)
      }
      else {
        console.log("Room has no device")
      }
    }
    const getSensorStatisticData = async()=>{
      if (sensorFeedIds.ready == 0) {
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/statistic?feedId=${sensorFeedIds[sensorType as keyof typeof sensorFeedIds]}&date=${formatLocalDate(selectedDate.toLocaleDateString())}`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok && response.status == 401) {
        navigate("/login")
        return
      }
      const data = await response.json()
      console.log(data)
    }
    getDeviceList()
    getSensorStatisticData()
  }, [selectedDate, sensorType, sensorFeedIds.ready])
  
  
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
  const formattedDate = selectedDate ? selectedDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }) : "Select a date"

  // Format date for input value
  const inputDateValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""

  // Generate ticks for the chart - hours of the day
  const generateTicks = () => {
    return [0, 3, 6, 9, 12, 15, 18, 21, 24]
  }

  const ticks = generateTicks()

  if (!analyticsData) {
    return <div className="flex min-h-screen items-center justify-center">Đang tải dữ liệu...</div>
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
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Thống kê</h1>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-3">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
                  <div>
                    <CardTitle>Dữ liệu cảm biến trong ngày</CardTitle>
                    <CardDescription>Thống kê chi tiết trong trong ngày</CardDescription>
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
                          max={new Date().toLocaleDateString()}
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
                  <div className="w-[calc(100vw_-_160px)] md:w-full overflow-auto h-[300px]">
                    <div className="w-min-[700px] md:w-full">
                    <AnalyticsChart
                      data={data}
                      ticks={ticks}
                      sensorType={sensorType}
                      thresholds={thresholds[sensorType as keyof typeof thresholds]}
                      dateRange={null}
                      isSingleDay={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan trong ngày</CardTitle>
                  <CardDescription>{formattedDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Giá trị Max:</span>
                      <span className="font-bold">
                        {analytics.max} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Giá trị Min:</span>
                      <span className="font-bold">
                        {analytics.min} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Giá trị trung bình:</span>
                      <span className="font-bold">
                        {analytics.avg} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Số điểm dữ liệu:</span>
                      <span className="font-bold">{data.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Trạng thái vượt ngưỡng:</span>
                      <div className="flex gap-2">
                        {!thresholdStatus.belowMin && !thresholdStatus.aboveMax ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Bình thường
                          </Badge>
                        ) : (
                          <>
                            {thresholdStatus.belowMin && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                Dưới Min
                              </Badge>
                            )}
                            {thresholdStatus.aboveMax && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                                Trên Max
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
                  <CardTitle>Cấu hình ngưỡng</CardTitle>
                  <CardDescription>Cấu hình ngưỡng hiện tại</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Ngưỡng dưới:</span>
                      <span className="font-bold">
                        {thresholds[sensorType as keyof typeof thresholds]?.min} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Ngưỡng trên:</span>
                      <span className="font-bold">
                        {thresholds[sensorType as keyof typeof thresholds]?.max} {sensorType === "temperature" ? "°C" : "%"}
                      </span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        Cấu hình các ngưỡng
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <Card>
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
              </Card> */}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
