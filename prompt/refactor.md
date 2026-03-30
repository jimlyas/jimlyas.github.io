Build a static personal CV website styled as a Windows 95/98 desktop experience.
It will be hosted on GitHub Pages with no build steps required — pure HTML, CSS,
and vanilla JavaScript only.

---

## TECH STACK
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- 98.css (https://jdan.github.io/98.css/) for authentic Win95 UI components
- No frameworks, no bundlers, no npm/s

---

## FOLDER STRUCTURE
my-cv/
├── index.html
├── 404.html
├── css/
│   └── style.css
├── js/
│   ├── desktop.js//
│   ├── data.js
│   ├── screensaver.js
│   └── search.js
├── assets/
│   ├── icons/
│   ├── cursors/
│   └── sounds/
└── blog/
    └── posts/

---

## DATA SOURCES
On page load, fetch and merge data from two sources to populate all CV windows:

### 1. GitHub API (automatic, no auth needed)
Fetch from https://api.github.com:
- /users/{username}         → name, bio, avatar, location, followers, public repos
- /users/{username}/repos   → public repos sorted by stars (top 10)

### 2. LinkedIn Profile (web fetch)
Fetch the public LinkedIn profile page at https://linkedin.com/in/{username}
and scrape/parse the following fields from the HTML response:
- Name, headline/title, location, summary/about
- Work experience: company, role, start date, end date, description
- Education: institution, degree, year
- Skills list with endorsement counts
- Certifications (if any)

Note: if LinkedIn blocks the fetch due to auth wall or CORS, fall back to
prompting the user to paste their LinkedIn URL and extract what is publicly
visible, or display a message asking them to manually fill in
assets/data/linkedin.json as a fallback.

### Caching
- Store all fetched data in localStorage with a 24-hour TTL
- On subsequent loads within TTL, use cached data instead of re-fetching
- Show a Win95-style "Connecting to network..." dialog while fetching
- If any fetch fails, fall back gracefully to placeholder text

---

## DESKTOP LAYOUT
- Full-viewport desktop with classic Windows 95 teal background (#008080)
- Desktop icons arranged in a grid on the left side, each with a pixel-art icon
  and label underneath
- A taskbar fixed at the bottom with:
  - A "Start" button on the left
  - Active windows tray in the middle
  - A real-time system clock on the right

---

## CUSTOM CURSORS
- Replace the default browser cursor with classic Win95 cursor assets
- Store cursor files in assets/cursors/
- Cursor states to implement:
  - Default arrow     → assets/cursors/arrow.cur
  - Hourglass/wait    → assets/cursors/wait.cur (shown during data fetching)
  - Text cursor       → assets/cursors/text.cur
  - Pointer/hand      → assets/cursors/pointer.cur
- Apply via CSS: cursor: url('assets/cursors/arrow.cur'), auto
- Swap to hourglass automatically during all loading and fetch states
- Swap to pointer on all clickable elements (icons, buttons, links)

---

## DESKTOP ICONS (each opens a window on double-click)
1. AboutMe.txt       → About Me section
2. WorkHistory.cal   → Work Experience — Calendar / Timeline View [NEW]
3. Skills.dfrag      → Skills — Disk Defragmenter View [NEW]
4. Education.doc     → Education section
5. MyRepos.git       → GitHub repositories
6. Blog/             → Blog folder / posts list
7. Contact.exe       → Contact section
8. Recycle Bin       → Easter egg section

---

## POST-IT NOTES ON DESKTOP
- Render 2–3 draggable sticky notes directly on the desktop surface
- Each note is a yellow box with a slightly darker yellow header bar
- Apply a subtle random rotation between -3deg and +3deg per note for realism
- Notes are draggable and their positions are saved in localStorage
- Default note content suggestions (customize as needed):
  - "👋 Open to work!"
  - "Currently learning: [Your Current Tech]"
  - "Last updated: March 2026"
- Notes sit above the desktop background but below open windows (z-index layering)

---

## WINDOW BEHAVIOR
Each icon opens a draggable, resizable window using 98.css window chrome:
- Title bar with icon, title text, and minimize/maximize/close buttons
- Draggable by the title bar
- Minimize: triggers a shrink animation toward the taskbar button position,
  then hides. Restore plays the animation in reverse.
- Maximize and close supported
- Correct z-index stacking when clicked (bring to front)
- Taskbar entry toggles restore/minimize on click

---

## WINDOW ANIMATIONS
- On minimize: animate the window shrinking (scale + translate) toward its
  corresponding taskbar button using CSS transform + transition
- Calculate target position dynamically using getBoundingClientRect() on the
  taskbar button
- Fade opacity to 0 at the end of the minimize animation
- On restore: reverse the animation — expand from taskbar button back to
  original window position and size
- Animation duration: 200ms, easing: ease-in-out

---

## WINDOW CONTENTS

### AboutMe.txt — Notepad window
- Profile photo (from GitHub avatar)
- Name, title/headline (from LinkedIn)
- Bio/summary (from LinkedIn about section)
- Location (from LinkedIn or GitHub)
- Links to GitHub and LinkedIn

### WorkHistory.cal — Calendar / Timeline window [NEW]
A two-panel window styled like a Win95 calendar application:

LEFT PANEL — Timeline
- Horizontal scrollable timeline, left (oldest) to right (newest)
- Each job is a colored block spanning its exact date range on the timeline
- Blocks stack in lanes if date ranges overlap (e.g. freelance + full-time)
- Each block displays: Company name + Role title inside it
- A red vertical "today" line marks the current date on the right end
- Year tick labels along the bottom axis (e.g. 2018, 2019, 2020...)
- Hovering a block highlights it with a Win95 raised bevel border
- Clicking a block loads the job detail in the right panel

RIGHT PANEL — Job Detail
Displays the selected job's full information:
- Company name, role title, date range (e.g. "Jan 2021 — Present")
- Description / responsibilities as a text body or bullet list
- Tech stack rendered as small Win95-style raised button badges
- Populated from LinkedIn work experience data

DATA MAPPING:
- Company name   → block label + right panel header
- Job title      → block sublabel + right panel title
- Start date     → block start position on timeline
- End date       → block end position (or extends to today line if "Present")
- Description    → right panel body text
- Skills/stack   → right panel tech badge pills

MOBILE BEHAVIOUR:
- Two-panel layout collapses into a vertical stacked list of Win95-styled cards
- Each card shows the full job detail in chronological order (newest first)
- No horizontal scrolling on mobile

### Skills.dfrag — Disk Defragmenter window [NEW]
A window styled exactly like the Win95 Disk Defragmenter utility:

DEFRAG GRID
- A dense grid of small square blocks filling the window width
- Each block represents one skill
- Block color represents proficiency level:
  - Dark Blue  → Expert       (top 5 endorsed skills from LinkedIn)
  - Light Blue → Advanced     (next 10 endorsed skills)
  - White      → Intermediate (remaining skills)
  - Red        → Beginner / Learning (manually tagged in data)
- Blocks are grouped by category with a label above each group:
  Languages, Frameworks, Tools, Cloud
- Small gap between groups for visual separation
- Hovering a block shows a tooltip: skill name + level + years of experience

BOTTOM CONTROLS PANEL
Mimics the real Win95 defrag UI:
  Drive: [Brain C:\]          Status: Fully Optimized
  [ Defragment ] [ Stop ] [ Show Legend ]
  Legend: ■ Expert  ■ Advanced  □ Intermediate  ■ Learning

DEFRAGMENT ANIMATION
When the user clicks Defragment:
1. Progress bar appears: "Defragmenting Brain C:\ ... 47%"
2. Blocks animate — randomly shuffle and reorder
3. After ~3 seconds, blocks re-sort: Expert top-left, Learning bottom-right
4. Progress bar completes: "Defragmentation Complete"
5. Status updates to: "Brain C:\ is now 100% optimized"
- "Stop" button cancels the animation mid-way
- "Show Legend" toggles the color legend visibility

DATA MAPPING FROM LINKEDIN:
- Skill name             → block tooltip label
- Skill category         → group label above block cluster
- Top 5 endorsed         → Expert (dark blue)
- Next 10 endorsed       → Advanced (light blue)
- Remaining skills       → Intermediate (white)
- Tagged as "learning"   → Beginner (red)

MOBILE BEHAVIOUR:
- Grid scales down to smaller blocks on mobile
- Tooltip on hover becomes tap-to-reveal label below the grid
- Defragment animation still works on touch devices
- Controls stack vertically below the grid

### Education.doc — Word document window
- Degree, institution, year from LinkedIn education
- Certifications listed below if available

### MyRepos.git — File explorer window
- Lists top 10 GitHub repos sorted by stars
- Columns: Name | Description | Language | ⭐ Stars
- Each row is clickable, opens repo URL in new tab

### Blog/ — File explorer window
- Lists blog posts as .txt file entries
- Static for now — manually add posts as .html files in blog/posts/
- Each entry opens a new window with post content

### Contact.exe — Installation wizard window
- Step 1: "Who would you like to contact?" — name and title
- Step 2: Email, GitHub, LinkedIn as clickable links
- Next / Back / Finish buttons styled with 98.css

### Recycle Bin — Easter egg window
- Humorous list: rejected PRs, deprecated skills, old frameworks learned

---

## BOOT SEQUENCE
On first page load, show a fullscreen boot animation:
- Black screen with white monospace text
- "[YourName]OS v1.0 — Loading... ██████░░░░ 60%"
- Progress bar fills over ~3 seconds, then cross-fades into the desktop
- Data fetching from GitHub and LinkedIn happens during this boot sequence
  so the desktop is fully populated when it appears

---

## SCREENSAVER
- Track user idle time using mousemove, keydown, click, and scroll event listeners
- After 60 seconds of inactivity, fade the desktop out and launch the screensaver
- Screensaver is a fullscreen canvas overlay rendered on top of everything
- Effect: Matrix-style falling characters (green on black) using canvas API
- Any mouse movement, click, or keypress dismisses the screensaver and restores
  the desktop instantly
- Add a "Screensaver Settings" option under Start Menu → Control Panel that lets
  the user change the idle timeout (30s / 60s / 120s), saved in localStorage

---

## SEARCH — "Find Files" Dialog
- Add a "Find..." option to both the Start Menu and the right-click context menu
- On open: shows a Win95-style dialog window with a text input field and
  a results list panel below it
- js/search.js builds a search index on page load from all window content:
  job titles, companies, skills, repo names, blog post titles, bio text
- As the user types, filter and display matching results in real time
- Each result shows: icon, section name, and matched text snippet
- Clicking a result closes the search dialog, opens the relevant window, and
  scrolls to / highlights the matched content

---

## MOBILE VIEW (screens under 768px)
- On mobile, hide the desktop icon grid, draggable windows, and taskbar entirely
- Replace with a vertically stacked single-page layout:
  - Each CV section is rendered as a Win95-styled card/panel using 98.css
  - Sections appear in order: About Me, Work Experience, Skills, Education,
    Repos, Blog, Contact
  - Each panel has a Win95 title bar (non-draggable) as a section header
- Add a fixed bottom navigation bar styled like the Win95 taskbar with icon
  buttons for jumping to each section
- Post-it notes stack vertically at the top of the mobile page instead of
  floating on the desktop
- Breakpoint: 768px, implemented via CSS media queries only

---

## BSOD 404 PAGE (404.html)
- GitHub Pages automatically serves 404.html for any unmatched URL
- Style as a full Blue Screen of Death:
  - Full-viewport solid blue background (#0000AA)
  - White monospace text, centered vertically and horizontally
  - Content:
      A problem has been detected and [YourName]OS has been shut down
      to prevent damage to your career.

      PAGE_NOT_FOUND (0x00000404)

      If this is the first time you've seen this profile error,
      restart your browser and try again.

      Technical information:
      *** STOP: 0x00000404 (PAGE_NOT_FOUND)

  - A countdown at the bottom: "Returning to desktop in 10... 9... 8..."
  - Auto-redirects to index.html when countdown reaches 0

---

## START MENU
Clicking "Start" opens a cascading popup menu with:
- User's name and avatar at the top (from GitHub)
- Menu items linking to each window/section
- "Find..." option that opens the Search dialog
- "Control Panel" submenu with Screensaver Settings
- "Shut Down" option at the bottom (fun animation)

---

## RIGHT-CLICK CONTEXT MENU
Right-clicking the desktop opens a small context menu:
- View, Refresh (re-fetches data), About [YourName]OS
- "Find..." option that opens the Search dialog

---

## ADDITIONAL DETAILS
- Typography: "MS Sans Serif", Arial, or a pixel-style web font
- All windows responsive enough to work on tablet screens
- Optional toggle-able Win95 sound effects (startup chime, click, open/close)
  using short .wav files in assets/sounds/
- Replace all instances of {username} with your actual GitHub and LinkedIn
  usernames before running