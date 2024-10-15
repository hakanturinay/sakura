import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * --- Debug UI ---
 */
const gui = new GUI();
const parametersUI = { materialColor: '#ffeded' };

// GUI controls for changing material color
gui.addColor(parametersUI, 'materialColor').onChange(() => {
    material.color.set(parametersUI.materialColor);
    particlesMaterial.color.set(parametersUI.materialColor);
});

/**
 * --- Scene Setup ---
 */
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

/**
 * --- Texture & Material Setup ---
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

const alphaTexture = textureLoader.load('textures/ALPHA_04.jpg');
alphaTexture.flipY = false;

const material = new THREE.MeshToonMaterial({
    color: parametersUI.materialColor,
    gradientMap: gradientTexture,
});

/**
 * --- 3D Model ---
 */
const gltfLoader = new GLTFLoader();
let mixer = null;
let animationAction = null;
let scrollTargetTime = 0; 
let smoothTime = 0;

// Load GLTF model and set up animation
gltfLoader.load('/models/sakura_9.glb', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.y = -0.3;
    gltf.scene.scale.set(1.1, 1.1, 1.1);

    const frontMidMesh = gltf.scene.getObjectByName('FrontMid');
    if (frontMidMesh) {
        frontMidMesh.material.alphaMap = alphaTexture;
        frontMidMesh.material.transparent = true;
    }

    mixer = new THREE.AnimationMixer(gltf.scene);
    const animationClip = gltf.animations[0]; // Assuming the model has animations
    animationAction = mixer.clipAction(animationClip);
    animationAction.play();
    animationAction.paused = true; // Pause initially to be controlled by scroll
});

/**
 * --- Lights ---
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);


/**
 * --- Camera & Renderer Setup ---
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', onWindowResize);

// Camera Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * --- Scroll Handling ---
 */
window.addEventListener('scroll', onScroll);

function onScroll() {
    if (!animationAction) return;

    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = 1 - (currentScrollY / maxScroll); // Invert scroll direction

    const duration = animationAction.getClip().duration;
    scrollTargetTime = scrollPercent * duration; // Set target time based on scroll
}

/**
 * --- Resize Handler ---
 */
function onWindowResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * --- Lerp Function ---
 * Linearly interpolates between two values.
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * --- Animation Loop ---
 * Main rendering and animation function.
 */
const clock = new THREE.Clock();
let previousTime = 0;

function tick() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    if (mixer) {
        mixer.update(deltaTime);

        const smoothingFactor = 0.04;
        smoothTime = lerp(smoothTime, scrollTargetTime, smoothingFactor);
        animationAction.time = smoothTime;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();