(() => {
  const canvas = document.getElementById('solarCanvas');
  const ctx = canvas.getContext('2d');
  const infoBox = document.getElementById('infoBox');
  const pauseBtn = document.getElementById('pauseBtn');
  const legend = document.getElementById('legend');

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const sun = {
    name: 'Sun',
    radius: 30,
    color: 'yellow',
    facts: ['The Sun is a star at the center of our solar system.']
  };

  const planets = [
    { name: 'Mercury', a: 70, e: 0.6, size: 6, color: '#a9a9a9', angle: 0, baseSpeed: 4.15, orbitRotation: 45, facts: [
      'Mercury is the closest planet to the Sun.',
      'Mercury has a very thin atmosphere.',
      'A day on Mercury lasts about 59 Earth days.'
    ], factIndex: 0 },
    { name: 'Venus', a: 100, e: 0.3, size: 10, color: '#e6ccb2', angle: 0, baseSpeed: 1.62, orbitRotation: 15, facts: [
      'Venus is the hottest planet in the solar system.',
      'Venus rotates in the opposite direction to most planets.',
      'Venus is sometimes called Earth’s sister planet.'
    ], factIndex: 0 },
    { name: 'Earth', a: 140, e: 0.2, size: 11, color: '#2a6df4', angle: 0, baseSpeed: 1.0, orbitRotation: 60, facts: [
      'Earth is the only planet known to support life.',
      'Earth has one natural satellite, the Moon.',
      'About 71% of Earth’s surface is water.'
    ], factIndex: 0 },
    { name: 'Mars', a: 180, e: 0.4, size: 8, color: '#d14b2f', angle: 0, baseSpeed: 0.53, orbitRotation: 120, facts: [
      'Mars is called the Red Planet due to iron oxide on its surface.',
      'Mars has the tallest volcano in the solar system.',
      'Mars is the 4th planet from the Sun.'
    ], factIndex: 0 },
    { name: 'Jupiter', a: 240, e: 0.1, size: 20, color: '#c18a59', angle: 0, baseSpeed: 0.08, orbitRotation: 25, facts: [
      'Jupiter is the largest planet in the solar system.',
      'Jupiter has a giant red storm called the Great Red Spot.',
      'Jupiter has over 79 moons.'
    ], factIndex: 0 },
    { name: 'Saturn', a: 300, e: 0.15, size: 18, color: '#d9c185', angle: 0, baseSpeed: 0.034, orbitRotation: 80, facts: [
      'Saturn is famous for its extensive ring system.',
      'Saturn is the second largest planet.',
      'Saturn’s rings are mostly made of ice particles.'
    ], factIndex: 0 },
    { name: 'Uranus', a: 360, e: 0.12, size: 15, color: '#82d6e3', angle: 0, baseSpeed: 0.012, orbitRotation: 30, facts: [
      'Uranus rotates on its side.',
      'Uranus has a faint ring system.',
      'Uranus is often called an ice giant.'
    ], factIndex: 0 },
    { name: 'Neptune', a: 410, e: 0.05, size: 15, color: '#3355cc', angle: 0, baseSpeed: 0.006, orbitRotation: 70, facts: [
      'Neptune is the farthest planet from the Sun.',
      'Neptune has the strongest winds in the solar system.',
      'Neptune was discovered through mathematical prediction.'
    ], factIndex: 0 },
  ];

  // Generate legend content
  function createLegend() {
    planets.forEach(p => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      const colorDot = document.createElement('div');
      colorDot.className = 'legend-color';
      colorDot.style.backgroundColor = p.color;
      colorDot.style.boxShadow = `0 0 10px 2px ${p.color}`;
      item.appendChild(colorDot);
      const label = document.createElement('span');
      label.textContent = p.name;
      item.appendChild(label);
      legend.appendChild(item);
    });
  }

  createLegend();

  const centerX = () => canvas.width / 2;
  const centerY = () => canvas.height / 2;

  let draggingPlanet = null;
  let paused = false;

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

  function drawSun() {
    ctx.beginPath();
    ctx.arc(centerX(), centerY(), sun.radius, 0, Math.PI * 2);
    ctx.fillStyle = sun.color;
    ctx.shadowColor = 'yellow';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawOrbits() {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    planets.forEach(p => {
      const b = semiMinorAxis(p.a, p.e);
      ctx.save();
      ctx.translate(centerX(), centerY());
      ctx.rotate(degToRad(p.orbitRotation));
      ctx.beginPath();
      ctx.ellipse(0, 0, p.a, b, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawSaturnRing(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(degToRad(20));
    ctx.strokeStyle = 'rgba(210, 180, 140, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.8, size * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlanets() {
    planets.forEach(p => {
      const b = semiMinorAxis(p.a, p.e);
      const pos = pointOnRotatedEllipse(centerX(), centerY(), p.a, b, p.angle, p.orbitRotation);

      ctx.beginPath();
      if (p.name === 'Mars') {
        const grad = ctx.createRadialGradient(pos.x - p.size/3, pos.y - p.size/3, p.size / 5, pos.x, pos.y, p.size);
        grad.addColorStop(0, '#ff6666');
        grad.addColorStop(1, p.color);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = p.color;
      }
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (p.name === 'Earth') {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(100, 150, 255, 0.7)';
        ctx.shadowBlur = 10;
        ctx.arc(pos.x, pos.y, p.size + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (p.name === 'Saturn') {
        drawSaturnRing(pos.x, pos.y, p.size);
      }
    });
  }

  function isPointOnPlanet(x, y, planet) {
    const b = semiMinorAxis(planet.a, planet.e);
    const pos = pointOnRotatedEllipse(centerX(), centerY(), planet.a, b, planet.angle, planet.orbitRotation);
    const dx = x - pos.x;
    const dy = y - pos.y;
    return Math.sqrt(dx * dx + dy * dy) <= planet.size + 5;
  }

  function isPointOnSun(x, y) {
    const dx = x - centerX();
    const dy = y - centerY();
    return Math.sqrt(dx * dx + dy * dy) <= sun.radius + 5;
  }

  // Show multiple facts at once in styled info box
  function showInfoMultiple(facts, x, y, title) {
    infoBox.style.display = 'block';
    infoBox.style.left = `${x + 15}px`;
    infoBox.style.top = `${y + 15}px`;
    infoBox.style.padding = '12px 18px';
    infoBox.style.background = 'rgba(30, 30, 30, 0.9)';
    infoBox.style.borderRadius = '10px';
    infoBox.style.boxShadow = '0 0 12px rgba(255,255,255,0.3)';
    infoBox.innerHTML = `<strong>${title}</strong>` +
      `<ul>` +
      facts.map(fact => `<li>${fact}</li>`).join('') +
      `</ul>`;
  }

  function hideInfo() {
    infoBox.style.display = 'none';
  }

  let lastTime = 0;
  function animate(time=0) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawOrbits();
    drawSun();

    if (!paused && !draggingPlanet) {
      planets.forEach(p => {
        const b = semiMinorAxis(p.a, p.e);
        const dist = distanceOnRotatedEllipse(p.a, b, p.angle);
        const speedMod = (p.a * p.a) / (dist * dist);
        p.angle = (p.angle + p.baseSpeed * speedMod * delta * 60) % 360;
      });
    }
    drawPlanets();

    requestAnimationFrame(animate);
  }

  let isDragging = false;
  let dragStartAngle = 0;
  let dragStartMouseAngle = 0;

  function getAngleOnRotatedEllipseFromPoint(x, y, rotation) {
    const cx = centerX();
    const cy = centerY();

    const radRot = degToRad(-rotation);
    const dx = x - cx;
    const dy = y - cy;
    const xr = dx * Math.cos(radRot) - dy * Math.sin(radRot);
    const yr = dx * Math.sin(radRot) + dy * Math.cos(radRot);
    return radToDeg(Math.atan2(yr, xr));
  }

  function onPointerDown(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const p of planets) {
      if (isPointOnPlanet(x, y, p)) {
        draggingPlanet = p;
        isDragging = true;
        dragStartAngle = p.angle;
        dragStartMouseAngle = getAngleOnRotatedEllipseFromPoint(x, y, p.orbitRotation);
        hideInfo();
        return;
      }
    }
    if (isPointOnSun(x, y)) {
      showInfoMultiple(sun.facts, x, y, sun.name);
      return;
    }
    hideInfo();
  }

  function onPointerMove(e) {
    if (!isDragging || !draggingPlanet) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentMouseAngle = getAngleOnRotatedEllipseFromPoint(x, y, draggingPlanet.orbitRotation);
    let deltaAngle = currentMouseAngle - dragStartMouseAngle;

    if (deltaAngle > 180) deltaAngle -= 360;
    else if (deltaAngle < -180) deltaAngle += 360;

    draggingPlanet.angle = (dragStartAngle + deltaAngle + 360) % 360;
    showInfoMultiple(draggingPlanet.facts, x, y, draggingPlanet.name);
  }

  function onPointerUp(e) {
    if (isDragging) {
      isDragging = false;
      draggingPlanet = null;
      hideInfo();
    }
  }

  // Show all facts at once on click
  function onClick(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const p of planets) {
      if (isPointOnPlanet(x, y, p)) {
        showInfoMultiple(p.facts, x, y, p.name);
        return;
      }
    }
    if (isPointOnSun(x, y)) {
      showInfoMultiple(sun.facts, x, y, sun.name);
      return;
    }
    hideInfo();
  }

  // Pause/play button toggle
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Play' : 'Pause';
  });

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);
  canvas.addEventListener('click', onClick);

  animate();
})();
