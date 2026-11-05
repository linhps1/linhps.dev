(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var menu = document.querySelector('.menu');
  var nav = document.getElementById('nav');
  var setMenu = function (open) { menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); };
  menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if (calm || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); seen.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { seen.observe(el); });
  }

  // Thin neural network behind the hero
  var c = document.getElementById('net');
  var ctx = c && c.getContext && c.getContext('2d');
  if (!ctx) return;
  var nodes = [], w = 0, h = 0, dpr = 1, running = true;
  function size() {
    var r = c.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(46, Math.max(16, w * h / 26000)));
    nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16, hot: i % 6 === 0 });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    var max = 150, i, j, a, b, d;
    ctx.lineWidth = .7;
    for (i = 0; i < nodes.length; i++) {
      for (j = i + 1; j < nodes.length; j++) {
        a = nodes[i]; b = nodes[j];
        d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < max) {
          ctx.strokeStyle = 'rgba(0,168,98,' + (.3 * (1 - d / max)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      ctx.fillStyle = a.hot ? 'rgba(255,54,80,.75)' : 'rgba(0,168,98,.65)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.hot ? 2.2 : 1.6, 0, 6.3); ctx.fill();
    }
  }
  function step() {
    if (!running) return;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
    }
    draw();
    requestAnimationFrame(step);
  }
  size();
  if (calm) { draw(); } else { step(); }
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { size(); draw(); }, 150); });
  if ('IntersectionObserver' in window && !calm) {
    new IntersectionObserver(function (e) {
      var v = e[0].isIntersecting;
      if (v && !running) { running = true; step(); } else if (!v) { running = false; }
    }).observe(c);
  }
})();
