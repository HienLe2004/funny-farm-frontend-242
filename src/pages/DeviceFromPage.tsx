import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For device type
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, PlusCircle, Trash2 } from "lucide-react";

// Re-use interfaces if defined elsewhere, or define here
interface DeviceFeed {
    feedId: number;
    threshold_max?: number | string; // Use string for input compatibility
    threshold_min?: number | string; // Use string for input compatibility
}

interface DeviceFormData {
    id?: number; // Present only when editing
    name: string;
    type: string; // e.g., "SENSOR", "ACTUATOR", "SENSOR_TRIGGER"
    status?: string; // Only relevant for update, might not be directly editable here
    feedsList: { [key: string]: DeviceFeed };
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export default function DeviceFormPage() {
    const { id } = useParams<{ id?: string }>(); // id will be string or undefined
    const navigate = useNavigate();
    const isEditMode = id !== undefined;
    const deviceId = isEditMode ? parseInt(id, 10) : undefined;

    const [formData, setFormData] = useState<DeviceFormData>({
        name: '',
        type: 'SENSOR', // Default type
        feedsList: {},
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedNameCounter, setFeedNameCounter] = useState(0); // To generate unique temp keys for new feeds

    // Fetch device data if in edit mode
    useEffect(() => {
        if (isEditMode && deviceId) {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("authToken");
            if (!token) {
                setError("Authentication token not found.");
                setLoading(false);
                navigate("/auth");
                return;
            }

            // *** Assuming an endpoint like GET /smart-farm/devices/{id} exists ***
            fetch(`${API_BASE_URL}/devices/${deviceId}`, { // Adjust endpoint if needed
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                 // Assuming data matches DeviceFormData structure or needs mapping
                 // Ensure feedsList values are strings for input fields if needed
                 const fetchedFeeds = data.feedsList || {};
                 const formattedFeeds: { [key: string]: DeviceFeed } = {};
                 Object.keys(fetchedFeeds).forEach(key => {
                     formattedFeeds[key] = {
                         ...fetchedFeeds[key],
                         threshold_max: fetchedFeeds[key].threshold_max?.toString() ?? '',
                         threshold_min: fetchedFeeds[key].threshold_min?.toString() ?? '',
                     };
                 });

                 setFormData({
                     id: data.id,
                     name: data.name || '',
                     type: data.type || 'SENSOR',
                     status: data.status, // Keep status if needed for update payload
                     feedsList: formattedFeeds,
                 });
            })
            .catch(err => {
                console.error("Failed to fetch device details:", err);
                setError(err instanceof Error ? err.message : "Failed to load device data.");
            })
            .finally(() => setLoading(false));
        }
    }, [id, isEditMode, deviceId, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, type: value }));
    };

    const handleFeedChange = (feedKey: string, field: keyof DeviceFeed, value: string) => {
        setFormData(prev => ({
            ...prev,
            feedsList: {
                ...prev.feedsList,
                [feedKey]: {
                    ...prev.feedsList[feedKey],
                    // Convert back to number if it's a threshold field, handle potential NaN
                    [field]: (field === 'threshold_max' || field === 'threshold_min' || field === 'feedId')
                             ? value // Keep as string for input, will parse on submit
                             : value,
                },
            },
        }));
    };

     const handleFeedNameChange = (oldKey: string, newKey: string) => {
         if (newKey && oldKey !== newKey && !formData.feedsList[newKey]) {
             setFormData(prev => {
                 const newFeedsList = { ...prev.feedsList };
                 newFeedsList[newKey] = newFeedsList[oldKey];
                 delete newFeedsList[oldKey];
                 return { ...prev, feedsList: newFeedsList };
             });
         } else if (newKey && oldKey !== newKey) {
             // Handle case where new key already exists (e.g., show an error)
             console.warn(`Feed name "${newKey}" already exists.`);
             // Optionally revert the input or show validation message
         }
     };


