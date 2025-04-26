import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
    ArrowLeft,
    Trash2,
    AlertCircle,
    Check,
    Activity, // Icon for DATA
    BellRing, // Icon for TRIGGER
    TriangleAlert // Icon for Error/Warning (can be adapted)
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const PAGE_SIZE = 5; // Number of logs per page

interface Log {
    id: number;
    logType: string; // "DATA", "TRIGGER_MAX", "TRIGGER_MIN"
    feedKey: string;
    value: string;
    createdAt: string; // Format "YYYY-MM-DD HH:mm"
}

interface ApiResponse<T> {
    code: number;
    message: string;
    authenticated: boolean;
    currentPage?: number;
    totalPages?: number;
    totalElements?: number;
    listLogDTO?: T[];
}

// Helper to get appropriate icon based on log type
const getLogIcon = (logType: string) => {
    if (logType.startsWith("TRIGGER")) {
        return <BellRing className="h-5 w-5 text-blue-500 mr-2" />;
    } else if (logType === "DATA") {
        return <Activity className="h-5 w-5 text-gray-500 mr-2" />;
    }
    // Add more conditions or a default icon if needed
    return <TriangleAlert className="h-5 w-5 text-yellow-500 mr-2" />; // Default/Warning
};

const getAuthToken = () => localStorage.getItem('authToken');

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [feedKey, setFeedKey] = useState<string>('');
    const [selectedLogType, setSelectedLogType] = useState<string>(''); // Empty string means fetch all types for the feedKey
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch logs when feedKey or currentPage changes, or when log type filter is applied/removed
    useEffect(() => {
        if (feedKey) {
            fetchLogs();
        } else {
            // Clear logs if feedKey is cleared
            setLogs([]);
            setTotalPages(1);
            setCurrentPage(0);
        }
    }, [feedKey, currentPage, selectedLogType]); // Re-fetch when these change

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setError(null);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    const showError = (message: string) => {
        setError(message);
        setSuccessMessage(null);
        setTimeout(() => setError(null), 5000);
    };

    const fetchLogs = async () => {
        if (!feedKey) {
            showError("Vui lòng nhập Feed Key.");
            return;
        }

        setLoading(true);
        clearMessages();
        const token = getAuthToken();
        if (!token) {
            showError("Không tìm thấy token xác thực.");
            setLoading(false);
            return;
        }

        let url = '';
        const options: RequestInit = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Needed for POST
            }
        };

        // Decide which API endpoint to use based on whether a log type is selected
        if (selectedLogType) {
            // API 3: Get logs by feed key and log type (Using POST as GET with body is non-standard)
            url = `${API_BASE_URL}/logs/type?page=${currentPage}&size=${PAGE_SIZE}`;
            options.method = 'POST'; // Assuming POST is correct for GET with body scenario
            options.body = JSON.stringify({
                logType: selectedLogType,
                feedKey: feedKey
            });
        } else {
            // API 2: Get logs by feed key
            url = `${API_BASE_URL}/logs/feed/${feedKey}?page=${currentPage}&size=${PAGE_SIZE}`;
            options.method = 'GET';
            // Remove Content-Type for GET request without body
             if (options.headers) {
                 delete (options.headers as Record<string, string>)['Content-Type'];
             }
        }

        try {
            console.log(`Fetching logs from: ${url} with options:`, options);
            const response = await fetch(url, options);
            const data: ApiResponse<Log> = await response.json();
            console.log("API Response:", data);

            if (response.ok && data.code === 200) {
                if (data.message === "No logs are found" || !data.listLogDTO) {
                    setLogs([]);
                    showSuccess("Không tìm thấy log nào.");
                } else {
                    setLogs(data.listLogDTO || []);
                }
                setCurrentPage(data.currentPage ?? 0);
                setTotalPages(data.totalPages ?? 1);
            } else {
                 // Handle specific backend error messages if available
                 if (data.message === "Feed sensor not found") {
                     showError(`Feed Key "${feedKey}" không tồn tại.`);
                 } else {
                     showError(data.message || `Không thể lấy danh sách log. Trạng thái: ${response.status}`);
                 }
                 setLogs([]); // Clear logs on error
                 setTotalPages(1);
                 setCurrentPage(0);
            }
        } catch (err) {
            console.error("Lỗi khi lấy danh sách log:", err);
            showError("Đã xảy ra lỗi không mong muốn khi lấy danh sách log.");
            setLogs([]); // Clear logs on error
            setTotalPages(1);
            setCurrentPage(0);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLog = async (id: number) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa log ID: ${id} không?`)) {
            return;
        }

        setLoading(true);
        clearMessages();
        const token = getAuthToken();
        if (!token) {
            showError("Không tìm thấy token xác thực.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/logs/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Check if response has content before parsing JSON
            const contentType = response.headers.get("content-type");
            let data: ApiResponse<never> | null = null;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                 data = await response.json();
            }


            if (response.ok) { // Check status code directly for success
                 showSuccess(data?.message || `Log ID: ${id} đã được xóa thành công!`);
                 // Refresh logs on the current page after deletion
                 fetchLogs();
            } else {
                 // Handle specific backend error messages if available
                 if (data?.message === "Log not found") {
                     showError(`Log ID: ${id} không tồn tại.`);
                 } else {
                     showError(data?.message || `Không thể xóa log. Trạng thái: ${response.status}`);
                 }
            }
        } catch (err) {
            console.error("Lỗi khi xóa log:", err);
            showError("Đã xảy ra lỗi không mong muốn khi xóa log.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset page to 0 when feedKey or logType changes
    const handleFeedKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFeedKey(e.target.value);
        setCurrentPage(0); // Reset page when feed key changes
    };

    const handleLogTypeChange = (value: string) => {
        setSelectedLogType(value);
        setCurrentPage(0); // Reset page when filter changes
    };

    const handleSearchClick = () => {
        setCurrentPage(0); // Reset to first page for new search
        fetchLogs();
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex-1">
                <section className="w-full py-6 md:py-12">
                    <div className="container px-4 md:px-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" asChild className="mr-2">
                                    <Link to="/">
                                        <ArrowLeft />
                                        <span className="sr-only">Quay lại</span>
                                    </Link>
                                </Button>
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                                    Lịch sử Log
                                </h1>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="mb-6 flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1 w-full md:w-auto">
                                <Label htmlFor="feedKey">Feed Key</Label>
                                <Input
                                    id="feedKey"
                                    value={feedKey}
                                    onChange={handleFeedKeyChange}
                                    placeholder="Nhập Feed Key (ví dụ: light-sensor)"
                                />
                            </div>
                            <div className="w-full md:w-auto">
                                <Label htmlFor="logType">Loại Log</Label>
                                <Select value={selectedLogType} onValueChange={handleLogTypeChange}>
                                    <SelectTrigger id="logType" className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Tất cả loại" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tất cả loại</SelectItem>
                                        <SelectItem value="DATA">DATA</SelectItem>
                                        <SelectItem value="TRIGGER_MAX">TRIGGER_MAX</SelectItem>
                                        <SelectItem value="TRIGGER_MIN">TRIGGER_MIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleSearchClick}
                                disabled={!feedKey || loading}
                            >
                                {loading ? "Đang tải..." : "Tìm kiếm"}
                            </Button>
                        </div>


                        {/* Display Success/Error Messages */}
                        {successMessage && (
                            <Alert variant="default" className="mb-4 bg-green-50">
                                <Check className="h-4 w-4 text-green-600" />
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

                        {/* Logs Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Danh sách Log</CardTitle>
                                <CardDescription>
                                    {feedKey ? `Các log cho Feed Key: ${feedKey}` : "Nhập Feed Key để xem danh sách log"}
                                    {selectedLogType && ` (Loại: ${selectedLogType})`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : logs.length > 0 ? (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">ID</TableHead>
                                                    <TableHead>Loại Log</TableHead>
                                                    <TableHead>Giá trị</TableHead>
                                                    <TableHead>Thời gian</TableHead>
                                                    <TableHead className="text-right">Thao tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {logs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell>{log.id}</TableCell>
                                                        <TableCell className="flex items-center">
                                                            {getLogIcon(log.logType)}
                                                            {log.logType}
                                                        </TableCell>
                                                        <TableCell>{log.value}</TableCell>
                                                        <TableCell>{log.createdAt}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteLog(log.id)}
                                                                disabled={loading}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Xóa</span>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <Pagination className="mt-4">
                                                <PaginationContent>
                                                    <PaginationItem>
                                                        <PaginationPrevious
                                                            href="#"
                                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                                            aria-disabled={currentPage === 0}
                                                            className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                                                        />
                                                    </PaginationItem>
                                                    {[...Array(totalPages).keys()].map((page) => (
                                                        <PaginationItem key={page}>
                                                            <PaginationLink
                                                                href="#"
                                                                onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                                                isActive={currentPage === page}
                                                            >
                                                                {page + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}
                                                    <PaginationItem>
                                                        <PaginationNext
                                                            href="#"
                                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                                            aria-disabled={currentPage === totalPages - 1}
                                                            className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        {feedKey ? "Không tìm thấy log nào phù hợp." : "Nhập Feed Key và nhấn Tìm kiếm để xem log."}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    );
}
