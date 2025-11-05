"use client";

import { useState } from "react";
import { Play, ExternalLink, CheckCircle, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getYouTubeClient, YouTubeVideo } from "@/lib/youtube-api";

export function YouTubeSettings() {
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testQuery, setTestQuery] = useState("lofi music");
  const [testResults, setTestResults] = useState<YouTubeVideo[]>([]);
  const [error, setError] = useState("");

  const handleTestConnection = async () => {
    if (!testQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsTesting(true);
    setError("");
    setTestResults([]);

    try {
      const client = getYouTubeClient();
      const response = await client.search({
        query: testQuery,
        maxResults: 5,
      });

      if (response.videos.length > 0) {
        setTestResults(response.videos);
        setIsConnected(true);
        setError("");
      } else {
        setError("No results found. Try a different query.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);

      if (errorMessage.includes('API key not configured')) {
        setIsConnected(false);
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-red-600 dark:text-red-500" />
          <CardTitle>YouTube Integration</CardTitle>
        </div>
        <CardDescription>
          Connect YouTube Music for video playback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions Alert */}
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
            <div className="space-y-2">
              <p className="font-medium">How to get your API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Go to{" "}
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1 hover:text-blue-600"
                  >
                    Google Cloud Console
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Create a new project</li>
                <li>Enable YouTube Data API v3</li>
                <li>Create API credentials (API Key)</li>
                <li>Restrict the key to YouTube Data API v3</li>
                <li>Set YOUTUBE_API_KEY in .env.local</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* API Key Info */}
        <div className="space-y-2">
          <Label htmlFor="youtube-api-key">API Key Configuration</Label>
          <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <AlertDescription className="text-sm text-yellow-900 dark:text-yellow-100">
              <p>
                For security, the API key must be set server-side in{" "}
                <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900 rounded">
                  .env.local
                </code>
                {" "}as{" "}
                <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900 rounded">
                  YOUTUBE_API_KEY
                </code>
              </p>
              <p className="mt-2 text-xs">
                Restart the dev server after adding the environment variable.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        {/* Quota Info */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">Quota Limits</h3>
          <div className="text-sm text-gray-600 dark:text-neutral-400 space-y-1">
            <p>• Free tier: 10,000 units/day</p>
            <p>• Search: 100 units per request</p>
            <p>• Approximately 100 searches per day</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900 dark:text-red-100">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {isConnected && !error && testResults.length > 0 && (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              YouTube API is working! Found {testResults.length} results.
            </AlertDescription>
          </Alert>
        )}

        {/* Test Search */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Connection</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500 mb-3">
              Search for music videos to verify YouTube integration is working
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search music videos..."
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
              {testResults.map((video) => (
                <div
                  key={video.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-14 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {video.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 truncate">
                      {video.channelTitle}
                    </p>
                    <a
                      href={`https://youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      Watch on YouTube
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOS Warning */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-neutral-800">
          <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
            ⚠️ Important: YouTube's Terms of Service require that videos remain visible during playback.
          </p>
          <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
            Audio-only extraction is prohibited. This app uses official YouTube IFrame player.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
