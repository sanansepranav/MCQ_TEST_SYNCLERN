import { useEffect, useRef, useCallback } from 'react';

const useProctor = (isActive, onViolation) => {
  const submittedRef = useRef(false);
  const activeRef = useRef(false);
  const graceRef = useRef(true);
  const listenersRef = useRef(false);

  // Keep activeRef in sync
  useEffect(() => {
    activeRef.current = isActive;
    console.log('Proctor active:', isActive);
  }, [isActive]);

  const fireViolation = useCallback((type) => {
    console.log('fireViolation called:', type, {
      submitted: submittedRef.current,
      active: activeRef.current,
      grace: graceRef.current
    });

    if (submittedRef.current) {
      console.log('Already submitted, skip');
      return;
    }
    if (!activeRef.current) {
      console.log('Test not active, skip');
      return;
    }
    if (graceRef.current) {
      console.log('In grace period, skip');
      return;
    }

    submittedRef.current = true;
    console.log('VIOLATION FIRING:', type);
    onViolation(type);
  }, [onViolation]);

  useEffect(() => {
    if (!isActive) {
      console.log('Proctor: test not active');
      return;
    }

    console.log('Proctor: setting up listeners');
    
    // Grace period: 3 seconds
    graceRef.current = true;
    submittedRef.current = false;
    
    const graceTimer = setTimeout(() => {
      graceRef.current = false;
      console.log('Proctor: grace period ended');
    }, 3000);

    // Request fullscreen after 1 second
    const fsTimer = setTimeout(async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          console.log('Fullscreen activated');
        }
      } catch(e) {
        console.log('Fullscreen failed:', e);
      }
    }, 1000);

    // ── Fullscreen exit ──
    const onFSChange = () => {
      console.log('Fullscreen changed:', !!document.fullscreenElement);
      if (!document.fullscreenElement) {
        fireViolation('fullscreen-exit');
      }
    };

    // ── Tab switch ──
    const onVisChange = () => {
      console.log('VISIBILITY CHANGE:', {
        hidden: document.hidden,
        state: document.visibilityState,
        active: activeRef.current,
        grace: graceRef.current,
        submitted: submittedRef.current
      });
      if (document.hidden) {
        fireViolation('tab-switch');
      }
    };

    // ── Window blur ──
    // Use timeout to avoid fullscreen transition false positives
    let blurTimer = null;
    const onBlur = () => {
      console.log('WINDOW BLUR:', {
        active: activeRef.current,
        grace: graceRef.current
      });
      blurTimer = setTimeout(() => {
        // Only fire if window still not focused
        if (document.visibilityState !== 'hidden') {
          fireViolation('window-blur');
        }
      }, 1000);
    };

    const onFocus = () => {
      console.log('Window focus');
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
    };

    // ── Keyboard shortcuts ──
    const onKeyDown = (e) => {
      const block = (
        e.key === 'F5' ||
        (e.ctrlKey && ['r','R','t','T','w','W','n','N','f','F','c','a'].includes(e.key)) ||
        (e.altKey && ['F4','Tab'].includes(e.key))
      );
      if (block) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Blocked key:', e.key);
      }
    };

    // ── Right click ──
    const onContext = (e) => {
      e.preventDefault();
    };

    // ── Before unload ──
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Test in progress. Sure you want to leave?';
      return e.returnValue;
    };

    // Attach all listeners
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContext);
    window.addEventListener('beforeunload', onBeforeUnload);

    listenersRef.current = true;
    console.log('Proctor: all listeners attached');

    // Cleanup
    return () => {
      console.log('Proctor: cleanup');
      clearTimeout(graceTimer);
      clearTimeout(fsTimer);
      if (blurTimer) clearTimeout(blurTimer);

      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContext);
      window.removeEventListener('beforeunload', onBeforeUnload);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isActive, fireViolation]);
};

export default useProctor;
