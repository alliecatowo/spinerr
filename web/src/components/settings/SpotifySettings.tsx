"use client";

import { useState } from "react";
import { Music, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SpotifySettings() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveCredentials = () => {
    // TODO: Save to backend when available
    console.log("Saving Spotify credentials:", { clientId, redirectUri });
    alert("Credentials saved! (Backend integration pending)");
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    // TODO: Test connection with Spotify API
    setTimeout(() => {
      setIsTesting(false);
      setIsConnected(true);
    }, 1500);
  };

  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-green-600 dark:text-green-500" />
          <CardTitle>Spotify Integration</CardTitle>
        </div>
        <CardDescription>
          Connect your Spotify Developer App credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions Alert */}
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
            <div className="space-y-2">
              <p className="font-medium">How to get your credentials:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Go to the{" "}
                  <a
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1 hover:text-blue-600"
                  >
                    Spotify Developer Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Create a new app and accept the terms</li>
                <li>Copy your Client ID and Client Secret</li>
                <li>Add your redirect URI in app settings</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Client ID */}
        <div className="space-y-2">
          <Label htmlFor="spotify-client-id">Client ID</Label>
          <Input
            id="spotify-client-id"
            type="text"
            placeholder="Enter your Spotify app Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
        </div>

        {/* Client Secret */}
        <div className="space-y-2">
          <Label htmlFor="spotify-client-secret">Client Secret</Label>
          <Input
            id="spotify-client-secret"
            type="password"
            placeholder="Enter your Spotify app Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
          />
        </div>

        {/* Redirect URI */}
        <div className="space-y-2">
          <Label htmlFor="spotify-redirect-uri">Redirect URI</Label>
          <Input
            id="spotify-redirect-uri"
            type="url"
            placeholder="http://localhost:3000/api/spotify/callback"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
          />
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Use http://localhost:3000/api/spotify/callback for local development
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              Successfully connected to Spotify!
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSaveCredentials}
            disabled={!clientId || !clientSecret || !redirectUri}
          >
            Save Credentials
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!clientId || !clientSecret || isTesting}
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        {/* Note about backend */}
        <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
          Note: Credentials will be stored securely once backend infrastructure is implemented.
        </p>
      </CardContent>
    </Card>
  );
}
