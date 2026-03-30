You are adding Simple Icons to the existing Skills.dfrag window in a Windows
95-themed CV website. The grid of skill blocks already renders correctly.
Your only task is to display the correct Simple Icons SVG icon inside each
skill block, and adjust block sizing to fit the icon comfortably.

Do not rewrite the component. Make only the changes described below.

---

## ICON SOURCE

Simple Icons are available via their CDN. Each icon is fetched as an SVG using
the skill name, normalized to lowercase with spaces removed:

  Base URL: https://cdn.simpleicons.org/{slug}

Examples:
  Kotlin          → https://cdn.simpleicons.org/kotlin
  Jetpack Compose → https://cdn.simpleicons.org/jetpackcompose
  GitHub Actions  → https://cdn.simpleicons.org/githubactions
  Visual Studio Code → https://cdn.simpleicons.org/visualstudiocode

Use <img> tags to load icons, not inline SVG fetch:
  <img src="https://cdn.simpleicons.org/{slug}" width="16" height="16" />

---

## SLUG MAP

Not all skill names map directly to Simple Icons slugs. Use this exact
mapping for all 36 skills. For any skill where Simple Icons has no icon,
use a fallback text initial instead (described below).

const ICON_SLUG_MAP = {
  // Languages
  "Kotlin":             "kotlin",
  "Java":               "java",
  "Python":             "python",

  // Mobile & UI
  "Android":            "android",
  "Android Studio":     "androidstudio",
  "Jetpack Compose":    "jetpackcompose",
  "QT":                 "qt",

  // Databases
  "MySQL":              "mysql",
  "PostgreSQL":         "postgresql",
  "MongoDB":            "mongodb",
  "SQLite":             "sqlite",
  "Realm":              "realm",
  "Firebase":           "firebase",

  // DevOps & CI/CD
  "Git":                "git",
  "GitHub Actions":     "githubactions",
  "GitLab":             "gitlab",
  "Bitbucket":          "bitbucket",
  "Jenkins":            "jenkins",
  "Bitrise":            "bitrise",
  "Docker":             "docker",
  "Gradle":             "gradle",
  "Jitpack":            null,           // no Simple Icons entry — use initial
  "Sonatype":           "sonatype",

  // Cloud & AI
  "Google Cloud":       "googlecloud",
  "Huawei":             "huawei",
  "Ollama":             "ollama",
  "MCP":                null,           // no Simple Icons entry — use initial

  // Design & Docs
  "Figma":              "figma",
  "Draw.io":            "diagramsdotnet",
  "Markdown":           "markdown",
  "Google Analytics":   "googleanalytics",

  // Management
  "Jira":               "jira",
  "Confluence":         "confluence",
  "SAP":                "sap",

  // Environment
  "Windows":            "windows",
  "Linux":              "linux",
  "Ubuntu":             "ubuntu",
  "Visual Studio Code": "visualstudiocode",
  "Postman":            "postman"
}

---

## ICON COLOR

Simple Icons SVGs are single-color. By default they render black.
To make them visible against the proficiency background color, apply
a CSS filter to invert the icon color based on the block's proficiency:

  "expert"       → background #000080 (dark) → filter: invert(1) brightness(2)
  "advanced"     → background #008080 (dark) → filter: invert(1) brightness(2)
  "intermediate" → background #c0c0c0 (light) → filter: none
  "learning"     → background #800000 (dark) → filter: invert(1) brightness(2)

Apply the filter directly to the <img> element via inline style or a
data-proficiency-driven CSS rule.

---

## BLOCK SIZE UPDATE

Increase block size from 28×28px to 40×40px to comfortably fit the icon.
Update .dfrag-block in the CSS:
  width: 40px
  height: 40px
  display: flex
  align-items: center
  justify-content: center
  padding: 6px
  box-sizing: border-box

Icon size inside the block: 20×20px.

---

## FALLBACK FOR MISSING ICONS

For skills where ICON_SLUG_MAP value is null (Jitpack, MCP):
- Do not render an <img>
- Instead render a centered <span> with the first letter of the skill name
- Style the span:
    font-size: 14px
    font-weight: bold
    font-family: "MS Sans Serif", Arial, sans-serif
    color: inherited from proficiency text color rule
    line-height: 1

---

## FALLBACK FOR FAILED ICON LOADS

Some icons may fail to load (404 or network error). Handle this on every
<img> with an onerror handler:
  img.onerror = function() {
    this.style.display = 'none'
    const fallback = document.createElement('span')
    fallback.textContent = skillName.charAt(0).toUpperCase()
    fallback.className = 'dfrag-block-initial'
    this.parentElement.appendChild(fallback)
  }

---

## TOOLTIP UPDATE

The tooltip already shows skill name, category, and proficiency.
No changes needed to tooltip behavior or content.

---

## DO NOT

- Do not rewrite renderGrid() from scratch — only modify the block
  creation code to add the icon <img> inside each .dfrag-block
- Do not change the defrag animation, sort logic, or controls panel
- Do not change the tooltip logic
- Do not add any new external libraries
- Do not inline fetch SVG content — use <img src="..."> only
- Do not modify desktop.js, data.js, or any other existing file