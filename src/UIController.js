
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
const finalText = document.getElementById('finalText');
const goUpBtn = document.getElementById("goUpBtn");
const fallingLeaves = document.querySelector('.falling-leaves');
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

    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        goUpBtn.classList.add('visible'); // Show the button when scrolling down
        document.getElementById('goUpBtn').style.visibility = 'visible' ;
        finalText.style.opacity = 0; // Show the text
 
        if (!fallingLeaves.classList.contains('fade-out')) {
            fallingLeaves.classList.add('fade-out');
            fallingLeaves.classList.remove('fade-in');
        }
    } else {
        document.getElementById('goUpBtn').style.visibility = 'hidden' ;
        goUpBtn.classList.remove('visible'); // Hide the button when at the top
        finalText.style.opacity = 1; // Show the text
        if (!fallingLeaves.classList.contains('fade-in')) {
            fallingLeaves.classList.add('fade-in');
            fallingLeaves.classList.remove('fade-out');
        }
    }
}
var LeafScene = function (e) {
    (this.viewport = e),
      (this.world = document.createElement("div")),
      (this.leaves = []),
      (this.options = {
        numLeaves: 50,
        wind: { magnitude: 1.2, maxSpeed: 8, duration: 100, start: 0, speed: 0 }
      }),
      (this.width = this.viewport.offsetWidth),
      (this.height = this.viewport.offsetHeight),
      (this.timer = 0),
      (this._resetLeaf = function (e) {
        (e.x = 2 * this.width - Math.random() * this.width * 1.75),
          (e.y = -10),
          (e.z = 200 * Math.random()),
          e.x > this.width &&
            ((e.x = this.width + 10), (e.y = (Math.random() * this.height) / 2)),
          0 == this.timer && (e.y = Math.random() * this.height),
          (e.rotation.speed = 10 * Math.random());
        var t = Math.random();
        return (
          0.5 < t
            ? (e.rotation.axis = "X")
            : 0.25 < t
            ? ((e.rotation.axis = "Y"), (e.rotation.x = 180 * Math.random() + 90))
            : ((e.rotation.axis = "Z"),
              (e.rotation.x = 360 * Math.random() - 180),
              (e.rotation.speed = 3 * Math.random())),
          (e.xSpeedVariation = 0.8 * Math.random() - 0.4),
          (e.ySpeed = Math.random() + 1.5),
          e
        );
      }),
      (this._updateLeaf = function (e) {
        var t =
          this.options.wind.speed(this.timer - this.options.wind.start, e.y) +
          e.xSpeedVariation;
        (e.x -= t), (e.y += e.ySpeed), (e.rotation.value += e.rotation.speed);
        var i =
          "translateX( " +
          e.x +
          "px ) translateY( " +
          e.y +
          "px ) translateZ( " +
          e.z +
          "px )  rotate" +
          e.rotation.axis +
          "( " +
          e.rotation.value +
          "deg )";
        "X" !== e.rotation.axis && (i += " rotateX(" + e.rotation.x + "deg)"),
          (e.el.style.webkitTransform = i),
          (e.el.style.MozTransform = i),
          (e.el.style.oTransform = i),
          (e.el.style.transform = i),
          (e.x < -10 || e.y > this.height + 10) && this._resetLeaf(e);
      }),
      (this._updateWind = function () {
        if (
          0 === this.timer ||
          this.timer > this.options.wind.start + this.options.wind.duratin
        ) {
          (this.options.wind.magnitude =
            Math.random() * this.options.wind.maxSpeed),
            (this.options.wind.duration =
              50 * this.options.wind.magnitude + (20 * Math.random() - 10)),
            (this.options.wind.start = this.timer);
          var s = this.height;
          this.options.wind.speed = function (e, t) {
            var i = ((this.magnitude / 2) * (s - (2 * t) / 3)) / s;
            return (
              i *
                Math.sin(
                  ((2 * Math.PI) / this.duration) * e + (3 * Math.PI) / 2
                ) +
              i
            );
          };
        }
      });
  };
  (LeafScene.prototype.init = function () {
    for (var e, t = 0; t < this.options.numLeaves; t++)
      (e = {
        el: document.createElement("div"),
        x: 0,
        y: 0,
        z: 0,
        rotation: { axis: "X", value: 0, speed: 0, x: 0 },
        xSpeedVariation: 0,
        ySpeed: 0,
        path: { type: 1, start: 0 },
        image: 1
      }),
        this._resetLeaf(e),
        this.leaves.push(e),
        this.world.appendChild(e.el);
    (this.world.className = "leaf-scene"),
      this.viewport.appendChild(this.world),
      (this.world.style.webkitPerspective = "800px"),
      (this.world.style.MozPerspective = "800px"),
      (this.world.style.oPerspective = "800px"),
      (this.world.style.perspective = "800px");
    var i = this;
    window.onresize = function () {
      (i.width = i.viewport.offsetWidth), (i.height = i.viewport.offsetHeight);
    };
  }),
    (LeafScene.prototype.render = function () {
      this._updateWind();
      for (var e = 0; e < this.leaves.length; e++)
        this._updateLeaf(this.leaves[e]);
      this.timer++, requestAnimationFrame(this.render.bind(this));
    });
  var leafContainer = document.querySelector(".falling-leaves"),
    leaves = new LeafScene(leafContainer);
  leaves.init(), leaves.render();
  