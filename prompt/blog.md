You are working inside an existing Windows 95-themed CV website built with
vanilla HTML, CSS, and JavaScript. The project uses 98.css for Win95 UI
components. Do not change any existing files unless explicitly told to.

Your task is to implement the Blog.pub window content only.

---

## CONTEXT

The window shell (title bar, minimize/maximize/close, dragging behavior,
taskbar registration) is already handled by the existing desktop.js.
You only need to build the INNER CONTENT of the Blog.pub window.

The window container you are filling is:
  <div id="window-blog" class="window-content"></div>

All styles for this component must be scoped under:
  #window-blog .blog-*

Do not use any external libraries. Vanilla JS and CSS only.

---

## DATA SOURCE

Fetch articles from the Medium RSS feed:
  https://jimlyas.medium.com/feed

- Use fetch() to retrieve the RSS feed on window open
- Parse the response as XML using DOMParser:
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, "text/xml")
- Cache the parsed result in blogState.articles with a 24-hour TTL
  stored in localStorage under the key "blog-cache"
- If the fetch fails or CORS blocks it, use the hardcoded fallback
  articles array defined at the bottom of this prompt

CORS NOTE:
Medium's RSS feed may block direct fetch due to CORS. If it does, use this
public RSS-to-JSON proxy instead:
  https://api.rss2json.com/v1/api.json?rss_url=https://jimlyas.medium.com/feed

The proxy returns a JSON object. Extract articles from response.items:
  {
    title: string,
    pubDate: string,       // e.g. "2025-12-03 00:00:00"
    link: string,          // full Medium article URL
    thumbnail: string,     // article cover image URL
    description: string,   // HTML string of article preview
    categories: string[]   // tags/topics
  }

The publication name is NOT in the proxy response. Extract it from the
article link URL:
  - "levelup.gitconnected.com" → "Level Up Coding"
  - "proandroiddev.com"        → "ProAndroidDev"
  - "betterprogramming.pub"    → "Better Programming"
  - "medium.com/telkomdev"     → "TelkomDev"
  - anything else              → "Medium"

---

## LAYOUT

The window content is a two-panel layout identical in structure to a
Win95 Windows Explorer window:

+-----------------------------+----------------------------------+
|                             |                                  |
|   LEFT PANEL                |   RIGHT PANEL                    |
|   (article file list)       |   (article preview)              |
|                             |                                  |
+-----------------------------+----------------------------------+

- Both panels sit inside a flex row container: .blog-container
- Left panel: .blog-list-panel   — fixed width 45% of window
- Right panel: .blog-preview-panel — fixed width 55% of window
- A 1px Win95 sunken inset border separates the two panels
- Both panels have a fixed height with overflow-y: auto

---

## LEFT PANEL — Article File List

TOOLBAR:
A Win95-style toolbar above the list with:
- A label: "📁 jimlyas.medium.com"
- A small "↻ Refresh" button that clears the cache and re-fetches
- Styled using 98.css toolbar class

PUBLICATION FOLDERS:
- Group articles by publication name
- Each publication is a collapsible folder row:
    <div class="blog-folder" data-pub="ProAndroidDev">
      <span class="blog-folder-icon">📁</span>
      <span class="blog-folder-name">ProAndroidDev (5)</span>
    </div>
- Clicking a folder toggles its articles open/closed
- All folders start expanded on first load
- Folder shows article count in parentheses

ARTICLE ENTRIES:
Each article under a folder is rendered as:
    <div class="blog-entry" data-article-id="0">
      <span class="blog-entry-icon">📄</span>
      <span class="blog-entry-title">Article Title.txt</span>
      <span class="blog-entry-date">Dec 2025</span>
    </div>

- Indented 16px from the folder to show hierarchy
- .blog-entry-title truncates with ellipsis if too long
- .blog-entry-date is right-aligned, formatted as "Mon YYYY"
- Articles within each folder sorted newest first

SELECTED STATE:
- Selected entry gets Win95 highlight: background #000080, text #ffffff
- Only one entry selected at a time

HOVER STATE:
- Non-selected entries highlight with background #c0c0c0 on hover
- Cursor: pointer on entries, default on folders

---

## RIGHT PANEL — Article Preview

