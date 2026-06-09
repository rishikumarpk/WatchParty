import React, { useEffect, useRef, useState } from 'react';
import { socketService } from '../services/socket';

interface VideoPlayerProps {
  file: File;
  roomId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, roomId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const isRemoteUpdateRef = useRef(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const socket = socketService.socket;
    const video = videoRef.current;
    if (!socket || !video) return;

    // --- Socket Listeners ---
    const handleRoomState = (state: any) => {
      isRemoteUpdateRef.current = true;
      
      const delay = (Date.now() - state.serverTimestamp) / 1000;
      const targetTime = state.currentTime + delay;
      
      video.currentTime = targetTime;
      
      if (state.playing) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
      
      setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
    };

    const handlePlay = (data: any) => {
      isRemoteUpdateRef.current = true;
      const delay = (Date.now() - data.serverTimestamp) / 1000;
      video.currentTime = data.time + delay;
      video.play().catch(console.error);
      setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
    };

    const handlePause = (data: any) => {
      isRemoteUpdateRef.current = true;
      video.currentTime = data.time;
      video.pause();
      setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
    };

    const handleSeek = (data: any) => {
      isRemoteUpdateRef.current = true;
      const delay = (Date.now() - data.serverTimestamp) / 1000;
      video.currentTime = data.time + delay;
      setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
    };

    const handleSync = (data: any) => {
      if (!video || video.paused !== !data.playing) return;

      const delay = (Date.now() - data.serverTimestamp) / 1000;
      const serverTime = data.currentTime + delay;
      const diff = Math.abs(video.currentTime - serverTime);

      if (diff > 2) {
        // Large difference -> hard seek
        isRemoteUpdateRef.current = true;
        video.currentTime = serverTime;
        setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
      } else if (diff > 0.3) {
        // Medium difference -> adjust playback speed
        video.playbackRate = video.currentTime < serverTime ? 1.05 : 0.95;
      } else {
        // Small difference -> normal speed
        video.playbackRate = 1.0;
      }
    };

    socket.on('ROOM_STATE', handleRoomState);
    socket.on('VIDEO_PLAY', handlePlay);
    socket.on('VIDEO_PAUSE', handlePause);
    socket.on('VIDEO_SEEK', handleSeek);
    socket.on('VIDEO_SYNC', handleSync);

    return () => {
      socket.off('ROOM_STATE', handleRoomState);
      socket.off('VIDEO_PLAY', handlePlay);
      socket.off('VIDEO_PAUSE', handlePause);
      socket.off('VIDEO_SEEK', handleSeek);
      socket.off('VIDEO_SYNC', handleSync);
    };
  }, []);

  // --- Video DOM Listeners ---
  const onPlay = () => {
    if (isRemoteUpdateRef.current) return;
    socketService.socket?.emit('VIDEO_PLAY', {
      roomId,
      time: videoRef.current?.currentTime,
      timestamp: Date.now()
    });
  };

  const onPause = () => {
    if (isRemoteUpdateRef.current) return;
    socketService.socket?.emit('VIDEO_PAUSE', {
      roomId,
      time: videoRef.current?.currentTime
    });
  };

  const onSeeked = () => {
    if (isRemoteUpdateRef.current) return;
    socketService.socket?.emit('VIDEO_SEEK', {
      roomId,
      time: videoRef.current?.currentTime
    });
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        onPlay={onPlay}
        onPause={onPause}
        onSeeked={onSeeked}
        className="max-w-full max-h-full outline-none shadow-2xl"
      />
    </div>
  );
};

export default VideoPlayer;
