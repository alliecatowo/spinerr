"use client";

import { useState, useEffect } from "react";
import { Music, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createSpotifyClient, SpotifyClient } from "@/lib/spotify-api";

// Global client instance (will be moved to context/backend later)
let spotifyClient: SpotifyClient | null = null;

export function SpotifySettings() {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("http://localhost:3000/settings");
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load saved credentials from localStorage
    const savedClientId = localStorage.getItem('spotify_client_id');
    const savedRedirectUri = localStorage.getItem('spotify_redirect_uri');

    if (savedClientId) setClientId(savedClientId);
    if (savedRedirectUri) setRedirectUri(savedRedirectUri);

    // Recreate client if credentials exist
    if (savedClientId && savedRedirectUri) {
      spotifyClient = createSpotifyClient(savedClientId, savedRedirectUri);
    }

    // Check if already connected
    if (spotifyClient?.isAuthenticated()) {
      setIsConnected(true);
    }

    // Check for OAuth callback (code in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const callbackError = urlParams.get('error');

    if (callbackError) {
      setError(`Spotify authorization failed: ${callbackError}`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code && spotifyClient) {
      // Exchange code for token
      handleCallback(code);
    }
  }, []);

  const handleCallback = async (code: string) => {
    if (!spotifyClient) return;

    try {
      setIsTesting(true);
      await spotifyClient.handleCallback(code);
      setIsConnected(true);
      setError("");

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = () => {
    // Store credentials (localStorage for now, backend later)
    localStorage.setItem('spotify_client_id', clientId);
    localStorage.setItem('spotify_redirect_uri', redirectUri);

    // Create client instance
    spotifyClient = createSpotifyClient(clientId, redirectUri);

    setError("");
    alert("Credentials saved! Click 'Connect Spotify' to authorize.");
  };

  const handleConnect = async () => {
    if (!spotifyClient) {
      setError("Please save credentials first");
      return;
    }

    try {
      setIsTesting(true);
      setError("");
      // This will redirect to Spotify authorization
      await spotifyClient.login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authorization');
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    spotifyClient?.logout();
    setIsConnected(false);
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
                <li>Copy your Client ID (Client Secret not needed for PKCE)</li>
                <li>Add your redirect URI in app settings (must match exactly)</li>
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
            disabled={isConnected}
          />
        </div>

        {/* Redirect URI */}
        <div className="space-y-2">
          <Label htmlFor="spotify-redirect-uri">Redirect URI</Label>
          <Input
            id="spotify-redirect-uri"
            type="url"
            placeholder="http://localhost:3000/settings"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            disabled={isConnected}
          />
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            This must match exactly what you configured in your Spotify app settings
          </p>
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
          {!isConnected ? (
            <>
              <Button
                onClick={handleSaveCredentials}
                disabled={!clientId || !redirectUri}
              >
                Save Credentials
              </Button>
              <Button
                variant="outline"
                onClick={handleConnect}
                disabled={!clientId || !redirectUri || isTesting}
              >
                {isTesting ? "Connecting..." : "Connect Spotify"}
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          )}
        </div>

        {/* Note about PKCE and backend */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
            Uses PKCE OAuth flow (no client secret needed in browser)
          </p>
          <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
            Note: Credentials stored in localStorage for now. Backend integration coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
