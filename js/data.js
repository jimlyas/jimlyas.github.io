const CACHE_KEY = 'jimlyas-cv-data';
const CACHE_TTL = 24 * 60 * 60 * 1000;
const GITHUB_USERNAME = 'jimlyas';

let cachedData = null;

const monthMap = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

function parseDateToYYYYMM(dateStr) {
  if (dateStr === 'Present') return 'present';
  const parts = dateStr.trim().split(' ');
  if (parts.length === 2) {
    const month = monthMap[parts[0]];
    const year = parts[1];
    return `${year}-${month}`;
  }
  return dateStr;
}

const LINKEDIN_DATA = {
  "name": "Jimly Asshiddiqy",
  "headline": "Android Application Developer | Google Cloud Enthusiast | ERP SAP Certified",
  "location": "Jakarta, Indonesia",
  "summary": "Passionate Android developer with expertise in building high-quality mobile applications. Experienced in Kotlin, Jetpack Compose, and Google Cloud technologies. Committed to writing clean, maintainable code and staying updated with the latest mobile development trends.",
  "email": "j_mly@ymail.com",
  "github": "jimlyas",
  "linkedin": "jimlyas",
  "experience": [
    {
      "id": "job-1",
      "company": "Accenture",
      "role": "Custom Software Engineering Specialist",
      "startDate": "2022-09",
      "endDate": "present",
      "description": "Design, build and configure applications to meet business process and application requirements for Android Project.\nCollaborate with cross-functional teams to deliver high-quality mobile solutions.",
      "stack": ["Android", "Kotlin", "Jetpack Compose", "Gradle", "Google Analytics"]
    },
    {
      "id": "job-2",
      "company": "Telkom Indonesia",
      "role": "Junior Developer",
      "startDate": "2019-03",
      "endDate": "2022-08",
      "description": "Design, build and configure applications to meet business process and application requirements for Android Project.\nDeveloped internal applications for business operations.",
      "stack": ["Android", "Kotlin", "Gradle", "Google Analytics"]
    },
    {
      "id": "job-3",
      "company": "Komatsu Indonesia",
      "role": "Development Intern",
      "startDate": "2018-05",
      "endDate": "2018-07",
      "description": "Develop Mobile Application to support company's business process.\nDuring internship, finished developing two applications for company's internal use.",
      "stack": ["Android", "Kotlin", "REST API"]
    }
  ],
  "education": [
    {
      "institution": "Telkom University",
      "degree": "Bachelor's in Information System",
      "year": "2021"
    }
  ],
  "certifications": [
    {
      "name": "SAP Certified Application Associate",
      "issuer": "SAP",
      "year": "2022"
    }
  ],
  "skills": {
    "Languages": [
      { name: "Java", level: "Expert" },
      { name: "Kotlin", level: "Expert" },
      { name: "Python", level: "Intermediate" },
      { name: "JavaScript", level: "Intermediate" },
      { name: "SQL", level: "Proficient" }
    ],
    "Frameworks": [
      { name: "Jetpack Compose", level: "Expert" },
      { name: "Android SDK", level: "Expert" },
      { name: "Qt", level: "Proficient" }
    ],
    "Tools": [
      { name: "Git", level: "Expert" },
      { name: "Gradle", level: "Expert" },
      { name: "Docker", level: "Proficient" },
      { name: "Android Studio", level: "Expert" },
      { name: "VS Code", level: "Expert" },
      { name: "Figma", level: "Proficient" },
      { name: "Google Analytics", level: "Proficient" }
    ],
    "Cloud": [
      { name: "GCP", level: "Expert" },
      { name: "Firebase", level: "Expert" },
      { name: "SAP", level: "Certified" }
    ]
  }
};

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function showLoadingDialog(message) {
  let dialog = document.querySelector('.loading-dialog');
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.className = 'loading-dialog';
    dialog.innerHTML = `
      <div class="loading-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
      </div>
      <div class="loading-message">${message}</div>
    `;
    document.body.appendChild(dialog);
  }
  dialog.querySelector('.loading-message').textContent = message;
  dialog.classList.remove('hidden');
  return dialog;
}

function hideLoadingDialog() {
  const dialog = document.querySelector('.loading-dialog');
  if (dialog) {
    dialog.classList.add('hidden');
  }
}

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (e) {
    console.warn('Cache read error:', e);
    return null;
  }
}

function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
}

async function fetchGitHubData() {
  const [userResponse, reposResponse] = await Promise.all([
    fetchWithTimeout(`https://api.github.com/users/${GITHUB_USERNAME}`),
    fetchWithTimeout(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stargazers&per_page=10`)
  ]);
  
  if (!userResponse.ok) throw new Error('GitHub user fetch failed');
  if (!reposResponse.ok) throw new Error('GitHub repos fetch failed');
  
  const user = await userResponse.json();
  const repos = await reposResponse.json();
  
  return {
    github: {
      name: user.name || user.login,
      bio: user.bio,
      avatar: user.avatar_url,
      location: user.location,
      followers: user.followers,
      publicRepos: user.public_repos,
      blog: user.blog,
      htmlUrl: user.html_url
    },
    repos: repos.map(repo => ({
      name: repo.name,
      description: repo.description || 'No description',
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      forks: repo.forks_count
    }))
  };
}

async function fetchAllData(showLoading = true) {
  const cached = getCachedData();
  if (cached) {
    return cached;
  }
  
  let loadingDialog = null;
  if (showLoading) {
    loadingDialog = showLoadingDialog('Connecting to network...');
  }
  
  try {
    const gitHubData = await fetchGitHubData();
    
    const mergedData = {
      ...LINKEDIN_DATA,
      ...gitHubData,
      github: {
        ...gitHubData.github,
        name: LINKEDIN_DATA.name || gitHubData.github?.name,
        location: LINKEDIN_DATA.location || gitHubData.github?.location
      }
    };
    
    setCachedData(mergedData);
    return mergedData;
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      ...LINKEDIN_DATA,
      github: {
        name: LINKEDIN_DATA.name,
        avatar: '',
        htmlUrl: `https://github.com/${GITHUB_USERNAME}`
      },
      repos: []
    };
  } finally {
    if (loadingDialog) {
      hideLoadingDialog();
    }
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchAllData, clearCache, getCachedData };
}
