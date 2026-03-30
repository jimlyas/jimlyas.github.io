You are working inside an existing Windows 95-themed CV website built with
vanilla HTML, CSS, and JavaScript. The project uses 98.css for Win95 UI
components. Do not change any existing files unless explicitly told to.

Your task is to fully replace the existing Education.doc window content
with a new System Properties-style dialog.

The window container you are filling is:
  <div id="window-education" class="window-content"></div>

All styles for this component must be scoped under:
  #window-education .sysprop-*

Do not use any external libraries. Vanilla JS and CSS only.

---

## HARDCODED DATA

Use this exact data. Do not fetch anything externally.

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
}

---

## LAYOUT

Style the entire window content as a Win95 System Properties dialog.
The dialog has two parts stacked vertically:

+----------------------------------------------+
|   TAB BAR (General | Certifications)         |
+----------------------------------------------+
|   TAB CONTENT PANEL                          |
|   (switches based on active tab)             |
+----------------------------------------------+

Use 98.css tab classes for the tab bar:
  <menu role="tablist">
    <button role="tab" aria-selected="true">General</button>
    <button role="tab" aria-selected="false">Certifications</button>
  </menu>
  <article role="tabpanel">
    <!-- active tab content here -->
  </article>

Only one tab panel is visible at a time.
Switching tabs updates aria-selected and swaps the panel content.
General tab is active by default on first open.

---

## GENERAL TAB — Degree Info

Styled like the Win95 System Properties "General" tab which shows
computer name, OS, and processor info in a structured layout.

HTML STRUCTURE:
  <div class="sysprop-general">

    <div class="sysprop-header">
      <img class="sysprop-logo" src="assets/icons/education.png"
           alt="Education icon" width="48" height="48" />
      <div class="sysprop-system-label">
        <span class="sysprop-degree">Bachelor's in Information System</span>
        <span class="sysprop-institution">Telkom University</span>
      </div>
    </div>

    <hr class="sysprop-divider" />

    <div class="sysprop-info-rows">
      <div class="sysprop-row">
        <span class="sysprop-row-label">Institution:</span>
        <span class="sysprop-row-value">Telkom University</span>
      </div>
      <div class="sysprop-row">
        <span class="sysprop-row-label">Degree:</span>
        <span class="sysprop-row-value">Bachelor's in Information System</span>
      </div>
      <div class="sysprop-row">
        <span class="sysprop-row-label">Graduated:</span>
        <span class="sysprop-row-value">2021</span>
      </div>
      <div class="sysprop-row">
        <span class="sysprop-row-label">GPA:</span>
        <span class="sysprop-row-value">3.08 / 4.00</span>
      </div>
    </div>

    <hr class="sysprop-divider" />

    <div class="sysprop-description">
      Activities and societies: Lembaga Dakwah Kampus, Perhimpunan
      Mahasiswa Bekasi. Took Enterprise Resource Planning (ERP)
      specialization.
    </div>

  </div>

STYLES:
- .sysprop-header: flex row, align-items center, gap 12px, margin-bottom 8px
- .sysprop-logo: if image missing, show a 48×48 grey placeholder box
- .sysprop-degree: font-weight bold, font-size 13px, display block
- .sysprop-institution: font-size 11px, color #444444, display block
- .sysprop-info-rows: flex column, gap 6px
- .sysprop-row: flex row, gap 8px
- .sysprop-row-label: font-weight bold, font-size 11px,
  min-width 90px, color #000000
- .sysprop-row-value: font-size 11px, color #000000
- .sysprop-description: font-size 10px, color #444444, font-style italic,
  line-height 1.5, margin-top 4px

---

## CERTIFICATIONS TAB — Cert List

Styled like a Win95 list view with a detail panel below,
similar to Add/Remove Programs or Device Manager.

HTML STRUCTURE:
  <div class="sysprop-certs">

    <!-- scrollable cert list -->
    <div class="sysprop-cert-list">
      <!-- one .sysprop-cert-row per certification -->
      <div class="sysprop-cert-row" data-cert-index="0">
        <img class="sysprop-cert-icon" src="..." width="16" height="16" />
        <span class="sysprop-cert-name">Dev Certified for Android</span>
        <span class="sysprop-cert-issued">Sep 2025</span>
        <span class="sysprop-cert-status">● Active</span>
      </div>
    </div>

    <hr class="sysprop-divider" />

    <!-- detail panel for selected cert -->
    <div class="sysprop-cert-detail">
      <!-- populated by selectCert(index) -->
    </div>

  </div>

CERT LIST STYLES:
- .sysprop-cert-list: scrollable, max-height 160px, overflow-y auto
  Win95 sunken inset border
- .sysprop-cert-row: flex row, align-items center, gap 8px,
  padding 4px 6px, cursor pointer
