import DeviceChart from "@/components/DeviceChart";
import { DeviceLog } from "@/components/DeviceLog";
import { DeviceSchedule } from "@/components/DeviceSchedule";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNowStrict, parseISO } from "date-fns"; // Import parseISO
import { vi } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, History, Info, AlertCircle, Loader2 } from "lucide-react" // Import AlertCircle, Loader2
import mqtt from "mqtt";
import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { Link, useParams, useNavigate, useLocation } from "react-router-dom" // Import useLocation
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

// Define interfaces matching backend and Adafruit structures
interface BackendDeviceFeedDetail {
  feedId: number;
  threshold_max?: number;
  threshold_min?: number;
}

interface BackendDevice {
  id: number;
  roomId?: number | null; // Ensure roomId is here
  name: string;
  type: string; // "SENSOR", "ACTUATOR", etc. (Adjust based on your backend)
  status: string; // "ACTIVE", "INACTIVE" (From backend, might be overridden by Adafruit)
  feedsList: { [key: string]: BackendDeviceFeedDetail };
}

interface AdafruitLastData {
    value: string;
    updated_at: string; // ISO string
}

// Define a combined device state
interface DeviceDisplayInfo {
    id: number;
    roomId?: number | null; // Add roomId here
    name: string;
    type: string; // SENSOR or ACTUATOR (Simplified for display logic)
    unit: string; // Determine based on name/type if needed
    color: string; // Determine based on name/type if needed
    adafruitFeedKey: string | null; // The key used for Adafruit API/MQTT (e.g., da.temp)
    value: string;
    lastUpdated: Date;
    status: "active" | "inactive"; // Primarily for actuators, derived from value
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL; // Your backend API

export default function DeviceDetailPage () {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation(); // Get location object
    const passedRoomId = location.state?.roomId as number | undefined | null; // Get roomId from state
    const deviceId = id ? parseInt(id, 10) : null;

    const [deviceInfo, setDeviceInfo] = useState<DeviceDisplayInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Adafruit credentials from .env
    const userAIOUsername = import.meta.env.VITE_USERAIOUSERNAME || "";
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY || "";
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME || ""; // Assuming owner is needed for Adafruit API

    // Helper to get auth token
    const getAuthToken = () => localStorage.getItem("authToken");

    // Function to determine display properties (unit, color) - customize as needed
    const getDisplayProperties = (backendDevice: BackendDevice): Partial<DeviceDisplayInfo> => {
        const nameLower = backendDevice.name.toLowerCase();
        let unit = "";
        // --- CHANGE: Use CSS color values (hex codes) instead of Tailwind classes ---
        let color = "#6b7280"; // Default color (gray-500)
        let type: "sensor" | "actuator" = backendDevice.type === "ACTUATOR" ? "actuator" : "sensor"; // Simplify type
    
        if (nameLower.includes("light") || nameLower.includes("ánh sáng")) { unit = "%"; color = "#F59E0B"; } // yellow-500
        else if (nameLower.includes("humidity") || nameLower.includes("độ ẩm")) { unit = "%"; color = "#3B82F6"; } // blue-500
        else if (nameLower.includes("temperature") || nameLower.includes("nhiệt độ")) { unit = "°C"; color = "#EF4444"; } // red-500
        else if (nameLower.includes("soil") || nameLower.includes("đất")) { unit = "%"; color = "#06B6D4"; } // cyan-500
        else if (nameLower.includes("pump") || nameLower.includes("bơm")) { unit = ""; color = "#22C55E"; type = "actuator"; } // green-500
        else if (nameLower.includes("fan") || nameLower.includes("quạt")) { unit = ""; color = "#A855F7"; type = "actuator"; } // purple-500
        // --- END CHANGE ---
    
        return { unit, color, type };
    };

    // --- Fetch Backend Device Details ---
    const fetchBackendDevice = useCallback(async () => {
        if (!deviceId) {
            setError("Invalid Device ID.");
            setLoading(false);
            return;
        }
        // --- Use passedRoomId ---
        if (passedRoomId === undefined || passedRoomId === null) {
             setError("Room ID was not provided. Cannot fetch device details.");
             setLoading(false);
             return;
        }

        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) {
            navigate("/auth"); // Redirect to login if no token
            setLoading(false); // Stop loading as we are navigating away
            return;
        }

        try {
            // --- CORRECTED: Fetch devices by Room ID ---
            const response = await fetch(`${API_BASE_URL}/devices/room/${passedRoomId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json(); // Assuming backend sends JSON response

            if (response.ok && data.code === 200 && data.listDeviceDTO) {
                // --- Find the specific device in the list ---
                const foundDevice = data.listDeviceDTO.find((d: BackendDevice) => d.id === deviceId);

                if (foundDevice) {
                    const backendDevice: BackendDevice = foundDevice;

                    // Determine the Adafruit feed key
                    const feedKeys = Object.keys(backendDevice.feedsList || {}); // Add check for null/undefined feedsList
                    const primaryAdafruitFeedKey = feedKeys.length > 0 ? feedKeys[0] : null;

                    if (!primaryAdafruitFeedKey) {
                        // Decide how to handle: error or proceed without Adafruit?
                        // For now, let's throw an error as Adafruit key seems essential
                        throw new Error("No Adafruit feed key found for this device in feedsList.");
                    }

                    const displayProps = getDisplayProperties(backendDevice);

                    // Initialize deviceInfo
                    setDeviceInfo({
                        id: backendDevice.id,
                        roomId: backendDevice.roomId ?? passedRoomId, // Use backend roomId if available, else the passed one
                        name: backendDevice.name,
                        type: displayProps.type || 'sensor',
                        unit: displayProps.unit || '',
                        color: displayProps.color || 'text-gray-500',
                        adafruitFeedKey: primaryAdafruitFeedKey,
                        value: "...", // Placeholder until Adafruit data loads
                        lastUpdated: new Date(), // Placeholder
                        status: backendDevice.status?.toLowerCase() as "active" | "inactive" || 'inactive', // Handle potential null status
                    });
                    // Note: setLoading(false) will happen in the Adafruit useEffect

                } else {
                    // Device ID not found within the fetched room's devices
                    throw new Error(`Device with ID ${deviceId} not found in room ${passedRoomId}.`);
                }

            } else if (response.ok && data.code === 200 && data.message === "No devices found") {
                 throw new Error(`No devices found in room ${passedRoomId}. Cannot find device ${deviceId}.`);
            } else if (response.status === 404 && data.message === "Room not found") {
                 throw new Error(`Room with ID ${passedRoomId} not found.`);
            }
            else {
                // Handle other non-ok responses or API errors
                throw new Error(data.message || `Failed to fetch devices for room ${passedRoomId}. Status: ${response.status}`);
            }
        } catch (err) {
            console.error("Fetch backend device error:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred fetching device details.");
            setDeviceInfo(null); // Clear device info on error
            setLoading(false); // Set loading false here on error
        }
        // No finally block setting loading false here; it's handled by the Adafruit useEffect or the catch block
    }, [deviceId, navigate, passedRoomId]); // Add passedRoomId dependency

    // --- Fetch Adafruit Data and Setup MQTT ---
    useEffect(() => {
        if (!deviceInfo || !deviceInfo.adafruitFeedKey) {
            // Don't proceed if backend info or feed key isn't available yet
            if (deviceId && !loading && !error) { // Only set loading false if initial fetch failed
                 setLoading(false);
            }
            return;
        }

        if (!userAIOUsername || !userAIOUserkey || !ownerAIOUsername) {
            setError("Adafruit IO credentials missing in .env file.");
            setLoading(false);
            return;
        }

        const adafruitFeedKey = deviceInfo.adafruitFeedKey; // e.g., da.temp
        const apiUrl = 'https://io.adafruit.com/api/v2/';
        let client: mqtt.MqttClient | null = null; // Define client here

        // Fetch initial data from Adafruit
        const getInitialAdafruitData = async () => {
            try {
                const response = await fetch(`${apiUrl}${ownerAIOUsername}/feeds/${adafruitFeedKey}/data/last`, {
                     headers: { "x-aio-key": userAIOUserkey }
                });
                if (!response.ok) {
                    // Handle case where feed might not have data yet
                    if (response.status === 404) {
                         console.warn(`No initial data found for feed ${adafruitFeedKey}. Waiting for MQTT.`);
                         setDeviceInfo(prev => prev ? ({
                             ...prev,
                             value: "N/A", // Or '0' or some default
                             lastUpdated: new Date(), // Use current time or keep placeholder
                             status: prev.type === 'actuator' ? 'inactive' : 'active' // Default status
                         }) : null);
                         setLoading(false); // Allow UI to render
                         return; // Don't throw error, proceed to MQTT
                    }
                    throw new Error(`Adafruit API Error! status ${response.status}`);
                }
                const data: AdafruitLastData = await response.json();
                setDeviceInfo(prev => prev ? ({
                    ...prev,
                    value: data.value,
                    lastUpdated: parseISO(data.updated_at),
                    status: prev.type === 'actuator' ? (data.value === "0" ? "inactive" : "active") : "active"
                }) : null);
            } catch (err) {
                console.error("Fetch initial Adafruit data error:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch initial data from Adafruit.");
                // Keep existing deviceInfo but indicate error? Or clear value?
                setDeviceInfo(prev => prev ? ({ ...prev, value: "Error" }) : null);
            } finally {
                 setLoading(false); // Data fetch attempt complete
            }
        };

        // Setup MQTT connection
        const connectAdafruitMQTT = () => {
            const mqttBrokerUrl = 'mqtt://io.adafruit.com';
            client = mqtt.connect(mqttBrokerUrl, {
                username: userAIOUsername,
                password: userAIOUserkey
            });

            client.on('connect', () => {
                console.log(`Connected to Adafruit IO MQTT for ${adafruitFeedKey}`);
                client?.subscribe(`${ownerAIOUsername}/feeds/${adafruitFeedKey}`);
            });

            client.on('message', (topic, message) => {
                const messageStr = message.toString();
                console.log(`Received MQTT message on topic ${topic}: ${messageStr}`);
                setDeviceInfo(prev => {
                    if (!prev || prev.adafruitFeedKey !== adafruitFeedKey) return prev; // Check if feed key matches current device
                    return {
                        ...prev,
                        value: messageStr,
                        lastUpdated: new Date(), // Use current time for MQTT updates
                        status: prev.type === 'actuator' ? (messageStr === "0" ? "inactive" : "active") : "active"
                    };
                });
            });

            client.on('error', (error) => {
                console.error(`Adafruit MQTT ERROR for ${adafruitFeedKey}: ${error}`);
                // Consider setting an error state specific to MQTT connection
            });

            client.on('close', () => {
                 console.log(`Adafruit MQTT connection closed for ${adafruitFeedKey}.`);
            });
             client.on('offline', () => {
                 console.log(`Adafruit MQTT client offline for ${adafruitFeedKey}.`);
             });
             client.on('reconnect', () => {
                 console.log(`Adafruit MQTT client reconnecting for ${adafruitFeedKey}...`);
             });
        };

        getInitialAdafruitData();
        connectAdafruitMQTT();

        // Cleanup MQTT connection on component unmount or when feedKey changes
        return () => {
            if (client) {
                console.log(`Disconnecting MQTT client for ${adafruitFeedKey}`);
                client.end(true, () => { // Force close
                     console.log(`MQTT client for ${adafruitFeedKey} ended.`);
                });
                client = null;
            }
        };
    }, [deviceInfo?.adafruitFeedKey, ownerAIOUsername, userAIOUsername, userAIOUserkey]); // Rerun when adafruitFeedKey changes

    // --- Effect for initial backend fetch ---
    useEffect(() => {
        fetchBackendDevice();
    }, [fetchBackendDevice]); // fetchBackendDevice is stable due to useCallback

    // --- Handle Actuator Button Click ---
    const handleActuatorToggle = async () => {
        if (!deviceInfo || deviceInfo.type !== "actuator" || !deviceInfo.adafruitFeedKey) {
            console.log("Cannot toggle: Not an actuator or feed key missing.");
            return;
        }
        if (!userAIOUsername || !userAIOUserkey || !ownerAIOUsername) {
            setError("Adafruit IO credentials missing in .env file.");
            return;
        }

        const newValue = deviceInfo.value === "0" ? "1" : "0";
        const adafruitFeedKey = deviceInfo.adafruitFeedKey;
        const apiUrl = 'https://io.adafruit.com/api/v2/';

        // Optimistic UI update (optional but good UX)
        // setDeviceInfo(prev => prev ? ({ ...prev, value: newValue, status: newValue === "0" ? "inactive" : "active" }) : null);

        try {
            const response = await fetch(`${apiUrl}${ownerAIOUsername}/feeds/${adafruitFeedKey}/data`, {
                method: 'POST',
                headers: {
                    "x-aio-key": userAIOUserkey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "value": newValue })
            });
            if (!response.ok) {
                // Revert optimistic update if API call fails
                // setDeviceInfo(prev => prev ? ({ ...prev, value: deviceInfo.value, status: deviceInfo.status }) : null);
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Adafruit API Error! status ${response.status}`);
            }
            // Data will update via MQTT, no need to manually set state here unless MQTT fails
            console.log(`Successfully sent value ${newValue} to ${adafruitFeedKey}`);

        } catch (err) {
             console.error("Toggle actuator error:", err);
             setError(err instanceof Error ? err.message : "Failed to toggle actuator state.");
             // Revert optimistic update if needed
             // setDeviceInfo(prev => prev ? ({ ...prev, value: deviceInfo.value, status: deviceInfo.status }) : null);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading device details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                 </Alert>
                 <Button variant="outline" asChild className="mt-4">
                     <Link to="/">Go Back</Link>
                 </Button>
            </div>
        );
    }

