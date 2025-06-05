
// Video compression utility using WebCodecs API
export interface CompressionSettings {
  quality: 'high' | 'medium' | 'low';
  targetSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressionProgress {
  progress: number;
  originalSize: number;
  estimatedSize: number;
  status: 'preparing' | 'compressing' | 'completed' | 'error';
}

export const COMPRESSION_PRESETS = {
  high: { quality: 0.8, maxWidth: 1920, maxHeight: 1080, bitrate: 5000000 },
  medium: { quality: 0.6, maxWidth: 1280, maxHeight: 720, bitrate: 2500000 },
  low: { quality: 0.4, maxWidth: 854, maxHeight: 480, bitrate: 1000000 }
};

export const isCompressionSupported = (): boolean => {
  return 'VideoEncoder' in window && 'VideoDecoder' in window;
};

export const compressVideo = async (
  file: File,
  settings: CompressionSettings,
  onProgress?: (progress: CompressionProgress) => void
): Promise<File> => {
  if (!isCompressionSupported()) {
    console.log('WebCodecs not supported, returning original file');
    return file;
  }

  const preset = COMPRESSION_PRESETS[settings.quality];
  
  try {
    onProgress?.({
      progress: 0,
      originalSize: file.size,
      estimatedSize: file.size * preset.quality,
      status: 'preparing'
    });

    // Create video element to get dimensions
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    // Calculate output dimensions
    const aspectRatio = video.videoWidth / video.videoHeight;
    let outputWidth = Math.min(video.videoWidth, preset.maxWidth || 1920);
    let outputHeight = Math.min(video.videoHeight, preset.maxHeight || 1080);

    if (outputWidth / outputHeight > aspectRatio) {
      outputWidth = outputHeight * aspectRatio;
    } else {
      outputHeight = outputWidth / aspectRatio;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    onProgress?.({
      progress: 25,
      originalSize: file.size,
      estimatedSize: file.size * preset.quality,
      status: 'compressing'
    });

    // Use MediaRecorder for compression (more widely supported)
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: preset.bitrate
    });

    const chunks: Blob[] = [];
    
    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([compressedBlob], 
          file.name.replace(/\.[^/.]+$/, '_compressed.webm'), 
          { type: 'video/webm' }
        );

        onProgress?.({
          progress: 100,
          originalSize: file.size,
          estimatedSize: compressedFile.size,
          status: 'completed'
        });

        resolve(compressedFile);
      };

      mediaRecorder.onerror = reject;

      // Start recording
      mediaRecorder.start();

      // Play video and draw frames
      let frameCount = 0;
      const totalFrames = Math.floor(video.duration * 30); // Assuming 30fps
      
      video.currentTime = 0;
      video.play();

      video.ontimeupdate = () => {
        ctx.drawImage(video, 0, 0, outputWidth, outputHeight);
        frameCount++;
        
        const progress = 25 + (frameCount / totalFrames) * 70;
        onProgress?.({
          progress: Math.min(progress, 95),
          originalSize: file.size,
          estimatedSize: file.size * preset.quality,
          status: 'compressing'
        });

        if (video.ended) {
          mediaRecorder.stop();
          video.pause();
        }
      };

      // Stop after video duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          video.pause();
        }
      }, (video.duration + 1) * 1000);
    });

  } catch (error) {
    console.error('Compression failed:', error);
    onProgress?.({
      progress: 0,
      originalSize: file.size,
      estimatedSize: file.size,
      status: 'error'
    });
    return file; // Return original file on error
  }
};

export const estimateCompressionTime = (fileSizeMB: number): number => {
  // Rough estimation: 1MB = ~3 seconds compression time
  return Math.max(10, fileSizeMB * 3);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
