"use client";

import { useState, useEffect } from "react";
import { Folder, Upload, Music, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  supportsFileSystemAccess,
  pickAudioFiles,
  pickAudioDirectory,
  extractMetadataFromFiles,
  AudioFileMetadata,
} from "@/lib/file-system";
import { batchEnrichMetadata } from "@/lib/metadata-api";

export function LocalFilesSettings() {
  const [supportsFileSystem, setSupportsFileSystem] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<Map<string, AudioFileMetadata>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");

  useEffect(() => {
    // Check for File System Access API support
    setSupportsFileSystem(supportsFileSystemAccess());
  }, []);

  const handleFolderPicker = async () => {
    if (!supportsFileSystem) {
      alert("File System Access API not supported in your browser");
      return;
    }

    try {
      const files = await pickAudioDirectory();

      if (files.length > 0) {
        setSelectedFiles(files);
        setScanProgress(`Found ${files.length} audio file(s)`);

        // Automatically extract metadata
        const extractedMetadata = await extractMetadataFromFiles(files);
        setMetadata(extractedMetadata);
      }
    } catch (err) {
      console.error('Error selecting folder:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter(f => f.type.startsWith('audio/'));

    if (audioFiles.length > 0) {
      setSelectedFiles(audioFiles);
      setScanProgress(`Selected ${audioFiles.length} file(s)`);

      // Extract metadata
      const extractedMetadata = await extractMetadataFromFiles(audioFiles);
      setMetadata(extractedMetadata);
    }
  };

  const handleScanMetadata = async () => {
    if (selectedFiles.length === 0) {
      alert("Please add some files first");
      return;
    }

    setIsScanning(true);
    setScanProgress("Enriching metadata from online sources...");

    try {
      // Convert metadata map to array for batch enrichment
      const metadataArray = Array.from(metadata.values());

      // Enrich with MusicBrainz/Cover Art Archive
      const enrichedData = await batchEnrichMetadata(metadataArray);

      setScanProgress(`Enriched ${enrichedData.length} tracks`);
      setIsScanning(false);

      // TODO: Update metadata with enriched data and store
      console.log("Enriched metadata:", enrichedData);
    } catch (err) {
      console.error('Error enriching metadata:', err);
      setIsScanning(false);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="border-gray-200/60 dark:border-neutral-800/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-600 dark:text-purple-500" />
          <CardTitle>Local Music Files</CardTitle>
        </div>
        <CardDescription>
          Add music from your computer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Compatibility Info */}
        {!supportsFileSystem && (
          <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <AlertDescription className="text-yellow-900 dark:text-yellow-100 text-sm">
              <p className="font-medium mb-1">Limited Browser Support</p>
              <p>Your browser doesn't support the File System Access API. You can still upload files individually.</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Add Folder (File System Access API) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Add Music Folder</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-500">
                Select a folder to scan for music files
              </p>
            </div>
            <Button
              onClick={handleFolderPicker}
              disabled={!supportsFileSystem}
              variant="outline"
            >
              <Folder className="h-4 w-4 mr-2" />
              Choose Folder
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-neutral-950 px-2 text-gray-500 dark:text-neutral-500">
              Or
            </span>
          </div>
        </div>

        {/* Upload Files (Traditional File Input) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Upload Files</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-500">
                Select individual audio files
              </p>
            </div>
            <label>
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </span>
              </Button>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                {selectedFiles.length} file(s) selected
                {metadata.size > 0 && ` - ${metadata.size} tracks with metadata`}
              </AlertDescription>
            </Alert>
          )}

          {scanProgress && (
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <AlertDescription className="text-green-900 dark:text-green-100 text-sm">
                {scanProgress}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Metadata Enrichment */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Metadata Enrichment</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-500">
                Enhance track info with online databases
              </p>
            </div>
            <Button
              onClick={handleScanMetadata}
              disabled={selectedFiles.length === 0 || isScanning}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan Metadata'}
            </Button>
          </div>

          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Uses MusicBrainz, Last.fm, and Cover Art Archive for album art and metadata
          </p>
        </div>

        {/* Implementation Note */}
        <p className="text-sm text-gray-500 dark:text-neutral-500 italic">
          Note: Files will be stored using IndexedDB handles once implementation is complete.
        </p>
      </CardContent>
    </Card>
  );
}