Default state (nothing selected):
  <div class="blog-preview-empty">
    <span>📄 Select an article to preview</span>
  </div>

Selected state — call renderPreview(article) to populate:

HTML STRUCTURE:
  <div class="blog-preview-content">
    <div class="blog-preview-thumbnail">
      <img src="{thumbnail}" alt="Article thumbnail" />
    </div>
    <div class="blog-preview-meta">
      <h3 class="blog-preview-title">{title}</h3>
      <div class="blog-preview-publication">
        <span class="blog-preview-pub-icon">📰</span>
        <span class="blog-preview-pub-name">{publication}</span>
      </div>
      <div class="blog-preview-date">
        <span>📅</span>
        <span>{formatted date}</span>
      </div>
    </div>
    <hr class="blog-divider" />
    <div class="blog-preview-description">{description snippet}</div>
    <button class="blog-read-btn">Read on Medium ↗</button>
  </div>

POPULATION LOGIC:
- .blog-preview-title: article.title
- .blog-preview-pub-name: derived publication name (see DATA SOURCE above)
- .blog-preview-date: formatDate(article.pubDate) → "Dec 3, 2025"
- .blog-preview-thumbnail img src: article.thumbnail
  - If thumbnail is empty or fails to load, show a grey placeholder div
    with text "No preview available" centered
- .blog-preview-description: strip all HTML tags from article.description,
  then truncate to 200 characters and append "..."
- .blog-read-btn onclick: window.open(article.link, '_blank')

THUMBNAIL:
- Max height: 140px, width: 100%, object-fit: cover
- Win95 sunken inset border around the image

---

## JS STATE MANAGEMENT

Maintain a single state object:

const blogState = {
  articles: [],          // parsed array of article objects
  grouped: {},           // articles grouped by publication name
  selectedId: null,      // index of currently selected article
  expandedFolders: {},   // { "ProAndroidDev": true, ... }
  loaded: false          // whether data has been fetched at least once
}

Functions to implement:

- initBlog()
  Entry point, called once when the Blog window is opened.
  If blogState.loaded is true, skip fetch and just re-render.
  Steps:
    1. Show loading state in left panel: "📡 Connecting to Medium..."
    2. Try localStorage cache — if valid and under 24hr TTL, use it
    3. Otherwise fetch from RSS proxy, parse, and cache result
    4. Populate blogState.articles and blogState.grouped
    5. Call renderList()
    6. Auto-select the first article and call renderPreview()

- fetchArticles()
  Fetches from the RSS proxy, returns a normalized array of article objects.
  Falls back to FALLBACK_ARTICLES if fetch fails.
  Always resolves — never throws.

- groupByPublication(articles)
  Returns an object keyed by publication name, each value an array of
  articles sorted newest first.

- renderList()
  Builds and injects the full left panel HTML from blogState.grouped.
  Respects blogState.expandedFolders for open/closed folder state.

- renderPreview(article)
  Updates the right panel with the given article's details.
  Updates blogState.selectedId.

- selectArticle(index)
  Sets blogState.selectedId, updates selected styles in the list,
  calls renderPreview() with the corresponding article.

- formatDate(dateStr)
  Parses "2025-12-03 00:00:00" and returns "Dec 3, 2025".
  Use a month name lookup array. Do not use toLocaleString().

- stripHtml(html)
  Removes all HTML tags from a string and returns plain text.
  Use: html.replace(/<[^>]*>/g, '')

- refreshBlog()
  Clears localStorage cache, resets blogState.loaded to false,
  calls initBlog() again.
  Triggered by the Refresh button in the toolbar.

---

## LOADING STATE

While fetching, show in the left panel:
  <div class="blog-loading">
    <span>📡 Connecting to Medium...</span>
    <div class="blog-loading-bar">
      <div class="blog-loading-progress"></div>
    </div>
  </div>

Animate .blog-loading-progress width from 0% to 90% over 2 seconds using
CSS animation, then jump to 100% when fetch completes.

---

## ERROR STATE

If fetch fails and no cache exists, show in the left panel:
  <div class="blog-error">
    <span>⚠️ Could not connect to Medium.</span>
    <button class="blog-retry-btn">Retry</button>
  </div>

