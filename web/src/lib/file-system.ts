/**
 * File System Access API utilities for local music file handling
 */

import jsmediatags from 'jsmediatags';
import { get, set, del } from 'idb-keyval';

export interface AudioFileMetadata {
  title: string;
  artist: string;
  album: string;
  year?: string;
  genre?: string;
  duration?: number;
  picture?: {
    data: Uint8Array;
    format: string;
  };
}

export interface StoredFileHandle {
  id: string;
  name: string;
  path?: string;
  lastModified: number;
  size: number;
  type: string;
  metadata?: AudioFileMetadata;
}

/**
 * Check if browser supports File System Access API
 */
export function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

/**
 * Open file picker for audio files
 */
export async function pickAudioFiles(multiple = true): Promise<File[]> {
  if (!supportsFileSystemAccess()) {
    throw new Error('File System Access API not supported');
  }

  try {
    // @ts-ignore - File System Access API
    const handles = await window.showOpenFilePicker({
      types: [{
        description: 'Audio Files',
        accept: {
          'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']
        }
      }],
      multiple,
    });

    const files: File[] = [];
    for (const handle of handles) {
      const file = await handle.getFile();
      files.push(file);
    }

    return files;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return []; // User cancelled
    }
    throw err;
  }
}

/**
 * Open directory picker and scan for audio files
 */
export async function pickAudioDirectory(): Promise<File[]> {
  if (!supportsFileSystemAccess()) {
    throw new Error('File System Access API not supported');
  }

  try {
    // @ts-ignore - File System Access API
    const dirHandle = await window.showDirectoryPicker();

    const audioFiles: File[] = [];
    await scanDirectory(dirHandle, audioFiles);

    return audioFiles;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return []; // User cancelled
    }
    throw err;
  }
}

/**
 * Recursively scan directory for audio files
 */
async function scanDirectory(dirHandle: any, audioFiles: File[], depth = 0): Promise<void> {
  // Limit recursion depth to avoid infinite loops
  if (depth > 5) return;

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (file.type.startsWith('audio/')) {
        audioFiles.push(file);
      }
    } else if (entry.kind === 'directory') {
      await scanDirectory(entry, audioFiles, depth + 1);
    }
  }
}

/**
 * Extract metadata from audio file using ID3 tags
 */
export async function extractMetadata(file: File): Promise<AudioFileMetadata> {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => {
        const tags = tag.tags;

        const metadata: AudioFileMetadata = {
          title: tags.title || file.name.replace(/\.[^/.]+$/, ''),
          artist: tags.artist || 'Unknown Artist',
          album: tags.album || 'Unknown Album',
          year: tags.year,
          genre: tags.genre,
        };

        // Extract album art if available
        if (tags.picture) {
          metadata.picture = {
            data: new Uint8Array(tags.picture.data),
            format: tags.picture.format,
          };
        }

        resolve(metadata);
      },
      onError: (error) => {
        console.error('Error reading metadata:', error);
        // Return basic metadata from filename
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
        });
      }
    });
  });
}

/**
 * Extract metadata from multiple files
 */
export async function extractMetadataFromFiles(files: File[]): Promise<Map<string, AudioFileMetadata>> {
  const metadataMap = new Map<string, AudioFileMetadata>();

  const promises = files.map(async (file) => {
    const metadata = await extractMetadata(file);
    metadataMap.set(file.name, metadata);
  });

  await Promise.all(promises);
  return metadataMap;
}

/**
 * Store file handles in IndexedDB for later access
 */
export async function storeFileHandle(handle: any, metadata?: AudioFileMetadata): Promise<string> {
  const file = await handle.getFile();
  const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const storedHandle: StoredFileHandle = {
    id,
    name: file.name,
    lastModified: file.lastModified,
    size: file.size,
    type: file.type,
    metadata,
  };

  // Store both the handle and its metadata
  await set(`handle-${id}`, handle);
  await set(`metadata-${id}`, storedHandle);

  return id;
}

/**
 * Retrieve stored file handle from IndexedDB
 */
export async function getFileHandle(id: string): Promise<any | null> {
  try {
    const handle = await get(`handle-${id}`);
    if (!handle) return null;

    // Check if permission is still granted
    const permission = await handle.queryPermission({ mode: 'read' });
    if (permission === 'granted') {
      return handle;
    } else if (permission === 'prompt') {
      // Request permission again
      const newPermission = await handle.requestPermission({ mode: 'read' });
      if (newPermission === 'granted') {
        return handle;
      }
    }

    return null;
  } catch (err) {
    console.error('Error retrieving file handle:', err);
    return null;
  }
}

/**
 * Get all stored file metadata
 */
export async function getAllStoredFiles(): Promise<StoredFileHandle[]> {
  // This is a simplified version - in production, you'd want a better way to track all keys
  const handles: StoredFileHandle[] = [];

  // For now, return empty array - would need proper key management
  return handles;
}

/**
 * Delete stored file handle
 */
export async function deleteFileHandle(id: string): Promise<void> {
  await del(`handle-${id}`);
  await del(`metadata-${id}`);
}

/**
 * Create Blob URL from file for playback
 */
export function createAudioUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke Blob URL to free memory
 */
export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}
