const CDN = 'assets/icons';

const icons = {
  about: `<img src="${CDN}/w2k-user.ico" width="32" height="32" alt="About" data-window-id="window-aboutme" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='👤';this.replaceWith(s)">`,
  work: `<img src="${CDN}/w2k-calendar_2.ico" width="32" height="32" alt="Work History" data-window-id="window-workhistory" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='📅';this.replaceWith(s)">`,
  skills: `<img src="${CDN}/w2k-hard_drive.ico" width="32" height="32" alt="Skills" data-window-id="window-skills" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='💽';this.replaceWith(s)">`,
  education: `<img src="${CDN}/w2k-certificate.ico" width="32" height="32" alt="Education" data-window-id="window-education" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='🎓';this.replaceWith(s)">`,
  repos: `<img src="${CDN}/w2k-folder_network.ico" width="32" height="32" alt="Repositories" data-window-id="window-repos" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='🐙';this.replaceWith(s)">`,
  blog: `<img src="${CDN}/w2k-edit_document.ico" width="32" height="32" alt="Blog" data-window-id="window-blog" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='✏️';this.replaceWith(s)">`,
  contact: `<img src="${CDN}/w2k-mail.ico" width="32" height="32" alt="Contact" data-window-id="window-contact" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='📧';this.replaceWith(s)">`,
  recycleBin: `<img src="${CDN}/w2k-recycle_bin_empty.ico" width="32" height="32" alt="Recycle Bin" data-window-id="window-recycle" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='🗑️';this.replaceWith(s)">`,
  folder: `<img src="${CDN}/w2k-folder.ico" width="32" height="32" alt="Folder" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='📁';this.replaceWith(s)">`,
  file: `<img src="${CDN}/w2k-file.ico" width="32" height="32" alt="File" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='📄';this.replaceWith(s)">`,
  windows: `<img src="${CDN}/w2k-logo.ico" width="16" height="16" alt="Windows" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback-sm';s.textContent='🪟';this.replaceWith(s)">`,
  search: `<img src="${CDN}/w2k-search.ico" width="32" height="32" alt="Search" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='🔍';this.replaceWith(s)">`,
  settings: `<img src="${CDN}/w2k-settings.ico" width="32" height="32" alt="Settings" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='⚙️';this.replaceWith(s)">`,
  controlPanel: `<img src="${CDN}/w2k-control_panel.ico" width="32" height="32" alt="Control Panel" onerror="this.style.display='none';const s=document.createElement('span');s.className='icon-fallback';s.textContent='🎛️';this.replaceWith(s)">`
};

let windowZIndex = 100;
let activeWindow = null;
let windows = {};
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let currentData = null;

function createWindow(id, title, icon, content, options = {}) {
  const existingWindow = document.getElementById(id);
  if (existingWindow) {
    focusWindow(id);
    return existingWindow;
  }
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window';
  windowEl.id = id;
  windowEl.style.zIndex = ++windowZIndex;
  
  if (options.width) windowEl.style.width = options.width + 'px';
  if (options.height) windowEl.style.height = options.height + 'px';
  if (options.left !== undefined) windowEl.style.left = options.left + 'px';
  if (options.top !== undefined) windowEl.style.top = options.top + 'px';
  
  windowEl.innerHTML = `
    <div class="window-titlebar" data-window-id="${id}">
      ${icon}
      <span class="window-title">${title}</span>
      <div class="window-controls">
        <button data-action="minimize" title="Minimize">_</button>
        <button data-action="maximize" title="Maximize">□</button>
        <button data-action="close" title="Close">×</button>
      </div>
    </div>
    <div class="window-content">${content}</div>
  `;
  
  document.querySelector('.desktop').appendChild(windowEl);
  
  windows[id] = {
    title,
    minimized: false,
    maximized: false,
    originalBounds: {
      left: windowEl.offsetLeft,
      top: windowEl.offsetTop,
      width: windowEl.offsetWidth,
      height: windowEl.offsetHeight
    }
  };
  
  addTaskbarItem(id, title, icon);
  setupWindowEvents(windowEl);
  focusWindow(id);
  
  return windowEl;
}

