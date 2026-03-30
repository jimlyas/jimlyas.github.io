const calState = {
  selectedJobId: null,
  jobs: []
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDate(dateStr) {
  if (dateStr === 'present') {
    return new Date();
  }
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function formatDate(dateStr) {
  if (dateStr === 'present') return 'Present';
  const [year, month] = dateStr.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function formatDuration(startDate, endDate) {
  const start = parseDate(startDate);
  const end = endDate === 'present' ? new Date() : parseDate(endDate);
  
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  if (months < 0) return '0 mos';
  
  if (months < 12) {
    return `${months} mos`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 1 && remainingMonths === 0) {
    return '1 yr';
  }
  
  if (remainingMonths === 0) {
    return `${years} yrs`;
  }
  
  return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mos`;
}

function selectJob(jobId) {
  const job = calState.jobs.find(j => j.id === jobId);
  if (!job) return;
  
  calState.selectedJobId = jobId;
  
  document.querySelectorAll('.cal-timeline-entry').forEach(entry => {
    entry.classList.remove('selected');
  });
  
  const entry = document.querySelector(`.cal-timeline-entry[data-job-id="${jobId}"]`);
  if (entry) {
    entry.classList.add('selected');
  }
  
  renderDetail(job);
}

function renderTimeline() {
  const panel = document.getElementById('cal-timeline-panel');
  if (!panel) return;
  
  const sortedJobs = [...calState.jobs].sort((a, b) => {
    const dateA = parseDate(a.startDate);
    const dateB = parseDate(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });
  
  let trackHTML = '<div class="cal-timeline-track">';
  
  sortedJobs.forEach((job) => {
    const duration = formatDuration(job.startDate, job.endDate);
    const dates = `${formatDate(job.startDate)} — ${formatDate(job.endDate)}`;
    
    trackHTML += `
      <div class="cal-timeline-entry" data-job-id="${job.id}">
        <div class="cal-timeline-node"></div>
        <div class="cal-timeline-connector"></div>
        <div class="cal-timeline-card">
          <span class="cal-card-company">${job.company}</span>
          <span class="cal-card-role">${job.role}</span>
          <span class="cal-card-dates">${dates}</span>
          <span class="cal-card-duration">${duration}</span>
        </div>
      </div>
    `;
  });
  
  trackHTML += '</div>';
  
  panel.innerHTML = trackHTML;
  
  panel.querySelectorAll('.cal-timeline-entry').forEach(entry => {
    entry.addEventListener('click', () => {
      const jobId = entry.dataset.jobId;
      selectJob(jobId);
    });
  });
}

function renderDetail(job) {
  const container = document.querySelector('#workhistory .window-content');
  if (!container) {
    console.error('WorkHistory: window-content container not found');
    return;
  }

  const companyEl = container.querySelector('.cal-detail-company');
  const roleEl = container.querySelector('.cal-detail-role');
  const datesEl = container.querySelector('.cal-detail-dates');
  const descriptionEl = container.querySelector('.cal-detail-description');
  const stackEl = container.querySelector('.cal-detail-stack');

  if (!companyEl || !roleEl || !datesEl || !descriptionEl || !stackEl) {
    console.error('WorkHistory: detail panel elements not found');
    return;
  }

  companyEl.textContent = job.company;
  roleEl.textContent = job.role;
  datesEl.textContent = `${formatDate(job.startDate)} — ${formatDate(job.endDate)}`;
  descriptionEl.innerHTML = job.description.replace(/\n/g, '<br>');
  
  stackEl.innerHTML = '';
  if (job.stack && job.stack.length > 0) {
    job.stack.forEach(tech => {
      const badge = document.createElement('span');
      badge.className = 'cal-stack-badge';
      badge.textContent = tech;
      stackEl.appendChild(badge);
    });
  }
}

function initCalendar() {
  const existingWindow = document.getElementById('workhistory');
  if (!existingWindow) return;
  
  const panel = document.getElementById('cal-timeline-panel');
  if (!panel) return;

  const workData = window.cvData?.experience || [];
  if (workData.length === 0) return;

  calState.jobs = [...workData];
  
  renderTimeline();
  
  const mostRecentJob = [...calState.jobs].sort((a, b) => {
    const dateA = parseDate(a.startDate);
    const dateB = parseDate(b.startDate);
    return dateB.getTime() - dateA.getTime();
  })[0];

  if (mostRecentJob) {
    selectJob(mostRecentJob.id);
  }
}
