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

  // Define initial object properties
  const sun = {
    name: 'Sun',
    radius: 30,
    color: 'yellow',
    facts: ['The Sun is like a giant ball of fire that gives us light and keeps us warm!']
  };

  const planets = [
    { name: 'Mercury', a: 80, e: 0.4, size: 5, color: '#a9a9a9', angle: 0, baseSpeed: 4.15, orbitRotation: 45, facts: [
      'Mercury is the smallest planet!',
      'It\'s the closest planet to the Sun, so it\'s very hot!',
      'You could jump really high on Mercury because it\'s so small!'
    ], factIndex: 0 },
    { name: 'Venus', a: 120, e: 0.3, size: 10, color: '#e6ccb2', angle: 0, baseSpeed: 1.62, orbitRotation: 15, facts: [
      'Venus is the brightest planet in our night sky!',
      'It spins backward compared to other planets - how silly!',
      'Venus is about the same size as Earth!'
    ], factIndex: 0 },
    { name: 'Earth', a: 160, e: 0.2, size: 11, color: '#2a6df4', angle: 0, baseSpeed: 1.0, orbitRotation: 60, facts: [
      'Earth is our home planet - it\'s where we all live!',
      'Earth has one moon that lights up our night sky!',
      'Earth is covered in big oceans and green forests!'
    ], factIndex: 0 },
    { name: 'Mars', a: 200, e: 0.4, size: 8, color: '#d14b2f', angle: 0, baseSpeed: 0.53, orbitRotation: 120, facts: [
      'Mars is called the Red Planet because it looks red!',
      'Mars has big mountains and deep valleys!',
      'Mars has two tiny moons - that\'s twice as many as Earth!'
    ], factIndex: 0 },
    { name: 'Jupiter', a: 260, e: 0.1, size: 20, color: '#c18a59', angle: 0, baseSpeed: 0.08, orbitRotation: 25, facts: [
      'Jupiter is the biggest planet - it\'s huge!',
      'It has a big red spot that\'s like a giant storm!',
      'Jupiter has lots and lots of moons!'
    ], factIndex: 0 },
    { name: 'Saturn', a: 320, e: 0.15, size: 18, color: '#d9c185', angle: 0, baseSpeed: 0.034, orbitRotation: 80, facts: [
      'Saturn has beautiful rings around it!',
      'The rings are made of ice and rock - like a space necklace!',
      'Saturn is so light it could float in a giant bathtub!'
    ], factIndex: 0 },
    { name: 'Uranus', a: 380, e: 0.12, size: 15, color: '#82d6e3', angle: 0, baseSpeed: 0.012, orbitRotation: 30, facts: [
      'Uranus rolls like a ball as it moves around the Sun!',
      'It\'s a pretty blue-green color!',
      'It\'s very cold on Uranus - like a giant ice ball!'
    ], factIndex: 0 },
    { name: 'Neptune', a: 440, e: 0.05, size: 15, color: '#3355cc', angle: 0, baseSpeed: 0.006, orbitRotation: 70, facts: [
      'Neptune is the last planet in our solar system!',
      'It\'s a beautiful bright blue color!',
      'Neptune has super strong winds - like the biggest hurricane ever!'
    ], factIndex: 0 }
  ];

  // Store original sizes for scaling
  const originalSizes = {
    sun: { radius: sun.radius },
    planets: planets.map(p => ({ size: p.size, a: p.a }))
  };

  // Helper functions
  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function radToDeg(rad) {
    return rad * 180 / Math.PI;
  }

  function semiMinorAxis(a, e) {
    return a * Math.sqrt(1 - e * e);
  }

  function pointOnRotatedEllipse(cx, cy, a, b, angleDeg, rotationDeg) {
    const rad = degToRad(angleDeg);
    const rot = degToRad(rotationDeg);
    let x = a * Math.cos(rad);
    let y = b * Math.sin(rad);
    const xr = x * Math.cos(rot) - y * Math.sin(rot);
    const yr = x * Math.sin(rot) + y * Math.cos(rot);
    return { x: cx + xr, y: cy + yr };
  }

  function distanceOnRotatedEllipse(a, b, angleDeg) {
    const rad = degToRad(angleDeg);
    return Math.sqrt((a * Math.cos(rad))**2 + (b * Math.sin(rad))**2);
  }

  // Canvas functions
  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const minDimension = Math.min(canvas.width, canvas.height);
    const scale = minDimension / 900; // Adjusted scale factor
    
    sun.radius = originalSizes.sun.radius * scale;
    
    planets.forEach((p, index) => {
      const original = originalSizes.planets[index];
      p.size = original.size * scale;
      p.a = original.a * scale;
    });
  }

  // Drawing functions
  function drawPlanet(ctx, planet, x, y, size) {
    ctx.beginPath();
    if (planet.name === 'Mars') {
      const grad = ctx.createRadialGradient(x - size/3, y - size/3, size/5, x, y, size);
      grad.addColorStop(0, '#ff6666');
      grad.addColorStop(1, planet.color);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = planet.color;
    }
    ctx.shadowColor = planet.color;
    ctx.shadowBlur = 10;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    if (planet.name === 'Saturn') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(degToRad(20));
      ctx.strokeStyle = 'rgba(210, 180, 140, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.8, size * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (planet.name === 'Earth') {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(100, 150, 255, 0.7)';
      ctx.shadowBlur = 5;
      ctx.arc(x, y, size + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function animate(time = 0) {
    const delta = (time - state.lastTime) / 1000;
    state.lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Center the view
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    
    // Draw orbits
    planets.forEach(p => {
      const b = semiMinorAxis(p.a, p.e);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.ellipse(0, 0, p.a, b, degToRad(p.orbitRotation), 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw sun
    ctx.beginPath();
    ctx.fillStyle = sun.color;
    ctx.shadowColor = 'yellow';
    ctx.shadowBlur = 20;
    ctx.arc(0, 0, sun.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Update and draw planets
    if (!state.paused && !state.draggingPlanet) {
      planets.forEach(p => {
        const b = semiMinorAxis(p.a, p.e);
        const dist = distanceOnRotatedEllipse(p.a, b, p.angle);
        const speedMod = (p.a * p.a) / (dist * dist);
        p.angle = (p.angle + p.baseSpeed * speedMod * delta * 60) % 360;
      });
    }

    planets.forEach(p => {
      const b = semiMinorAxis(p.a, p.e);
      const pos = pointOnRotatedEllipse(0, 0, p.a, b, p.angle, p.orbitRotation);
      drawPlanet(ctx, p, pos.x, pos.y, p.size);
    });

    ctx.restore();
    requestAnimationFrame(animate);
  }

  // Info display
  function showInfo(facts, x, y, title) {
    const infoBox = document.getElementById('infoBox');
    infoBox.style.display = 'block';
    infoBox.innerHTML = `<strong>${title}</strong><ul>${facts.map(fact => `<li>${fact}</li>`).join('')}</ul>`;
  }

  function hideInfo() {
    const infoBox = document.getElementById('infoBox');
    infoBox.style.display = 'none';
  }

  // Interaction
  function isPointOnPlanet(x, y, planet) {
    const b = semiMinorAxis(planet.a, planet.e);
    const pos = pointOnRotatedEllipse(canvas.width/2, canvas.height/2, planet.a, b, planet.angle, planet.orbitRotation);
    const dx = x - pos.x;
    const dy = y - pos.y;
    return Math.sqrt(dx * dx + dy * dy) <= planet.size + 5;
  }

  function isPointOnSun(x, y) {
    const dx = x - canvas.width/2;
    const dy = y - canvas.height/2;
    return Math.sqrt(dx * dx + dy * dy) <= sun.radius + 5;
  }

  function getAngleOnRotatedEllipseFromPoint(x, y, rotation) {
    const cx = canvas.width/2;
    const cy = canvas.height/2;
    const radRot = degToRad(-rotation);
    const dx = x - cx;
    const dy = y - cy;
    const xr = dx * Math.cos(radRot) - dy * Math.sin(radRot);
    const yr = dx * Math.sin(radRot) + dy * Math.cos(radRot);
    return radToDeg(Math.atan2(yr, xr));
  }

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

      for (const p of planets) {
        if (isPointOnPlanet(x, y, p)) {
          showInfo(p.facts, clientX, clientY, p.name);
          return;
        }
      }
      if (isPointOnSun(x, y)) {
        showInfo(sun.facts, clientX, clientY, sun.name);
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
      
      // Only start actual dragging after a small delay or movement
      if (Date.now() - handlers.dragStartTime < 100) return;

      const coords = handlers.getEventCoords(e);
      const { x, y } = coords;

      const currentMouseAngle = getAngleOnRotatedEllipseFromPoint(x, y, state.draggingPlanet.orbitRotation);
      let deltaAngle = currentMouseAngle - state.dragStartMouseAngle;

      if (deltaAngle > 180) deltaAngle -= 360;
      else if (deltaAngle < -180) deltaAngle += 360;

      state.draggingPlanet.angle = (state.dragStartAngle + deltaAngle + 360) % 360;
    },

    onPointerUp(e) {
      if (state.isDragging) {
        // If this was a quick tap, treat it as a click
        if (Date.now() - handlers.dragStartTime < 100) {
          handlers.onClick(e);
        }
        state.isDragging = false;
        state.draggingPlanet = null;
        hideInfo();
      }
    }
  };

  // Create legend
  function createLegend() {
    const legend = document.getElementById('legend');
    if (!legend) return;
    
    const legendItems = document.createElement('div');
    legendItems.className = 'legend-items';
    legend.appendChild(legendItems);

    // Add Sun to legend
    const sunItem = document.createElement('div');
    sunItem.className = 'legend-item';
    
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 40;
    sunCanvas.height = 40;
    sunCanvas.className = 'legend-planet';
    const sunCtx = sunCanvas.getContext('2d');
    
    sunCtx.translate(sunCanvas.width/2, sunCanvas.height/2);
    sunCtx.fillStyle = 'yellow';
    sunCtx.beginPath();
    sunCtx.arc(0, 0, 12, 0, Math.PI * 2);
    sunCtx.fill();
    
    sunItem.appendChild(sunCanvas);
    const sunLabel = document.createElement('span');
    sunLabel.textContent = sun.name;
    sunItem.appendChild(sunLabel);
    legendItems.appendChild(sunItem);
    
    planets.forEach(p => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      canvas.className = 'legend-planet';
      const ctx = canvas.getContext('2d');
      
      ctx.translate(canvas.width/2, canvas.height/2);
      drawPlanet(ctx, p, 0, 0, 8);
      
      item.appendChild(canvas);
      const label = document.createElement('span');
      label.textContent = p.name;
      item.appendChild(label);
      legendItems.appendChild(item);
    });
  }

  // Event listeners
  canvas.addEventListener('pointerdown', handlers.onPointerDown.bind(handlers));
  canvas.addEventListener('pointermove', handlers.onPointerMove.bind(handlers));
  canvas.addEventListener('pointerup', handlers.onPointerUp.bind(handlers));
  canvas.addEventListener('pointerleave', handlers.onPointerUp.bind(handlers));
  canvas.addEventListener('click', handlers.onClick.bind(handlers));

  pauseBtn.addEventListener('click', () => {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? 'Play' : 'Pause';
  });

  window.addEventListener('resize', resize);

  // Initialize
  window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    createLegend();
    resize();
    requestAnimationFrame(animate);
  });
})();