function setupWindowEvents(windowEl) {
  const id = windowEl.id;
  
  windowEl.addEventListener('mousedown', () => focusWindow(id));
  
  const titlebar = windowEl.querySelector('.window-titlebar');
  
  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (windows[id].maximized) return;
    
    isDragging = true;
    dragOffset = {
      x: e.clientX - windowEl.offsetLeft,
      y: e.clientY - windowEl.offsetTop
    };
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onDragEnd);
  });
  
  windowEl.querySelectorAll('.window-controls button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      switch (action) {
        case 'minimize': minimizeWindow(id); break;
        case 'maximize': maximizeWindow(id); break;
        case 'close': closeWindow(id); break;
      }
    });
  });
}

function onDrag(e) {
  if (!isDragging) return;
  
  const activeWinEl = document.querySelector(`.window[data-window-id="${activeWindow}"]`) || 
                      document.querySelector(`#${activeWindow}`);
  
  if (!activeWinEl || windows[activeWindow]?.maximized) return;
  
  const newLeft = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
  const newTop = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 50));
  
  activeWinEl.style.left = newLeft + 'px';
  activeWinEl.style.top = newTop + 'px';
}

function onDragEnd() {
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', onDragEnd);
}

function focusWindow(id) {
  const windowEl = document.getElementById(id);
  if (!windowEl) return;
  
  windowEl.style.zIndex = ++windowZIndex;
  activeWindow = id;
  
  document.querySelectorAll('.taskbar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.windowId === id && !windows[id].minimized);
  });
}

function minimizeWindow(id) {
  const windowEl = document.getElementById(id);
  const taskbarItem = document.querySelector(`.taskbar-item[data-window-id="${id}"]`);
  if (!windowEl || !taskbarItem) return;
  
  const bounds = {
    left: windowEl.offsetLeft,
    top: windowEl.offsetTop,
    width: windowEl.offsetWidth,
    height: windowEl.offsetHeight
  };
  windows[id].originalBounds = bounds;
  
  const taskbarRect = taskbarItem.getBoundingClientRect();
  const targetX = taskbarRect.left + taskbarRect.width / 2 - 50;
  const targetY = window.innerHeight - 28 - 50;
  
  windowEl.style.transition = 'transform 200ms ease-in-out, opacity 200ms ease-in-out';
  windowEl.style.transformOrigin = 'center center';
  windowEl.style.transform = `translate(${targetX - bounds.left}px, ${targetY - bounds.top}px) scale(0.1)`;
  windowEl.style.opacity = '0';
  
  setTimeout(() => {
    windows[id].minimized = true;
    windowEl.classList.add('minimized');
    windowEl.style.transition = '';
    windowEl.style.transform = '';
    windowEl.style.opacity = '';
    windowEl.style.display = 'none';
    updateTaskbarItem(id);
  }, 200);
}

function maximizeWindow(id) {
  const windowEl = document.getElementById(id);
  if (!windowEl) return;
  
  if (windows[id].maximized) {
    windowEl.classList.remove('maximized');
    const bounds = windows[id].originalBounds;
    windowEl.style.left = bounds.left + 'px';
    windowEl.style.top = bounds.top + 'px';
    windowEl.style.width = bounds.width + 'px';
    windowEl.style.height = bounds.height + 'px';
    windows[id].maximized = false;
  } else {
    windows[id].originalBounds = {
      left: windowEl.offsetLeft,
      top: windowEl.offsetTop,
      width: windowEl.offsetWidth,
      height: windowEl.offsetHeight
    };
    windowEl.classList.add('maximized');
    windows[id].maximized = true;
  }
}

function closeWindow(id) {
  const windowEl = document.getElementById(id);
  if (!windowEl) return;
  
  windowEl.remove();
  delete windows[id];
  
  const taskbarItem = document.querySelector(`.taskbar-item[data-window-id="${id}"]`);
  if (taskbarItem) taskbarItem.remove();
}

