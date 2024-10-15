
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}
// Load the Lottie animation
var animation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'), 
    renderer: 'svg', 
    loop: true, 
    autoplay: true,
    path: 'textures/lottie/loading.json' 
});


window.onload = function() {
    setTimeout(() => {
        scrollToBottom()
    }, 100); 

    document.getElementById('loading-screen').classList.add('fade-out');
    document.getElementById('landing-page').classList.add('fade-in');
 
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('goUpBtn').style.visibility = 'visible' ;
    }, 1000); 

};
// Get the button
function smoothScrollToTop(duration) {
    const start = document.documentElement.scrollTop || document.body.scrollTop;
    const startTime = performance.now();

    function scrollStep(timestamp) {
        const progress = (timestamp - startTime) / duration; // Linear progression
        const currentScroll = start * (1 - progress); // Scroll amount based on progress

        window.scrollTo(0, currentScroll);

        if (progress < 1) {
            requestAnimationFrame(scrollStep); // Continue scrolling
        } else {
            window.scrollTo(0, 0); // Ensure we land exactly at the top
        }
    }

    requestAnimationFrame(scrollStep); // Start the scroll
}
document.getElementById("goUpBtn").addEventListener("click", function () {
    smoothScrollToTop(2000); // Adjust the duration (in ms) for smoother scroll
});
// Optional: Hide button when at the top of the page
window.onscroll = function () {
    const goUpBtn = document.getElementById("goUpBtn");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        goUpBtn.classList.add('visible'); // Show the button when scrolling down
        document.getElementById('goUpBtn').style.visibility = 'visible' ;
    } else {
        document.getElementById('goUpBtn').style.visibility = 'hidden' ;
        goUpBtn.classList.remove('visible'); // Hide the button when at the top
    }
}