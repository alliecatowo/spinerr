"use client";

import { useState, useEffect } from "react";
import { Music2, CheckCircle, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSoundCloudClient, SoundCloudTrack } from "@/lib/soundcloud-api";

export function SoundCloudSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testQuery, setTestQuery] = useState("lofi hip hop");
  const [testResults, setTestResults] = useState<SoundCloudTrack[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize SoundCloud client on mount
    initializeClient();
  }, []);

  const initializeClient = async () => {
    try {
      const client = getSoundCloudClient();
      await client.initialize();
      setIsConnected(client.isAuthenticated());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize SoundCloud');
      setIsConnected(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsTesting(true);
    setError("");
    setTestResults([]);

    try {
      const client = getSoundCloudClient();
      const results = await client.searchTracks({
        query: testQuery,
        limit: 5,
      });

      if (results.length > 0) {
        setTestResults(results);
        setIsConnected(true);
        setError("");
      } else {
        setError("No results found. Try a different query.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music2 className="h-5 w-5 text-orange-600 dark:text-orange-500" />
          <CardTitle>SoundCloud Integration</CardTitle>
        </div>
        <CardDescription>
          Auto-configured using soundcloud.ts (no registration required)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
            <div className="space-y-2">
              <p className="font-medium">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Uses soundcloud.ts library</li>
                <li>No API key or registration required</li>
                <li>Auto-fetches client IDs from SoundCloud</li>
                <li>Access to public tracks, search, and streaming</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Connection Status */}
        {isConnected && !error && (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              SoundCloud client initialized successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900 dark:text-red-100">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Search */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Connection</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500 mb-3">
              Search for tracks to verify SoundCloud integration is working
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search tracks..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTestConnection();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleTestConnection}
              disabled={isTesting || !testQuery.trim()}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              {isTesting ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Results ({testResults.length})
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {testResults.map((track) => (
                <div
                  key={track.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {track.artworkUrl && (
                    <img
                      src={track.artworkUrl}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {track.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 truncate">
                      {track.artist}
                    </p>
                    {track.genre && (
                      <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                        {track.genre}
                        {track.bpm && ` • ${track.bpm} BPM`}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-neutral-500 flex-shrink-0">
                    {Math.floor(track.duration / 60000)}:
                    {String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Note */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-neutral-800">
          <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
            ⚠️ Note: This uses an unofficial API client (soundcloud.ts) which auto-fetches client IDs.
          </p>
          <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
            For production apps, consider using SoundCloud's official Widget API.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
