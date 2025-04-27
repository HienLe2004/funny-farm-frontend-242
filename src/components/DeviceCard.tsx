import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// --- Add necessary icons ---
import { ArrowRight, Thermometer, Lightbulb, Fan, Droplets, Gauge, Cpu, AlertCircle, Droplet } from "lucide-react"
import { Link } from "react-router-dom"
import { formatDistanceToNowStrict, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
// --- Add Badge and Skeleton ---
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Define the Device interface based on expected data
interface DeviceFeedDetail {
    feedId: number;
    threshold_max?: number;
    threshold_min?: number;
}

interface Device {
    id: number;
    roomId?: number | null;
    name: string;
    type: string; // "SENSOR", "ACTUATOR", etc.
    status: string; // "ACTIVE", "INACTIVE" (May need adjustment based on Adafruit)
    feedsList: { [key: string]: DeviceFeedDetail };
    // Add potential fields from Adafruit if merged later (e.g., last_value, updated_at)
    last_value?: string;
    updated_at?: string; // ISO string
}

// Define props for DeviceCard, including the new currentRoomId
interface DeviceCardProps {
    device: Device;
    currentRoomId?: number; // Add the room ID passed from the parent
}

// --- Define getDeviceIcon helper function ---
const getDeviceIcon = (deviceType: string, deviceName?: string) => {
    const typeLower = deviceType.toLowerCase();
    const nameLower = deviceName?.toLowerCase() || '';

    if (typeLower === 'sensor') {
        if (nameLower.includes('light') || nameLower.includes('ánh sáng')) return <Lightbulb className="h-6 w-6 text-yellow-500" />;
        if (nameLower.includes('humidity') || nameLower.includes('độ ẩm kk')) return <Droplet className="h-6 w-6 text-blue-500" />; // Added Droplet
        if (nameLower.includes('temperature') || nameLower.includes('nhiệt độ')) return <Thermometer className="h-6 w-6 text-red-500" />;
        if (nameLower.includes('soil') || nameLower.includes('độ ẩm đất')) return <Droplets className="h-6 w-6 text-cyan-500" />;
        return <Cpu className="h-6 w-6 text-gray-500" />; // Default sensor icon
    } else if (typeLower === 'actuator' || typeLower === 'control') {
        if (nameLower.includes('pump') || nameLower.includes('bơm')) return <Gauge className="h-6 w-6 text-green-500" />;
        if (nameLower.includes('fan') || nameLower.includes('quạt')) return <Fan className="h-6 w-6 text-purple-500" />;
        return <Cpu className="h-6 w-6 text-blue-500" />; // Default actuator icon
    }
    return <Gauge className="h-6 w-6 text-gray-500" />; // Fallback icon
};
// --- End getDeviceIcon ---

// Helper to get status badge variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    // Assuming 'ACTIVE' maps to a success/default style and others to secondary
    return status.toUpperCase() === 'ACTIVE' ? 'default' : 'secondary';
};


