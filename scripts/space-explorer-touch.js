(() => {
  // Get DOM elements
  const canvas = document.getElementById('solarCanvas');
  const ctx = canvas.getContext('2d');
  const infoBox = document.getElementById('infoBox');
  const pauseBtn = document.getElementById('pauseBtn');

  // Game state
  const state = {
    lastTime: 0,
    draggingPlanet: null,
    paused: false,
    isDragging: false,
    dragStartAngle: 0,
    dragStartMouseAngle: 0,
    lastTapTime: 0,
    lastTouchX: 0,
    lastTouchY: 0
  };

  // Event handlers
  const handlers = {
    dragStartTime: 0,

    // Helper function to handle both mouse and touch coordinates
    getEventCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const coords = e.touches ? e.touches[0] : e;
      return {
        x: coords.clientX - rect.left,
        y: coords.clientY - rect.top,
        clientX: coords.clientX,
        clientY: coords.clientY
      };
    },
    
    onClick(e) {
      e.preventDefault();
      const coords = handlers.getEventCoords(e);
      const { x, y, clientX, clientY } = coords;

      // Check for double-tap on touch devices
      const now = Date.now();
      if (e.touches && now - state.lastTapTime < 300) {
        return; // Prevent double-tap zoom
      }
      state.lastTapTime = now;

      // Update info box position to center of canvas
      const canvasRect = canvas.getBoundingClientRect();
      const infoX = canvasRect.left + (canvasRect.width / 2);
      const infoY = canvasRect.top + (canvasRect.height / 2);

      for (const p of planets) {
        if (isPointOnPlanet(x, y, p)) {
          showInfo(p.facts, infoX, infoY, p.name);
          return;
        }
      }
      if (isPointOnSun(x, y)) {
        showInfo(sun.facts, infoX, infoY, sun.name);
        return;
      }
      hideInfo();
    },

    onPointerDown(e) {
      e.preventDefault();
      handlers.dragStartTime = Date.now();
      const coords = handlers.getEventCoords(e);
      const { x, y } = coords;

      // Store touch coordinates for distance calculation
      if (e.touches) {
        state.lastTouchX = x;
        state.lastTouchY = y;
      }

      for (const p of planets) {
        if (isPointOnPlanet(x, y, p)) {
          state.draggingPlanet = p;
          state.isDragging = true;
          state.dragStartAngle = p.angle;
          state.dragStartMouseAngle = getAngleOnRotatedEllipseFromPoint(x, y, p.orbitRotation);
          return;
        }
      }
    },

    onPointerMove(e) {
      if (!state.isDragging || !state.draggingPlanet) return;
      e.preventDefault();
      
      const coords = handlers.getEventCoords(e);
      const { x, y } = coords;

      if (e.touches) {
        // Calculate touch movement distance
        const dx = x - state.lastTouchX;
        const dy = y - state.lastTouchY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update last touch position
        state.lastTouchX = x;
        state.lastTouchY = y;
        
        // If movement is too small, ignore it (prevents accidental moves)
        if (distance < 5) return;
      }

      const currentAngle = getAngleOnRotatedEllipseFromPoint(x, y, state.draggingPlanet.orbitRotation);
      let angleDiff = currentAngle - state.dragStartMouseAngle;
      state.draggingPlanet.angle = state.dragStartAngle + angleDiff;
    }
  };

  // Setup event listeners for both mouse and touch
  function setupEventListeners() {
    // Touch events
    canvas.addEventListener('touchstart', handlers.onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlers.onPointerMove, { passive: false });
    canvas.addEventListener('touchend', () => {
      state.isDragging = false;
      state.draggingPlanet = null;
    });
    canvas.addEventListener('touchcancel', () => {
      state.isDragging = false;
      state.draggingPlanet = null;
    });

    // Tap handler for info display
    canvas.addEventListener('touchend', (e) => {
      if (Date.now() - handlers.dragStartTime < 200) {
        handlers.onClick(e);
      }
    });

    // Mouse events
    canvas.addEventListener('click', handlers.onClick);
    canvas.addEventListener('mousedown', handlers.onPointerDown);
    canvas.addEventListener('mousemove', handlers.onPointerMove);
    canvas.addEventListener('mouseup', () => {
      state.isDragging = false;
      state.draggingPlanet = null;
    });
    canvas.addEventListener('mouseleave', () => {
      state.isDragging = false;
      state.draggingPlanet = null;
    });

    // Prevent unwanted touch behaviors
    canvas.addEventListener('gesturestart', e => e.preventDefault());
    canvas.addEventListener('gesturechange', e => e.preventDefault());
    canvas.addEventListener('gestureend', e => e.preventDefault());
  }

  // Initialize everything
  setupCanvas();
  createLegend();
  setupEventListeners();
  requestAnimationFrame(animate);
})();
