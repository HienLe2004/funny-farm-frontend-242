"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Search, Users } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

// Sample room data
const sampleRooms = [
  {
    id: 1,
    name: "Greenhouse 1",
    description: "Main greenhouse with temperature and humidity sensors",
    owner: {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    members: [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "owner",
      },
      {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: 3,
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
    ],
    devices: 5,
    createdAt: "2023-01-15T10:30:00Z",
    lastActivity: "2023-05-10T14:45:00Z",
  },
  {
    id: 2,
    name: "Barn Monitoring",
    description: "Sensors and controls for the main barn",
    owner: {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    members: [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "owner",
      },
      {
        id: 4,
        name: "Robert Johnson",
        email: "robert@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
    ],
    devices: 3,
    createdAt: "2023-02-20T09:15:00Z",
    lastActivity: "2023-05-09T11:30:00Z",
  },
  {
    id: 3,
    name: "Field Irrigation",
    description: "Irrigation system for the main field",
    owner: {
      id: 2,
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    members: [
      {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "owner",
      },
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: 5,
        name: "Sarah Williams",
        email: "sarah@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
    ],
    devices: 7,
    createdAt: "2023-03-05T14:20:00Z",
    lastActivity: "2023-05-10T09:15:00Z",
  },
  {
    id: 4,
    name: "Storage Monitoring",
    description: "Temperature and humidity monitoring for storage facilities",
    owner: {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    members: [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "owner",
      },
    ],
    devices: 2,
    createdAt: "2023-04-10T11:45:00Z",
    lastActivity: "2023-05-08T16:30:00Z",
  },
]

export default function RoomsPage() {
  const [rooms, setRooms] = useState(sampleRooms)
  const [searchQuery, setSearchQuery] = useState("")
  const [newRoomDialog, setNewRoomDialog] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: "", description: "" })
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [inviteDialog, setInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const { toast } = useToast()

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get current user (in a real app, this would come from authentication)
  const currentUser = {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
  }

  // Handle creating a new room
  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      toast({
        variant: "destructive",
        title: "Room name required",
        description: "Please enter a name for the room.",
      })
      return
    }

    const newRoomData = {
      id: rooms.length + 1,
      name: newRoom.name,
      description: newRoom.description,
      owner: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: "/placeholder.svg?height=40&width=40",
          role: "owner",
        },
      ],
      devices: 0,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    }

    setRooms([...rooms, newRoomData])
    setNewRoom({ name: "", description: "" })
    setNewRoomDialog(false)

    toast({
      title: "Room created",
      description: `${newRoom.name} has been created successfully.`,
    })
  }

  // Handle inviting a user to a room
  const handleInviteUser = () => {
    if (!inviteEmail.trim() || !selectedRoom) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter a valid email address.",
      })
      return
    }

    // In a real app, this would send an invitation to the user
    // For now, we'll just add them to the room
    const updatedRooms = rooms.map((room) => {
      if (room.id === selectedRoom) {
        // Check if user is already a member
        const existingMember = room.members.find((member) => member.email === inviteEmail)
        if (existingMember) {
          toast({
            variant: "destructive",
            title: "User already in room",
            description: `${inviteEmail} is already a member of this room.`,
          })
          return room
        }

        return {
          ...room,
          members: [
            ...room.members,
            {
              id: Math.floor(Math.random() * 1000) + 10, // Generate random ID for demo
              name: inviteEmail.split("@")[0], // Use email prefix as name for demo
              email: inviteEmail,
              avatar: "/placeholder.svg?height=40&width=40",
              role: "member",
            },
          ],
        }
      }
      return room
    })

    setRooms(updatedRooms)
    setInviteEmail("")
    setInviteDialog(false)

    toast({
      title: "Invitation sent",
      description: `${inviteEmail} has been invited to the room.`,
    })
  }

  // Handle removing a user from a room
  const handleRemoveUser = (roomId: number, userId: number) => {
    // Don't allow removing the owner
    const room = rooms.find((r) => r.id === roomId)
    const user = room?.members.find((m) => m.id === userId)

    if (user?.role === "owner") {
      toast({
        variant: "destructive",
        title: "Cannot remove owner",
        description: "The room owner cannot be removed from the room.",
      })
      return
    }

    const updatedRooms = rooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,
          members: room.members.filter((member) => member.id !== userId),
        }
      }
      return room
    })

    setRooms(updatedRooms)

    toast({
      title: "User removed",
      description: `${user?.name} has been removed from the room.`,
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <section className="w-full py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" asChild className="mr-2">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Rooms</h1>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={newRoomDialog} onOpenChange={setNewRoomDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Room</DialogTitle>
                      <DialogDescription>Create a new room to group devices and invite team members.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="room-name">Room Name</Label>
                        <Input
                          id="room-name"
                          placeholder="e.g., Greenhouse 1"
                          value={newRoom.name}
                          onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="room-description">Description (Optional)</Label>
                        <Input
                          id="room-description"
                          placeholder="e.g., Main greenhouse with temperature sensors"
                          value={newRoom.description}
                          onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewRoomDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRoom}>Create Room</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-[350px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search rooms..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No rooms found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Try adjusting your search query" : "Create a new room to get started"}
                  </p>
                  <Button className="mt-4" onClick={() => setNewRoomDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredRooms.map((room) => (
                    <Card key={room.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription>{room.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Owner</span>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={room.owner.avatar || "/placeholder.svg"} alt={room.owner.name} />
                                <AvatarFallback>{room.owner.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{room.owner.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Members</span>
                            <div className="flex -space-x-2">
                              {room.members.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {room.members.length > 3 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                                  +{room.members.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Devices</span>
                            <Badge variant="outline">{room.devices}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Created</span>
                            <span className="text-sm text-muted-foreground">{formatDate(room.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t p-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/rooms/${room.id}`}>View Details</Link>
                        </Button>
                        {room.owner.id === currentUser.id && (
                          <Dialog
                            open={inviteDialog && selectedRoom === room.id}
                            onOpenChange={(open) => {
                              setInviteDialog(open)
                              if (open) setSelectedRoom(room.id)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Users className="mr-2 h-4 w-4" />
                                Invite
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Invite to {room.name}</DialogTitle>
                                <DialogDescription>Invite a user to join this room by email.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="invite-email">Email Address</Label>
                                  <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setInviteDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleInviteUser}>Send Invitation</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
