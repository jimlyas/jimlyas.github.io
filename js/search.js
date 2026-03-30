let searchIndex = [];
let searchWindow = null;

function buildSearchIndex(data) {
  searchIndex = [];
  
  if (data) {
    if (data.name) {
      searchIndex.push({ type: 'about', label: 'About Me', content: data.name });
    }
    if (data.headline) {
      searchIndex.push({ type: 'about', label: 'About Me', content: data.headline });
    }
    if (data.summary) {
      searchIndex.push({ type: 'about', label: 'About Me', content: data.summary });
    }
    if (data.location) {
      searchIndex.push({ type: 'about', label: 'About Me', content: data.location });
    }
    
    if (data.experience && Array.isArray(data.experience)) {
      data.experience.forEach((exp, i) => {
        searchIndex.push({ type: 'work', label: 'Work History', content: `${exp.company} - ${exp.role}` });
        if (exp.description) {
          searchIndex.push({ type: 'work', label: 'Work History', content: exp.description });
        }
        if (exp.techStack) {
          exp.techStack.forEach(tech => {
            searchIndex.push({ type: 'work', label: 'Work History', content: tech });
          });
        }
      });
    }
    
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach(edu => {
        searchIndex.push({ type: 'education', label: 'Education', content: `${edu.degree} at ${edu.institution}` });
      });
    }
    
    if (data.certifications && Array.isArray(data.certifications)) {
      data.certifications.forEach(cert => {
        searchIndex.push({ type: 'education', label: 'Education', content: cert.name });
      });
    }
    
    if (data.skills) {
      Object.values(data.skills).flat().forEach(skill => {
        searchIndex.push({ type: 'skills', label: 'Skills', content: skill });
      });
    }
  }
  
  if (data && data.repos && Array.isArray(data.repos)) {
    data.repos.forEach(repo => {
      searchIndex.push({ type: 'repos', label: 'My Repositories', content: repo.name });
      if (repo.description) {
        searchIndex.push({ type: 'repos', label: 'My Repositories', content: repo.description });
      }
      if (repo.language) {
        searchIndex.push({ type: 'repos', label: 'My Repositories', content: repo.language });
      }
    });
  }
}

function searchContent(query) {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return searchIndex.filter(item => {
    return item.content.toLowerCase().includes(lowerQuery);
  }).map(item => {
    const index = item.content.toLowerCase().indexOf(lowerQuery);
    const start = Math.max(0, index - 30);
    const end = Math.min(item.content.length, index + query.length + 30);
    let snippet = item.content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < item.content.length) snippet = snippet + '...';
    
    return {
      ...item,
      snippet: snippet.replace(new RegExp(`(${query})`, 'gi'), '<strong>$1</strong>')
    };
  });
}

function openSearchDialog() {
  const content = `
    <div style="padding: 12px;">
      <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        <label style="white-space: nowrap;">Search:</label>
        <input type="text" id="search-input" style="flex: 1; padding: 4px; border: 2px inset #c0c0c0;" placeholder="Type to search..." autofocus>
      </div>
      <div style="border: 2px inset #c0c0c0; height: 200px; overflow-y: auto; background: #fff;">
        <div id="search-results" style="padding: 8px; color: #808080;">
          Enter a search term above
        </div>
      </div>
    </div>
  `;
  
  if (typeof createWindow === 'function') {
    createWindow('search-dialog', 'Find...', icons.search, content, { width: 450, height: 320 });
    
    setTimeout(() => {
      const input = document.getElementById('search-input');
      const results = document.getElementById('search-results');
      
      if (input) {
        input.focus();
        input.addEventListener('input', (e) => {
          const query = e.target.value;
          const results_data = searchContent(query);
          
          if (!query || query.length < 2) {
            results.innerHTML = '<div style="color: #808080;">Enter a search term above</div>';
            return;
          }
          
          if (results_data.length === 0) {
            results.innerHTML = '<div style="color: #808080;">No results found</div>';
            return;
          }
          
          results.innerHTML = results_data.map(item => `
            <div class="search-result-item" data-type="${item.type}" style="padding: 6px 4px; border-bottom: 1px solid #e0e0e0; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <strong>${item.label}</strong>
              </div>
              <div style="font-size: 11px; color: #666;">${item.snippet}</div>
            </div>
          `).join('');
          
          results.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
              const type = el.dataset.type;
              closeWindow('search-dialog');
              
              setTimeout(() => {
                openWindowById(type);
              }, 100);
            });
          });
        });
      }
    }, 0);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildSearchIndex, searchContent, openSearchDialog };
}
