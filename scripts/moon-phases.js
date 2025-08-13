// Import Three.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class MoonPhasesGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sun = null;
        this.earth = null;
        this.moon = null;
        this.labels = [];
        this.moonAngle = 0;
        
        this.init();
        this.animate();
    }

    init() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);
        this.camera.position.set(8, 12, 20);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        const container = document.getElementById('canvas-container');
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 40;

        // Define sun position that will be used by both lights and the sun object
        this.sunPosition = new THREE.Vector3(15, 0, 0);
        
        this.setupLights();
        this.createCelestialBodies();
        this.setupEventListeners();
    }

    setupLights() {
        // Strong directional sunlight for moon phases
        const sunlight = new THREE.DirectionalLight(0xffffff, 3);
        sunlight.position.copy(this.sunPosition);
        this.scene.add(sunlight);
        this.sunLight = sunlight;  // Store reference for updating
        
        // Very dim ambient light to slightly illuminate dark side
        this.scene.add(new THREE.AmbientLight(0x444444, 0.1));
    }

    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            transparent: true
        });

        const starsVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
    }

    createOrbitLine(radius) {
        const segments = 64;
        const orbitGeometry = new THREE.BufferGeometry();
        const points = [];
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
        }
        
        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0x444444,
            transparent: true,
            opacity: 0.5
        });
        
        return new THREE.Line(orbitGeometry, orbitMaterial);
    }

    async createCelestialBodies() {
        this.createStarField();
        const loader = new THREE.TextureLoader();
        
        // Load textures from our own assets
        const earthTexture = await loader.loadAsync('/assets/textures/earth.jpg');
        const moonTexture = await loader.loadAsync('/assets/textures/moon.jpg');

        // Create Sun with glow
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.copy(this.sunPosition);
        this.scene.add(this.sun);

        // Add sun glow
        const glowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.15
        });
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(sunGlow);

        // Create Earth
        const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);

        // Create Moon with enhanced material for proper phase rendering
        const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({ 
            map: moonTexture,
            shininess: 0, // Remove specular highlights
            side: THREE.FrontSide,
            transparent: true
        });
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.scene.add(this.moon);
        
        // Add a dark side to the moon
        const moonDarkGeometry = new THREE.SphereGeometry(0.271, 32, 32);
        const moonDarkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.95
        });
        this.moonDarkSide = new THREE.Mesh(moonDarkGeometry, moonDarkMaterial);
        this.moon.add(this.moonDarkSide);

        // Add orbit lines
        const moonOrbit = this.createOrbitLine(3);
        this.scene.add(moonOrbit);

        // Create labels
        this.createLabels();
    }

    createLabels() {
        const createLabel = (text, position) => {
            const div = document.createElement('div');
            div.className = 'celestial-label';
            div.textContent = text;
            document.getElementById('canvas-container').appendChild(div);
            return { element: div, position };
        };

        this.labels = [
            createLabel('Sun', this.sun.position),
            createLabel('Earth', this.earth.position),
            createLabel('Moon', this.moon.position)
        ];
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            const container = document.getElementById('canvas-container');
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    updateMoonPosition() {
        this.moonAngle += 0.01;
        const moonOrbitRadius = 3;
        
        // Update moon position
        this.moon.position.set(
            Math.cos(this.moonAngle) * moonOrbitRadius,
            0,
            Math.sin(this.moonAngle) * moonOrbitRadius
        );

        // Make moon always face the camera for correct phase visualization
        const moonToCamera = new THREE.Vector3();
        moonToCamera.copy(this.camera.position).sub(this.moon.position).normalize();
        this.moon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), moonToCamera);
        
        // Update moon phase by rotating dark side
        const moonToSun = new THREE.Vector3();
        moonToSun.copy(this.sunPosition).sub(this.moon.position).normalize();
        const angleToSun = Math.atan2(moonToSun.z, moonToSun.x);
        this.moonDarkSide.rotation.y = angleToSun;
    }

    updateLabels() {
        this.labels.forEach(({ element, position }) => {
            const vector = position.clone().project(this.camera);
            const x = (vector.x * 0.5 + 0.5) * this.renderer.domElement.width;
            const y = (-vector.y * 0.5 + 0.5) * this.renderer.domElement.height;
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.updateMoonPosition();
        this.updateLabels();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MoonPhasesGame();
});
