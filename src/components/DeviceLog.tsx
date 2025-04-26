import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Check, Clock, Info, X } from "lucide-react";

// Define the structure of a log entry from the API
interface ApiLogEntry {
  id: number;
  logType: "DATA" | "TRIGGER_MAX" | "TRIGGER_MIN" | string; // Allow other strings for flexibility
  feedKey: string;
  value: string;
  createdAt: string; // Assuming ISO string format or similar from API
}

// Define the structure for the displayed log
interface DisplayLog {
  id: number;
  time: string;
  event: string;
  type: "info" | "success" | "warning" | "error" | "activity";
}

// --- REMOVE hardcoded logs ---
// const deviceLogs = { ... }
// --- END REMOVE ---

// Get icon based on log type (updated for API log types)
const getLogIcon = (type: DisplayLog["type"]) => {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "success": // Keep success for potential future use (e.g., manual actions)
      return <Check className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "error": // Keep error for potential future use
      return <X className="h-4 w-4 text-red-500" />;
    default: // Use 'activity' as default
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

// Helper to format the date/time string
const formatLogTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    // Simple relative time or specific format
    // This is basic, consider using a library like date-fns for more robust formatting
    return date.toLocaleString("vi-VN", {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return isoString; // Fallback to original string if parsing fails
  }
};

// Helper to create event message and determine display type
const processLogEntry = (log: ApiLogEntry): Pick<DisplayLog, 'event' | 'type'> => {
  let event = "";
  let type: DisplayLog["type"] = "activity"; // Default type

  switch (log.logType) {
    case "DATA":
      event = `Value changed to ${log.value}`;
      type = "info";
      break;
    case "TRIGGER_MAX":
      event = `Triggered MAX threshold with value ${log.value}`;
      type = "warning";
      break;
    case "TRIGGER_MIN":
      event = `Triggered MIN threshold with value ${log.value}`;
      type = "warning";
      break;
    // Add cases for other potential log types from your system
    default:
      event = `Log event: ${log.logType} - ${log.value}`; // Generic fallback
      type = "activity";
  }
  return { event, type };
};

const getAuthToken = () => localStorage.getItem('authToken');

// --- UPDATE Props: Use feedKey instead of deviceId ---
export function DeviceLog({ feedKey }: { feedKey: string | null }) {
  const [logs, setLogs] = useState<DisplayLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL; // Get base URL from env or use a default

  useEffect(() => {
    if (!feedKey) {
      setLogs([]);
      setError("Feed key not provided.");
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken(); // Get the token

      // --- Add check for token ---
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        // Optionally, redirect to login: navigate('/auth');
        return;
      }
      // --- End check for token ---

      // --- Use API endpoint ---
      // Adjust page size as needed
      const url = `${apiBaseUrl}/logs/feed/${feedKey}?page=0&size=20`;
      console.log("Fetching logs from:", url); // Log URL for debugging

      try {
        // Add authentication headers if required by your API
        const response = await fetch(url, {
          method: 'GET',
          headers: {
             'Authorization': `Bearer ${token}`, // Add the Authorization header
            // 'Content-Type': 'application/json' // Content-Type might not be needed for GET
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch logs. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 200) {
             throw new Error(data.message || "API returned an error code.");
        }

        if (data.message === "No logs are found" || !data.listLogDTO || data.listLogDTO.length === 0) {
            setLogs([]);
        } else {
            // --- Map API data to DisplayLog format ---
            const formattedLogs = data.listLogDTO.map((log: ApiLogEntry) => {
                const { event, type } = processLogEntry(log);
                return {
                    id: log.id,
                    time: formatLogTime(log.createdAt),
                    event: event,
                    type: type,
                };
            });
            setLogs(formattedLogs);
        }

      } catch (err) {
        console.error("Failed to fetch device logs:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setLogs([]); // Clear logs on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [feedKey, apiBaseUrl]); // Re-fetch when feedKey changes

  // --- Render based on state ---
  if (!feedKey) {
      return <div className="text-center py-4 text-muted-foreground">Feed key not available.</div>;
  }

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading logs...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error loading logs: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No logs available for this device.</div>
      ) : (
        // --- Use fetched and formatted logs ---
        logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="mt-0.5">{getLogIcon(log.type)}</div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{log.event}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {log.time}
              </div>
            </div>
            {/* Optional: Add delete button here if needed */}
            {/* <button onClick={() => handleDelete(log.id)}>Delete</button> */}
          </div>
        ))
      )}
    </div>
  );
}
