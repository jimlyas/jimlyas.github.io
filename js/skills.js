const SKILLS_DATA = {
  "Languages": [
    { name: "Kotlin",  proficiency: "intermediate" },
    { name: "Java",    proficiency: "intermediate" },
    { name: "Python",  proficiency: "intermediate" }
  ],
  "Mobile & UI": [
    { name: "Android",          proficiency: "intermediate" },
    { name: "Android Studio",   proficiency: "intermediate" },
    { name: "Jetpack Compose",  proficiency: "intermediate" },
    { name: "QT",               proficiency: "intermediate" }
  ],
  "Databases": [
    { name: "MySQL",       proficiency: "intermediate" },
    { name: "PostgreSQL",  proficiency: "intermediate" },
    { name: "MongoDB",     proficiency: "intermediate" },
    { name: "SQLite",      proficiency: "intermediate" },
    { name: "Realm",       proficiency: "intermediate" },
    { name: "Firebase",    proficiency: "intermediate" }
  ],
  "DevOps & CI/CD": [
    { name: "Git",             proficiency: "intermediate" },
    { name: "GitHub Actions",  proficiency: "intermediate" },
    { name: "GitLab",          proficiency: "intermediate" },
    { name: "Bitbucket",       proficiency: "intermediate" },
    { name: "Jenkins",         proficiency: "intermediate" },
    { name: "Bitrise",         proficiency: "intermediate" },
    { name: "Docker",          proficiency: "intermediate" },
    { name: "Gradle",          proficiency: "intermediate" },
    { name: "Jitpack",         proficiency: "intermediate" },
    { name: "Sonatype",        proficiency: "intermediate" }
  ],
  "Cloud & AI": [
    { name: "Google Cloud",  proficiency: "intermediate" },
    { name: "Huawei",        proficiency: "intermediate" },
    { name: "Ollama",        proficiency: "intermediate" },
    { name: "MCP",           proficiency: "intermediate" }
  ],
  "Design & Docs": [
    { name: "Figma",             proficiency: "intermediate" },
    { name: "Draw.io",           proficiency: "intermediate" },
    { name: "Markdown",          proficiency: "intermediate" },
    { name: "Google Analytics",  proficiency: "intermediate" }
  ],
  "Management": [
    { name: "Jira",        proficiency: "intermediate" },
    { name: "Confluence",  proficiency: "intermediate" },
    { name: "SAP",         proficiency: "intermediate" }
  ],
  "Environment": [
    { name: "Windows",           proficiency: "intermediate" },
    { name: "Linux",             proficiency: "intermediate" },
    { name: "Ubuntu",            proficiency: "intermediate" },
    { name: "Visual Studio Code", proficiency: "intermediate" },
    { name: "Postman",           proficiency: "intermediate" }
  ]
};

const PROFICIENCY_COLORS = {
  "expert":       { bg: "#000080", text: "#ffffff" },
  "advanced":     { bg: "#008080", text: "#ffffff" },
  "intermediate": { bg: "#c0c0c0", text: "#000000" },
  "learning":     { bg: "#800000", text: "#ffffff" }
};

const PROFICIENCY_ORDER = ["expert", "advanced", "intermediate", "learning"];

const ICON_SLUG_MAP = {
  "Kotlin":             "kotlin",
  "Java":               "java",
  "Python":             "python",
  "Android":            "android",
  "Android Studio":     "androidstudio",
  "Jetpack Compose":    "jetpackcompose",
  "QT":                 "qt",
  "MySQL":              "mysql",
  "PostgreSQL":         "postgresql",
  "MongoDB":            "mongodb",
  "SQLite":             "sqlite",
  "Realm":              "realm",
  "Firebase":           "firebase",
  "Git":                "git",
  "GitHub Actions":     "githubactions",
  "GitLab":             "gitlab",
  "Bitbucket":          "bitbucket",
  "Jenkins":            "jenkins",
  "Bitrise":            "bitrise",
  "Docker":             "docker",
  "Gradle":             "gradle",
  "Jitpack":            null,
  "Sonatype":           "sonatype",
  "Google Cloud":       "googlecloud",
  "Huawei":             "huawei",
  "Ollama":             "ollama",
  "MCP":                null,
  "Figma":              "figma",
  "Draw.io":            "diagramsdotnet",
  "Markdown":           "markdown",
  "Google Analytics":   "googleanalytics",
  "Jira":               "jira",
  "Confluence":         "confluence",
  "SAP":                "sap",
  "Windows":            "windows",
  "Linux":              "linux",
  "Ubuntu":             "ubuntu",
  "Visual Studio Code": "visualstudiocode",
  "Postman":            "postman"
};

const dfragState = {
  animating: false,
  legendVisible: true,
  swapTimers: [],
  progressTimer: null
};

let skillsInitialized = false;

