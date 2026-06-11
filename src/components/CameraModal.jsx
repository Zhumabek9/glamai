import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RotateCw, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { useToast } from './Toast';

export default function CameraModal({ isOpen, onClose, onCapture, preferredFacingMode = 'user', fallbackTrigger }) {
  const toast = useToast();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [facingMode, setFacingMode] = useState(preferredFacingMode);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Check if multiple cameras exist to show/hide the switch camera button
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      })
      .catch(() => {});
  }, []);

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setIsReady(false);
    setError(null);

    const startCamera = async () => {
      // Clean up existing stream first
      stopStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (active) setError('WebRTC camera is not supported by your device or browser.');
        return;
      }

      try {
        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1080 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 1 } // Prefer square camera for profile/hairstyles
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsReady(true);
      } catch (err) {
        console.error('Camera error:', err);
        if (active) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Camera permission denied. Please allow camera access in your device/app settings.');
          } else {
            setError(`Could not access camera: ${err.message || 'Unknown error'}`);
          }
        }
      }
    };

    startCamera();

    return () => {
      active = false;
      stopStream();
    };
  }, [isOpen, facingMode]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!isReady || !videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Use natural video dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Mirror the front camera for intuitive selfie capture
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `captured_photo_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          onCapture(file);
          onClose();
        } else {
          toast.error('Failed to capture photo frame.');
        }
      }, 'image/jpeg', 0.95);

    } catch (err) {
      console.error('Capture error:', err);
      toast.error('Failed to capture photo.');
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000', // Pitch black for camera viewport immersion
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}
    >
      {/* Header / Top Bar */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1.5rem',
          zIndex: 10000,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
        }}
      >
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.02em' }}>
          {facingMode === 'user' ? 'Selfie Camera' : 'Rear Camera'}
        </span>
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            backdropFilter: 'blur(5px)',
            transition: 'background 0.2s'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Viewport Container */}
      <div 
        style={{
          width: '100%',
          maxWidth: '500px',
          height: '100%',
          maxHeight: '100vw', // Force a square box aspect on mobile
          position: 'relative',
          overflow: 'hidden',
          background: '#121212',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {error ? (
          <div 
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 75, 75, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff4b4b'
              }}
            >
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Camera Access Blocked</h3>
            <p style={{ fontSize: '0.88rem', color: '#b3b3b3', lineHeight: '1.5', maxWidth: '300px' }}>
              {error}
            </p>
            
            {/* Fallback button to use device system file picker */}
            {fallbackTrigger && (
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => fallbackTrigger(), 100);
                }}
                style={{
                  marginTop: '1rem',
                  background: 'var(--gradient-pink-purple, linear-gradient(135deg, #ff2e93, #a100ff))',
                  border: 'none',
                  borderRadius: '30px',
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 5px 15px rgba(255, 46, 147, 0.3)'
                }}
              >
                <ImageIcon size={16} />
                <span>Use Device File Chooser</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Live Camera Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                // Mirror video stream if it's the front camera
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
              }}
            />

            {/* Scanning/Overlay Guidelines for selfie framing */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '30px solid rgba(0, 0, 0, 0.4)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Oval guide for facial framing */}
              <div 
                style={{
                  width: '75%',
                  height: '75%',
                  borderRadius: '50% / 60%',
                  border: '2px dashed rgba(255, 46, 147, 0.5)',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Position face inside the frame
                </div>
              </div>
            </div>

            {/* Spinner before ready */}
            {!isReady && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: '#121212',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="spinner-outer" style={{ width: '50px', height: '50px', margin: 0 }}>
                  <div className="spinner-inner" style={{ width: '30px', height: '30px' }}></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer / Control Bar */}
      <div 
        style={{
          width: '100%',
          flex: 1,
          maxHeight: '120px',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          padding: '1rem',
          zIndex: 10000
        }}
      >
        {/* Placeholder to balance layout */}
        <div style={{ width: '48px' }}></div>

        {/* Shutter / Capture Button */}
        <button
          onClick={handleCapture}
          disabled={!isReady || !!error}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isReady ? 'pointer' : 'not-allowed',
            opacity: isReady ? 1 : 0.5,
            boxShadow: '0 0 20px rgba(255,255,255,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            outline: 'none',
            position: 'relative'
          }}
          onMouseDown={(e) => { if (isReady) e.currentTarget.style.transform = 'scale(0.9)'; }}
          onMouseUp={(e) => { if (isReady) e.currentTarget.style.transform = 'scale(1)'; }}
          onTouchStart={(e) => { if (isReady) e.currentTarget.style.transform = 'scale(0.9)'; }}
          onTouchEnd={(e) => { if (isReady) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {/* Inner ring */}
          <div 
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-pink-primary, #ff2e93)'
            }}
          >
            <Camera size={26} />
          </div>
        </button>

        {/* Switch Camera Button */}
        {hasMultipleCameras && !error ? (
          <button
            onClick={toggleFacingMode}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              backdropFilter: 'blur(5px)',
              transition: 'background 0.2s'
            }}
          >
            <RotateCw size={20} />
          </button>
        ) : (
          <div style={{ width: '48px' }}></div>
        )}
      </div>
    </div>
  );
}