    const addFeed = () => {
        const newFeedKey = `new_feed_${feedNameCounter}`;
        setFeedNameCounter(prev => prev + 1);
        setFormData(prev => ({
            ...prev,
            feedsList: {
                ...prev.feedsList,
                [newFeedKey]: { feedId: 0, threshold_max: '', threshold_min: '' }, // Default values as strings
            },
        }));
    };

    const removeFeed = (feedKey: string) => {
        setFormData(prev => {
            const newFeedsList = { ...prev.feedsList };
            delete newFeedsList[feedKey];
            return { ...prev, feedsList: newFeedsList };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        if (!token) {
            setError("Authentication token not found.");
            setLoading(false);
            return;
        }

        // Prepare payload, converting thresholds back to numbers
        const payloadFeeds: { [key: string]: DeviceFeed } = {};
        let validationError = null;
        Object.entries(formData.feedsList).forEach(([key, feed]) => {
             if (!key.trim()) {
                 validationError = "Feed name cannot be empty.";
                 return;
             }
             const feedIdNum = parseInt(feed.feedId.toString(), 10);
             if (isNaN(feedIdNum)) {
                 validationError = `Invalid Feed ID for feed "${key}". Must be a number.`;
                 return;
             }
             payloadFeeds[key] = {
                 feedId: feedIdNum,
                 // Only include thresholds if they are not empty strings
                 ...(feed.threshold_max !== '' && { threshold_max: parseFloat(feed.threshold_max.toString()) }),
                 ...(feed.threshold_min !== '' && { threshold_min: parseFloat(feed.threshold_min.toString()) }),
             };
             // Further validation for NaN thresholds if needed
             if (payloadFeeds[key].threshold_max !== undefined && isNaN(payloadFeeds[key].threshold_max as number)) {
                 validationError = `Invalid Max Threshold for feed "${key}". Must be a number.`;
             }
             if (payloadFeeds[key].threshold_min !== undefined && isNaN(payloadFeeds[key].threshold_min as number)) {
                 validationError = `Invalid Min Threshold for feed "${key}". Must be a number.`;
             }
        });

         if (validationError) {
             setError(validationError);
             setLoading(false);
             return;
         }


        const payload: any = {
            name: formData.name,
            type: formData.type,
            feedsList: payloadFeeds,
        };

        if (isEditMode) {
            payload.id = deviceId;
            payload.status = formData.status; // Include status if it was part of fetched data and relevant for update
        }

        const url = isEditMode ? `${API_BASE_URL}/devices/update` : `${API_BASE_URL}/devices/add`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.code === 200) {
                alert(`Device ${isEditMode ? 'updated' : 'added'} successfully!`);
                navigate('/devices'); // Navigate back to the devices list
            } else {
                throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'add'} device. Status: ${response.status}`);
            }
        } catch (err) {
            console.error(`Failed to ${isEditMode ? 'update' : 'add'} device:`, err);
            setError(err instanceof Error ? err.message : `An unknown error occurred.`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <p>Loading device details...</p>; // Show loading state
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
             <Card className="w-full max-w-2xl">
                 <CardHeader>
                     <div className="flex items-center mb-2">
                         <Button variant="ghost" size="icon" asChild className="mr-2">
                             <Link to="/devices">
                                 <ArrowLeft/>
                                 <span className="sr-only">Back to Devices</span>
                             </Link>
                         </Button>
                         <CardTitle>{isEditMode ? 'Edit Device' : 'Add New Device'}</CardTitle>
                     </div>
                     <CardDescription>
                         {isEditMode ? `Update the details for device ID: ${deviceId}` : 'Enter the details for the new device.'}
                     </CardDescription>
                 </CardHeader>
                 <form onSubmit={handleSubmit}>
                     <CardContent className="space-y-4">
                         {error && (
                             <Alert variant="destructive">
                                 <AlertCircle className="h-4 w-4" />
                                 <AlertTitle>Error</AlertTitle>
                                 <AlertDescription>{error}</AlertDescription>
                             </Alert>
                         )}
                         <div className="space-y-2">
                             <Label htmlFor="name">Device Name</Label>
                             <Input
                                 id="name"
                                 name="name"
                                 value={formData.name}
                                 onChange={handleInputChange}
                                 required
                                 disabled={loading}
                             />
                         </div>
                         <div className="space-y-2">
                             <Label htmlFor="type">Device Type</Label>
                             <Select
                                 name="type"
                                 value={formData.type}
                                 onValueChange={handleSelectChange}
                                 required
                                 disabled={loading}
                             >
                                 <SelectTrigger id="type">
                                     <SelectValue placeholder="Select device type" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="SENSOR">Sensor</SelectItem>
                                     <SelectItem value="ACTUATOR">Actuator</SelectItem>
                                     <SelectItem value="SENSOR_TRIGGER">Sensor/Trigger</SelectItem>
                                     {/* Add other types if needed */}
                                 </SelectContent>
                             </Select>
                         </div>

                         {/* Feeds List Section */}
                         <div className="space-y-4 rounded-md border p-4">
                             <div className="flex justify-between items-center">
                                 <Label className="text-lg font-semibold">Feeds</Label>
                                 <Button type="button" variant="outline" size="sm" onClick={addFeed} disabled={loading}>
                                     <PlusCircle className="w-4 h-4 mr-2" /> Add Feed
                                 </Button>
                             </div>
                             {Object.keys(formData.feedsList).length === 0 ? (
                                 <p className="text-sm text-muted-foreground">No feeds added yet.</p>
                             ) : (
                                 Object.entries(formData.feedsList).map(([key, feed]) => (
                                     <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border-t pt-2">
                                         {/* Feed Name Input */}
                                         <div className="space-y-1 md:col-span-4">
                                             <Label htmlFor={`feed-name-${key}`}>Feed Name</Label>
                                             <Input
                                                 id={`feed-name-${key}`}
                                                 value={key}
                                                 onChange={(e) => handleFeedNameChange(key, e.target.value)}
                                                 placeholder="e.g., temp_sensor_1"
                                                 required
                                                 disabled={loading}
                                             />
                                         </div>
                                         {/* Feed ID Input */}
                                         <div className="space-y-1">
                                             <Label htmlFor={`feed-id-${key}`}>Feed ID</Label>
                                             <Input
                                                 id={`feed-id-${key}`}
                                                 type="number"
                                                 value={feed.feedId}
                                                 onChange={(e) => handleFeedChange(key, 'feedId', e.target.value)}
                                                 required
                                                 disabled={loading}
                                             />
                                         </div>
                                         {/* Threshold Max Input */}
                                         <div className="space-y-1">
                                             <Label htmlFor={`feed-max-${key}`}>Threshold Max</Label>
                                             <Input
                                                 id={`feed-max-${key}`}
                                                 type="number"
                                                 step="any" // Allow decimals
                                                 value={feed.threshold_max}
                                                 onChange={(e) => handleFeedChange(key, 'threshold_max', e.target.value)}
                                                 placeholder="Optional"
                                                 disabled={loading}
                                             />
                                         </div>
                                         {/* Threshold Min Input */}
                                         <div className="space-y-1">
                                             <Label htmlFor={`feed-min-${key}`}>Threshold Min</Label>
                                             <Input
                                                 id={`feed-min-${key}`}
                                                 type="number"
                                                 step="any" // Allow decimals
                                                 value={feed.threshold_min}
                                                 onChange={(e) => handleFeedChange(key, 'threshold_min', e.target.value)}
                                                 placeholder="Optional"
                                                 disabled={loading}
                                             />
                                         </div>
                                         {/* Remove Button */}
                                         <Button
                                             type="button"
                                             variant="destructive"
                                             size="icon"
                                             onClick={() => removeFeed(key)}
                                             disabled={loading}
                                             className="self-end" // Align button to bottom
                                         >
                                             <Trash2 className="w-4 h-4" />
                                             <span className="sr-only">Remove Feed</span>
                                         </Button>
                                     </div>
                                 ))
                             )}
                         </div>
                     </CardContent>
                     <CardFooter>
                         <Button type="submit" className="w-full" disabled={loading}>
                             {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Device' : 'Add Device')}
                         </Button>
                     </CardFooter>
                 </form>
             </Card>
        </div>
    );
}