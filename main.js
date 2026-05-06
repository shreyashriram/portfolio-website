// ── Project data ──────────────────────────────────────────────
const projects = [
  {
    id: 'mpm-particle-simulation',
    title: 'MPM Particle Simulation',
    homeHero: ['assets/bunny-hero2.gif'],
    heroImages: ['assets/bunny-hero2.gif', 'assets/inspo.gif'],
    subtitle: 'C++ · OpenGL',
    codeLink: 'https://github.com/shreyashriram/melt-sim',
    demoLink: 'https://youtu.be/X1LFJarVVDA',
    oneliner: 'A real-time Material Point Method simulation that models the melting transition from solid to liquid using a hybrid particle-grid framework.',
    description: 'Inspired by the transformations in Elemental, this project explores stylized phase transitions using a physics-based simulation framework. We implemented a melting system built on the Material Point Method (MPM), enabling materials to smoothly transition between solid and liquid behaviors.',
    subsections: [
      { title: 'Material Point Method', body: 'The simulation transfers particle mass and momentum to a grid for force computation, then back to particles to update motion and deformation. A continuous melt parameter drives a smooth transition from elastic solid behavior to fluid-like flow, while stability is maintained through CFL-based timestepping, clamped deformation gradients, and controlled velocity updates.', images: ['assets/grid_reference.png'] },
      { title: 'Billboarded Particle Rendering', body: 'A stylized shader-driven particle rendering system using splatting techniques, where individual particles blend into a cohesive, fluid-like surface. The shader emphasizes artistic control through exaggerated highlights, rim lighting, and velocity-based deformation.', images: ['assets/particles.gif', 'assets/splats.gif'] },
    ],
  },
  {
    id: 'video-reconstruction',
    title: 'Video Reconstruction',
    homeHero: ['assets/hero.png'],
    heroImages: ['assets/image.png'],
    subtitle: 'Python · OpenCV · FFmpeg',
    codeLink: '',
    demoLink: '',
    oneliner: 'Reconstruct wide-coverage, ultra-high-resolution scenes from handheld video footage.',
    description: 'A system that generates ultra-high-resolution images from handheld video capture by combining overlapping footage into a single coherent result. It treats video as a series of "paintbrush" strokes, where users sweep their camera across a scene to capture different regions. Multiple 1080p video passes, such as those from an iPhone, are processed and merged into a larger high-definition image.',
    subsections: [
      { title: 'Visual Sweeps', body: 'Treating each video pass as a brushstroke across the scene, the pipeline accepts unstructured handheld captures with no calibration or pose estimation required up front.', images: ['assets/1_vs.png','assets/2_vs.png','assets/3_vs.png'] },
      { title: 'Feature Matching', body: 'Distinctive keypoints are extracted from overlapping frames, then a homography matrix is computed that geometrically maps one frame onto another\'s coordinate space. RANSAC is layered on top to discard false matches caused by blur, lighting changes, or repeated textures — yielding a fully automatic alignment pipeline.', images: ['assets/feature_match.png'] },
      { title: 'Super Resolution', body: 'A set of low-resolution images of the same scene with sub-pixel displacements are fused into a single image of higher resolution, recovering high-frequency detail beyond what any single frame contains.', images: ['assets/sr_before.png', 'assets/sr_after.png'] },
    ],
  },
];

// ── Render home project list ──────────────────────────────────
function renderProjectList() {
  const list = document.getElementById('project-list');
  if (!list) return;
  list.innerHTML = projects.map((proj) => `
      <article class="project-card" onclick="showProject('${proj.id}')">
        <div class="project-thumb">
          ${proj.homeHero?.[0] ? `<img src="${proj.homeHero[0]}" alt="${proj.title}" />` : ''}
        </div>
        <div class="project-info">
          <h3>${proj.title}</h3>
          <div class="stack">${proj.subtitle || ''}</div>
          <p>${proj.oneliner}</p>
          <div class="tag-links">
            ${proj.codeLink ? `<a href="${proj.codeLink}" target="_blank" onclick="event.stopPropagation()">[code]</a>` : ''}
            ${proj.demoLink ? `<a href="${proj.demoLink}" target="_blank" onclick="event.stopPropagation()">[demo]</a>` : ''}
          </div>
        </div>
      </article>
    `).join('');
}

// ── Page routing ──────────────────────────────────────────────
function showHome() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-home').classList.add('active');
  const projectsSection = document.getElementById('projects');
  if (projectsSection) projectsSection.scrollIntoView({ behavior: 'smooth' });
}

function showProject(projectId) {
  const idx = projects.findIndex(p => p.id === projectId);
  const proj = projects[idx];
  if (!proj) return;
  const num = String(idx + 1).padStart(2, '0');

  const figEl = document.getElementById('proj-fig-label');
  if (figEl) figEl.textContent = `PROJECT ${num}`;

  const heroContainer = document.getElementById('proj-hero-img');
  heroContainer.innerHTML = (proj.heroImages || []).map(src =>
    `<img src="${src}" alt="${proj.title}" />`
  ).join('');

  document.getElementById('proj-title').textContent = proj.title;
  const subtitleEl = document.getElementById('proj-subtitle');
  if (subtitleEl) subtitleEl.textContent = proj.subtitle || '';
  document.getElementById('proj-desc').textContent = proj.description;

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

  const subContainer = document.getElementById('proj-subsections');
  subContainer.innerHTML = proj.subsections.map(s => `
    <div class="proj-subsection">
      ${s.title ? `<h3>${s.title}</h3>` : '<div></div>'}
      <div>
        ${s.body ? `<p>${s.body}</p>` : ''}
      </div>
      ${s.images?.length ? `
        <div class="subsection-imgs">
          ${s.images.map(src => `<img src="${src}" alt="${s.title}" />`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  const nextProj = projects[(idx + 1) % projects.length];
  const nextEl = document.getElementById('next-project-link');
  if (nextProj) {
    nextEl.innerHTML = `<a onclick="showProject('${nextProj.id}')">Next: ${nextProj.title} <b>→</b></a>`;
    nextEl.style.display = 'flex';
  } else {
    nextEl.style.display = 'none';
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-project').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => { renderProjectList(); });