function restoreWindow(id) {
  const windowEl = document.getElementById(id);
  if (!windowEl) {
    openWindowById(id);
    return;
  }
  
  if (windows[id].minimized) {
    const bounds = windows[id].originalBounds;
    const taskbarRect = document.querySelector(`.taskbar-item[data-window-id="${id}"]`)?.getBoundingClientRect();
    
    if (taskbarRect && bounds) {
      const startX = taskbarRect.left + taskbarRect.width / 2 - 50;
      const startY = window.innerHeight - 28 - 50;
      
      windowEl.style.display = 'flex';
      windowEl.style.transform = `translate(${startX - bounds.left}px, ${startY - bounds.top}px) scale(0.1)`;
      windowEl.style.opacity = '0';
      
      requestAnimationFrame(() => {
        windowEl.style.transition = 'transform 200ms ease-in-out, opacity 200ms ease-in-out';
        windowEl.style.transform = '';
        windowEl.style.opacity = '';
        
        setTimeout(() => {
          windowEl.style.transition = '';
          windows[id].minimized = false;
          windowEl.classList.remove('minimized');
          focusWindow(id);
          updateTaskbarItem(id);
        }, 200);
      });
    } else {
      windows[id].minimized = false;
      windowEl.classList.remove('minimized');
      windowEl.style.display = 'flex';
      focusWindow(id);
      updateTaskbarItem(id);
    }
  } else {
    focusWindow(id);
  }
}

function addTaskbarItem(id, title, icon) {
  const item = document.createElement('div');
  item.className = 'taskbar-item active';
  item.dataset.windowId = id;
  item.innerHTML = `${icon}<span>${title}</span>`;
  
  item.addEventListener('click', () => {
    if (windows[id].minimized) {
      restoreWindow(id);
    } else if (activeWindow === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  });
  
  document.querySelector('.taskbar-windows').appendChild(item);
}

function updateTaskbarItem(id) {
  const item = document.querySelector(`.taskbar-item[data-window-id="${id}"]`);
  if (!item) return;
  
  item.classList.toggle('active', !windows[id].minimized);
}

function updateClock() {
  const clock = document.querySelector('.taskbar-clock');
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  clock.textContent = `${day} ${date} ${month} ${hours}.${minutes}`;
}

function toggleStartMenu() {
  const menu = document.querySelector('.start-menu');
  menu.classList.toggle('open');
}

function closeStartMenu() {
  document.querySelector('.start-menu').classList.remove('open');
}

function setupStartMenu(data) {
  const menu = document.querySelector('.start-menu');
  const userInfo = menu.querySelector('.start-menu-user');
  
  userInfo.innerHTML = `
    <img src="${data.github?.avatar || ''}" alt="Avatar" onerror="this.style.display='none'">
    <div class="start-menu-user-info">
      <div class="start-menu-user-name">${data.name || 'User'}</div>
      <div style="font-size:10px">${data.headline || ''}</div>
    </div>
  `;
  
  const items = menu.querySelector('.start-menu-items');
  items.innerHTML = `
    <div class="start-menu-item" data-action="open" data-window="about">
      ${icons.about}<span>About Me</span>
    </div>
    <div class="start-menu-item" data-action="open" data-window="workhistory">
      ${icons.work}<span>Work History</span>
    </div>
    <div class="start-menu-item" data-action="open" data-window="skills">
      ${icons.skills}<span>Skills</span>
    </div>
    <div class="start-menu-item" data-action="open" data-window="education">
      ${icons.education}<span>Education</span>
    </div>
    <div class="start-menu-item" data-action="open" data-window="repos">
      ${icons.repos}<span>My Repositories</span>
    </div>
    <div class="start-menu-item" data-action="open" data-window="blog">
      ${icons.blog}<span>Blog</span>
    </div>
    <div class="start-menu-item" data-action="open" data-window="contact">
      ${icons.contact}<span>Contact</span>
    </div>
    <div class="start-menu-divider"></div>
    <div class="start-menu-item" data-action="find">
      ${icons.search}<span>Find...</span>
    </div>
    <div class="start-menu-item" data-action="controlpanel">
      ${icons.controlPanel}<span>Control Panel</span>
    </div>
    <div class="start-menu-divider"></div>
    <div class="start-menu-item" data-action="shutdown">
      ${icons.controlPanel}<span>Shut Down</span>
    </div>
  `;
  
  items.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      const windowId = item.dataset.window;
      
      closeStartMenu();
      
      if (action === 'open' && windowId) {
        openWindowById(windowId);
      } else if (action === 'find') {
        if (typeof openSearchDialog === 'function') {
          openSearchDialog();
        }
      } else if (action === 'controlpanel') {
        if (typeof openScreensaverSettings === 'function') {
          openScreensaverSettings();
        }
      } else if (action === 'shutdown') {
        showShutdownAnimation();
      }
    });
  });
}

