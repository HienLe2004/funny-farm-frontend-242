import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Fan, Gauge } from "lucide-react"
export default function DeviceControls() {
    const [pump1, setPump1] = useState(true)
    const [pump2, setPump2] = useState(false)
    const [fan, setFan] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Gauge className="text-green-500 h-5 w-5"/>
                    <Label htmlFor="pump1" className="text-sm font-medium">
                        Pump 1
                    </Label>
                </div>
                <Switch id="pump1" checked={pump1} onCheckedChange={setPump1}/>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Gauge className="text-green-500 h-5 w-5"/>
                    <Label htmlFor="pump2" className="text-sm font-medium">
                        Pump 2
                    </Label>
                </div>
                <Switch id="pump2" checked={pump2} onCheckedChange={setPump2}/>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Fan className="text-purple-500 h-5 w-5"/>
                    <Label htmlFor="fan" className="text-sm font-medium">
                        Fan
                    </Label>
                </div>
                <Switch id="fan" checked={fan} onCheckedChange={setFan}/>
            </div>
        </div>
    )
}