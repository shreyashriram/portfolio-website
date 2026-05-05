// ── Project data (single source of truth — reorder here to reorder everywhere) ──
const projects = [
  // {
  //   id: 'gaussian-splatting',
  //   title: 'Gaussian Splatting',
  //   heroImages: ['assets/jello.gif'],
  //   codeLink: 'https://github.com/you/...',
  //   demoLink: '',
  //   oneliner: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget mi malesuada, efficitur ante et, pulvinar dolor.',
  //   description: 'This project explores capturing a scene by "painting" with a phone or video camera, using short video sweeps to gather dense visual data from multiple perspectives.',
  //   subsections: [
  //     { title: '', body: '', images: ['assets/bunny-hero2.gif', 'assets/inspo.gif'] },
  //     { title: 'Billboarded Particle Rendering', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
  //     { title: 'Numeric Stability', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
  //   ],
  // },
  {
    id: 'mpm-particle-simulation',
    title: 'MPM Particle Simulation',
    homeHero: ['assets/bunny-hero2.gif'],
    heroImages: ['assets/bunny-hero2.gif', 'assets/inspo.gif'],
    subtitle: 'C++, OpenGL',
    codeLink: 'https://github.com/shreyashriram/melt-sim',
    demoLink: 'https://youtu.be/X1LFJarVVDA',
    oneliner: 'Real-time Material Point Method (MPM) simulation that models the melting transition from solid to liquid using a hybrid particle-grid framework.',
    description: 'Inspired by the transformations in Elemental, this project explores stylized phase transitions using a physics-based simulation framework. We implemented a melting system built on the Material Point Method (MPM), enabling materials to smoothly transition between solid and liquid behaviors.',
    subsections: [
      { title: 'Material Point Method', body: 'The simulation transfers particle mass and momentum to a grid for force computation, then back to particles to update motion and deformation. A continuous melt parameter drives a smooth transition from elastic solid behavior to fluid-like flow, while stability is maintained through CFL-based timestepping, clamped deformation gradients, and controlled velocity updates.',  images: ['assets/grid_reference.png']},
      { title: 'Billboarded Particle Rendering', body: 'We developed a stylized shader-driven particle rendering system using splatting techniques, where individual particles blend into a cohesive, fluid-like surface. The shader emphasizes artistic control through exaggerated highlights, rim lighting, and velocity-based deformation, rather than strict physical realism.' , images: ['assets/particles.gif', 'assets/splats.gif']},
    ],
  },
  {
    id: 'video-reconstruction',
    title: 'Video Reconstruction',
    homeHero: ['assets/hero.png'],
    heroImages: ['assets/image.png'],
    subtitle: 'Python, OpenCV, FFmpeg',
    codeLink: '',
    demoLink: '',
    oneliner: 'Reconstruct wide-coverage, ultra-high-resolution scenes from handheld video.',
    description: 'This project builds a system that generates ultra-high-resolution images from handheld video capture by combining overlapping footage into a single coherent result. It treats video as a series of “paintbrush” strokes, where users sweep their camera across a scene to capture different regions. Multiple 1080p video passes, such as those from an iPhone, are processed and merged into a larger high-definition image.',
    subsections: [
      { title: '', body: '', images: ['assets/1_vs.png','assets/2_vs.png','assets/3_vs.png']},
      { title: 'Feature Matching', body: 'Since the input is raw, unstructured handheld video, the only way to figure out how frames relate spatially is to let the algorithm find visual evidence of overlap directly in the pixel data. We identify distinctive keypoints in overlapping image frames and finding corresponding points across them. A homography matrix is computed that geometrically maps one frame onto anothers coordinate space. RANSAC is layered on top to automatically discard false matches caused by blur, lighting changes, or repeated textures. The result was a fully automatic alignment pipeline that stitched frames from multiple video clips into a single wide-coverage mosaic without any manual correspondence annotation.', images: ['assets/feature_match.png'] },
      { title: 'Super Resolution', body: 'The task in super-resolution combines a set of low resolution images of the same scene in order to obtain a single image of higher resolution - where low resolution images have sub-pixel displacements relative to each other. Extract high frequency details → sharper.', images: ['assets/sr_before.png', 'assets/sr_after.png'] },
    ],
  },
];

// ── Render home project list from data ────────────────────────
function renderProjectList() {
  const list = document.getElementById('project-list');
  list.innerHTML = projects.map(proj => `
    <div class="project-card" onclick="showProject('${proj.id}')">
      <div class="project-thumb">
        ${proj.homeHero?.[0] ? `<img src="${proj.homeHero[0]}" alt="${proj.title}" />` : ''}
      </div>
      <div class="project-info">
        <h3>${proj.title}</h3>
        <p>${proj.oneliner}</p>
        <div class="tag-links">
          ${proj.codeLink ? `<a href="${proj.codeLink}" target="_blank" onclick="event.stopPropagation()">[code]</a>` : ''}
          ${proj.demoLink ? `<a href="${proj.demoLink}" target="_blank" onclick="event.stopPropagation()">[demo]</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ── Page routing ───────────────────────────────────────────────
function showHome() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-home').classList.add('active');

  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    projectsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function showProject(projectId) {
  const idx = projects.findIndex(p => p.id === projectId);
  const proj = projects[idx];
  if (!proj) return;

  // Hero images — renders all in a row
  const heroContainer = document.getElementById('proj-hero-img');
  heroContainer.innerHTML = (proj.heroImages || []).map(src =>
    `<img src="${src}" alt="${proj.title}" />`
  ).join('');

  // Title, subtitle, description
  document.getElementById('proj-title').textContent = proj.title;
  const subtitleEl = document.getElementById('proj-subtitle');
  if (subtitleEl) subtitleEl.textContent = proj.subtitle || '';
  document.getElementById('proj-desc').textContent = proj.description;

  // Code / demo links — show only if the URL exists
  const codeLink = document.getElementById('proj-code-link');
  const demoLink = document.getElementById('proj-demo-link');
  if (codeLink) {
    codeLink.href = proj.codeLink || '#';
    codeLink.style.display = proj.codeLink ? '' : 'none';
  }
  if (demoLink) {
    demoLink.href = proj.demoLink || '#';
    demoLink.style.display = proj.demoLink ? '' : 'none';
  }

  // Subsections
  const subContainer = document.getElementById('proj-subsections');
  subContainer.innerHTML = proj.subsections.map(s => `
    <div class="proj-subsection">
      ${s.title ? `<h3>${s.title}</h3>` : ''}
      ${s.body ? `<p>${s.body}</p>` : ''}
      ${s.images?.length ? `
        <div class="subsection-imgs">
          ${s.images.map(src => `<img src="${src}" alt="${s.title}" />`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  // Next project
  const nextProj = projects[(idx + 1) % projects.length];
  const nextEl = document.getElementById('next-project-link');
  if (nextProj) {
    nextEl.innerHTML = `<a onclick="showProject('${nextProj.id}')">Next Project: ${nextProj.title} <b>→</b></a>`;
    nextEl.style.display = 'flex';
  } else {
    nextEl.style.display = 'none';
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-project').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProjectList();
});