function initSkills() {
  const container = document.getElementById('window-skills');
  if (!container) {
    skillsInitialized = false;
    return;
  }

  if (container.children.length > 0 && skillsInitialized) return;
  skillsInitialized = true;

  container.innerHTML = `
    <div class="dfrag-wrapper">
      <div class="dfrag-toolbar">
        <span class="dfrag-drive">Drive: [Brain C:\\]</span>
      </div>
      <div class="dfrag-grid"></div>
      <div class="dfrag-controls"></div>
    </div>
    <div class="dfrag-tooltip" style="display:none;"></div>
  `;

  renderGrid();
  renderControls();
}

function renderGrid() {
  const grid = document.querySelector('#window-skills .dfrag-grid');
  if (!grid) return;

  grid.innerHTML = '';

  for (const [category, skills] of Object.entries(SKILLS_DATA)) {
    const group = document.createElement('div');
    group.className = 'dfrag-group';
    group.dataset.category = category;

    const label = document.createElement('div');
    label.className = 'dfrag-group-label';
    label.textContent = category;
    group.appendChild(label);

    const blocksContainer = document.createElement('div');
    blocksContainer.className = 'dfrag-group-blocks';

    skills.forEach(skill => {
      const block = document.createElement('div');
      block.className = 'dfrag-block';
      block.dataset.skill = skill.name;
      block.dataset.proficiency = skill.proficiency;

      const colors = PROFICIENCY_COLORS[skill.proficiency] || PROFICIENCY_COLORS.intermediate;
      block.style.backgroundColor = colors.bg;

      const slug = ICON_SLUG_MAP[skill.name];

      if (slug) {
        const img = document.createElement('img');
        img.src = `https://cdn.simpleicons.org/${slug}`;
        img.width = 20;
        img.height = 20;
        img.alt = skill.name;

        if (skill.proficiency === 'intermediate') {
          img.style.filter = 'none';
        } else {
          img.style.filter = 'invert(1) brightness(2)';
        }

        img.onerror = function() {
          this.style.display = 'none';
          const fallback = document.createElement('span');
          fallback.textContent = skill.name.charAt(0).toUpperCase();
          fallback.className = 'dfrag-block-initial';
          this.parentElement.appendChild(fallback);
        };

        block.appendChild(img);
      } else {
        const initial = document.createElement('span');
        initial.textContent = skill.name.charAt(0).toUpperCase();
        initial.className = 'dfrag-block-initial';
        block.appendChild(initial);
      }

      block.addEventListener('mouseover', (e) => showTooltip(e, skill.name, category, skill.proficiency));
      block.addEventListener('mouseout', hideTooltip);
      block.addEventListener('mousemove', (e) => moveTooltip(e));

      blocksContainer.appendChild(block);
    });

    group.appendChild(blocksContainer);
    grid.appendChild(group);
  }
}

function renderControls() {
  const controls = document.querySelector('#window-skills .dfrag-controls');
  if (!controls) return;

  controls.innerHTML = `
    <div class="dfrag-status-row">
      <span class="dfrag-drive-label">Drive: [Brain C:\\]</span>
      <span class="dfrag-status-label">Status: <span class="dfrag-status">Optimized</span></span>
    </div>
    <div class="dfrag-buttons">
      <button class="button dfrag-defrag-btn" onclick="startDefrag()">Defragment</button>
      <button class="button dfrag-stop-btn" onclick="stopDefrag()">Stop</button>
      <button class="button dfrag-legend-btn" onclick="toggleLegend()">Hide Legend</button>
    </div>
    <div class="dfrag-legend">
      <span class="dfrag-legend-item expert">■ Expert</span>
      <span class="dfrag-legend-item advanced">■ Advanced</span>
      <span class="dfrag-legend-item intermediate">□ Intermediate</span>
      <span class="dfrag-legend-item learning">■ Learning</span>
    </div>
    <div class="dfrag-progress-bar" style="display:none">
      <div class="dfrag-progress-fill"></div>
    </div>
    <div class="dfrag-progress-label" style="display:none"></div>
  `;
}

function startDefrag() {
  if (dfragState.animating) return;

  dfragState.animating = true;
  dfragState.swapTimers = [];

  const defragBtn = document.querySelector('#window-skills .dfrag-defrag-btn');
  const progressBar = document.querySelector('#window-skills .dfrag-progress-bar');
  const progressFill = document.querySelector('#window-skills .dfrag-progress-fill');
  const progressLabel = document.querySelector('#window-skills .dfrag-progress-label');
  const statusEl = document.querySelector('#window-skills .dfrag-status');

  if (defragBtn) defragBtn.disabled = true;
  if (progressBar) progressBar.style.display = 'block';
  if (progressLabel) {
    progressLabel.style.display = 'block';
    progressLabel.textContent = '';
  }
  if (statusEl) statusEl.textContent = 'Defragmenting...';

  if (progressFill) {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressFill.style.transition = 'width 2500ms linear';
        progressFill.style.width = '85%';
      });
    });
  }

  const swapInterval = setInterval(() => {
    shuffleRandomBlocks();
  }, 300);
  dfragState.swapTimers.push(swapInterval);

  dfragState.progressTimer = setTimeout(() => {
    if (progressFill) progressFill.style.width = '100%';
    if (progressLabel) progressLabel.textContent = 'Defragmentation Complete';
    if (statusEl) statusEl.textContent = 'Brain C:\\ is 100% Optimized';

    sortBlocks();

    setTimeout(() => {
      if (progressBar) progressBar.style.display = 'none';
      if (progressLabel) progressLabel.style.display = 'none';
      dfragState.animating = false;
      if (defragBtn) defragBtn.disabled = false;
    }, 1000);
  }, 2500);
}

