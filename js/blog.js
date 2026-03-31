const blogState = {
  articles: [],
  grouped: {},
  selectedId: null,
  expandedFolders: {},
  loaded: false
};

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
];

const BLOG_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function extractFirstImage(html) {
  if (!html) return '';
  
  // Try different patterns to extract image src
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=([^>\s]+)/i,
    /data-src=["']([^"']+)["']/i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const src = match[1].replace(/^["']|["']$/g, '');
      if (src && src.startsWith('http')) {
        return src;
      }
    }
  }
  
  // Try to find figure or picture elements
  const figureMatch = html.match(/<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i);
  if (figureMatch && figureMatch[1]) {
    return figureMatch[1];
  }
  
  return '';
}

function getPublicationName(link) {
  if (!link) return 'Medium';
  if (link.includes('levelup.gitconnected.com')) return 'Level Up Coding';
  if (link.includes('proandroiddev.com')) return 'ProAndroidDev';
  if (link.includes('betterprogramming.pub')) return 'Better Programming';
  if (link.includes('telkomdev')) return 'TelkomDev';
  return 'Medium';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split(' ')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${BLOG_MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split(' ')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date(year, month - 1, parseInt(parts[2], 10));
  return `${dayNames[d.getDay()]} ${year}`;
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function groupByPublication(articles) {
  const grouped = {};
  articles.forEach((article, index) => {
    const pub = getPublicationName(article.link);
    if (!grouped[pub]) {
      grouped[pub] = [];
    }
    article._index = index;
    grouped[pub].push(article);
  });
  
  Object.keys(grouped).forEach(pub => {
    grouped[pub].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  });
  
  return grouped;
}

function getCache() {
  try {
    const cached = localStorage.getItem('blog-cache');
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('blog-cache');
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

function setCache(articles) {
  try {
    localStorage.setItem('blog-cache', JSON.stringify({
      data: articles,
      timestamp: Date.now()
    }));
  } catch (e) {}
}

async function fetchArticles() {
  const cached = getCache();
  if (cached) {
    console.log('Using cached articles:', cached.length);
    return cached;
  }
  
  try {
    const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://jimlyas.medium.com/feed');
    if (!response.ok) throw new Error('Fetch failed');
    const data = await response.json();
    console.log('RSS response:', data);
    
    const articles = (data.items || []).map(item => {
      const thumbnail = item.thumbnail || extractFirstImage(item.description) || extractFirstImage(item.content);
      console.log('Article:', item.title, '| Thumbnail:', thumbnail);
      return {
        title: item.title || 'Untitled',
        pubDate: item.pubDate || '',
        link: item.link || '',
        thumbnail: thumbnail,
        description: item.description || '',
        categories: item.categories || []
      };
    });
    setCache(articles);
    return articles;
  } catch (error) {
    console.warn('Blog fetch failed, using fallback:', error);
    return FALLBACK_ARTICLES;
  }
}

function renderLoading() {
  const container = document.getElementById('window-blog');
  if (!container) return;
  container.innerHTML = `
    <div class="blog-loading">
      <span>📡 Connecting to Medium...</span>
      <div class="blog-loading-bar">
        <div class="blog-loading-progress"></div>
      </div>
    </div>
  `;
}

function renderError() {
  const container = document.getElementById('window-blog');
  if (!container) return;
  container.innerHTML = `
    <div class="blog-error">
      <span>⚠️ Could not connect to Medium.</span>
      <button class="blog-retry-btn" onclick="refreshBlog()">Retry</button>
    </div>
  `;
}

function renderList() {
  const container = document.getElementById('window-blog');
  if (!container) return;
  
  const publications = Object.keys(blogState.grouped).sort();
  
  let foldersHtml = '';
  publications.forEach(pub => {
    const articles = blogState.grouped[pub];
    const isExpanded = blogState.expandedFolders[pub] !== false;
    const folderClass = isExpanded ? 'blog-folder expanded' : 'blog-folder';
    const toggleIcon = isExpanded ? '▼' : '▶';
    const entriesDisplay = isExpanded ? 'block' : 'none';
    
    let entriesHtml = '';
    articles.forEach((article, i) => {
      const globalIndex = article._index;
      const selectedClass = blogState.selectedId === globalIndex ? ' selected' : '';
      entriesHtml += `
        <div class="blog-entry${selectedClass}" data-article-id="${globalIndex}" style="display: ${entriesDisplay}">
          <span class="blog-entry-icon">📄</span>
          <span class="blog-entry-title" title="${article.title}">${article.title}.txt</span>
          <span class="blog-entry-date">${formatDateShort(article.pubDate)}</span>
        </div>
      `;
    });
    
    foldersHtml += `
      <div class="${folderClass}" data-pub="${pub}">
        <span class="blog-folder-toggle">${toggleIcon}</span>
        <span class="blog-folder-icon">📁</span>
        <span class="blog-folder-name">${pub} (${articles.length})</span>
      </div>
      <div class="blog-folder-entries" data-pub="${pub}">
        ${entriesHtml}
      </div>
    `;
  });
  
  container.innerHTML = `
    <div class="blog-container">
      <div class="blog-list-panel">
        <div class="toolbar">
          <span class="blog-address">📁 jimlyas.medium.com</span>
          <button class="blog-refresh-btn" onclick="refreshBlog()">↻ Refresh</button>
        </div>
        <div class="blog-folders">
          ${foldersHtml}
        </div>
      </div>
      <div class="blog-preview-panel">
        <div class="blog-preview-empty">
          <span>📄 Select an article to preview</span>
        </div>
      </div>
    </div>
  `;
  
  container.querySelectorAll('.blog-folder').forEach(folder => {
    folder.addEventListener('click', (e) => {
      const pub = folder.dataset.pub;
      const entries = container.querySelector(`.blog-folder-entries[data-pub="${pub}"]`);
      const toggle = folder.querySelector('.blog-folder-toggle');
      const isExpanded = blogState.expandedFolders[pub] !== false;
      
      blogState.expandedFolders[pub] = !isExpanded;
      
      if (!isExpanded) {
        folder.classList.add('expanded');
        toggle.textContent = '▼';
        entries.querySelectorAll('.blog-entry').forEach(entry => {
          entry.style.display = 'block';
        });
      } else {
        folder.classList.remove('expanded');
        toggle.textContent = '▶';
        entries.querySelectorAll('.blog-entry').forEach(entry => {
          entry.style.display = 'none';
        });
      }
    });
  });
  
  container.querySelectorAll('.blog-entry').forEach(entry => {
    entry.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(entry.dataset.articleId, 10);
      selectArticle(index);
    });
  });
}

function isValidThumbnail(url) {
  if (!url) return false;
  if (url.includes('beacon.sparkloop')) return false;
  if (url.includes('track.hubspot')) return false;
  if (url.includes('/pixel')) return false;
  if (url.includes('logo') && url.includes('medium.com') && !url.includes('miro.medium.com')) return false;
  if (url.includes('data:image')) return false;
  if (url.includes('avatar')) return false;
  if (url.length < 50) return false;
  return true;
}

function getValidThumbnail(article) {
  if (!article.thumbnail) return '';
  if (isValidThumbnail(article.thumbnail)) return article.thumbnail;
  return '';
}

function renderPreview(article) {
  const container = document.getElementById('window-blog');
  if (!container) return;
  
  const panel = container.querySelector('.blog-preview-panel');
  if (!panel) return;
  
  const pubName = getPublicationName(article.link);
  const description = stripHtml(article.description);
  const truncatedDesc = description.length > 200 ? description.substring(0, 200) + '...' : description;
  
  const thumbnail = getValidThumbnail(article);
  const thumbnailHtml = thumbnail 
    ? `<div class="blog-preview-thumbnail"><img src="${thumbnail}" alt="Article thumbnail" /></div>`
    : `<div class="blog-preview-thumbnail"><div class="blog-preview-placeholder">No preview available</div></div>`;
  
  panel.innerHTML = `
    <div class="blog-preview-content">
      ${thumbnailHtml}
      <div class="blog-preview-meta">
        <h3 class="blog-preview-title">${article.title}</h3>
        <div class="blog-preview-publication">
          <span class="blog-preview-pub-icon">📰</span>
          <span class="blog-preview-pub-name">${pubName}</span>
        </div>
        <div class="blog-preview-date">
          <span>📅</span>
          <span>${formatDate(article.pubDate)}</span>
        </div>
      </div>
      <hr class="blog-divider" />
      <div class="blog-preview-description">${truncatedDesc}</div>
      <button class="blog-read-btn" onclick="window.open('${article.link}', '_blank')">Read on Medium ↗</button>
    </div>
  `;
}

function selectArticle(index) {
  blogState.selectedId = index;
  
  const container = document.getElementById('window-blog');
  if (!container) return;
  
  container.querySelectorAll('.blog-entry').forEach(entry => {
    entry.classList.remove('selected');
  });
  
  const entry = container.querySelector(`.blog-entry[data-article-id="${index}"]`);
  if (entry) {
    entry.classList.add('selected');
  }
  
  const article = blogState.articles[index];
  if (article) {
    renderPreview(article);
  }
}

async function initBlog() {
  if (blogState.loaded) {
    renderList();
    if (blogState.articles.length > 0 && blogState.selectedId === null) {
      selectArticle(0);
    }
    return;
  }
  
  renderLoading();
  
  const articles = await fetchArticles();
  
  if (!articles || articles.length === 0) {
    renderError();
    return;
  }
  
  blogState.articles = articles;
  blogState.grouped = groupByPublication(articles);
  blogState.loaded = true;
  
  Object.keys(blogState.grouped).forEach(pub => {
    blogState.expandedFolders[pub] = true;
  });
  
  renderList();
  
  if (articles.length > 0) {
    selectArticle(0);
  }
}

function refreshBlog() {
  localStorage.removeItem('blog-cache');
  blogState.loaded = false;
  blogState.selectedId = null;
  blogState.articles = [];
  blogState.grouped = {};
  blogState.expandedFolders = {};
  initBlog();
}

function openBlogWindow() {
  const existingWindow = document.getElementById('blog');
  if (existingWindow) {
    focusWindow('blog');
    return;
  }
  
  createWindow('blog', 'Blog', icons.blog, '<div id="window-blog"></div>', { width: 1000, height: 600 });
  
  requestAnimationFrame(() => {
    initBlog();
  });
}
