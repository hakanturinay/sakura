import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * --- Debug UI ---
 */
// const gui = new GUI();
// const parametersUI = { materialColor: '#ffeded' };

// // GUI controls for changing material color
// gui.addColor(parametersUI, 'materialColor').onChange(() => {
//     material.color.set(parametersUI.materialColor);
//     particlesMaterial.color.set(parametersUI.materialColor);
// });

/**
 * --- LOADING MANAGER---
 */
// Set up the loading manager
const loadingManager = new THREE.LoadingManager();

// Set up loading progress callback
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  console.log(`Loading file: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} files.`);
};
// Function to scroll to the bottom of the page
const scrollToBottom = () => window.scrollTo(0, document.body.scrollHeight);
const loadingScreen = document.getElementById('loading-screen');
const landingPage = document.getElementById('landing-page');
const goUpBtn = document.getElementById("goUpBtn");
const navbar = document.querySelector('.navbar')
// Set up loading completion callback
loadingManager.onLoad = function () {
    setTimeout(scrollToBottom, 100);

    // Transition for loading screen
    loadingScreen.classList.add('fade-out');
    landingPage.classList.add('fade-in');
    
    const leafSection = document.getElementById('leaf-section');
  
    // Add the fade-in class when the page has loaded
    setTimeout(() => {
        navbar.style.visibility = 'visible';
        leafSection.classList.add('fade-in');
    }, 250);
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        goUpBtn.style.visibility = 'visible';
        navbar.style.visibility = 'visible';
    }, 1000);
  console.log('All assets loaded!');

};

// Set up loading error callback
loadingManager.onError = function (url) {
  console.error(`There was an error loading ${url}`);
};
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

const alphaTexture = textureLoader.load('textures/base-alpha.jpg');
alphaTexture.flipY = false;

const backTextureAlphaMap = textureLoader.load('textures/back-alphamap-7.jpg');
backTextureAlphaMap.flipY = false;


/**
 * --- 3D Model ---
 */
const gltfLoader = new GLTFLoader(loadingManager);
let mixer = null;
let animationAction = null;
let rayLightMat = null
let scrollTargetTime = 0; 
let smoothTime = 0;

// Load GLTF model and set up animation
gltfLoader.load('/models/sakura_51.glb', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.y = -0.3;
    gltf.scene.scale.set(1.1, 1.1, 1.1);
    console.log(gltf.scene.getObjectByName('BAck'))
    // gltf.scene.getObjectByName('BAck').visible = false
    const frontMidMesh = gltf.scene.getObjectByName('FrontMid');
    if (frontMidMesh) {
        frontMidMesh.material.alphaMap = alphaTexture;
        frontMidMesh.material.transparent = true;
    }
    const backMesh = gltf.scene.getObjectByName('BAck');
    if (backMesh) {
        backMesh.material.alphaMap = backTextureAlphaMap;
        backMesh.material.transparent = true;
    }
    rayLightMat = gltf.scene.getObjectByName('ray_test-2');
    if (rayLightMat) {
        rayLightMat.position.x -=0.001
        // rayLightMat.material.blending =  THREE.MultiplyBlending
        rayLightMat.material.transparent = true;
        rayLightMat.material.opacity = 0    
       
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


// Function to update opacity based on scroll value
function updateOpacity(scrollValue) {
    if (mixer) {
    let opacity = 0;
    let targetedOpacity = 0.85
    if (scrollValue <= 3) {
        opacity = 0;
    }
    // If scroll value is between 3 and 6, smoothly increase opacity from 0 to 0.75
    else if (scrollValue > 3 && scrollValue <= 6) {
        opacity = (scrollValue - 3) / (6 - 3) * targetedOpacity;
    }
    // If scroll value is greater than 6, cap opacity at 0.75
    else if (scrollValue > 6 && scrollValue <= 11) {
        opacity = targetedOpacity;
    }
   // If scroll value is between 11 and 13, smoothly decrease opacity from 0.75 to 0
    else if (scrollValue > 11 && scrollValue <= 13) {
        opacity = targetedOpacity - ((scrollValue - 11) / (13 - 11) * targetedOpacity);
    }
    // If scroll value is greater than 13, cap opacity at 0
    else if (scrollValue > 13) {
        opacity = 0;
    }  
    // Set the opacity of the element
    rayLightMat.material.opacity = opacity;
}
}

// Example: Assume scrollValue is dynamically updated
window.addEventListener('scroll', () => {
    // Example: get the scroll value (or adjust based on your actual method)
    const scrollValue = window.scrollY; // Or any other way to get your scroll value
   
});
function tick() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    if (mixer) {
        mixer.update(deltaTime);

        const smoothingFactor = 0.04;
        smoothTime = lerp(smoothTime, scrollTargetTime, smoothingFactor);
        // console.log(smoothTime)
        updateOpacity(smoothTime);
        animationAction.time = smoothTime;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();