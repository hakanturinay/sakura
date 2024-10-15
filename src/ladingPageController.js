import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

     // Automatically scroll to the bottom when the page loads

/**
 * Debug
 */
const gui = new GUI()
const textureLoader = new THREE.TextureLoader()
const parametersUI = {
    materialColor: '#ffeded'
}

gui
    .addColor(parametersUI, 'materialColor')
    .onChange(() =>
    {
        material.color.set(parametersUI.materialColor)
        particlesMaterial.color.set(parametersUI.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Texture

const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

// Alpha texture (replace 'alphaTexture.png' with your texture file)
const alphaTexture = textureLoader.load('textures/ALPHA_04.jpg');
alphaTexture.flipY = false
// Material
const material = new THREE.MeshToonMaterial({
    color: parametersUI.materialColor,
    gradientMap: gradientTexture
})


const gltfLoader = new GLTFLoader()
let mixer = null
let animationAction = null
let scrollTargetTime = 0; // Target animation time based on scroll
let smoothTime = 0; // Smoothed animation time

gltfLoader.load(
    '/models/sakura_9.glb',
    (gltf) =>
    {
        // gltf.scene.scale.set(0.025, 0.025, 0.025)
        scene.add(gltf.scene)
        gltf.scene.position.y = -0.3
        gltf.scene.scale.set(1.1, 1.1, 1.1)

        const frontMidMesh = gltf.scene.getObjectByName('FrontMid');
        if (frontMidMesh) {
            // Apply the material with the alpha texture to "FrontMid"
            frontMidMesh.material.alphaMap = alphaTexture;
            frontMidMesh.material.transparent = true
        }
        // Animation
        mixer = new THREE.AnimationMixer(gltf.scene)
        const animationClip = gltf.animations[0]; // Assuming the model has animations
        animationAction = mixer.clipAction(animationClip);

        // Start the animation (paused)
        animationAction.play();
        animationAction.paused = true;
        // action.play()
    }
)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Particles
 */
const particleTexture = textureLoader.load('textures/CanopyTex.png'); // Replace with your texture path


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.toneMapping = THREE.LinearToneMapping
// renderer.toneMappingExposure = 1.5

/**
 * Scroll
 */


window.addEventListener('scroll', () =>
{
    if (!animationAction) return; // Ensure animation is loaded

    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Map scroll to animation progress (0 at bottom, 1 at top)
    const scrollPercent = 1 - (currentScrollY / maxScroll); // Invert the scroll

    // Map scroll percent directly to target animation time
    const duration = animationAction.getClip().duration;
    scrollTargetTime = scrollPercent * duration; // Set the target time based on scroll positio

})
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) =>
{

})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime



    if (mixer) {
        mixer.update(deltaTime)

        // Smooth the transition between the current time and target time
        const smoothingFactor = 0.04; // Smaller values make it smoother
        smoothTime = lerp(smoothTime, scrollTargetTime, smoothingFactor);

        // Apply the smoothed time to the animation
        animationAction.time = smoothTime;
    }
    //particle


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)


}

tick()