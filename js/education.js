const EDUCATION_DATA = {
  education: {
    institution: "Telkom University",
    degree: "Bachelor's in Information System",
    grade: 3.08,
    year: "2021",
    description: "Activities and societies: Lembaga Dakwah Kampus, Perhimpunan Mahasiswa Bekasi. Took Enterprise Resource Planning (ERP) specialization"
  },
  certifications: [
    {
      name: "Dev Certified for Android",
      issuer: "dev.cert by dev.id",
      issued: "Sep 2025",
      expired: "Sep 2028",
      skills: ["Android", "Android Development", "Kotlin"]
    },
    {
      name: "Gradle Build Caching",
      issuer: "Gradle Technologies",
      issued: "Oct 2024",
      expired: null,
      skills: ["Gradle", "Build Tools"]
    },
    {
      name: "Google Analytics Individual Qualification",
      issuer: "Google Digital Academy (Skillshop)",
      issued: "May 2024",
      expired: null,
      skills: ["Google Analytics"]
    },
    {
      name: "Kotlin Android Developer Expert",
      issuer: "Dicoding Indonesia",
      issued: "Sep 2018",
      expired: "Sep 2021",
      skills: ["Android", "Android Development", "Kotlin"]
    }
  ]
};

const eduState = {
  activeTab: "general",
  selectedCertIndex: 0,
  initialized: false
};

function parseExpiry(str) {
  if (!str) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [mon, yr] = str.trim().split(" ");
  const monthIndex = months.indexOf(mon);
  return new Date(parseInt(yr), monthIndex + 1, 0);
}

function isExpired(expiredStr) {
  if (!expiredStr) return false;
  const expiryDate = parseExpiry(expiredStr);
  if (!expiryDate) return false;
  return expiryDate < new Date();
}

function getCertIcon(issuer) {
  const iconMap = {
    "Gradle Technologies": "https://cdn.simpleicons.org/gradle",
    "Google Digital Academy (Skillshop)": "https://cdn.simpleicons.org/google"
  };
  return iconMap[issuer] || null;
}

function renderGeneral() {
  const edu = EDUCATION_DATA.education;
  return `
    <div class="sysprop-general">
      <div class="sysprop-header">
        <img class="sysprop-logo" src="assets/icons/education.png"
             alt="Education icon" width="48" height="48" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div class="sysprop-logo-fallback" style="display:none; width:48px; height:48px; background:#c0c0c0; border:2px inset #fff;"></div>
        <div class="sysprop-system-label">
          <span class="sysprop-degree">${edu.degree}</span>
          <span class="sysprop-institution">${edu.institution}</span>
        </div>
      </div>
      <hr class="sysprop-divider" />
      <div class="sysprop-info-rows">
        <div class="sysprop-row">
          <span class="sysprop-row-label">Institution:</span>
          <span class="sysprop-row-value">${edu.institution}</span>
        </div>
        <div class="sysprop-row">
          <span class="sysprop-row-label">Degree:</span>
          <span class="sysprop-row-value">${edu.degree}</span>
        </div>
        <div class="sysprop-row">
          <span class="sysprop-row-label">Graduated:</span>
          <span class="sysprop-row-value">${edu.year}</span>
        </div>
        <div class="sysprop-row">
          <span class="sysprop-row-label">GPA:</span>
          <span class="sysprop-row-value">${edu.grade} / 4.00</span>
        </div>
      </div>
      <hr class="sysprop-divider" />
      <div class="sysprop-description">
        ${edu.description}
      </div>
    </div>
  `;
}

