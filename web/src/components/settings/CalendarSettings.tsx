"use client";

import { useState } from "react";
import { Calendar, Upload, CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function CalendarSettings() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [icalFile, setIcalFile] = useState<File | null>(null);

  const handleGoogleConnect = () => {
    // TODO: Implement Google OAuth
    alert("Google Calendar OAuth will be implemented with backend");
  };

  const handleIcalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.ics')) {
      setIcalFile(file);
      // TODO: Parse iCal file
      alert(`iCal file "${file.name}" selected (parsing pending)`);
    }
  };

  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          <CardTitle>Calendar Providers</CardTitle>
        </div>
        <CardDescription>
          Connect your calendar services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="ical">iCal</TabsTrigger>
            <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
          </TabsList>

          {/* Google Calendar */}
          <TabsContent value="google" className="space-y-4 mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Connect your Google Calendar to sync events automatically
              </p>

              {googleConnected ? (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900 dark:text-green-100">
                    Connected to Google Calendar
                  </AlertDescription>
                </Alert>
              ) : (
                <Button onClick={handleGoogleConnect}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </Button>
              )}

              <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
                Requires backend OAuth implementation
              </p>
            </div>
          </TabsContent>

          {/* iCal Import */}
          <TabsContent value="ical" className="space-y-4 mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Import events from an iCal (.ics) file
              </p>

              <div className="space-y-2">
                <Label htmlFor="ical-file">iCal File</Label>
                <Input
                  id="ical-file"
                  type="file"
                  accept=".ics"
                  onChange={handleIcalUpload}
                />
                {icalFile && (
                  <p className="text-sm text-green-600 dark:text-green-500">
                    Selected: {icalFile.name}
                  </p>
                )}
              </div>

              <Button disabled={!icalFile}>
                <Upload className="h-4 w-4 mr-2" />
                Import Events
              </Button>

              <p className="text-sm text-gray-500 dark:text-neutral-500">
                Supports standard iCalendar format (.ics)
              </p>
            </div>
          </TabsContent>

          {/* Microsoft Calendar */}
          <TabsContent value="microsoft" className="space-y-4 mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Microsoft Calendar integration coming soon
              </p>

              <Button disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Microsoft Calendar
              </Button>

              <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
                Feature in development
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
