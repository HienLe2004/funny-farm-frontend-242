import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { useToast } from "@/components/hooks/use-toast"
import { Link, useNavigate } from "react-router-dom"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  // const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
        const response = await fetch(`${import.meta.env.VITE_BASEDAPIURL}/auth/login`,  {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"email": email, "password": password})
        })
        const data = await response.json()
        if (data.authenticated) {   
            // Store authentication token
            sessionStorage.setItem("accessToken", data.token)
            console.log("Login successful")
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
            navigate("/")
            toast('Đăng nhập thành công', {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
              });
        } else {
            console.log("Login failed")
            setEmail("")
            setPassword("")
            toast('Sai tên tài khoản hoặc mật khẩu. Vui long thử lại.', {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
              });
        }
        } catch (error) {
        toast('Lỗi đăng nhập. Vui lòng thử lại.', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          });
        } finally {
        setIsLoading(false)
        }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Farm IoT Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="mt-4 text-center text-sm">
                <Link to="#" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Link to="#" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-4 text-xs text-gray-500">Demo credentials: admin@example.com / password</p>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        />
    </div>
  )
}