function renderCertifications() {
  const certs = EDUCATION_DATA.certifications;
  let html = `<div class="sysprop-certs">`;
  
  html += `<div class="sysprop-cert-list">`;
  certs.forEach((cert, index) => {
    const expired = isExpired(cert.expired);
    const statusClass = expired ? 'expired' : 'active';
    const statusText = expired ? '● Expired' : '● Active';
    const iconUrl = getCertIcon(cert.issuer);
    const iconHtml = iconUrl 
      ? `<img class="sysprop-cert-icon" src="${iconUrl}" width="16" height="16" onerror="this.style.display='none'; this.parentNode.insertAdjacentText('beforeend', '📜');" />`
      : `<span class="sysprop-cert-icon">📜</span>`;
    
    html += `
      <div class="sysprop-cert-row ${index === eduState.selectedCertIndex ? 'selected' : ''}" data-cert-index="${index}">
        ${iconHtml}
        <span class="sysprop-cert-name">${cert.name}</span>
        <span class="sysprop-cert-issued">${cert.issued}</span>
        <span class="sysprop-cert-status ${statusClass}" data-status="${statusClass}">${statusText}</span>
      </div>
    `;
  });
  html += `</div>`;
  
  html += `<hr class="sysprop-divider" />`;
  html += `<div class="sysprop-cert-detail" id="sysprop-cert-detail"></div>`;
  html += `</div>`;
  
  return html;
}

function selectCert(index) {
  eduState.selectedCertIndex = index;
  const cert = EDUCATION_DATA.certifications[index];
  
  document.querySelectorAll('.sysprop-cert-row').forEach((row, i) => {
    if (i === index) {
      row.classList.add('selected');
    } else {
      row.classList.remove('selected');
    }
  });
  
  const detail = document.getElementById('sysprop-cert-detail');
  if (!detail) return;
  
  const expired = isExpired(cert.expired);
  let detailHtml = `
    <div class="sysprop-row">
      <span class="sysprop-row-label">Name:</span>
      <span class="sysprop-row-value">${cert.name}</span>
    </div>
    <div class="sysprop-row">
      <span class="sysprop-row-label">Issuer:</span>
      <span class="sysprop-row-value">${cert.issuer}</span>
    </div>
    <div class="sysprop-row">
      <span class="sysprop-row-label">Issued:</span>
      <span class="sysprop-row-value">${cert.issued}</span>
    </div>
  `;
  
  if (cert.expired) {
    detailHtml += `
      <div class="sysprop-row">
        <span class="sysprop-row-label">Expires:</span>
        <span class="sysprop-row-value">${cert.expired}</span>
      </div>
    `;
  }
  
  detailHtml += `
    <div class="sysprop-row">
      <span class="sysprop-row-label">Skills:</span>
      <span class="sysprop-row-value">
        ${cert.skills.map(skill => `<button class="sysprop-skill-badge">${skill}</button>`).join('')}
      </span>
    </div>
  `;
  
  detail.innerHTML = detailHtml;
}

function switchTab(tabName) {
  eduState.activeTab = tabName;
  
  document.querySelectorAll('#window-education button[role="tab"]').forEach(btn => {
    btn.setAttribute('aria-selected', btn.textContent.toLowerCase().includes(tabName === 'general' ? 'general' : 'certifications'));
  });
  
  document.querySelectorAll('#window-education article[role="tabpanel"]').forEach(panel => {
    panel.style.display = 'none';
  });
  
  const activePanel = document.querySelector(`#window-education article[role="tabpanel"].${tabName === 'general' ? 'sysprop-general' : 'sysprop-certs'}`);
  if (activePanel) {
    activePanel.style.display = 'block';
  }
  
  if (tabName === 'certifications' && document.getElementById('sysprop-cert-detail')) {
    selectCert(eduState.selectedCertIndex);
  }
}