function setupContextMenu() {
  const menu = document.querySelector('.context-menu');
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    
    if (e.target.closest('.window') || e.target.closest('.start-menu') || 
        e.target.closest('.taskbar') || e.target.closest('.context-menu')) {
      return;
    }
    
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.add('open');
  });
  
  document.addEventListener('click', () => {
    menu.classList.remove('open');
  });
  
  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      
      switch (action) {
        case 'refresh':
          localStorage.removeItem('jimlyas-cv-data');
          localStorage.removeItem('postit-notes');
          location.reload();
          break;
        case 'about':
          alert(`${currentData?.name || 'User'}OS v1.0\nA Windows 95 style CV`);
          break;
        case 'find':
          if (typeof openSearchDialog === 'function') {
            openSearchDialog();
          }
          break;
      }
    });
  });
}

function showShutdownAnimation() {
  const overlay = document.createElement('div');
  overlay.className = 'shutdown-overlay';
  overlay.innerHTML = `
    <div class="shutdown-text">It is now safe to turn off your computer.</div>
  `;
  document.body.appendChild(overlay);
}

function getAboutContent(data) {
  return `
    <div class="profile-header">
      <img class="profile-avatar" src="${data.github?.avatar || ''}" alt="Profile" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23c0c0c0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2240%22>?</text></svg>'">
      <div class="profile-info">
        <h2>${data.name || 'User Name'}</h2>
        <h3>${data.headline || 'Professional Title'}</h3>
        <div>📍 ${data.location || 'Location'}</div>
      </div>
    </div>
    <div style="margin-top: 16px;">
      <h4 style="margin-bottom: 8px;">About Me</h4>
      <p>${data.summary || 'No summary available. Please update your linkedin.json file.'}</p>
    </div>
    <div class="profile-links">
      <a href="https://github.com/${data.github?.username || GITHUB_USERNAME}" target="_blank">GitHub Profile</a>
      ${data.linkedin?.linkedin ? `<a href="https://linkedin.com/in/${data.linkedin.linkedin}" target="_blank">LinkedIn Profile</a>` : ''}
    </div>
  `;
}

function getWorkCalendarContent(data) {
  const workData = data.experience || [];
  if (workData.length === 0) {
    return '<p>No work experience data.</p>';
  }
  
  return `
    <div class="cal-container">
      <div class="cal-timeline-panel" id="cal-timeline-panel"></div>
      <div class="cal-detail-panel" id="cal-detail-panel" role="region" aria-label="Job detail">
        <div class="cal-detail-header">
          <span class="cal-detail-company"></span>
          <span class="cal-detail-role"></span>
          <span class="cal-detail-dates"></span>
        </div>
        <hr class="cal-divider" />
        <div class="cal-detail-description"></div>
        <div class="cal-detail-stack"></div>
      </div>
    </div>
  `;
}

function getSkillsContent(data) {
  return '<div id="window-skills"></div>';
}

function getEducationContent(data) {
  return '<div id="window-education"></div>';
}

function getReposContent(data) {
  const repos = data.repos || [];
  
  if (repos.length === 0) {
    return '<p style="padding: 16px;">No repositories found.</p>';
  }
  
  return `
    <ul class="repo-list">
      ${repos.map(repo => `
        <li class="repo-item" onclick="window.open('${repo.url}', '_blank')">
          ${icons.file}
          <div class="repo-info">
            <div class="repo-name">${repo.name}</div>
            <div class="repo-desc">${repo.description}</div>
          </div>
          <div class="repo-stars">⭐ ${repo.stars} | 🍴 ${repo.forks}</div>
        </li>
      `).join('')}
    </ul>
  `;
}

