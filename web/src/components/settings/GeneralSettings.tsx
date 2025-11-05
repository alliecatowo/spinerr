"use client";

import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GeneralSettings() {
  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600 dark:text-neutral-400" />
          <CardTitle>General</CardTitle>
        </div>
        <CardDescription>
          General application preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Preference */}
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select defaultValue="system">
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Choose your preferred color scheme
          </p>
        </div>

        {/* Playback Settings - Placeholder */}
        <div className="space-y-2">
          <Label>Playback</Label>
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Additional playback settings coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
