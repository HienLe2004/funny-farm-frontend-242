import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Import necessary icons
import { ArrowLeft, ArrowRight, Droplet, Droplets, Fan, Gauge, Lightbulb, Thermometer, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    // DialogClose, // Keep if you want an explicit cancel button
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Remove Textarea import if no longer needed elsewhere
// import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Keep your existing dummy devices data ---
const devices = [
    {
      id: "light-sensor",
      name: "Light Sensor",
      type: "sensor",
      value: "75%",
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Lightbulb,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      id: "humidity-sensor",
      name: "Humidity Sensor",
      type: "sensor",
      value: "58%",
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Droplet,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "temperature-sensor",
      name: "Temperature Sensor",
      type: "sensor",
      value: "23.5°C",
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Thermometer,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      id: "soil-moisture-sensor",
      name: "Soil Moisture Sensor",
      type: "sensor",
      value: "58%",
      status: "active",
      lastUpdated: "2 minutes ago",
      icon: Droplets,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      id: "pump-1",
      name: "Pump 1",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "15 minutes ago",
      icon: Gauge,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "pump-2",
      name: "Pump 2",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "1 hour ago",
      icon: Gauge,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "fan",
      name: "Fan",
      type: "actuator",
      value: "Off",
      status: "inactive",
      lastUpdated: "30 minutes ago",
      icon: Fan,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
];
// --- End of dummy devices data ---

const API_BASE_URL = "http://localhost:8080/smart-farm";

// Define types for the form data
interface FeedInput {
    id: number; // Unique ID for React key prop
    feedName: string;   
    feedId: string; // Keep as string for input, parse later
    threshold_max: string; // Keep as string for input, parse later
    threshold_min: string; // Keep as string for input, parse later
}

interface FeedsList {
    [key: string]: {
        feedId: number;
        threshold_max: number;
        threshold_min: number;
    };
}

// --- Updated AddDeviceForm Component ---
const AddDeviceForm = ({ onSuccess, onError }: { onSuccess: (message: string) => void, onError: (message: string | null) => void }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    // State for dynamic feeds
    const [feeds, setFeeds] = useState<FeedInput[]>([
        { id: Date.now(), feedName: '', feedId: '', threshold_max: '', threshold_min: '' } // Start with one feed entry
    ]);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const getAuthToken = () => localStorage.getItem('authToken');

    // Function to add a new feed input group
    const addFeed = () => {
        setFeeds([...feeds, { id: Date.now(), feedName: '', feedId: '', threshold_max: '', threshold_min: '' }]);
    };

    // Function to remove a feed input group by its unique id
    const removeFeed = (idToRemove: number) => {
        if (feeds.length > 1) { // Prevent removing the last feed entry
            setFeeds(feeds.filter(feed => feed.id !== idToRemove));
        } else {
            setFormError("At least one feed is required."); // Or handle differently
        }
    };

    // Function to handle changes in feed inputs
    const handleFeedChange = (id: number, field: keyof Omit<FeedInput, 'id'>, value: string) => {
        setFeeds(feeds.map(feed =>
            feed.id === id ? { ...feed, [field]: value } : feed
        ));
        // Clear error when user starts typing
        if (formError) setFormError(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setFormError(null);
        onError(null); // Clear page-level error

        // --- Build feedsList object from state ---
        const feedsList: FeedsList = {};
        let validationError = null;

        for (const feed of feeds) {
            if (!feed.feedName.trim()) {
                validationError = "Feed Name cannot be empty.";
                break;
            }
            if (feedsList[feed.feedName]) {
                 validationError = `Duplicate Feed Name found: "${feed.feedName}". Feed names must be unique.`;
                 break;
            }
            if (!feed.feedId || !feed.threshold_max || !feed.threshold_min) {
                validationError = `All fields (Feed ID, Max Threshold, Min Threshold) are required for feed "${feed.feedName}".`;
                break;
            }

            const feedIdNum = parseInt(feed.feedId, 10);
            const maxNum = parseFloat(feed.threshold_max);
            const minNum = parseFloat(feed.threshold_min);

            if (isNaN(feedIdNum) || isNaN(maxNum) || isNaN(minNum)) {
                validationError = `Feed ID, Max Threshold, and Min Threshold must be valid numbers for feed "${feed.feedName}".`;
                break;
            }
             if (minNum >= maxNum) {
                 validationError = `Min Threshold must be less than Max Threshold for feed "${feed.feedName}".`;
                 break;
             }

            feedsList[feed.feedName] = {
                feedId: feedIdNum,
                threshold_max: maxNum,
                threshold_min: minNum,
            };
        }

        if (validationError) {
            setFormError(validationError);
            setLoading(false);
            return;
        }
        // --- End building feedsList ---


        const deviceData = { name, type, feedsList };

        try {
            const response = await fetch(`${API_BASE_URL}/devices/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(deviceData),
            });

            const data = await response.json();

            if (response.ok && data.code === 200) {
                onSuccess(data.message || "Device added successfully!");
                // Reset form fields after successful submission
                setName('');
                setType('');
                setFeeds([{ id: Date.now(), feedName: '', feedId: '', threshold_max: '', threshold_min: '' }]); // Reset feeds
            } else {
                 // Use onError for API errors, setFormError for validation errors
                 onError(data.message || `Failed to add device. Status: ${response.status}`);
            }
        } catch (err) {
            console.error("Add device error:", err);
            onError(`An unexpected error occurred.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Removed onSubmit from form tag, handled by button click within DialogFooter
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"> {/* Added scroll for long forms */}
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
                     {feeds.length > 1 && ( // Show remove button only if more than one feed exists
                        <Button
                            type="button" // Important: prevent form submission
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
                                onChange={(e) => handleFeedChange(feed.id, 'feedName', e.target.value)}
                                required
                                disabled={loading}
                                placeholder="e.g., temperature"
                            />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor={`feedId-${feed.id}`}>Feed ID</Label>
                            <Input
                                id={`feedId-${feed.id}`}
                                type="number" // Use number type for better input control
                                value={feed.feedId}
                                onChange={(e) => handleFeedChange(feed.id, 'feedId', e.target.value)}
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
                                step="any" // Allow decimals
                                value={feed.threshold_min}
                                onChange={(e) => handleFeedChange(feed.id, 'threshold_min', e.target.value)}
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
                                step="any" // Allow decimals
                                value={feed.threshold_max}
                                onChange={(e) => handleFeedChange(feed.id, 'threshold_max', e.target.value)}
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

            {/* Submit Button is now outside the scrollable div, in the DialogFooter */}
             <DialogFooter className="mt-4 pt-4 border-t"> {/* Add separator */}
                 {/* Optional Cancel/Close Button */}
                 {/* <DialogClose asChild>
                     <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                 </DialogClose> */}
                 <Button type="button" onClick={handleSubmit} disabled={loading}> {/* Changed to type="button" and manually call handleSubmit */}
                     {loading ? 'Adding...' : 'Add Device'}
                 </Button>
             </DialogFooter>
        </div> // End of scrollable div
    );
};
// --- End of AddDeviceForm Component ---


// --- DevicesPage Component (largely unchanged, ensure it uses the updated AddDeviceForm) ---
export default function DevicesPage () {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const refreshDevices = () => {
        console.log("Refreshing device list...");
        // TODO: Implement actual device fetching logic here
        // fetchDevices();
    };

    const handleAddSuccess = (message: string) => {
        setSuccessMessage(message);
        setPageError(null);
        setDialogOpen(false);
        refreshDevices();
        setTimeout(() => setSuccessMessage(null), 4000); // Increased timeout
    };

     const handleAddError = (message: string | null) => { // Allow null to clear error
         setPageError(message);
         setSuccessMessage(null);
         // Keep dialog open on error
     };


    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex-1">
                <section className="w-full py-6 md:py-12">
                    <div className="container px-4 md:px-6">
                        <div className="flex items-center justify-between mb-6">
                            {/* ... back button and title ... */}
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" asChild className="mr-2">
                                    <Link to="/">
                                        <ArrowLeft/>
                                        <span className="sr-only">Back</span>
                                    </Link>
                                </Button>
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                                    All Devices
                                </h1>
                            </div>

                            {/* Dialog Trigger Button */}
                            <Dialog open={dialogOpen} onOpenChange={(open) => {
                                setDialogOpen(open);
                                if (!open) { // Clear errors when dialog is closed manually
                                     setPageError(null);
                                     // Optionally reset form state here if needed, though AddDeviceForm resets on success
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Device
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl"> {/* Increased width slightly */}
                                    <DialogHeader>
                                        <DialogTitle>Add New Device</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details for the new device and its feeds. Click add when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {/* Embed the updated AddDeviceForm component */}
                                    <AddDeviceForm onSuccess={handleAddSuccess} onError={handleAddError} />
                                    {/* Footer is now part of the AddDeviceForm */}
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Display Page-Level Success/Error Messages */}
                         {successMessage && (
                            <Alert variant="default" className="mb-4">
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}
                        {pageError && !dialogOpen && ( // Only show page error if dialog is closed
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{pageError}</AlertDescription>
                            </Alert>
                        )}


                        {/* Existing Device Grid */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {devices.map((device) => (
                                <Card key={device.id} className="">
                                    {/* ... existing card rendering ... */}
                                    <CardHeader className={`${device.bgColor}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center">
                                                    <device.icon className={`h-5 w-5 ${device.color} mr-2`}/>
                                                    {device.name}
                                                </CardTitle>
                                                <CardDescription className="capitalize">{device.type}</CardDescription>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium
                                             ${device.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {device.status === "active" ? "Active" : "Inactive"}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    Current Value
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {device.value}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    Last Updated
                                                </div>
                                                <div className="text-sm">
                                                    {device.lastUpdated}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t p-4">
                                        <Button variant="ghost" className="w-full" asChild>
                                            <Link to={`/devices/${device.id}`}>
                                                View Details
                                                <ArrowRight className="w-4 h-4 ml-2"/>
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}