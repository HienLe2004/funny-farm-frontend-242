import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";

// --- REMOVE these helper functions ---
// const getDeviceColor = ...
// const getValueLabel = ...
// const getLineType = ...
// const getFeedKey = ...
// --- END REMOVE ---

// Define props to accept the full feed key and potentially other display info
interface DeviceChartProps {
    adafruitFeedKey: string | null; // Accept the full key
    valueLabel: string; // Pass label from parent
    lineType: "monotone" | "stepAfter"; // Pass line type from parent
    color: string; // Pass color from parent
}

export default function DeviceChart({ adafruitFeedKey, valueLabel, lineType, color }: DeviceChartProps) { // Update props
    // const color = getDeviceColor(deviceId) // Removed
    // const valueLabel = getValueLabel(deviceId) // Removed
    // const lineType = getLineType(deviceId) // Removed
    // const [feedKey,setFeedKey] = useState(getFeedKey(deviceId)) // Removed
    const [deviceData,setDeviceData] = useState<{time:string,value:Number}[]>([])
    // const [tick,setTick] = useState(0) // Removed if not used
    const userAIOUsername = import.meta.env.VITE_USERAIOUSERNAME || "";
    const userAIOUserkey = import.meta.env.VITE_USERAIOUSERKEY || "";
    const ownerAIOUsername = import.meta.env.VITE_OWNERAIOUSERNAME || "";
    // const [groupKey, setGroupKey] = useState('da') // Removed

    useEffect(()=>{
        const getDeviceData = async () => {
            // Use the passed adafruitFeedKey directly
            if (!adafruitFeedKey) {
                console.warn("DeviceChart: adafruitFeedKey is null, cannot fetch data.");
                setDeviceData([]); // Clear data if no key
                return;
            }
            // --- REMOVE check for "Value" ---
            // if (feedKey == "Value") {
            //     return
            // }
            // --- END REMOVE ---

            const apiUrl = 'https://io.adafruit.com/api/v2/';
            let currentDate = new Date();
            let sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));

            // --- Use adafruitFeedKey directly in the URL ---
            const fetchUrl = `${apiUrl}${ownerAIOUsername}/feeds/${adafruitFeedKey}/data`;
            console.log("DeviceChart fetching from:", fetchUrl); // Log the URL being used

            try { // Add try...catch for fetch errors
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: {
                        'x-aio-key': userAIOUserkey
                    }
                });

                if (!response.ok) {
                    // Log error and clear data
                    console.error(`DeviceChart: HTTP ERROR! status ${response.status} for feed ${adafruitFeedKey}`);
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    setDeviceData([]); // Clear data on error
                    // Optionally, set an error state to display in the chart area
                    return; // Stop processing
                }

                const data = await response.json();
                let realValues = data.filter((day:{'created_at':string, 'value':string}) => {
                    const createdDataDate = new Date(day['created_at']);
                    return (createdDataDate <= currentDate && createdDataDate >= sevenDaysAgo); // Corrected logic <= >=
                });
                realValues.reverse();

                setDeviceData(
                    realValues.map((day:{'created_at':string, 'value':string}) =>
                        ({"time":day['created_at'], "value":Number(day['value'])})
                ));
            } catch (error) {
                 console.error(`DeviceChart: Failed to fetch or process data for ${adafruitFeedKey}:`, error);
                 setDeviceData([]); // Clear data on fetch/processing error
            }
        };
        getDeviceData();
    },[adafruitFeedKey, ownerAIOUsername, userAIOUsername, userAIOUserkey]); // Update dependency array

    // --- REMOVE second useEffect ---
    // useEffect(()=>{
    //     setFeedKey(getFeedKey(deviceId))
    // },[deviceId])
    // --- END REMOVE ---

    // Handle case where data is empty or loading
    if (!adafruitFeedKey) {
        return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Feed key not available.</div>;
    }
    if (deviceData.length === 0) {
         // Optionally show a loading indicator or "No data" message
         return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Loading chart data or no data available...</div>;
    }


return (
    <div className="h-[300px] w-full">
    {/* Pass color to ChartContainer config if needed, or remove if color is only for the line */}
    <ChartContainer config={{ [valueLabel]: { label: valueLabel, color: color } }} className="h-full w-full">
        <LineChart
        data={deviceData}
        margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
        }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tickFormatter={(value) => {
            const date = new Date(value);
            // Handle potential invalid dates
            if (isNaN(date.getTime())) return "";
            return date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short"
            });
        }} />
        <YAxis />
        <Tooltip content={
            <ChartTooltipContent labelFormatter={(value) => {
            const date = new Date(value);
             if (isNaN(date.getTime())) return "";
            return date.toLocaleTimeString("vi-VN", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
            });
            }} />
        }/>
        <Legend />
        {/* Use props for line properties */}
        <Line type={lineType} dataKey="value" stroke={color} activeDot={{ r: 8 }} name={valueLabel} />
        </LineChart>
    </ChartContainer>
    </div>
    );
}
  