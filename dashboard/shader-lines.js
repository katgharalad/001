/**
 * Shader Lines Background Component
 * Vanilla JavaScript version for static HTML dashboard
 * Creates animated shader lines effect using Three.js
 */

class ShaderLines {
    constructor(container) {
        this.container = container;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.uniforms = null;
        this.animationId = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized || !this.container) {
            console.log('Shader init skipped - initialized:', this.initialized, 'container:', !!this.container);
            return;
        }

        console.log('Initializing shader lines...');

        // Check for THREE.js availability using window.THREE
        if (typeof window.THREE === 'undefined' || !window.THREE || !window.THREE.WebGLRenderer) {
            console.log('Loading Three.js...');
            this.loadThreeJS().then(() => {
                console.log('Three.js loaded, initializing shader...');
                this.initThreeJS();
            }).catch((error) => {
                console.error('Failed to load Three.js:', error);
            });
        } else {
            console.log('Three.js already loaded, initializing shader...');
            this.initThreeJS();
        }
    }

    loadThreeJS() {
        return new Promise((resolve, reject) => {
            // Check if already loaded using window.THREE
            if (typeof window.THREE !== 'undefined' && window.THREE && window.THREE.WebGLRenderer) {
                console.log('Three.js already available');
                resolve();
                return;
            }

            // Check if script already exists
            const existingScript = document.querySelector('script[src*="three.js"]');
            if (existingScript) {
                console.log('Three.js script already exists, waiting for load...');
                if (typeof window.THREE !== 'undefined' && window.THREE) {
                    resolve();
                } else {
                    existingScript.addEventListener('load', () => {
                        setTimeout(() => {
                            if (typeof window.THREE !== 'undefined' && window.THREE) {
                                resolve();
                            } else {
                                reject(new Error('THREE.js failed to load'));
                            }
                        }, 100);
                    });
                }
                return;
            }

            console.log('Loading Three.js from CDN...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                console.log('Three.js script loaded, waiting for THREE object...');
                // Wait a bit for THREE to be fully available
                let attempts = 0;
                const checkThree = setInterval(() => {
                    attempts++;
                    if (typeof window.THREE !== 'undefined' && window.THREE && window.THREE.WebGLRenderer) {
                        console.log('Three.js is now available!');
                        clearInterval(checkThree);
                        resolve();
                    } else if (attempts > 20) {
                        clearInterval(checkThree);
                        console.error('Three.js failed to initialize after 2 seconds');
                        reject(new Error('THREE.js failed to load'));
                    }
                }, 100);
            };
            script.onerror = (error) => {
                console.error('Failed to load Three.js script:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    initThreeJS() {
        if (!this.container) {
            console.error('Container not found');
            return;
        }

        // Check for THREE.js availability
        if (typeof window.THREE === 'undefined') {
            console.error('Three.js not loaded - window.THREE is undefined');
            return;
        }

        const THREE = window.THREE;

        if (!THREE.WebGLRenderer) {
            console.error('Three.js WebGLRenderer not available');
            return;
        }

        // Clear container
        this.container.innerHTML = '';

        // Initialize camera
        this.camera = new THREE.Camera();
        this.camera.position.z = 1;

        // Initialize scene
        this.scene = new THREE.Scene();

        // Create geometry (use BufferGeometry for older Three.js versions)
        let geometry;
        if (THREE.PlaneGeometry) {
            geometry = new THREE.PlaneGeometry(2, 2);
        } else if (THREE.PlaneBufferGeometry) {
            geometry = new THREE.PlaneBufferGeometry(2, 2);
        } else {
            console.error('PlaneGeometry not available');
            return;
        }

        // Define uniforms
        this.uniforms = {
            time: { type: 'f', value: 1.0 },
            resolution: { type: 'v2', value: new THREE.Vector2() },
        };

        // Vertex shader
        const vertexShader = `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `;

        // Fragment shader
        const fragmentShader = `
            #define TWO_PI 6.2831853072
            #define PI 3.14159265359

            precision highp float;
            uniform vec2 resolution;
            uniform float time;

            float random(in float x) {
                return fract(sin(x) * 1e4);
            }

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            void main(void) {
                vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

                vec2 fMosaicScal = vec2(4.0, 2.0);
                vec2 vScreenSize = vec2(256.0, 256.0);
                uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
                uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

                float t = time * 0.06 + random(uv.x) * 0.4;
                float lineWidth = 0.0008;

                vec3 color = vec3(0.0);
                for(int j = 0; j < 3; j++) {
                    for(int i = 0; i < 5; i++) {
                        color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 1.0 - length(uv));
                    }
                }

                gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
            }
        `;

        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        // Create mesh and add to scene
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 1); // Black opaque background
        
        // Set initial size
        const rect = this.container.getBoundingClientRect();
        this.renderer.setSize(rect.width || window.innerWidth, rect.height || window.innerHeight);
        this.uniforms.resolution.value.x = this.renderer.domElement.width;
        this.uniforms.resolution.value.y = this.renderer.domElement.height;
        
        this.container.appendChild(this.renderer.domElement);
        console.log('Shader renderer initialized, canvas size:', this.renderer.domElement.width, 'x', this.renderer.domElement.height);

        // Handle resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize(), false);

        // Start animation
        this.animate();
        this.initialized = true;
    }

    handleResize() {
        if (!this.container || !this.renderer) return;

        const rect = this.container.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        
        if (this.uniforms && this.uniforms.resolution) {
            this.uniforms.resolution.value.x = this.renderer.domElement.width;
            this.uniforms.resolution.value.y = this.renderer.domElement.height;
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.uniforms && this.uniforms.time) {
            this.uniforms.time.value += 0.05;
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
            this.renderer = null;
        }

        this.scene = null;
        this.camera = null;
        this.uniforms = null;
        this.initialized = false;
    }
}

