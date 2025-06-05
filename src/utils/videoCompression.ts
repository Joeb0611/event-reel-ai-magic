// Video compression utility using WebCodecs API
export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
}

export interface CompressionProgress {
  progress: number;
  originalSize: number;
  estimatedSize: number;
  status: 'preparing' | 'compressing' | 'completed' | 'error';
}

export const isCompressionSupported = (): boolean => {
  return 'MediaRecorder' in window;
};

export const compressVideo = async (
  file: File,
  settings: CompressionSettings,
  onProgress?: (progress: CompressionProgress) => void
): Promise<File> => {
  if (!isCompressionSupported()) {
    console.log('MediaRecorder not supported, returning original file');
    return file;
  }

  try {
    onProgress?.({
      progress: 0,
      originalSize: file.size,
      estimatedSize: file.size * settings.quality,
      status: 'preparing'
    });

    // Create video element to get video properties
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });

    onProgress?.({
      progress: 25,
      originalSize: file.size,
      estimatedSize: file.size * settings.quality,
      status: 'compressing'
    });

    // Create canvas and stream for compression
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    // Keep original resolution but compress quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const stream = canvas.captureStream(30);
    
    // Calculate bitrate based on quality setting
    const baseBitrate = 2500000; // 2.5 Mbps base
    const targetBitrate = Math.floor(baseBitrate * settings.quality);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: targetBitrate
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
      const fps = 30;
      const totalFrames = Math.floor(video.duration * fps);
      
      video.currentTime = 0;
      video.play();

      video.ontimeupdate = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frameCount++;
        
        const progress = 25 + (frameCount / totalFrames) * 70;
        onProgress?.({
          progress: Math.min(progress, 95),
          originalSize: file.size,
          estimatedSize: file.size * settings.quality,
          status: 'compressing'
        });

        if (video.ended) {
          mediaRecorder.stop();
          video.pause();
          URL.revokeObjectURL(video.src);
        }
      };

      // Stop after video duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          video.pause();
          URL.revokeObjectURL(video.src);
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

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