function stopDefrag() {
  if (!dfragState.animating) return;

  dfragState.swapTimers.forEach(timer => clearInterval(timer));
  dfragState.swapTimers = [];
  if (dfragState.progressTimer) {
    clearTimeout(dfragState.progressTimer);
    dfragState.progressTimer = null;
  }

  const progressBar = document.querySelector('#window-skills .dfrag-progress-bar');
  const progressLabel = document.querySelector('#window-skills .dfrag-progress-label');
  const progressFill = document.querySelector('#window-skills .dfrag-progress-fill');
  const statusEl = document.querySelector('#window-skills .dfrag-status');
  const defragBtn = document.querySelector('#window-skills .dfrag-defrag-btn');

  if (progressBar) progressBar.style.display = 'none';
  if (progressLabel) progressLabel.style.display = 'none';
  if (progressFill) {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
  }
  if (statusEl) statusEl.textContent = 'Defragmentation stopped';
  if (defragBtn) defragBtn.disabled = false;

  dfragState.animating = false;
}

function shuffleRandomBlocks() {
  const allBlocks = document.querySelectorAll('#window-skills .dfrag-block');
  if (allBlocks.length < 2) return;

  const indices = Array.from({ length: allBlocks.length }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5).slice(0, Math.min(6, allBlocks.length));

  shuffled.forEach(idx => {
    const block = allBlocks[idx];
    const parent = block.parentElement;
    if (parent) {
      parent.removeChild(block);
      const blocks = parent.querySelectorAll('.dfrag-block');
      const insertIdx = Math.floor(Math.random() * (blocks.length + 1));
      if (insertIdx >= blocks.length) {
        parent.appendChild(block);
      } else {
        parent.insertBefore(block, blocks[insertIdx]);
      }
    }
  });
}

function sortBlocks() {
  const groups = document.querySelectorAll('#window-skills .dfrag-group');
  groups.forEach(group => {
    const blocksContainer = group.querySelector('.dfrag-group-blocks');
    if (!blocksContainer) return;

    const blocks = Array.from(blocksContainer.querySelectorAll('.dfrag-block'));
    blocks.sort((a, b) => {
      const orderA = PROFICIENCY_ORDER.indexOf(a.dataset.proficiency);
      const orderB = PROFICIENCY_ORDER.indexOf(b.dataset.proficiency);
      return orderA - orderB;
    });

    blocks.forEach(block => blocksContainer.appendChild(block));
  });
}

function toggleLegend() {
  const legend = document.querySelector('#window-skills .dfrag-legend');
  const legendBtn = document.querySelector('#window-skills .dfrag-legend-btn');
  if (!legend) return;

  dfragState.legendVisible = !dfragState.legendVisible;

  if (dfragState.legendVisible) {
    legend.style.display = 'flex';
    if (legendBtn) legendBtn.textContent = 'Hide Legend';
  } else {
    legend.style.display = 'none';
    if (legendBtn) legendBtn.textContent = 'Show Legend';
  }
}

function showTooltip(event, skill, category, proficiency) {
  const tooltip = document.querySelector('#window-skills .dfrag-tooltip');
  if (!tooltip) return;

  tooltip.innerHTML = `
    <div>${skill}</div>
    <div>${category}</div>
    <div>${proficiency.charAt(0).toUpperCase() + proficiency.slice(1)}</div>
  `;
  tooltip.style.display = 'block';
  moveTooltip(event);
}

function hideTooltip() {
  const tooltip = document.querySelector('#window-skills .dfrag-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

function moveTooltip(event) {
  const tooltip = document.querySelector('#window-skills .dfrag-tooltip');
  const container = document.getElementById('window-skills');
  if (!tooltip || !container) return;

  let x = event.clientX + 12;
  let y = event.clientY + 12;

  const tooltipRect = tooltip.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  if (x + tooltipRect.width > containerRect.right - 10) {
    x = event.clientX - tooltipRect.width - 12;
  }
  if (y + tooltipRect.height > containerRect.bottom - 10) {
    y = event.clientY - tooltipRect.height - 12;
  }

  tooltip.style.left = `${x - containerRect.left}px`;
  tooltip.style.top = `${y - containerRect.top}px`;
}
