class JSLogo {
    constructor() {
        this.container = document.getElementById('logo-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.controls = null;
        this.jsLogo = null;
        this.particles = [];
        this.particleSystem = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
        this.addParticleSystem();
        this.addEventListeners();

        // Add resize listener for particle responsiveness
        window.addEventListener('resize', () => this.handleResize());
    }

    init() {
        // Setup renderer with container size
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 6;

        // Setup controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add lights
        this.setupLighting();

        // Create JS Logo
        this.createLogo();

        // Add environment map
        this.addEnvironmentMap();

        // Start animation
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLighting() {
        // Ambient light - softer
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Main directional light - stronger and better positioned
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(3, 3, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.radius = 3;
        mainLight.shadow.bias = -0.0001;
        this.scene.add(mainLight);

        // Rim light for better edge definition
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight.position.set(-5, 0, -5);
        this.scene.add(rimLight);

        // Subtle colored point lights
        const colors = [0xffcc00, 0xffe066, 0xffd700];
        colors.forEach((color, index) => {
            const light = new THREE.PointLight(color, 0.3, 15);
            light.position.set(
                Math.cos(index * Math.PI * 2 / 3) * 5,
                Math.sin(index * Math.PI * 2 / 3) * 5,
                2
            );
            this.scene.add(light);
        });
    }

    addEnvironmentMap() {
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const environmentMap = cubeTextureLoader.load([
            'https://threejs.org/examples/textures/cube/Park2/posx.jpg',
            'https://threejs.org/examples/textures/cube/Park2/negx.jpg',
            'https://threejs.org/examples/textures/cube/Park2/posy.jpg',
            'https://threejs.org/examples/textures/cube/Park2/negy.jpg',
            'https://threejs.org/examples/textures/cube/Park2/posz.jpg',
            'https://threejs.org/examples/textures/cube/Park2/negz.jpg',
        ]);
        this.scene.environment = environmentMap;
    }

    createLogo() {
        const loader = new THREE.FontLoader();
        
        loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            const textGeometry = new THREE.TextGeometry('JS', {
                font: font,
                size: 3,
                height: 0.4,
                curveSegments: 32,
                bevelEnabled: true,
                bevelThickness: 0.15,
                bevelSize: 0.04,
                bevelOffset: 0,
                bevelSegments: 8
            });

            textGeometry.center();

            // Enhanced material for better definition
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xf7df1e,
                metalness: 0.3,
                roughness: 0.2,
                reflectivity: 0.8,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                envMapIntensity: 1.0,
                side: THREE.FrontSide,
                flatShading: false,
                transparent: false,
                opacity: 1
            });

            this.jsLogo = new THREE.Mesh(textGeometry, material);
            this.jsLogo.castShadow = true;
            this.jsLogo.receiveShadow = true;
            
            // Subtle initial rotation
            this.jsLogo.rotation.x = 0.1;
            this.scene.add(this.jsLogo);

            // Add enhanced glow effect with adjusted parameters
            this.addGlowEffect();
        });
    }

    addGlowEffect() {
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                coefficient: { value: 0.15 },
                color: { value: new THREE.Color(0xf7df1e) },
                power: { value: 2.0 },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float coefficient;
                uniform float power;
                uniform vec3 color;
                uniform float time;
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                void main() {
                    float intensity = pow(coefficient - dot(vPositionNormal, vNormal), power);
                    intensity *= 1.0 + 0.1 * sin(time * 2.0);
                    gl_FragColor = vec4(color, intensity * 0.5);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            side: THREE.BackSide
        });

        const glowGeometry = this.jsLogo.geometry.clone();
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.scale.multiplyScalar(1.1);
        glowMesh.renderOrder = 0;
        this.scene.add(glowMesh);

        this.jsLogo.renderOrder = 1;
    }

    addParticleSystem() {
        // Ajuste del número de partículas según el dispositivo
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 1000 : 2500; // Reducido de 5500 a 3500/2000
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const lifetimes = new Float32Array(particleCount);

        const color1 = new THREE.Color(0xf7df1e); // JavaScript yellow
        const color2 = new THREE.Color(0xffd700); // Gold
        const color3 = new THREE.Color(0xffa500); // Orange for variety
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Create particles in a more interesting distribution
            const radius = Math.random() * 4 + 1; // Varied radius
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            positions[i] = radius * Math.sin(theta) * Math.cos(phi);
            positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i + 2] = radius * Math.cos(theta);

            // Reduced velocities for slower movement
            velocities[i] = (Math.random() - 0.5) * 0.015;     // Reduced from 0.03
            velocities[i + 1] = (Math.random() - 0.5) * 0.015; // Reduced from 0.03
            velocities[i + 2] = (Math.random() - 0.5) * 0.015; // Reduced from 0.03

            // Color interpolation between three colors
            const mixFactor = Math.random();
            let particleColor;
            if (mixFactor < 0.33) {
                particleColor = new THREE.Color().lerpColors(color1, color2, mixFactor * 3);
            } else if (mixFactor < 0.66) {
                particleColor = new THREE.Color().lerpColors(color2, color3, (mixFactor - 0.33) * 3);
            } else {
                particleColor = new THREE.Color().lerpColors(color3, color1, (mixFactor - 0.66) * 3);
            }
            
            colors[i] = particleColor.r;
            colors[i + 1] = particleColor.g;
            colors[i + 2] = particleColor.b;

            // Ajuste de tamaños de partículas
            sizes[i / 3] = isMobile ? 
                (Math.random() * 0.16 + 0.08) : // Tamaño más grande para móvil
                (Math.random() * 0.15 + 0.01);   // Tamaño más grande para desktop
            

            // Initialize random lifetimes for particles
            lifetimes[i / 3] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

        // Enhanced shader material with responsive sizes
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                containerRadius: { value: 5.0 },
                isMobile: { value: window.innerWidth < 768 ? 1.0 : 0.0 } // New uniform for mobile detection
            },
            vertexShader: `
                attribute vec3 color;
                attribute float size;
                attribute float lifetime;
                varying vec3 vColor;
                varying float vLifetime;
                varying float vDistance;
                uniform float time;
                uniform float pixelRatio;
                uniform float isMobile;
                
                void main() {
                    vColor = color;
                    vLifetime = lifetime;
                    vec3 pos = position;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    float mobileScale = isMobile > 0.5 ? 0.7 : 1.0; // Aumentado de 0.5 a 0.7 para móvil
                    float particleSize = size * (450.0 / -mvPosition.z) * pixelRatio * mobileScale; // Aumentado de 350.0 a 450.0
                    gl_PointSize = particleSize * (0.8 + 0.4 * sin(time * 3.0 + lifetime * 10.0));
                    gl_Position = projectionMatrix * mvPosition;
                    
                    vDistance = length(pos);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vLifetime;
                varying float vDistance;
                uniform float containerRadius;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float pulse = 0.8 + 0.2 * sin(vLifetime * 20.0);
                    float alpha = (1.0 - smoothstep(0.45, 0.5, dist)) * pulse;
                    
                    // Fade out particles near the container boundary
                    float fadeStart = containerRadius * 0.7;
                    float fadeEnd = containerRadius;
                    float fadeAlpha = 1.0 - smoothstep(fadeStart, fadeEnd, vDistance);
                    
                    // Reduced brightness by using original color without multiplication
                    vec3 finalColor = vColor;
                    gl_FragColor = vec4(finalColor, alpha * fadeAlpha * 0.6); // Reduced opacity from 0.9 to 0.6
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.particleSystem = new THREE.Points(geometry, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    updateParticles() {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.geometry.attributes.velocity.array;
        const lifetimes = this.particleSystem.geometry.attributes.lifetime.array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < positions.length; i += 3) {
            // Update lifetimes more slowly
            lifetimes[i / 3] += 0.002; // Reduced from 0.005
            if (lifetimes[i / 3] > 1) {
                lifetimes[i / 3] = 0;
                // Reset particle to a new random position when lifetime ends
                const radius = Math.random() * 4 + 1;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI * 2;

                positions[i] = radius * Math.sin(theta) * Math.cos(phi);
                positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
                positions[i + 2] = radius * Math.cos(theta);

                // Give new random velocities with more speed
                velocities[i] = (Math.random() - 0.5) * 0.015;     // Reduced from 0.03
                velocities[i + 1] = (Math.random() - 0.5) * 0.015; // Reduced from 0.03
                velocities[i + 2] = (Math.random() - 0.5) * 0.015; // Reduced from 0.03
                continue;
            }

            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            const radius = Math.sqrt(x * x + y * y + z * z);
            const swirlingSpeed = (5 - radius) * 0.001; // Reduced from 0.003
            
            // Reduced motion patterns
            positions[i] += velocities[i] + 
                Math.sin(time + x + lifetimes[i/3] * 3) * 0.01 +  // Reduced multipliers and frequency
                Math.cos(time * 0.3) * 0.005;
            positions[i + 1] += velocities[i + 1] + 
                Math.cos(time + y + lifetimes[i/3] * 3) * 0.01 + 
                Math.sin(time * 0.3) * 0.005;
            positions[i + 2] += velocities[i + 2] + 
                Math.sin(time * 0.5 + lifetimes[i/3] * 3) * 0.005;

            // Enhanced swirling motion with varied patterns
            const angle = swirlingSpeed * (1 + Math.sin(time * 0.5 + lifetimes[i/3] * 3) * 0.2);
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);
            
            const tempX = positions[i];
            positions[i] = tempX * cosAngle - z * sinAngle;
            positions[i + 2] = tempX * sinAngle + z * cosAngle;

            // Reduced outward force even more
            const outwardForce = 0.00015; // Reduced from 0.0002
            velocities[i] += (positions[i] / radius) * outwardForce;
            velocities[i + 1] += (positions[i + 1] / radius) * outwardForce;
            velocities[i + 2] += (positions[i + 2] / radius) * outwardForce;

            // Reduced random velocity changes
            if (Math.random() < 0.01) {  // Reduced chance from 0.02
                velocities[i] += (Math.random() - 0.5) * 0.01;    // Reduced from 0.02
                velocities[i + 1] += (Math.random() - 0.5) * 0.01;
                velocities[i + 2] += (Math.random() - 0.5) * 0.01;
            }
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.lifetime.needsUpdate = true;
        this.particleSystem.material.uniforms.time.value = time;
    }

    addEventListeners() {
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
            this.mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }

        if (this.jsLogo) {
            // Subtle floating animation
            this.jsLogo.position.y = Math.sin(Date.now() * 0.001) * 0.1;
            
            // Mouse interaction
            this.jsLogo.rotation.x += (this.mouseY - this.jsLogo.rotation.x) * 0.05;
            this.jsLogo.rotation.y += (this.mouseX - this.jsLogo.rotation.y) * 0.05;
        }

        // Update particles
        if (this.particleSystem) {
            this.updateParticles();
        }

        // Update glow effect
        const glowMaterial = this.scene.children.find(child => child.material && child.material.type === 'ShaderMaterial');
        if (glowMaterial) {
            glowMaterial.material.uniforms.time.value = Date.now() * 0.001;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    handleResize() {
        // Update particle material for mobile responsiveness
        if (this.particleSystem) {
            this.particleSystem.material.uniforms.isMobile.value = window.innerWidth < 768 ? 1.0 : 0.0;
        }
        
        // Existing resize handling
        if (this.container) {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }
}

// Initialize the 3D logo when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JSLogo();
}); 