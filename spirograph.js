// ─────────────────────────────────────────────────────────────────────────────
// SPIROGRAPH — hand-drawn ink accents anchored to scroll positions
// • Anchored to specific page elements (left & right sides)
// • Drawn sequentially (one at a time)
// • In background (z-index: -1) — never covers content/images
//   exception: hero portrait gets its own ring on top
// • Variable colors (red/green/blue inks), random sizes, variable strokes
// • Heavy hand-drawn quality: wobble, ink blots, opacity variation, pooling
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  function mulberry32(seed) {
    seed = seed >>> 0;
    return function () {
      seed = (seed + 0x6D2B79F5) >>> 0;
      let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

  function makeHypo(R, r, d) {
    const loops = R / gcd(R, r);
    const steps = Math.round(loops * 180);
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2 * loops;
      pts.push([
        (R-r)*Math.cos(t) + d*Math.cos(((R-r)/r)*t),
        (R-r)*Math.sin(t) - d*Math.sin(((R-r)/r)*t),
      ]);
    }
    return pts;
  }
  function makeEpi(R, r, d) {
    const loops = R / gcd(R, r);
    const steps = Math.round(loops * 180);
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2 * loops;
      pts.push([
        (R+r)*Math.cos(t) - d*Math.cos(((R+r)/r)*t),
        (R+r)*Math.sin(t) - d*Math.sin(((R+r)/r)*t),
      ]);
    }
    return pts;
  }
  function makeRose(k, loops) {
    loops = loops || (Number.isInteger(k) ? 1 : 2);
    const steps = Math.round(loops * 800);
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2 * loops;
      const r = Math.cos(k * t);
      pts.push([r*Math.cos(t), r*Math.sin(t)]);
    }
    return pts;
  }

  const SHAPES = [
    () => makeHypo(140, 35, 90),
    () => makeHypo(150, 25, 140),
    () => makeHypo(100, 36, 100),
    () => makeHypo(120, 31, 70),
    () => makeRose(5),
    () => makeRose(7/3),
    () => makeRose(4),
    () => makeEpi(110, 33, 95),
    () => makeEpi(90, 27, 70),
  ];

  const INKS = [
    { name: 'blue',  hex: '#2d3a8c' },
    { name: 'red',   hex: '#a8231f' },
    { name: 'green', hex: '#2a6b3d' },
  ];

  function bbox(pts) {
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    for (const [x,y] of pts) {
      if (x<minX) minX=x; if (x>maxX) maxX=x;
      if (y<minY) minY=y; if (y>maxY) maxY=y;
    }
    return { minX, maxX, w:maxX-minX, h:maxY-minY, minY, maxY };
  }
  function placePoints(rawPts, cx, cy, size) {
    const bb = bbox(rawPts);
    const s  = size / Math.max(bb.w, bb.h);
    const midX = (bb.minX+bb.maxX)/2;
    const midY = (bb.minY+bb.maxY)/2;
    return rawPts.map(([x,y]) => [cx+(x-midX)*s, cy+(y-midY)*s]);
  }
  function hexA(hex, a) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ── Heavy hand-drawn ink stroke ──
  // - Larger wobble + low-frequency drift
  // - Variable line width (ink pooling)
  // - Variable opacity (ink dries thin in places)
  // - Ink blots at direction changes (curvature peaks)
  function drawInkStroke(ctx, pts, head, next, seed, ink, baseWidth, curv) {
    if (next - head < 1) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = head; i < next; i++) {
      // High-freq jitter
      const n1 = Math.sin((seed + i) * 12.9898) * 43758.5453;
      const wx = (n1 - Math.floor(n1) - 0.5) * 1.4;
      const n2 = Math.sin((seed + i) * 78.233) * 43758.5453;
      const wy = (n2 - Math.floor(n2) - 0.5) * 1.4;
      const n3 = Math.sin((seed + i) * 31.7) * 43758.5453;
      const wx2 = (n3 - Math.floor(n3) - 0.5) * 1.4;
      const n4 = Math.sin((seed + i + 1) * 78.233) * 43758.5453;
      const wy2 = (n4 - Math.floor(n4) - 0.5) * 1.4;

      // Low-freq drift (the hand wandering off-line)
      const drift = Math.sin(i * 0.03 + seed * 0.01) * 1.2;
      const driftY = Math.cos(i * 0.027 + seed * 0.013) * 1.2;

      // Variable width — ink pools
      const phase = (i / pts.length) * Math.PI * 8 + seed * 0.01;
      const widthMul = 0.45 + 0.85 * Math.abs(Math.sin(phase));
      // Pool extra at direction changes
      const c = curv ? curv[i] || 0 : 0;
      const w = baseWidth * widthMul * (1 + c * 1.4);

      // Variable alpha
      const a = 0.22 + 0.55 * Math.abs(Math.sin(phase * 0.6 + 1.2));

      ctx.strokeStyle = hexA(ink, a);
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(pts[i][0] + wx + drift, pts[i][1] + wy + driftY);
      ctx.lineTo(pts[i+1][0] + wx2 + drift, pts[i+1][1] + wy2 + driftY);
      ctx.stroke();
    }

    // Doubled shadow pass
    ctx.strokeStyle = hexA(ink, 0.12);
    ctx.lineWidth = baseWidth * 0.5;
    ctx.beginPath();
    for (let i = head; i <= next; i++) {
      const x = pts[i][0] + 0.8;
      const y = pts[i][1] + 0.6;
      if (i === head) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Ink blots — at direction changes and random rest points
    for (let i = head; i < next; i++) {
      const c = curv ? curv[i] || 0 : 0;
      const blotN = Math.sin((seed + i) * 7.13) * 43758.5453;
      const f = blotN - Math.floor(blotN);
      // Blot if curvature spike, or rare random rest
      if ((c > 0.5 && f < 0.35) || f < 0.04) {
        const blotSize = baseWidth * (0.7 + f * 2.2) * (1 + c);
        // Main blot
        ctx.fillStyle = hexA(ink, 0.55);
        ctx.beginPath();
        ctx.arc(pts[i][0], pts[i][1], blotSize, 0, Math.PI * 2);
        ctx.fill();
        // Halo
        ctx.fillStyle = hexA(ink, 0.18);
        ctx.beginPath();
        ctx.arc(pts[i][0] + 0.5, pts[i][1] + 0.3, blotSize * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Pre-compute curvature (0..1) for each point — direction changes
  function computeCurvature(pts) {
    const cur = new Array(pts.length).fill(0);
    for (let i = 2; i < pts.length - 2; i++) {
      const dx1 = pts[i][0] - pts[i-2][0];
      const dy1 = pts[i][1] - pts[i-2][1];
      const dx2 = pts[i+2][0] - pts[i][0];
      const dy2 = pts[i+2][1] - pts[i][1];
      const a1 = Math.atan2(dy1, dx1);
      const a2 = Math.atan2(dy2, dx2);
      let d = Math.abs(a2 - a1);
      if (d > Math.PI) d = Math.PI * 2 - d;
      cur[i] = Math.min(1, d / (Math.PI * 0.5));
    }
    return cur;
  }

  function setupCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    return ctx;
  }

  // ─── Anchored spirographs (left & right of content) ──────────────────────
  // Pool of candidate slots. Random subset of 3–5 are picked per page load,
  // and a collision check prevents overlap.

  const ANCHOR_POOL = [
    { target: '.hero', side: 'right',        offsetX: -10, offsetY: 30,   shapeIdx: 1, inkIdx: 0 },
    { target: '.hero', side: 'left',         offsetX: -60, offsetY: -20,  shapeIdx: 4, inkIdx: 1 },
    { target: '.hero', side: 'left',         offsetX: -40, offsetY: 200,  shapeIdx: 2, inkIdx: 2 },
    { target: '.projects-section', side: 'right',  offsetX: -20, offsetY: 80,  shapeIdx: 0, inkIdx: 2 },
    { target: '.projects-section', side: 'left',   offsetX: -40, offsetY: 200, shapeIdx: 7, inkIdx: 1 },
    { target: '.projects-section', side: 'right',  offsetX: -10, offsetY: 480, shapeIdx: 5, inkIdx: 0 },
    { target: '.projects-section', side: 'left',   offsetX: -50, offsetY: 600, shapeIdx: 3, inkIdx: 2 },
    { target: '.gallery-section',  side: 'right',  offsetX: -10, offsetY: 60,  shapeIdx: 7, inkIdx: 0 },
    { target: '.gallery-section',  side: 'left',   offsetX: -30, offsetY: 100, shapeIdx: 5, inkIdx: 2 },
    { target: 'footer', side: 'bottom-right',      offsetX: -30, offsetY: -50, shapeIdx: 2, inkIdx: 0 },
    { target: 'footer', side: 'bottom-left',       offsetX: -30, offsetY: -50, shapeIdx: 5, inkIdx: 1 },
  ];

  // Pick 3–5 random non-overlapping anchors
  function pickAnchors() {
    const count = 3 + Math.floor(Math.random() * 3);  // 3, 4, or 5
    const shuffled = [...ANCHOR_POOL].sort(() => Math.random() - 0.5);
    const placed = [];   // {target, rect (page coords)}

    function pageRect(target, side, ox, oy, size) {
      // Estimate bounding box in page coordinates so we can collision-check
      // across different anchor parents.
      const el = document.querySelector(target);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const left = r.left + window.scrollX;
      let x, y;
      if (side === 'right')        { x = left + r.width - size - ox;         y = top + oy; }
      else if (side === 'left')    { x = left + ox;                          y = top + oy; }
      else if (side === 'bottom-right') { x = left + r.width - size + ox;     y = top + r.height - size + oy; }
      else if (side === 'bottom-left')  { x = left - ox;                       y = top + r.height - size + oy; }
      return { x, y, w: size, h: size };
    }

    function overlaps(a, b) {
      const pad = 20;  // require some breathing room
      return !(a.x + a.w + pad < b.x || b.x + b.w + pad < a.x ||
               a.y + a.h + pad < b.y || b.y + b.h + pad < a.y);
    }

    const result = [];
    for (const cand of shuffled) {
      if (result.length >= count) break;
      // Random size 150–350 with per-spiro jitter
      const size = 150 + Math.random() * 200;
      const rect = pageRect(cand.target, cand.side, cand.offsetX, cand.offsetY, size);
      if (!rect) continue;
      if (placed.some(p => overlaps(p, rect))) continue;
      placed.push(rect);
      result.push({ ...cand, size });
    }
    return result;
  }

  const ANCHORS = pickAnchors();

  function buildSpiro(anchor, idx) {
    const target = document.querySelector(anchor.target);
    if (!target) return null;

    const cs = getComputedStyle(target);
    if (cs.position === 'static') target.style.position = 'relative';

    const finalSize = anchor.size;  // already randomized in pickAnchors

    const canvas = document.createElement('canvas');
    canvas.className = 'spiro-anchored';
    canvas.style.position = 'absolute';
    canvas.style.width = finalSize + 'px';
    canvas.style.height = finalSize + 'px';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = (window.__TWEAKS && window.__TWEAKS.spiroOpacity != null)
      ? window.__TWEAKS.spiroOpacity : 0.65;

    if (anchor.side === 'right') {
      canvas.style.right = anchor.offsetX + 'px';
      canvas.style.top = anchor.offsetY + 'px';
    } else if (anchor.side === 'left') {
      canvas.style.left = anchor.offsetX + 'px';
      canvas.style.top = anchor.offsetY + 'px';
    } else if (anchor.side === 'bottom-right') {
      canvas.style.right = (-anchor.offsetX) + 'px';
      canvas.style.bottom = (-anchor.offsetY) + 'px';
    } else if (anchor.side === 'bottom-left') {
      canvas.style.left = (-anchor.offsetX) + 'px';
      canvas.style.bottom = (-anchor.offsetY) + 'px';
    }

    target.appendChild(canvas);
    return { canvas, anchor, idx, finalSize };
  }

  const spiros = ANCHORS.map(buildSpiro).filter(Boolean);

  const drawn = new Set();
  let drawing = false;
  const queue = [];

  function enqueue(spiro) {
    if (drawn.has(spiro.idx)) return;
    if (queue.includes(spiro)) return;
    queue.push(spiro);
    drawn.add(spiro.idx);
    pump();
  }

  function pump() {
    if (drawing) return;
    const next = queue.shift();
    if (!next) return;
    drawing = true;
    drawSpiro(next, () => {
      drawing = false;
      pump();
    });
  }

  function drawSpiro(spiro, done) {
    const { canvas, anchor, idx } = spiro;
    const ctx = setupCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    const rng = mulberry32(Date.now() + idx * 137 + 7);
    const raw = SHAPES[anchor.shapeIdx % SHAPES.length]();
    const drawSize = Math.min(W, H) * 0.95;
    const pts = placePoints(raw, W/2, H/2, drawSize);
    const seed = Math.floor(rng() * 10000);
    const ink = INKS[anchor.inkIdx % INKS.length].hex;
    const stroke = anchor.stroke || 1.3;
    const baseWidth = stroke * (0.85 + rng() * 0.7);
    const curv = computeCurvature(pts);

    // Slower, consistent draw speed: time-based, ~110 segments/sec
    const SEGMENTS_PER_SEC = 110;
    let head = 0;
    let lastT = performance.now();
    function step(now) {
      const dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      const advance = Math.max(1, Math.round(SEGMENTS_PER_SEC * dt));
      const nextH = Math.min(head + advance, pts.length - 1);
      drawInkStroke(ctx, pts, head, nextH, seed, ink, baseWidth, curv);
      head = nextH;
      if (head < pts.length - 1) {
        requestAnimationFrame(step);
      } else {
        done();
      }
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const sp = spiros.find(s => s.canvas === e.target);
        if (sp) enqueue(sp);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

  spiros.forEach(s => io.observe(s.canvas));

  window.__applySpiroTweaks = function (t) {
    spiros.forEach(s => {
      s.canvas.style.display = t.showCorners === false ? 'none' : '';
      s.canvas.style.opacity = t.spiroOpacity != null ? t.spiroOpacity : 0.65;
      if (t.spiroSize) {
        const scale = t.spiroSize / 360;
        s.canvas.style.width = (s.finalSize * scale) + 'px';
        s.canvas.style.height = (s.finalSize * scale) + 'px';
      }
    });
    if (t.inkColor && t.inkColor !== 'all') {
      const idx = INKS.findIndex(i => i.hex === t.inkColor);
      if (idx >= 0) spiros.forEach(s => { s.anchor.inkIdx = idx; });
    }
  };
  if (window.__TWEAKS) window.__applySpiroTweaks(window.__TWEAKS);

  document.querySelectorAll('.spiro-corner').forEach(c => { c.style.display = 'none'; });
})();
