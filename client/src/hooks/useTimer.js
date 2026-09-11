import { useState, useEffect, useRef } from 'react';

const useTimer = (totalSeconds, onExpire) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds || 0);
  const intervalRef = useRef(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!totalSeconds || totalSeconds <= 0) return;
    setSecondsLeft(totalSeconds);
    expiredRef.current = false;

    console.log('useTimer started:', {
      totalSeconds,
      display: `${Math.floor(totalSeconds/60)}:${String(totalSeconds%60).padStart(2,'0')}`
    });
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!expiredRef.current && totalSeconds > 0) {
        expiredRef.current = true;
        onExpire && onExpire();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire && onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [secondsLeft === totalSeconds]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const displayTime = 
    `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  const isWarning = secondsLeft <= 300;
  const isCritical = secondsLeft <= 60;

  return { 
    secondsLeft,
    displayTime, 
    isWarning, 
    isCritical 
  };
};

export default useTimer;