    if (!deviceInfo) {
         return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
                 <Alert variant="default" className="max-w-md">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Not Found</AlertTitle>
                     <AlertDescription>Device with ID {deviceId} could not be loaded or found.</AlertDescription>
                 </Alert>
                  <Button variant="outline" asChild className="mt-4">
                     <Link to="/">Go Back</Link>
                 </Button>
             </div>
         );
    }

    // Helper function to determine chart properties based on DeviceDisplayInfo
    const getChartProperties = (info: DeviceDisplayInfo | null) => {
        if (!info) return { valueLabel: 'Value', lineType: 'monotone' as const, color: '#6b7280' }; // Default hex color

        let valueLabel = 'Value';
        let lineType: "monotone" | "stepAfter" = 'monotone';
        const nameLower = info.name.toLowerCase();

        if (info.type === 'sensor') {
            if (nameLower.includes('light')) valueLabel = "Ánh sáng (%)";
            else if (nameLower.includes('humidity')) valueLabel = "Độ ẩm không khí (%)";
            else if (nameLower.includes('temperature')) valueLabel = "Nhiệt độ (°C)";
            else if (nameLower.includes('soil')) valueLabel = "Độ ẩm đất (%)";
        } else if (info.type === 'actuator') {
            valueLabel = "Trạng thái (0=Tắt, 1=Bật)"; // Or similar
            lineType = 'stepAfter';
        }

        // --- CHANGE: Ensure the correct CSS color from info is passed ---
        return { valueLabel, lineType, color: info.color || '#6b7280' }; // Use the CSS color from info
        // --- END CHANGE ---
    };


    // Now we have deviceInfo, render the page
    const chartProps = getChartProperties(deviceInfo); // Get chart props

    return (
        <div className="flex min-h-screen w-full flex-col">
          <main className="flex-1">
            <section className="w-full py-6 md:py-12">
              <div className="container px-4 md:px-6">
                <div className="flex flex-row items-center">
                    <Button variant="ghost" size="icon" asChild className="mr-2">
                      {/* Use the stored roomId for the back link */}
                      <Link to={deviceInfo.roomId ? `/rooms/${deviceInfo.roomId}/devices` : "/devices"}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                      </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                      <span className={deviceInfo.color}>●</span> {deviceInfo.name}
                    </h1>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-semibold">Trạng thái</CardTitle>
                      <CardDescription>Thông tin hiện tại</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Giá trị hiện tại:</span>
                          <span className="font-bold">{deviceInfo.value}{deviceInfo.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Trạng thái:</span>
                          <span
                            className={`font-medium ${deviceInfo.status === "active" ? "text-green-500" : "text-gray-500"}`}
                          >
                            {/* Display Active/Inactive, potentially customize based on type */}
                            {deviceInfo.type === 'actuator'
                                ? (deviceInfo.status === "active" ? "ON" : "OFF")
                                : (deviceInfo.status === "active" ? "Active" : "Inactive") // Or just show value for sensors
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Cập nhật lần cuối:</span>
                          {/* Ensure lastUpdated is a valid Date object */}
                          <span className="text-sm text-muted-foreground">
                              {deviceInfo.lastUpdated instanceof Date && !isNaN(deviceInfo.lastUpdated.getTime())
                                  ? formatDistanceToNowStrict(deviceInfo.lastUpdated, { addSuffix: true, locale: vi })
                                  : 'N/A'
                              }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Loại thiết bị:</span>
                          <span className="text-sm">{deviceInfo.type === "sensor" ? "Cảm biến" : "Điều khiển"}</span>
                        </div>
                      </div>
                      {deviceInfo.type === "actuator" && (
                        <Button className="mt-4 w-full" onClick={handleActuatorToggle}>
                            {deviceInfo.status === "active" ? "Turn Off" : "Turn On"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Keep the "Thông tin khác" card as is, or fetch relevant data if available */}
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-semibold">Thông tin khác</CardTitle>
                      <CardDescription>Thông tin khác về thiết bị</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <Info className="h-6 w-6 text-blue-500" />
                          <div>
                            <h3 className="font-medium">Device ID (Backend)</h3>
                            {/* Display backend ID */}
                            <p className="text-sm text-muted-foreground">{deviceInfo.id}</p>
                          </div>
                        </div>
                         <div className="flex items-center gap-4 rounded-lg border p-4">
                          <Info className="h-6 w-6 text-blue-500" />
                          <div>
                            <h3 className="font-medium">Adafruit Feed Key</h3>
                             {/* Display Adafruit Feed Key */}
                            <p className="text-sm text-muted-foreground">{deviceInfo.adafruitFeedKey || 'N/A'}</p>
                          </div>
                        </div>
                        {/* Remove or replace dummy data below */}
                        {/* <div className="flex items-center gap-4 rounded-lg border p-4">
                          <Clock className="h-6 w-6 text-orange-500" />
                          <div>
                            <h3 className="font-medium">Uptime</h3>
                            <p className="text-sm text-muted-foreground">14 days, 6 hours</p>
                          </div>
                        </div> */}
                        {/* ... other placeholder info ... */}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <Tabs defaultValue="chart">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
                      <TabsTrigger value="log">Nhật ký hoạt động</TabsTrigger>
                      <TabsTrigger value="schedule">Lập lịch</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Lịch sử dữ liệu</CardTitle>
                          <CardDescription>Biểu đồ dữ liệu Adafruit</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* Pass the Adafruit feed key to the chart component */}
                          <DeviceChart 
                            adafruitFeedKey={deviceInfo.adafruitFeedKey || ""} 
                            valueLabel={chartProps.valueLabel}
                            lineType={chartProps.lineType}
                            color={chartProps.color}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="log" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold">Nhật ký hoạt động</CardTitle>
                          <CardDescription>Hoạt động và sự kiện gần đây (Backend Logs)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* Pass the backend device ID or Adafruit key to the log component */}
                          {/* Adjust DeviceLog component to fetch logs based on the passed ID/key */}
                          <DeviceLog feedKey={deviceInfo.adafruitFeedKey} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="schedule" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl font-semibold">Lịch của thiết bị</CardTitle>
                          <CardDescription>Các lịch sắp tới của thiết bị (Backend Schedules)</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {/* Pass the backend device ID to the schedule component */}
                           {/* Adjust DeviceSchedule component to fetch schedules based on the passed ID */}
                          <DeviceSchedule deviceId={deviceInfo.id.toString()} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </section>
          </main>
        </div>
      )
}
