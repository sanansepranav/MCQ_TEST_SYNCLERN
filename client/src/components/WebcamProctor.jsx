import { useEffect, useRef, useState, useCallback } from 'react';
import {
  HiOutlineVideoCamera,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlineArrowsPointingOut,
} from 'react-icons/hi2';

// Simple sound alert using Web Audio API (no external audio assets required)
const playAlertSound = (type = 'warning') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type === 'danger' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(type === 'danger' ? 880 : 587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(type === 'danger' ? 440 : 880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
};

/**
 * AI Webcam Proctoring Component
 * Strictly activates camera ONLY while test is in progress.
 * Shuts off all camera tracks immediately when test finishes or unmounts.
 */
const WebcamProctor = ({
  isActive = true,
  onViolation = () => {},
  maxWarnings = 3,
  requireFullscreen = true,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const intervalRef = useRef(null);

  // Proctor state
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [proctorStatus, setProctorStatus] = useState('initializing'); // 'verified' | 'no-face' | 'multiple-faces' | 'looking-away' | 'initializing'
  const [statusMessage, setStatusMessage] = useState('Initializing AI Proctor...');
  const [warningCount, setWarningCount] = useState(0);
  const [activeAlert, setActiveAlert] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [faceBoxes, setFaceBoxes] = useState([]);

  // Consecutive counters to prevent instantaneous false positives
  const consecutiveFailuresRef = useRef({ noFace: 0, multiFace: 0, lookAway: 0 });
  const lastViolationTimeRef = useRef(0);
  const warningCountRef = useRef(0);

  // ─────────────────────────────────────────────────────────────
  // 1. Camera Lifecycle: Start on mount (if active), Stop on unmount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      try {
        console.log('[WebcamProctor] Requesting camera access for test...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          // Unmounted before getUserMedia resolved: clean up immediately
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(() => {});
            setCameraReady(true);
            setProctorStatus('verified');
            setStatusMessage('Face Verified');
          };
        }
      } catch (err) {
        console.error('[WebcamProctor] Camera permission denied or unavailable:', err);
        if (isMounted) {
          setCameraError(err.message || 'Unable to access webcam. Please allow camera permissions.');
          setProctorStatus('no-face');
          setStatusMessage('Camera Access Denied');
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isActive]);

  const stopCamera = () => {
    console.log('[WebcamProctor] Stopping camera tracks...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          console.log('[WebcamProctor] Stopped track:', track.kind, track.label);
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  // ─────────────────────────────────────────────────────────────
  // 2. Fullscreen Listener
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleFSChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && isActive) {
        triggerWarning(
          'fullscreen-exit',
          'Fullscreen exited! Please return to Fullscreen mode immediately.'
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, [isActive]);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen request rejected:', e);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. Trigger Warning & Strike Evaluation
  // ─────────────────────────────────────────────────────────────
  const triggerWarning = useCallback(
    (violationType, message) => {
      const now = Date.now();
      // Throttle warnings to once every 4 seconds to avoid spamming
      if (now - lastViolationTimeRef.current < 4000) return;
      lastViolationTimeRef.current = now;

      playAlertSound('danger');

      const nextWarnings = warningCountRef.current + 1;
      warningCountRef.current = nextWarnings;
      setWarningCount(nextWarnings);

      setActiveAlert({
        type: violationType,
        message,
        strike: nextWarnings,
        maxStrikes: maxWarnings,
      });

      // Call parent handler
      onViolation(violationType, message);

      // Auto-dismiss the overlay alert after 3.5 seconds
      setTimeout(() => {
        setActiveAlert((prev) => (prev?.strike === nextWarnings ? null : prev));
      }, 3500);

      // If strikes exceed threshold, notify severe violation
      if (nextWarnings >= maxWarnings) {
        onViolation('camera-cheating-detected', 'Exceeded maximum proctoring violation warnings');
      }
    },
    [maxWarnings, onViolation]
  );

  // ─────────────────────────────────────────────────────────────
  // 4. AI Face & Person Detection Engine
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraReady || !isActive) return;

    let hasNativeDetector = false;
    let nativeDetector = null;

    if ('FaceDetector' in window) {
      try {
        nativeDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
        hasNativeDetector = true;
        console.log('[WebcamProctor] Native FaceDetector enabled');
      } catch (e) {
        hasNativeDetector = false;
      }
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const detectLoop = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        if (hasNativeDetector && nativeDetector) {
          // Native browser FaceDetector
          const faces = await nativeDetector.detect(video);
          evaluateNativeDetections(faces, video.videoWidth, video.videoHeight);
        } else {
          // High-performance Canvas Computer Vision Fallback
          ctx.drawImage(video, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          evaluateCanvasCV(frame);
        }
      } catch (err) {
        // Fallback to Canvas CV if native detection throws
        try {
          ctx.drawImage(video, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          evaluateCanvasCV(frame);
        } catch (e) {}
      }
    };

    // Run detection every 750ms
    intervalRef.current = setInterval(detectLoop, 750);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraReady, isActive]);

  // Evaluate Native Faces
  const evaluateNativeDetections = (faces, vW, vH) => {
    if (!faces || faces.length === 0) {
      consecutiveFailuresRef.current.noFace++;
      consecutiveFailuresRef.current.multiFace = 0;
      setFaceBoxes([]);

      if (consecutiveFailuresRef.current.noFace >= 3) {
        setProctorStatus('no-face');
        setStatusMessage('⚠️ No Face Detected');
        triggerWarning('no-face-detected', 'No face detected in webcam! Please face the screen.');
      }
      return;
    }

    if (faces.length > 1) {
      consecutiveFailuresRef.current.multiFace++;
      consecutiveFailuresRef.current.noFace = 0;
      setFaceBoxes(
        faces.map((f) => ({
          x: (f.boundingBox.x / vW) * 100,
          y: (f.boundingBox.y / vH) * 100,
          w: (f.boundingBox.width / vW) * 100,
          h: (f.boundingBox.height / vH) * 100,
          isViolation: true,
        }))
      );

      if (consecutiveFailuresRef.current.multiFace >= 2) {
        setProctorStatus('multiple-faces');
        setStatusMessage('🚨 Multiple People Detected!');
        triggerWarning(
          'multiple-faces-detected',
          'Multiple people detected in webcam! Exam must be taken alone.'
        );
      }
      return;
    }

    // Exactly 1 face
    consecutiveFailuresRef.current.noFace = 0;
    consecutiveFailuresRef.current.multiFace = 0;

    const face = faces[0];
    const box = face.boundingBox;
    const centerX = box.x + box.width / 2;
    const normCenterX = centerX / vW;

    // Check if looking far away / leaning out of frame
    if (normCenterX < 0.15 || normCenterX > 0.85) {
      consecutiveFailuresRef.current.lookAway++;
      if (consecutiveFailuresRef.current.lookAway >= 3) {
        setProctorStatus('looking-away');
        setStatusMessage('⚠️ Looking Away from Screen');
        triggerWarning('looking-away', 'You are looking away from the exam screen.');
      }
    } else {
      consecutiveFailuresRef.current.lookAway = 0;
      setProctorStatus('verified');
      setStatusMessage('● Face Verified (1 Person)');
    }

    setFaceBoxes([
      {
        x: (box.x / vW) * 100,
        y: (box.y / vH) * 100,
        w: (box.width / vW) * 100,
        h: (box.height / vH) * 100,
        isViolation: false,
      },
    ]);
  };

  // Evaluate Canvas Computer Vision Fallback
  const evaluateCanvasCV = (frame) => {
    const data = frame.data;
    const w = frame.width;
    const h = frame.height;
    const totalPixels = w * h;

    let skinPixels = 0;
    let sumX = 0;
    let sumY = 0;
    let leftSkin = 0;
    let rightSkin = 0;
    const midX = w / 2;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelIdx = i / 4;
      const x = pixelIdx % w;
      const y = Math.floor(pixelIdx / w);

      // Human skin-tone color model
      const isSkin =
        r > 85 &&
        g > 35 &&
        b > 20 &&
        Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
        Math.abs(r - g) > 12 &&
        r > g &&
        r > b;

      if (isSkin) {
        skinPixels++;
        sumX += x;
        sumY += y;
        if (x < midX - 10) leftSkin++;
        else if (x > midX + 10) rightSkin++;
      }
    }

    const skinRatio = skinPixels / totalPixels;

    // Condition 1: No person detected / camera obstructed
    if (skinRatio < 0.03) {
      consecutiveFailuresRef.current.noFace++;
      consecutiveFailuresRef.current.multiFace = 0;
      setFaceBoxes([]);

      if (consecutiveFailuresRef.current.noFace >= 3) {
        setProctorStatus('no-face');
        setStatusMessage('⚠️ No Face Detected');
        triggerWarning('no-face-detected', 'No face detected in webcam! Please face the screen.');
      }
      return;
    }

    // Condition 2: Multiple distinct person clusters
    // If both left and right quadrants have independent large skin clusters
    const leftRatio = leftSkin / (totalPixels / 2);
    const rightRatio = rightSkin / (totalPixels / 2);

    if (skinRatio > 0.38 && leftRatio > 0.22 && rightRatio > 0.22) {
      consecutiveFailuresRef.current.multiFace++;
      consecutiveFailuresRef.current.noFace = 0;

      if (consecutiveFailuresRef.current.multiFace >= 2) {
        setProctorStatus('multiple-faces');
        setStatusMessage('🚨 Multiple People Detected!');
        triggerWarning(
          'multiple-faces-detected',
          'Multiple people detected in webcam! Exam must be taken alone.'
        );
      }
      return;
    }

    // Condition 3: Exactly 1 person centered
    consecutiveFailuresRef.current.noFace = 0;
    consecutiveFailuresRef.current.multiFace = 0;

    const avgX = sumX / skinPixels;
    const normX = avgX / w;

    if (normX < 0.18 || normX > 0.82) {
      consecutiveFailuresRef.current.lookAway++;
      if (consecutiveFailuresRef.current.lookAway >= 3) {
        setProctorStatus('looking-away');
        setStatusMessage('⚠️ Looking Away from Screen');
        triggerWarning('looking-away', 'You are looking away from the exam screen.');
      }
    } else {
      consecutiveFailuresRef.current.lookAway = 0;
      setProctorStatus('verified');
      setStatusMessage('● Face Verified (1 Person)');
    }

    // Rough bounding box representation
    const avgY = sumY / skinPixels;
    setFaceBoxes([
      {
        x: Math.max(5, ((avgX - 25) / w) * 100),
        y: Math.max(5, ((avgY - 30) / h) * 100),
        w: 35,
        h: 50,
        isViolation: proctorStatus !== 'verified',
      },
    ]);
  };

  const getStatusColor = () => {
    switch (proctorStatus) {
      case 'verified':
        return '#10b981'; // Green
      case 'no-face':
        return '#f59e0b'; // Amber
      case 'multiple-faces':
        return '#ef4444'; // Red
      case 'looking-away':
        return '#f97316'; // Orange
      default:
        return '#3b82f6'; // Blue
    }
  };

  if (!isActive) return null;

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. Fullscreen Warning Banner (if student leaves fullscreen)
         ───────────────────────────────────────────────────────────── */}
      {requireFullscreen && !isFullscreen && cameraReady && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999999,
            background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
            color: '#ffffff',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HiOutlineExclamationTriangle size={24} style={{ color: '#fef08a' }} />
            <div>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>
                FULLSCREEN REQUIRED FOR PROCTORED EXAM
              </span>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                Exiting fullscreen is logged as a violation. Please return to fullscreen.
              </p>
            </div>
          </div>
          <button
            onClick={requestFullscreen}
            style={{
              background: '#ffffff',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HiOutlineArrowsPointingOut size={16} />
            Re-enter Fullscreen
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. Full-Screen Violation Warning Overlay (Active Alerts)
         ───────────────────────────────────────────────────────────── */}
      {activeAlert && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999999,
            maxWidth: '540px',
            width: '90%',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: `2px solid ${activeAlert.type === 'multiple-faces-detected' ? '#ef4444' : '#f59e0b'}`,
            borderRadius: '16px',
            padding: '18px 24px',
            color: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            animation: 'pulseBorder 1s infinite alternate',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background:
                activeAlert.type === 'multiple-faces-detected'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {activeAlert.type === 'multiple-faces-detected' ? (
              <HiOutlineUserGroup size={28} color="#ef4444" />
            ) : activeAlert.type === 'looking-away' ? (
              <HiOutlineEye size={28} color="#f97316" />
            ) : (
              <HiOutlineExclamationTriangle size={28} color="#f59e0b" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color:
                    activeAlert.type === 'multiple-faces-detected' ? '#ef4444' : '#f59e0b',
                }}
              >
                AI PROCTOR WARNING
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                Strike {activeAlert.strike} / {activeAlert.maxStrikes}
              </span>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '1.4',
              }}
            >
              {activeAlert.message}
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. Floating Picture-in-Picture Live Webcam Widget
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          width: '210px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          border: `2px solid ${getStatusColor()}`,
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          transition: 'border-color 0.25s, box-shadow 0.25s',
          userSelect: 'none',
          pointerEvents: 'auto',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getStatusColor(),
                boxShadow: `0 0 8px ${getStatusColor()}`,
                animation: proctorStatus !== 'verified' ? 'blink 0.8s infinite' : 'none',
              }}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              AI PROCTOR
            </span>
          </div>

          <span
            style={{
              fontSize: '10px',
              color: warningCount > 0 ? '#ef4444' : '#94a3b8',
              fontWeight: '700',
            }}
          >
            Strikes: {warningCount}/{maxWarnings}
          </span>
        </div>

        {/* Live Video Frame with Target Reticles */}
        <div style={{ position: 'relative', width: '100%', height: '140px', background: '#000000' }}>
          {cameraError ? (
            <div
              style={{
                padding: '16px 12px',
                textAlign: 'center',
                color: '#ef4444',
                fontSize: '11px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <HiOutlineVideoCamera size={24} style={{ marginBottom: '6px' }} />
              <span>Camera Error</span>
              <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                Please check permissions
              </span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror feed
                }}
              />

              {/* Bounding Box / Detection Reticle Overlays */}
              {faceBoxes.map((box, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                    border: `2px solid ${box.isViolation ? '#ef4444' : '#10b981'}`,
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    boxShadow: `0 0 10px ${box.isViolation ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.4)'}`,
                    transition: 'all 0.15s ease-out',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      left: '0',
                      background: box.isViolation ? '#ef4444' : '#10b981',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: '800',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {box.isViolation ? 'UNKNOWN' : 'EXAMINEE'}
                  </span>
                </div>
              ))}

              {/* Corner reticles for HUD look */}
              <div
                style={{
                  position: 'absolute',
                  inset: '8px',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                }}
              />
            </>
          )}
        </div>

        {/* Bottom Status Pill */}
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: '600',
            color: getStatusColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          {proctorStatus === 'verified' && <HiOutlineShieldCheck size={13} />}
          {proctorStatus === 'multiple-faces' && <HiOutlineUserGroup size={13} />}
          {proctorStatus === 'no-face' && <HiOutlineExclamationTriangle size={13} />}
          {proctorStatus === 'looking-away' && <HiOutlineEye size={13} />}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {statusMessage}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pulseBorder {
          0% { box-shadow: 0 0 20px rgba(239,68,68,0.4); }
          100% { box-shadow: 0 0 35px rgba(239,68,68,0.8); }
        }
      `}</style>
    </>
  );
};

export default WebcamProctor;