function getBlogContent() {
  return '<div id="window-blog"></div>';
}

function getContactContent(data) {
  return `
    <div class="contact-wizard">
      <div class="wizard-step active" id="contact-step-1">
        <div class="wizard-title">Contact Information</div>
        <p>Welcome! I'm ${data.name || 'the developer'}.</p>
        <p style="margin-top: 12px;">Feel free to reach out through any of the following channels:</p>
      </div>
      
      <div class="wizard-step" id="contact-step-2">
        <div class="wizard-title">Get In Touch</div>
        <div style="padding: 16px;">
          ${data.email ? `<p style="margin-bottom: 12px;">📧 <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>` : ''}
          <p style="margin-bottom: 12px;">💻 <strong>GitHub:</strong> <a href="https://github.com/jimlyas" target="_blank">@jimlyas</a></p>
          ${data.linkedin?.linkedin ? `<p>🔗 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/${data.linkedin.linkedin}" target="_blank">Connect on LinkedIn</a></p>` : ''}
        </div>
      </div>
      
      <div class="wizard-buttons">
        <button class="window-button" id="contact-prev" onclick="prevContactStep()">◀ Back</button>
        <button class="window-button" id="contact-next" onclick="nextContactStep()">Next ▶</button>
      </div>
    </div>
  `;
}

function getRecycleBinContent() {
  return `
    <div class="recycle-bin-content">
      <h3>🗑️ Recycle Bin</h3>
      <p>Items you've moved on from:</p>
      <ul class="recycle-list">
        <li>That time I tried to learn Rust (still in progress)</li>
        <li>AngularJS (2018 edition)</li>
        <li>jQuery (we'll always have Paris)</li>
        <li>That one merge conflict that took 3 days</li>
        <li>Y2K bug preparations</li>
        <li>CoffeeScript (it was a phase)</li>
        <li>Regular expressions (just kidding, I'll never master those)</li>
        <li>That side project I promised to maintain</li>
      </ul>
      <p style="margin-top: 16px; font-style: italic;">Note: These items cannot be restored.</p>
    </div>
  `;
}

let contactStep = 1;

function nextContactStep() {
  if (contactStep < 2) {
    document.getElementById(`contact-step-${contactStep}`).classList.remove('active');
    contactStep++;
    document.getElementById(`contact-step-${contactStep}`).classList.add('active');
    updateContactButtons();
  }
}

function prevContactStep() {
  if (contactStep > 1) {
    document.getElementById(`contact-step-${contactStep}`).classList.remove('active');
    contactStep--;
    document.getElementById(`contact-step-${contactStep}`).classList.add('active');
    updateContactButtons();
  }
}

function updateContactButtons() {
  const prevBtn = document.getElementById('contact-prev');
  const nextBtn = document.getElementById('contact-next');
  if (prevBtn) prevBtn.style.visibility = contactStep > 1 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.textContent = contactStep === 2 ? 'Finish' : 'Next ▶';
}

function openWindowById(id) {
  const data = window.cvData || {};
  
  switch (id) {
    case 'about':
      createWindow('about', 'AboutMe.txt', icons.about, getAboutContent(data), { width: 500, height: 400 });
      break;
    case 'workhistory':
      createWindow('workhistory', 'WorkHistory.cal', icons.work, getWorkCalendarContent(data), { width: 900, height: 500 });
      if (typeof initCalendar === 'function') {
        initCalendar();
      }
      break;
    case 'skills':
      createWindow('skills', 'Skills.defrag', icons.skills, getSkillsContent(data), { width: 400, height: 400 });
      if (typeof initSkills === 'function') {
        initSkills();
      }
      break;
    case 'education':
      createWindow('education', 'Education.doc', icons.education, getEducationContent(data), { width: 450, height: 350 });
      if (typeof initEducation === 'function') {
        initEducation();
      }
      break;
    case 'repos':
      createWindow('repos', 'MyRepos.git', icons.repos, getReposContent(data), { width: 600, height: 400 });
      break;
    case 'blog':
      openBlogWindow();
      break;
    case 'contact':
      contactStep = 1;
      createWindow('contact', 'Contact.exe', icons.contact, getContactContent(data), { width: 400, height: 300 });
      break;
    case 'recycle':
      createWindow('recycle', 'Recycle Bin', icons.recycleBin, getRecycleBinContent(), { width: 400, height: 350 });
      break;
  }
}

function setupDesktopIcons(data) {
  const desktop = document.querySelector('.desktop');
  
  const iconConfigs = [
    { id: 'about', icon: icons.about, label: 'AboutMe.txt' },
    { id: 'workhistory', icon: icons.work, label: 'WorkHistory.cal' },
    { id: 'skills', icon: icons.skills, label: 'Skills.defrag' },
    { id: 'education', icon: icons.education, label: 'Education.doc' },
    { id: 'repos', icon: icons.repos, label: 'MyRepos.git' },
    { id: 'blog', icon: icons.blog, label: 'Blog.doc' },
    { id: 'contact', icon: icons.contact, label: 'Contact.exe' },
    { id: 'recycle', icon: icons.recycleBin, label: 'Recycle Bin' }
  ];
  
  iconConfigs.forEach(config => {
    const iconEl = document.createElement('div');
    iconEl.className = 'desktop-icon';
    iconEl.dataset.windowId = config.id;
    iconEl.innerHTML = `${config.icon}<span>${config.label}</span>`;
    
    iconEl.addEventListener('dblclick', () => openWindowById(config.id));
    iconEl.addEventListener('click', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      iconEl.classList.add('selected');
    });
    
    desktop.appendChild(iconEl);
  });
}

function initDesktop(data) {
  window.cvData = data;
  currentData = data;
  
  setupDesktopIcons(data);
  setupStartMenu(data);
  setupContextMenu();
  initNowPlayingWidget();
  
  setInterval(updateClock, 1000);
  updateClock();
  
  document.querySelector('.start-button').addEventListener('click', toggleStartMenu);
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
      closeStartMenu();
    }
  });
  
  populateMobileView(data);
}

function populateMobileView(data) {
  const mobileAvatar = document.getElementById('mobile-avatar');
  const mobileName = document.getElementById('mobile-name');
  const mobileHeadline = document.getElementById('mobile-headline');
  const mobileSummary = document.getElementById('mobile-summary');
  const mobileLocation = document.getElementById('mobile-location');
  
  if (mobileAvatar) mobileAvatar.src = data.github?.avatar || '';
  if (mobileName) mobileName.textContent = data.name || 'User';
  if (mobileHeadline) mobileHeadline.textContent = data.headline || '';
  if (mobileSummary) mobileSummary.textContent = data.summary || 'No summary available.';
  if (mobileLocation) mobileLocation.textContent = '📍 ' + (data.location || 'Location not set');
  
  const mobileWork = document.getElementById('mobile-work-content');
  if (mobileWork && data.experience) {
    const mobileMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatMobileDate = (dateStr) => {
      if (dateStr === 'present') return 'Present';
      const [year, month] = dateStr.split('-');
      return `${mobileMonthNames[parseInt(month) - 1]} ${year}`;
    };
    mobileWork.innerHTML = data.experience.map(exp => `
      <div class="mobile-work-item">
        <div class="mobile-work-company">${exp.company}</div>
        <div class="mobile-work-role">${exp.role}</div>
        <div class="mobile-work-date">${formatMobileDate(exp.startDate)} — ${formatMobileDate(exp.endDate)}</div>
        <p style="margin-top: 8px; font-size: 12px;">${exp.description || ''}</p>
        ${exp.stack ? `<div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">${exp.stack.map(t => `<span class="mobile-skill-tag">${t}</span>`).join('')}</div>` : ''}
      </div>
    `).join('') || '<p>No work experience added.</p>';
  }
  
  const mobileSkills = document.getElementById('mobile-skills-content');
  if (mobileSkills && data.skills) {
    const allSkills = Object.values(data.skills).flat();
    mobileSkills.innerHTML = allSkills.map(skill => `<span class="mobile-skill-tag">${skill}</span>`).join('') || '<p>No skills added.</p>';
  }
  
  const mobileEducation = document.getElementById('mobile-education-content');
  if (mobileEducation && data.education) {
    mobileEducation.innerHTML = data.education.map(edu => `
      <div style="margin-bottom: 12px;">
        <strong>${edu.degree}</strong><br>
        ${edu.institution} (${edu.year})
      </div>
    `).join('') || '<p>No education added.</p>';
  }
  
  const mobileRepos = document.getElementById('mobile-repos-content');
  if (mobileRepos && data.repos) {
    mobileRepos.innerHTML = data.repos.map(repo => `
      <a href="${repo.url}" target="_blank" class="mobile-repo-item" style="text-decoration: none;">
        <div>
          <div class="mobile-repo-name">${repo.name}</div>
          <div style="font-size: 11px; color: #666;">${repo.description || ''}</div>
        </div>
        <div style="font-size: 11px;">⭐ ${repo.stars}</div>
      </a>
    `).join('') || '<p>No repositories found.</p>';
  }
  
  const mobileContact = document.getElementById('mobile-contact-content');
  if (mobileContact) {
    let links = '';
    if (data.email) links += `<a href="mailto:${data.email}" class="mobile-contact-link">📧 ${data.email}</a>`;
    links += `<a href="https://github.com/${data.github.username || 'jimlyas'}" target="_blank" class="mobile-contact-link">💻 GitHub</a>`;
    if (data.linkedin?.linkedin) links += `<a href="https://linkedin.com/in/${data.linkedin.linkedin}" target="_blank" class="mobile-contact-link">🔗 LinkedIn</a>`;
    mobileContact.innerHTML = links;
  }
}

function runBootSequence(data, callback) {
  const bootScreen = document.querySelector('.boot-screen');
  const progressBar = document.querySelector('.boot-progress-bar');
  const loadingText = document.querySelector('.boot-loading-text');
  
  const stages = [
    { progress: 10, text: 'Loading kernel...' },
    { progress: 25, text: 'Initializing devices...' },
    { progress: 40, text: 'Loading desktop...' },
    { progress: 55, text: 'Connecting to network...' },
    { progress: 70, text: 'Fetching GitHub data...' },
    { progress: 85, text: 'Loading profile...' },
    { progress: 95, text: 'Almost ready...' },
    { progress: 100, text: 'Welcome!' }
  ];
  
  let stageIndex = 0;
  
  function updateProgress() {
    if (stageIndex < stages.length) {
      const stage = stages[stageIndex];
      progressBar.style.width = stage.progress + '%';
      loadingText.textContent = stage.text;
      stageIndex++;
      setTimeout(updateProgress, 300 + Math.random() * 200);
    } else {
      setTimeout(() => {
        bootScreen.classList.add('hidden');
        initDesktop(data);
        callback();
      }, 500);
    }
  }
  
  updateProgress();
}

function initPostItNotes() {
  const desktop = document.querySelector('.desktop');
  if (!desktop) return;
  
  const notesData = JSON.parse(localStorage.getItem('postit-notes') || 'null');
  
  const defaultNotes = [
    { id: 1, text: 'Open to work!', x: 100, y: 100 },
    { id: 2, text: 'Last updated: March 2026', x: 200, y: 150 }
  ];
  
  const notes = notesData || defaultNotes;
  
  notes.forEach(note => {
    const rotation = (Math.random() * 6) - 3;
    const noteEl = document.createElement('div');
    noteEl.className = 'postit-note';
    noteEl.dataset.id = note.id;
    noteEl.style.left = note.x + 'px';
    noteEl.style.top = note.y + 'px';
    noteEl.style.transform = `rotate(${rotation}deg)`;
    noteEl.innerHTML = `
      <div class="postit-header">Note</div>
      <div class="postit-content">${note.text}</div>
    `;
    
    let isDraggingNote = false;
    let noteOffset = { x: 0, y: 0 };
    
    noteEl.querySelector('.postit-header').addEventListener('mousedown', (e) => {
      if (e.target.closest('.window') || e.target.closest('.start-menu')) return;
      isDraggingNote = true;
      noteOffset = {
        x: e.clientX - noteEl.offsetLeft,
        y: e.clientY - noteEl.offsetTop
      };
      noteEl.style.zIndex = ++windowZIndex;
      
      document.addEventListener('mousemove', onNoteDrag);
      document.addEventListener('mouseup', onNoteDragEnd);
    });
    
    function onNoteDrag(e) {
      if (!isDraggingNote) return;
      const newX = Math.max(0, e.clientX - noteOffset.x);
      const newY = Math.max(0, e.clientY - noteOffset.y);
      noteEl.style.left = newX + 'px';
      noteEl.style.top = newY + 'px';
    }
    
    function onNoteDragEnd() {
      isDraggingNote = false;
      document.removeEventListener('mousemove', onNoteDrag);
      document.removeEventListener('mouseup', onNoteDragEnd);
      
      const updatedNotes = Array.from(document.querySelectorAll('.postit-note')).map(n => ({
        id: parseInt(n.dataset.id),
        text: n.querySelector('.postit-content').textContent,
        x: parseInt(n.style.left),
        y: parseInt(n.style.top)
      }));
      localStorage.setItem('postit-notes', JSON.stringify(updatedNotes));
    }
    
    desktop.appendChild(noteEl);
  });
}

function initNowPlayingWidget() {
  const widget = document.getElementById('nowplaying-widget');
  const svgImg = document.getElementById('npw-svg');
  const offlineSpan = document.querySelector('.npw-offline');
  if (!widget || !svgImg) return;

  const spotifyUrl = 'https://now-playing-jimlyas.vercel.app/api/spotify-playing';

  let npwPollInterval;

  function loadSpotifySvg() {
    svgImg.classList.remove('npw-error');
    offlineSpan.classList.remove('npw-visible');
    svgImg.src = spotifyUrl + '?t=' + Date.now();
  }

  svgImg.addEventListener('load', function() {
    svgImg.classList.remove('npw-error');
    offlineSpan.classList.remove('npw-visible');
  });

  svgImg.addEventListener('error', function() {
    svgImg.classList.add('npw-error');
    offlineSpan.classList.add('npw-visible');
  });

  loadSpotifySvg();

  npwPollInterval = setInterval(loadSpotifySvg, 30000);

  const savedPosition = JSON.parse(localStorage.getItem('npw-position'));
  if (savedPosition) {
    widget.style.left = savedPosition.x + 'px';
    widget.style.top = savedPosition.y + 'px';
  }

  let isDraggingWidget = false;
  let widgetOffset = { x: 0, y: 0 };

  widget.addEventListener('mousedown', (e) => {
    if (e.target.closest('.window') || e.target.closest('.start-menu')) return;
    isDraggingWidget = true;
    widgetOffset = {
      x: e.clientX - widget.offsetLeft,
      y: e.clientY - widget.offsetTop
    };
    widget.style.zIndex = ++windowZIndex;

    document.addEventListener('mousemove', onWidgetDrag);
    document.addEventListener('mouseup', onWidgetDragEnd);
  });

  function onWidgetDrag(e) {
    if (!isDraggingWidget) return;
    const newX = Math.max(0, e.clientX - widgetOffset.x);
    const newY = Math.max(0, e.clientY - widgetOffset.y);
    widget.style.left = newX + 'px';
    widget.style.top = newY + 'px';
  }

  function onWidgetDragEnd() {
    isDraggingWidget = false;
    document.removeEventListener('mousemove', onWidgetDrag);
    document.removeEventListener('mouseup', onWidgetDragEnd);

    const position = {
      x: parseInt(widget.style.left),
      y: parseInt(widget.style.top)
    };
    localStorage.setItem('npw-position', JSON.stringify(position));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDesktop, runBootSequence, openWindowById };
}