function initEducation() {
  const container = document.getElementById('window-education');
  if (!container) return;
  
  if (eduState.initialized) return;
  eduState.initialized = true;
  
  container.innerHTML = `
    <style>
      #window-education .sysprop-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      #window-education .sysprop-logo {
        flex-shrink: 0;
      }
      #window-education .sysprop-degree {
        font-weight: bold;
        font-size: 13px;
        display: block;
      }
      #window-education .sysprop-institution {
        font-size: 11px;
        color: #444444;
        display: block;
      }
      #window-education .sysprop-info-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      #window-education .sysprop-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
      }
      #window-education .sysprop-row-label {
        font-weight: bold;
        font-size: 11px;
        min-width: 90px;
        color: #000000;
      }
      #window-education .sysprop-row-value {
        font-size: 11px;
        color: #000000;
        flex: 1;
        word-break: break-word;
      }
      #window-education .sysprop-divider {
        border: none;
        border-top: 1px solid #808080;
        border-bottom: 1px solid #ffffff;
        margin: 8px 0;
      }
      #window-education .sysprop-description {
        font-size: 10px;
        color: #444444;
        font-style: italic;
        line-height: 1.5;
        margin-top: 4px;
      }
      #window-education .sysprop-cert-list {
        max-height: 160px;
        overflow-y: auto;
        border: 2px inset #ffffff;
        background: #ffffff;
      }
      #window-education .sysprop-cert-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        cursor: pointer;
      }
      #window-education .sysprop-cert-row:hover {
        background: #c0c0c0;
      }
      #window-education .sysprop-cert-row.selected {
        background: #000080;
        color: #ffffff;
      }
      #window-education .sysprop-cert-name {
        flex: 1;
        font-size: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #window-education .sysprop-cert-issued {
        font-size: 10px;
        min-width: 64px;
        text-align: right;
      }
      #window-education .sysprop-cert-status.active {
        color: #008000;
      }
      #window-education .sysprop-cert-status.expired {
        color: #800000;
      }
      #window-education .sysprop-cert-row.selected .sysprop-cert-status {
        color: #ffffff !important;
      }
      #window-education .sysprop-cert-detail {
        height: 120px;
        padding: 4px;
        overflow-y: auto;
      }
      #window-education .sysprop-cert-detail:empty::after {
        content: "Select a certification to view details";
        display: block;
        text-align: center;
        font-size: 11px;
        color: #808080;
        margin-top: 40px;
      }
      #window-education .sysprop-skill-badge {
        font-size: 10px;
        padding: 1px 6px;
        margin: 2px;
        cursor: default;
        border: 2px outset #fff;
        background: #c0c0c0;
      }
      #window-education .sysprop-skill-badge:active {
        border: 2px inset #fff;
      }
      #window-education menu[role="tablist"] {
        display: flex;
        flex-direction: row;
        gap: 0;
        margin: 0;
        padding: 0;
        border-bottom: 1px solid #808080;
      }
      #window-education button[role="tab"] {
        padding: 4px 12px;
        border: 1px solid #808080;
        border-bottom: none;
        background: #c0c0c0;
        cursor: pointer;
        font-size: 11px;
        margin-bottom: -1px;
      }
      #window-education button[role="tab"][aria-selected="true"] {
        background: #ffffff;
        border-bottom: 1px solid #ffffff;
      }
      #window-education button[role="tab"][aria-selected="false"] {
        background: #c0c0c0;
      }
      #window-education article[role="tabpanel"] {
        padding: 8px;
      }
      #window-education article[role="tabpanel"].sysprop-certs,
      #window-education article[role="tabpanel"].sysprop-general {
        display: none;
      }
      #window-education article[role="tabpanel"].sysprop-general {
        display: block;
      }
      @media (max-width: 768px) {
        #window-education menu[role="tablist"] {
          flex-direction: column;
        }
        #window-education button[role="tab"] {
          border-bottom: 1px solid #808080;
          text-align: left;
        }
        #window-education button[role="tab"][aria-selected="true"] {
          border-bottom: 1px solid #808080;
          background: #ffffff;
        }
        #window-education article[role="tabpanel"] {
          display: block !important;
        }
        #window-education .sysprop-cert-list {
          max-height: 240px;
        }
        #window-education .sysprop-cert-detail {
          min-height: auto;
        }
      }
    </style>
    <menu role="tablist">
      <button role="tab" aria-selected="true" data-tab="general">General</button>
      <button role="tab" aria-selected="false" data-tab="certifications">Certifications</button>
    </menu>
    <article role="tabpanel" class="sysprop-general">
      ${renderGeneral()}
    </article>
    <article role="tabpanel" class="sysprop-certs">
      ${renderCertifications()}
    </article>
  `;
  
  container.querySelectorAll('button[role="tab"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });
  
  container.querySelectorAll('.sysprop-cert-row').forEach(row => {
    row.addEventListener('click', () => {
      const index = parseInt(row.getAttribute('data-cert-index'));
      selectCert(index);
    });
  });
  
  setTimeout(() => {
    selectCert(0);
  }, 0);
}
