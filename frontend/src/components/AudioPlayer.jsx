import React, { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ audioUrl, autoPlay = false, volume = 0.5 }) {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = isMuted ? 0 : currentVolume;
      if (autoPlay) {
        // Try to play, but don't fail silently - show controls if autoplay fails
        audioRef.current.play().catch(() => {
          console.log('Autoplay blocked, showing manual controls');
        });
      }
    }
  }, [audioUrl, autoPlay, currentVolume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : currentVolume;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setCurrentVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(() => {});
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="audio-controls" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      background: '#222',
      padding: '8px',
      borderRadius: '8px',
      border: '2px solid #ff0'
    }}>
      <audio ref={audioRef} preload="metadata" />
      <button
        onClick={playSound}
        style={{
          padding: '8px 12px',
          fontSize: '16px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        title="Play Winner Cry"
      >
        🎵 PLAY
      </button>
      <button
        onClick={toggleMute}
        style={{
          padding: '6px 10px',
          fontSize: '14px',
          background: isMuted ? '#dc3545' : '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? '🔇 MUTE' : '🔊 UNMUTE'}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: '#fff', fontSize: '12px' }}>VOL:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={currentVolume}
          onChange={handleVolumeChange}
          style={{ width: '80px' }}
          title="Volume"
        />
      </div>
    </div>
  );
}