- .sysprop-cert-row:hover: background #c0c0c0
- .sysprop-cert-row.selected: background #000080, color #ffffff
- .sysprop-cert-name: flex 1, font-size 11px, truncate with ellipsis
- .sysprop-cert-issued: font-size 10px, color inherited, min-width 64px,
  text-align right
- .sysprop-cert-status:
    Active (no expiry or expiry in future) → color #008000, text "● Active"
    Expired (expiry date is in the past)   → color #800000, text "● Expired"
  When row is selected (.selected), override status color to #ffffff

CERT ICONS:
Use Simple Icons via CDN for the issuer, mapped as follows:
  "dev.cert by dev.id"              → no icon, use 📜 emoji
  "Gradle Technologies"             → https://cdn.simpleicons.org/gradle
  "Google Digital Academy (Skillshop)" → https://cdn.simpleicons.org/google
  "Dicoding Indonesia"              → no icon, use 📜 emoji

If icon image fails to load, replace with 📜 emoji fallback.

CERT STATUS LOGIC:
Determine Active vs Expired by comparing expired field to today's date:
  - If expired is null → Active
  - If expired date is in the future → Active
  - If expired date is in the past → Expired

Parse expired string (e.g. "Sep 2021") as the last day of that month
for comparison. Use this helper:

  function parseExpiry(str) {
    if (!str) return null
    const months = ["Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"]
    const [mon, yr] = str.trim().split(" ")
    const monthIndex = months.indexOf(mon)
    // last day of that month
    return new Date(parseInt(yr), monthIndex + 1, 0)
  }

---

## CERT DETAIL PANEL

When a cert row is clicked, call selectCert(index) to populate:

  <div class="sysprop-cert-detail">
    <div class="sysprop-row">
      <span class="sysprop-row-label">Name:</span>
      <span class="sysprop-row-value">{name}</span>
    </div>
    <div class="sysprop-row">
      <span class="sysprop-row-label">Issuer:</span>
      <span class="sysprop-row-value">{issuer}</span>
    </div>
    <div class="sysprop-row">
      <span class="sysprop-row-label">Issued:</span>
      <span class="sysprop-row-value">{issued}</span>
    </div>
    <div class="sysprop-row">  <!-- only if expired is not null -->
      <span class="sysprop-row-label">Expires:</span>
      <span class="sysprop-row-value">{expired}</span>
    </div>
    <div class="sysprop-row">
      <span class="sysprop-row-label">Skills:</span>
      <span class="sysprop-row-value">
        <!-- one badge per skill -->
        <button class="sysprop-skill-badge">{skill}</button>
      </span>
    </div>
  </div>

- Detail panel has a fixed height of 120px
- .sysprop-skill-badge uses 98.css .button class, font-size 10px,
  padding 1px 6px, non-interactive (no click action needed)
- If no cert is selected, show placeholder text:
  "Select a certification to view details"
  centered, font-size 11px, color #808080

Auto-select the first cert (index 0) on tab open.

---

## JS STATE MANAGEMENT

const eduState = {
  activeTab: "general",      // "general" | "certifications"
  selectedCertIndex: 0       // index into EDUCATION_DATA.certifications
}

Functions to implement:

- initEducation()
  Entry point, called once when the Education window is opened.
  Renders both tabs and sets General as active.
  If called again on reopen, return early — do not re-render.

- renderGeneral()
  Builds and injects the General tab content from EDUCATION_DATA.education.

- renderCertifications()
  Builds and injects the Certifications tab content from
  EDUCATION_DATA.certifications. Auto-selects cert at index 0.

- switchTab(tabName)
  Updates eduState.activeTab, updates aria-selected on tab buttons,
  shows the correct panel, hides the other.

- selectCert(index)
  Updates eduState.selectedCertIndex.
  Updates selected styles on cert rows.
  Populates the detail panel with the selected cert's data.

- isExpired(expiredStr)
  Returns true if the expiry date is in the past, false otherwise.
  Returns false if expiredStr is null.
  Uses parseExpiry() helper described above.

---

## MOBILE BEHAVIOUR (below 768px)

- Stack tabs vertically instead of horizontal tab bar
- Each tab becomes a collapsible accordion section
- Both sections visible simultaneously, General expanded by default
- Cert list max-height increases to 240px on mobile
- Detail panel shows below the list without fixed height

---

## DO NOT

- Do not modify desktop.js, data.js, or any other existing file
- Do not add any new external libraries or CDN links
- Do not change the window shell, title bar, or taskbar behavior
- Do not use CSS frameworks other than the already-loaded 98.css
- Do not fetch any external data — EDUCATION_DATA is the only source
- Do not use toLocaleString() for date parsing or formatting