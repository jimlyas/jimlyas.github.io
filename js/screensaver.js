let screensaverTimeout = null;
let screensaverActive = false;
let idleTimeout = 60000;
let lastActivity = Date.now();

const IDLE_OPTIONS = {
  30: 30000,
  60: 60000,
  120: 120000
};

function initScreensaver() {
  const savedTimeout = localStorage.getItem('screensaverTimeout');
  if (savedTimeout && IDLE_OPTIONS[savedTimeout]) {
    idleTimeout = IDLE_OPTIONS[savedTimeout];
  }

  resetIdleTimer();

  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetIdleTimer);
  });
}

function resetIdleTimer() {
  lastActivity = Date.now();
  
  if (screensaverActive) {
    dismissScreensaver();
  }
  
  if (screensaverTimeout) {
    clearTimeout(screensaverTimeout);
  }
  
  screensaverTimeout = setTimeout(launchScreensaver, idleTimeout);
}

function launchScreensaver() {
  if (screensaverActive) return;
  screensaverActive = true;
  
  const canvas = document.createElement('canvas');
  canvas.id = 'screensaver-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
    background: #000;
  `;
  document.body.appendChild(canvas);
  
  runMatrixEffect(canvas);
  
  const dismissHandler = () => {
    dismissScreensaver();
    document.removeEventListener('mousemove', dismissHandler);
    document.removeEventListener('click', dismissHandler);
    document.removeEventListener('keydown', dismissHandler);
    document.removeEventListener('touchstart', dismissHandler);
  };
  
  document.addEventListener('mousemove', dismissHandler);
  document.addEventListener('click', dismissHandler);
  document.addEventListener('keydown', dismissHandler);
  document.addEventListener('touchstart', dismissHandler);
}

function dismissScreensaver() {
  if (!screensaverActive) return;
  screensaverActive = false;
  
  const canvas = document.getElementById('screensaver-canvas');
  if (canvas) {
    canvas.remove();
  }
}

function runMatrixEffect(canvas) {
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charArray = chars.split('');
  
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = [];
  
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
  }
  
  function draw() {
    if (!screensaverActive) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const char = charArray[Math.floor(Math.random() * charArray.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      
      ctx.fillStyle = '#00FF00';
      ctx.fillText(char, x, y);
      
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      
      const brightness = Math.random();
      if (brightness > 0.9) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(char, x, y);
      }
      
      drops[i]++;
    }
    
    requestAnimationFrame(draw);
  }
  
  draw();
}

function openScreensaverSettings() {
  const currentSeconds = idleTimeout / 1000;
  
  const content = `
    <div style="padding: 16px;">
      <p style="margin-bottom: 16px;">Screensaver will activate after:</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="radio" name="idle-time" value="30" ${currentSeconds === 30 ? 'checked' : ''}>
          30 seconds
        </label>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="radio" name="idle-time" value="60" ${currentSeconds === 60 ? 'checked' : ''}>
          60 seconds (default)
        </label>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="radio" name="idle-time" value="120" ${currentSeconds === 120 ? 'checked' : ''}>
          120 seconds
        </label>
      </div>
      <div style="margin-top: 16px; display: flex; gap: 8px;">
        <button id="save-screensaver" class="window-button">OK</button>
        <button id="cancel-screensaver" class="window-button">Cancel</button>
      </div>
    </div>
  `;
  
  if (typeof createWindow === 'function') {
    createWindow('screensaver-settings', 'Screensaver Settings', icons.settings, content, { width: 300, height: 220 });
    
    setTimeout(() => {
      document.getElementById('save-screensaver')?.addEventListener('click', () => {
        const selected = document.querySelector('input[name="idle-time"]:checked');
        if (selected) {
          idleTimeout = IDLE_OPTIONS[selected.value];
          localStorage.setItem('screensaverTimeout', selected.value);
          resetIdleTimer();
        }
        closeWindow('screensaver-settings');
      });
      
      document.getElementById('cancel-screensaver')?.addEventListener('click', () => {
        closeWindow('screensaver-settings');
      });
    }, 0);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initScreensaver, openScreensaverSettings };
}
