import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, PlusCircle, Edit, Copy, Share2, AlertCircle } from "lucide-react"; // Added Building icon
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL; // Ensure this is correct

interface Room {
    roomId: number;
    roomName: string;
    roomKey?: string; // Add roomKey if needed for update/create
}

interface ApiResponse<T> {
    code: number;
    message: string;
    authenticated: boolean;
    listRoom?: T[];
    id?: number;
    name?: string;
    roomId?: number;
    encodedRoom?: string;
}

const getAuthToken = () => localStorage.getItem('authToken');

export default function RoomsPage() {
    const navigate = useNavigate(); // Add useNavigate hook
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for Dialogs
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [encodeDialogOpen, setEncodeDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    // State for Forms
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomKey, setNewRoomKey] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [updateRoomName, setUpdateRoomName] = useState('');
    const [encodedRoomString, setEncodedRoomString] = useState('');
    const [assignEncodedString, setAssignEncodedString] = useState('');

    // Fetch rooms on component mount
    useEffect(() => {
        fetchRooms();
    }, []);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    const handleRoomClick = (roomId: number) => {
        navigate(`/rooms/${roomId}/devices`);
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setError(null);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    const showError = (message: string) => {
        setError(message);
        setSuccessMessage(null);
         setTimeout(() => setError(null), 5000); // Auto-clear error after 5 seconds
    };

    const fetchRooms = async () => {
        setLoading(true);
        clearMessages();
        const token = getAuthToken();
        console.log("Fetching rooms with token:", token ? "Present" : "Missing"); // Keep this log
        if (!token) {
            showError("Authentication token not found.");
            setLoading(false);
            console.error("Auth token missing, redirect might be needed."); // Keep this log
            // navigate("/auth"); // Consider uncommenting if not handled elsewhere
            return;
        }

        try {
            console.log(`Attempting to fetch from: ${API_BASE_URL}/rooms`); // Keep this log
            const response = await fetch(`${API_BASE_URL}/rooms`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("Fetch response status:", response.status); // Keep this log

            // Check if the response status indicates success before trying to parse JSON
            if (!response.ok) {
                 // Try to read the response body as text for error details
                 let errorText = `Failed to fetch rooms. Status: ${response.status}`;
                 try {
                     const text = await response.text();
                     console.error("Non-OK response body:", text); // Log the raw error text
                     // You might want to parse this text if it contains a structured error message
                     // For now, just use the status text or the raw text if short
                     errorText = text.length < 100 ? text : errorText; 
                 } catch (textError) {
                     console.error("Could not read error response text:", textError);
                 }
                 showError(errorText);
                 setLoading(false);
                 return; // Stop processing if response is not OK
            }

            // Clone the response to allow reading body multiple times if needed (e.g., text fallback)
            const responseClone = response.clone();
            let data: ApiResponse<Room>;

            try {
                 data = await response.json(); // Attempt to parse JSON
                 console.log("API Response data:", data); // Keep this log

                 // Check backend-specific code after successful JSON parsing
                 if (data.code === 200) {
                     console.log("Rooms fetched successfully:", data.listRoom); // Keep this log
                     setRooms(data.listRoom || []);
                 } else {
                     console.error("API Error (from JSON):", data.message, "Code:", data.code); // Log backend error
                     showError(data.message || `API returned error code ${data.code}`);
                 }

            } catch (jsonError) {
                 console.error("Failed to parse JSON response:", jsonError); // Log the JSON parsing error

                 // Attempt to read the original response as text for more clues
                 try {
                     const textResponse = await responseClone.text();
                     console.error("Raw response text (on JSON parse failure):", textResponse); // Log the raw text
                     showError(`Received invalid data format from server. Status: ${responseClone.status}`);
                 } catch (textReadError) {
                      console.error("Failed to read response text after JSON parse failure:", textReadError);
                      showError(`Received invalid data format and could not read response body. Status: ${responseClone.status}`);
                 }
            }

        } catch (err) {
            console.error("Fetch rooms network/unexpected error:", err); // Keep this log
            showError(err instanceof Error ? err.message : "An unexpected network error occurred while fetching rooms.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        clearMessages();
        const token = getAuthToken();
        if (!token) {
             showError("Authentication token not found.");
             setLoading(false);
             return;
        }
        if (!newRoomName || !newRoomKey) {
            showError("Room Name and Room Key are required.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/rooms/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newRoomName, roomKey: newRoomKey }),
            });
            const data: ApiResponse<never> = await response.json();

            if (response.ok && data.code === 200) {
                showSuccess(data.message || "Room created successfully!");
                setCreateDialogOpen(false);
                setNewRoomName('');
                setNewRoomKey('');
                fetchRooms(); // Refresh the list
            } else {
                showError(data.message || `Failed to create room. Status: ${response.status}`);
            }
        } catch (err) {
            console.error("Create room error:", err);
            showError("An unexpected error occurred while creating the room.");
        } finally {
            setLoading(false);
        }
    };

    const openUpdateDialog = (room: Room) => {
        setSelectedRoom(room);
        setUpdateRoomName(room.roomName);
        setUpdateDialogOpen(true);
        clearMessages();
    };

    const handleUpdateRoom = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedRoom) return;

        setLoading(true);
        clearMessages();
        const token = getAuthToken();
         if (!token) {
              showError("Authentication token not found.");
              setLoading(false);
              return;
         }
        if (!updateRoomName) {
            showError("Room Name cannot be empty.");
            setLoading(false);
            return;
        }

        try {
            // Assuming roomKey is needed for update, get it from selectedRoom or fetch if necessary
            // If roomKey is not available or needed, adjust the payload
            const payload = {
                id: selectedRoom.roomId.toString(), // API expects string ID? Check API doc.
                name: updateRoomName,
                roomKey: selectedRoom.roomKey || `room${selectedRoom.roomId}` // Adjust as needed
            };

            const response = await fetch(`${API_BASE_URL}/rooms/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data: ApiResponse<never> = await response.json();

            if (response.ok && data.code === 200) {
                showSuccess(data.message || "Room updated successfully!");
                setUpdateDialogOpen(false);
                setSelectedRoom(null);
                fetchRooms(); // Refresh the list
            } else {
                showError(data.message || `Failed to update room. Status: ${response.status}`);
            }
        } catch (err) {
            console.error("Update room error:", err);
            showError("An unexpected error occurred while updating the room.");
        } finally {
            setLoading(false);
        }
    };

    const handleEncodeRoom = async (roomId: number) => {
        setLoading(true);
        clearMessages();
        const token = getAuthToken();
         if (!token) {
              showError("Authentication token not found.");
              setLoading(false);
              return;
         }

        try {
            const response = await fetch(`${API_BASE_URL}/rooms/encode/${roomId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: ApiResponse<never> = await response.json();

            if (response.ok && data.code === 200 && data.encodedRoom) {
                setEncodedRoomString(data.encodedRoom);
                setEncodeDialogOpen(true);
            } else {
                 // Handle 404 specifically if possible from status code
                 if (response.status === 404) {
                     showError("Room not found.");
                 } else {
                     showError(data.message || `Failed to encode room. Status: ${response.status}`);
                 }
            }
        } catch (err) {
            console.error("Encode room error:", err);
            showError("An unexpected error occurred while encoding the room.");
        } finally {
            setLoading(false);
        }
    };

     const copyToClipboard = () => {
         navigator.clipboard.writeText(encodedRoomString)
             .then(() => showSuccess("Encoded string copied to clipboard!"))
             .catch(_ => showError("Failed to copy text."));
     };

    const handleAssignRoom = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        clearMessages();
        const token = getAuthToken();
         if (!token) {
              showError("Authentication token not found.");
              setLoading(false);
              return;
         }
        if (!assignEncodedString) {
            showError("Encoded string is required.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/rooms/assign?encodedRoom=${encodeURIComponent(assignEncodedString)}`, {
                method: 'GET', // API uses GET for assign
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data: ApiResponse<never> = await response.json();

            if (response.ok && data.code === 200) {
                showSuccess(data.message || "Room assigned successfully!");
                setAssignDialogOpen(false);
                setAssignEncodedString('');
                // Optionally refresh rooms if assignment affects the current user's list
                // fetchRooms();
            } else {
                 // Handle 400 specifically
                 if (response.status === 400) {
                     showError(data.message || "Invalid encoded device string.");
                 } else {
                     showError(data.message || `Failed to assign room. Status: ${response.status}`);
                 }
            }
        } catch (err) {
            console.error("Assign room error:", err);
            showError("An unexpected error occurred while assigning the room.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex-1 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" asChild className="mr-2">
                            <Link to="/">
                                <ArrowLeft />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                            Quản lý Phòng
                        </h1>
                    </div>
                    <div className="flex gap-2">
                         {/* Assign Room Dialog Trigger */}
                        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Share2 className="mr-2 h-4 w-4" /> Gán phòng
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Gán phòng bằng mã</DialogTitle>
                                    <DialogDescription>
                                        Dán mã phòng được mã hóa vào đây để thêm phòng vào tài khoản của bạn.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAssignRoom} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="assign-encoded">Mã phòng (Encoded)</Label>
                                        <Input
                                            id="assign-encoded"
                                            value={assignEncodedString}
                                            onChange={(e) => setAssignEncodedString(e.target.value)}
                                            placeholder="Dán mã vào đây..."
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={loading}>Hủy</Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Đang gán...' : 'Gán phòng'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Create Room Dialog Trigger */}
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Thêm phòng mới
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tạo phòng mới</DialogTitle>
                                    <DialogDescription>
                                        Nhập thông tin chi tiết cho phòng mới.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateRoom} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-room-name">Tên phòng</Label>
                                        <Input
                                            id="new-room-name"
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                            placeholder="Vd: Vườn Thanh Long 1"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-room-key">Khóa phòng (Room Key)</Label>
                                        <Input
                                            id="new-room-key"
                                            value={newRoomKey}
                                            onChange={(e) => setNewRoomKey(e.target.value)}
                                            placeholder="Vd: room1 (duy nhất)"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={loading}>Hủy</Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Đang tạo...' : 'Tạo phòng'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <Alert variant="default" className="mb-4">
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

                {/* Room List Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách phòng</CardTitle>
                        <CardDescription>Các phòng bạn đang quản lý.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && rooms.length === 0 ? (
                            <p>Đang tải danh sách phòng...</p>
                        ) : rooms.length === 0 ? (
                            <p>Bạn chưa quản lý phòng nào.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Tên phòng</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rooms.map((room) => (
                                        <TableRow key={room.roomId} // Add onClick here
                                            onClick={() => handleRoomClick(room.roomId)} // Add onClick here
                                            className="cursor-pointer hover:bg-muted/50" // Add cursor and hover effect
                                        >
                                            <TableCell>{room.roomId}</TableCell>
                                            <TableCell className="font-medium">{room.roomName}</TableCell>
                                            <TableCell className="text-right">
                                                {/* Keep action buttons, but stop their click from propagating */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mr-1"
                                                    onClick={(e) => { e.stopPropagation(); openUpdateDialog(room); }} // Stop propagation
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mr-1"
                                                    onClick={(e) => { e.stopPropagation(); handleEncodeRoom(room.roomId); }} // Stop propagation
                                                    disabled={loading}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                    <span className="sr-only">Encode/Share</span>
                                                </Button>
                                                {/* Add Delete button if needed */}
                                                {/* <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button> */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Update Room Dialog */}
                <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cập nhật tên phòng</DialogTitle>
                            <DialogDescription>
                                Đổi tên cho phòng "{selectedRoom?.roomName}".
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateRoom} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="update-room-name">Tên phòng mới</Label>
                                <Input
                                    id="update-room-name"
                                    value={updateRoomName}
                                    onChange={(e) => setUpdateRoomName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {/* Optionally add Room Key update field if needed */}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setUpdateDialogOpen(false)} disabled={loading}>Hủy</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                 {/* Encode Room Dialog */}
                 <Dialog open={encodeDialogOpen} onOpenChange={setEncodeDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mã phòng đã mã hóa</DialogTitle>
                            <DialogDescription>
                                Sao chép mã này để chia sẻ hoặc gán phòng cho người dùng khác.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                             <Input
                                 id="encoded-string"
                                 value={encodedRoomString}
                                 readOnly
                                 className="font-mono"
                             />
                             <Button onClick={copyToClipboard} className="w-full">
                                 <Copy className="mr-2 h-4 w-4" /> Sao chép mã
                             </Button>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEncodeDialogOpen(false)}>Đóng</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </main>
        </div>
    );
}