.blog-retry-btn calls refreshBlog() on click.

---

## MOBILE BEHAVIOUR (below 768px)

- Hide the two-panel layout entirely
- Render a single vertically stacked list of article cards
- Each card contains: thumbnail, title, publication, date, and
  a "Read on Medium ↗" link
- No folder grouping on mobile — flat list sorted newest first
- Cards are not selectable — tap goes directly to Medium URL

---

## FALLBACK ARTICLES

If fetch fails and no cache exists, use this hardcoded array:

const FALLBACK_ARTICLES = [
  {
    title: "Let's Make Modularization Fun Again",
    pubDate: "2025-12-03 00:00:00",
    link: "https://jimlyas.medium.com/lets-make-modularization-fun-again-81cfbd99825d",
    thumbnail: "",
    description: "A lightweight, simple, and useful Gradle Plugin to boost your productivity!"
  },
  {
    title: "Visualizing Compose Navigation with Kotlin Compiler Plugin",
    pubDate: "2025-09-29 00:00:00",
    link: "https://jimlyas.medium.com/compose-diagram-e74fcbac08f8",
    thumbnail: "",
    description: "From code to diagram: Leveraging Kotlin compiler plugin to generate Mermaid diagram for your app's navigation graph."
  },
  {
    title: "Using Kotlin Reflection to Automate Compose Navigation",
    pubDate: "2024-10-14 00:00:00",
    link: "https://jimlyas.medium.com/4c5b565f660f",
    thumbnail: "",
    description: "Because who got time to register parameter names and all of their typeMaps."
  },
  {
    title: "Living Dangerously without Obfuscation",
    pubDate: "2023-10-23 00:00:00",
    link: "https://jimlyas.medium.com/living-dangerously-without-proguard-affda698a46b",
    thumbnail: "",
    description: "A story how I (seemingly) hacked an Android application from a unicorn startup."
  },
  {
    title: "Jetpack Compose for Late Adopters",
    pubDate: "2022-05-15 00:00:00",
    link: "https://jimlyas.medium.com/jetpack-compose-cc59718b3914",
    thumbnail: "",
    description: "For you who's not sure about learning Jetpack Compose or not."
  },
  {
    title: "6 Basic Security Tips for Android Application",
    pubDate: "2022-02-15 00:00:00",
    link: "https://jimlyas.medium.com/basic-android-security-11dadf275dea",
    thumbnail: "",
    description: "Gain your user trust by improving security in your Android Application with these simple tips."
  },
  {
    title: "Dynamically Change Backend Environment in Android at Runtime",
    pubDate: "2022-01-26 00:00:00",
    link: "https://jimlyas.medium.com/dynamically-change-backend-environment-in-android-at-runtime-d3af9ec7391f",
    thumbnail: "",
    description: "Speed up your Android application development by using all environments at once."
  },
  {
    title: "Developing Harmony Application as Android Developer",
    pubDate: "2022-01-13 00:00:00",
    link: "https://jimlyas.medium.com/harmony-bc0b3cfe3196",
    thumbnail: "",
    description: "Add HMS to support your Android application in Huawei devices."
  },
  {
    title: "Two Developer Tools for Documenting Android Codebases",
    pubDate: "2022-01-06 00:00:00",
    link: "https://jimlyas.medium.com/two-developer-tools-for-documenting-android-codebases-3482bad3fb4c",
    thumbnail: "",
    description: "Documenting an Android project is easy, or is it?"
  },
  {
    title: "Using Both Firebase Analytics and Huawei Analytics Kit in Android",
    pubDate: "2021-12-31 00:00:00",
    link: "https://jimlyas.medium.com/using-both-firebase-analytics-and-huawei-analytics-kit-in-android-application-88240825c71e",
    thumbnail: "",
    description: "Easy way for using two analytics tools on Android application seamlessly."
  }
]

---

## DO NOT

- Do not modify desktop.js, data.js, or any other existing file
- Do not add any new external libraries or CDN links
- Do not change the window shell, title bar, or taskbar behavior
- Do not use CSS frameworks other than the already-loaded 98.css
- Do not use toLocaleString() for date formatting
- Do not attempt to scrape Medium article pages directly