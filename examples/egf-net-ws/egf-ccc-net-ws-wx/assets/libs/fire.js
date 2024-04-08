//烟花代码
(function () {
    var cdom = document.createElement("canvas");
    cdom.id = "myCanvas"; cdom.style.position = "fixed"; cdom.style.left = "0"; cdom.style.top = "0";
    cdom.style.zIndex = 1; document.body.appendChild(cdom); var canvas = document.getElementById('myCanvas'); var context = canvas.getContext('2d');
    cdom.style.background = "rgba(255,255,255,0)"
    cdom.style.pointerEvents = "none";
    function resizeCanvas() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas, false); resizeCanvas(); clearCanvas();
    function clearCanvas() {
        // context.fillStyle = '#000000';
        // context.fillRect(0, 0, canvas.width, canvas.height);
    }
    var rid;
    window.fire = function fire(x, y) {
        createFireworks(x, y); function tick() { context.globalCompositeOperation = 'destination-out'; context.fillStyle = 'rgba(0,0,0,' + 10 / 100 + ')'; context.fillRect(0, 0, canvas.width, canvas.height); context.globalCompositeOperation = 'lighter'; drawFireworks(); rid = requestAnimationFrame(tick); } cancelAnimationFrame(rid); tick();
    }
    var particles = [];
    function createFireworks(sx, sy) {
        particles = []; var hue = Math.floor(Math.random() * 51) + 150; var hueVariance = 30; var count = 100; for (var i = 0; i < count; i++) { var p = {}; var angle = Math.floor(Math.random() * 360); p.radians = angle * Math.PI / 180; p.x = sx; p.y = sy; p.speed = (Math.random() * 5) + .4; p.radius = p.speed; p.size = Math.floor(Math.random() * 3) + 1; p.hue = Math.floor(Math.random() * ((hue + hueVariance) - (hue - hueVariance))) + (hue - hueVariance); p.brightness = Math.floor(Math.random() * 31) + 50; p.alpha = (Math.floor(Math.random() * 61) + 40) / 100; particles.push(p); }
    }
    function drawFireworks() {
        clearCanvas(); for (var i = 0; i < particles.length; i++) {
            var p = particles[i]; var vx = Math.cos(p.radians) * p.radius; var vy = Math.sin(p.radians) * p.radius + 0.4; p.x += vx; p.y += vy; p.radius *= 1 - p.speed / 100; p.alpha -= 0.005; context.beginPath(); context.arc(p.x, p.y, p.size, 0, Math.PI * 2, false); context.closePath();
            context.fillStyle = 'hsla(' + p.hue + ', 100%, ' + p.brightness + '%, ' + p.alpha + ')'; context.fill();
        }
    }
    // document.addEventListener('mousedown', mouseDownHandler, false);
})();