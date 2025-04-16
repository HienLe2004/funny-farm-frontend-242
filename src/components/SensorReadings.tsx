import { Droplet, Droplets, Lightbulb, Thermometer } from "lucide-react";

export default function SensorReadings () {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mr-2"/>
                    <span className="text-sm font-medium">Light</span>
                </div>
                <div className="font-bold">70%</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Droplet className="h-5 w-5 text-blue-500 mr-2"/>
                    <span className="text-sm font-medium">Humid</span>
                </div>
                <div className="font-bold">32%</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-red-500 mr-2"/>
                    <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="font-bold">23.5°C</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Droplets className="h-5 w-5 text-cyan-500 mr-2"/>
                    <span className="text-sm font-medium">Soil moisture</span>
                </div>
                <div className="font-bold">48%</div>
            </div>
            <div className="pt-2">
                <div className="text-xs text-muted-foreground">Last updated: 2 seconds ago</div>
            </div>
        </div>
    )
}