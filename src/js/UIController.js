// Constants for configuration
const SCROLL_DURATION = 2000; // Duration for smooth scroll to top in milliseconds
const WIND_MAGNITUDE_RANGE = 0.8; // Wind magnitude range (lower for gentle movement)
const LEAF_SPEED_MIN = 0.8; // Minimum speed for leaves' downward movement
const LEAF_COUNT = 50; // Number of falling leaves

// DOM elements for smooth scroll and animations
const loadingScreen = document.getElementById('loading-screen');
const landingPage = document.getElementById('landing-page');
const goUpBtn = document.getElementById("goUpBtn");
const finalText = document.getElementById('finalText');
const fallingLeaves = document.querySelector('.falling-leaves');

// Initialize Lottie animation
const animation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'textures/lottie/loading.json',
});

// Function to scroll to the bottom of the page
const scrollToBottom = () => window.scrollTo(0, document.body.scrollHeight);

// On window load, start animations and transitions
window.onload = () => {
    setTimeout(scrollToBottom, 100);

    // Transition for loading screen
    loadingScreen.classList.add('fade-out');
    landingPage.classList.add('fade-in');
    
    const leafSection = document.getElementById('leaf-section');
  
    // Add the fade-in class when the page has loaded

    setTimeout(() => {
        leafSection.classList.add('fade-in');
        // leafSection.style.opacity = 1;
        loadingScreen.style.display = 'none';
        goUpBtn.style.visibility = 'visible';
    }, 1000);
};

// Smooth scroll to the top of the page
const smoothScrollToTop = (duration) => {
    const startScrollPos = document.documentElement.scrollTop || document.body.scrollTop;
    const startTime = performance.now();

    const scrollStep = (timestamp) => {
        const progress = (timestamp - startTime) / duration;
        const currentScroll = startScrollPos * (1 - progress);

        window.scrollTo(0, currentScroll);

        if (progress < 1) {
            requestAnimationFrame(scrollStep);
        } else {
            window.scrollTo(0, 0);
        }
    };

    requestAnimationFrame(scrollStep);
};

// Event listener for the "Go Up" button
goUpBtn.addEventListener("click", () => {
    smoothScrollToTop(SCROLL_DURATION);
});

// Show or hide the "Go Up" button based on scroll position
window.onscroll = () => {
    const isScrolled = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;

    if (isScrolled) {
        goUpBtn.classList.add('visible');
        goUpBtn.style.visibility = 'visible';
        finalText.style.opacity = 0;

        if (!fallingLeaves.classList.contains('fade-out')) {
            fallingLeaves.classList.add('fade-out');
            fallingLeaves.classList.remove('fade-in');
        }
    } else {
        goUpBtn.classList.remove('visible');
        goUpBtn.style.visibility = 'hidden';
        finalText.style.opacity = 1;

        if (!fallingLeaves.classList.contains('fade-in')) {
            fallingLeaves.classList.add('fade-in');
            fallingLeaves.classList.remove('fade-out');
        }
    }
};

// LeafScene class for managing leaf animations and wind effects
class LeafScene {
    constructor(viewport) {
        this.viewport = viewport;
        this.world = document.createElement("div");
        this.leaves = [];
        this.options = {
            numLeaves: LEAF_COUNT,
            wind: {
                magnitude: WIND_MAGNITUDE_RANGE,
                maxSpeed: 8,
                duration: 100,
                start: 0,
                speed: 0
            }
        };
        this.width = viewport.offsetWidth;
        this.height = viewport.offsetHeight;
        this.timer = 0;

        this.init();
        this.render();
    }

    // Resets the position and properties of a leaf
    resetLeaf(leaf) {
        leaf.x = 2 * this.width - Math.random() * this.width * 1.75;
        leaf.y = -10;
        leaf.z = 200 * Math.random();

        if (leaf.x > this.width) {
            leaf.x = this.width + 10;
            leaf.y = Math.random() * this.height / 2;
        }

        leaf.rotation.speed = 10 * Math.random();

        const rotationType = Math.random();
        if (rotationType > 0.5) {
            leaf.rotation.axis = "X";
        } else if (rotationType > 0.25) {
            leaf.rotation.axis = "Y";
            leaf.rotation.x = 180 * Math.random() + 90;
        } else {
            leaf.rotation.axis = "Z";
            leaf.rotation.x = 360 * Math.random() - 180;
            leaf.rotation.speed = 3 * Math.random();
        }

        leaf.xSpeedVariation = 0.8 * Math.random() - 0.4;
        leaf.ySpeed = Math.random() + LEAF_SPEED_MIN;
    }

    // Updates the position and rotation of a leaf
    updateLeaf(leaf) {
        const windSpeed = this.options.wind.speed(this.timer - this.options.wind.start, leaf.y) + leaf.xSpeedVariation;
        leaf.x -= windSpeed;
        leaf.y += leaf.ySpeed;
        leaf.rotation.value += leaf.rotation.speed;

        let transform = `translateX(${leaf.x}px) translateY(${leaf.y}px) translateZ(${leaf.z}px) rotate${leaf.rotation.axis}(${leaf.rotation.value}deg)`;
        if (leaf.rotation.axis !== "X") {
            transform += ` rotateX(${leaf.rotation.x}deg)`;
        }

        leaf.el.style.transform = transform;

        // Reset leaf when it goes off-screen
        if (leaf.x < -10 || leaf.y > this.height + 10) {
            this.resetLeaf(leaf);
        }
    }

    // Updates the wind effect
    updateWind() {
        if (this.timer === 0 || this.timer > this.options.wind.start + this.options.wind.duration) {
            this.options.wind.magnitude = Math.random() * WIND_MAGNITUDE_RANGE;
            this.options.wind.duration = 50 * this.options.wind.magnitude + (20 * Math.random() - 10);
            this.options.wind.start = this.timer;

            const height = this.height;
            this.options.wind.speed = (time, yPos) => {
                const intensity = ((this.options.wind.magnitude / 2) * (height - (2 * yPos) / 3)) / height;
                return intensity * Math.sin((2 * Math.PI / this.options.wind.duration) * time + (3 * Math.PI) / 2) + intensity;
            };
        }
    }

    // Initializes the leaves and scene
    init() {
        for (let i = 0; i < this.options.numLeaves; i++) {
            const leaf = {
                el: document.createElement("div"),
                x: 0,
                y: 0,
                z: 0,
                rotation: { axis: "X", value: 0, speed: 0, x: 0 },
                xSpeedVariation: 0,
                ySpeed: 0
            };

            this.resetLeaf(leaf);
            this.leaves.push(leaf);
            this.world.appendChild(leaf.el);
        }

        this.world.className = "leaf-scene";
        this.viewport.appendChild(this.world);
        this.world.style.perspective = "800px";

        // Resize viewport when window is resized
        window.onresize = () => {
            this.width = this.viewport.offsetWidth;
            this.height = this.viewport.offsetHeight;
        };
    }

    // Renders the scene
    render() {
        this.updateWind();
        this.leaves.forEach(this.updateLeaf.bind(this));
        this.timer++;
        requestAnimationFrame(this.render.bind(this));
    }
}

// Initialize the falling leaves scene
const leafContainer = document.querySelector(".falling-leaves");
const leaves = new LeafScene(leafContainer);