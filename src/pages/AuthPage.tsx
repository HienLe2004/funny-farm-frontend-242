import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            console.log(API_BASE_URL)
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.code === 200 && data.authenticated) {
                localStorage.setItem("authToken", data.token); // Store the token
                sessionStorage.setItem("accessToken", data.token); // Store the token
                localStorage.setItem("userEmail", email); // Optionally store user email
                const roomListResponse = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/rooms`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                })
                const roomListData = await roomListResponse.json()
                if (roomListData.listRoom.length > 0) {
                  // Store roomId
                    sessionStorage.setItem("roomId", roomListData.listRoom[0].roomId)
                    const roomResponse = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/devices/room/${roomListData.listRoom[0].roomId}`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${data.token}`
                      }
                    })
                    const roomData = await roomResponse.json()
                    if (roomData.listDeviceDTO.length > 0) {
                      const roomKey:string = Object.keys(roomData.listDeviceDTO[0].feedsList)[0].split('.')[0]
                      sessionStorage.setItem("roomKey", roomKey)
                    }
                    else {
                      console.log("Room has no device")
                    }
                }
                else {
                  console.log("User has no room")
                  sessionStorage.removeItem("roomId")
                  sessionStorage.removeItem("roomKey")
                }
                navigate("/"); // Redirect to overview page on successful login
            } else {
                setError(data.message || `Login failed with status: ${response.status}`);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Basic client-side validation
        if (!email.endsWith("@gmail.com")) {
             setError("Please enter an email ending with @gmail.com");
             setLoading(false);
             return;
        }
         if (!name) {
             setError("Please enter your name.");
             setLoading(false);
             return;
         }

        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (response.ok && data.code === 200) {
                // Optionally automatically log in or prompt user to log in
                alert("Registration successful! Please log in.");
                // Consider switching tab to login automatically
            } else {
                 setError(data.message || `Registration failed with status: ${response.status}`);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError("An unexpected error occurred during registration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Tabs defaultValue="login" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>Enter your credentials to access your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="admin@gmail.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>Register</CardTitle>
                            <CardDescription>Create a new account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleRegister} className="space-y-4">
                                 {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">Name</Label>
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="Your Name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="user@gmail.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Password</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Registering..." : "Register"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}