export default function DeviceCard({ device, currentRoomId }: DeviceCardProps) { // Update props destructuring
    const [latestValue, setLatestValue] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loadingValue, setLoadingValue] = useState(true);
    const [errorValue, setErrorValue] = useState<string | null>(null);

    // Adafruit credentials from environment variables
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME || "";
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY || "";
    const adafruitApiUrl = 'https://io.adafruit.com/api/v2';

    useEffect(() => {
        const fetchLatestValue = async () => {
            setLoadingValue(true);
            setErrorValue(null);

            // --- ADD CHECK for device.feedsList ---
            if (!device.feedsList || typeof device.feedsList !== 'object') { // Added type check
                setErrorValue("Device configuration error: feedsList is missing or invalid.");
                setLoadingValue(false);
                return;
            }
            // --- END ADD CHECK ---

            // Get the first feed key from the feedsList
            const feedKeys = Object.keys(device.feedsList);
            if (feedKeys.length === 0) {
                setErrorValue("No feeds configured for this device.");
                setLoadingValue(false);
                return;
            }
            const rawFeedKey = feedKeys[0]; // e.g., "room1.da.light" or just "da.light"

            // --- FIX: Extract the base feed key for Adafruit ---
            // This logic assumes the Adafruit key might be prefixed (e.g., room1.)
            // or might be the full key if no prefix exists. Adjust if your naming convention differs.
            const keyParts = rawFeedKey.split('.');
            // Examples:
            // "room1.da.light" -> "da.light"
            // "da.light" -> "da.light"
            // "pump1" -> "pump1"
            // If a room prefix exists (more than 2 parts like roomX.group.feed), take the last parts.
            // If it's just group.feed (2 parts), take both.
            // If it's just feed (1 part), take that.
            let feedKey = rawFeedKey; // Default to the raw key
            if (keyParts.length > 1) {
                 // Check if the first part looks like a room identifier (e.g., "room" followed by numbers)
                 // This is a heuristic, adjust if your room prefixes are different
                 if (/^room\d+$/i.test(keyParts[0])) {
                     feedKey = feedKey; // Skip the room prefix
                 }
                 // Otherwise, assume the full key is the Adafruit key (e.g., "da.light")
            }


            if (!ownerAIOUsername || !userAIOUserkey) {
                setErrorValue("Adafruit credentials missing.");
                setLoadingValue(false);
                return;
            }

            try {
                // Use the corrected feedKey here
                const response = await fetch(`${adafruitApiUrl}/${ownerAIOUsername}/feeds/${feedKey}/data/last`, {
                    headers: {
                        'X-AIO-Key': userAIOUserkey,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    // Provide more specific error for 404
                    if (response.status === 404) {
                         throw new Error(`Feed not found on Adafruit IO: ${feedKey}`);
                    }
                    throw new Error(errorData.error || `Failed to fetch data (Status: ${response.status}) for feed: ${feedKey}`);
                }

                const data: AdafruitLastData = await response.json();
                setLatestValue(data.value);
                // Ensure created_at is valid before parsing
                if (data.created_at) {
                    setLastUpdated(parseISO(data.created_at));
                } else {
                    setLastUpdated(null); // Handle missing date
                }


            } catch (err) {
                // Use the corrected feedKey in the error message
                console.error(`Error fetching latest value for feed ${feedKey}:`, err);
                setErrorValue(err instanceof Error ? err.message : "Failed to fetch value.");
                setLatestValue(null); // Clear value on error
                setLastUpdated(null);
            } finally {
                setLoadingValue(false);
            }
        };

        fetchLatestValue();

        // Optional: Set up an interval to refresh the value periodically
        // const intervalId = setInterval(fetchLatestValue, 60000); // Refresh every 60 seconds
        // return () => clearInterval(intervalId); // Cleanup interval on unmount

    }, [device.id, device.feedsList, ownerAIOUsername, userAIOUserkey]); // Added device.id to dependencies

    // Determine unit based on type/name - refine as needed
    let unit = '';
    if (device.type === 'SENSOR') {
        const nameLower = device.name.toLowerCase();
        if (nameLower.includes('light') || nameLower.includes('humidity') || nameLower.includes('soil')) {
            unit = '%';
        } else if (nameLower.includes('temperature')) {
            unit = '°C';
        }
    }

    const displayValue = latestValue !== null ? `${latestValue}${unit}` : '--';
    const displayLastUpdated = lastUpdated ? formatDistanceToNowStrict(lastUpdated, { addSuffix: true, locale: vi }) : 'N/A';

    // Determine status based on Adafruit value for actuators if available
    let currentStatus = device.status;
    if (device.type === 'ACTUATOR' && latestValue !== null) {
        currentStatus = latestValue === '0' ? 'INACTIVE' : 'ACTIVE';
    }

    return (
        <Card className="w-full max-w-sm">
            {/* Use currentStatus for background and badge */}
            <CardHeader className={`p-4 ${currentStatus.toUpperCase() === 'ACTIVE' ? 'bg-green-50' : 'bg-yellow-50'} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Call the new getDeviceIcon function */}
                        {getDeviceIcon(device.type, device.name)}
                        <div>
                            <CardTitle className="text-lg font-semibold">{device.name}</CardTitle>
                            <CardDescription className="text-sm capitalize">{device.type.toLowerCase()}</CardDescription>
                        </div>
                    </div>
                    {/* Use currentStatus for badge */}
                    <Badge variant={getStatusVariant(currentStatus)}>
                        {currentStatus.toUpperCase() === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    {loadingValue ? (
                        <Skeleton className="h-8 w-20 mt-1" />
                    ) : errorValue ? (
                         <div className="flex items-center text-red-500" title={errorValue}>
                             <AlertCircle className="h-5 w-5 mr-1"/>
                             <p className="text-lg font-bold">Error</p>
                         </div>
                    ) : (
                        <p className="text-2xl font-bold">{displayValue}</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                     {loadingValue ? (
                        <Skeleton className="h-5 w-24 mt-1 ml-auto" />
                     ) : (
                        <p className="text-sm mt-1">{displayLastUpdated}</p>
                     )}
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
                {/* Use currentRoomId (passed as prop) in the state */}
                <Link
                    to={`/devices/${device.id}`}
                    state={{ roomId: currentRoomId }} // Use the passed currentRoomId here
                    className="w-full"
                >
                    <Button variant="ghost" className="w-full justify-between text-sm">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

// --- Define AdafruitLastData interface ---
interface AdafruitLastData {
    value: string;
    id: string;
    feed_id: number;
    feed_key: string;
    created_at: string; // ISO 8601 format string
    location: any; // Define more specifically if needed
    lat: number | null;
    lon: number | null;
    ele: number | null;
    created_epoch: number;
    expiration: string; // ISO 8601 format string
}
