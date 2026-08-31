document.addEventListener('DOMContentLoaded', async () => {
  injectLayout();
  setupInteractions();

  // Route-based fetching
  const path = window.location.pathname;
  if (path.includes('about.html')) {
    await fetchAboutData();
  } else if (path.includes('projects.html')) {
    await fetchProjectsData();
  } else if (path.includes('project-detail.html')) {
    await fetchSingleProjectData();
  }
});

function injectLayout() {
  const navbarHTML = `
    <header class="navbar">
      <div class="nav-container">
        <div class="logo">
          <a href="index.html">
            <img src="/logo.png" alt="Oak Bay Firefighters Charitable Foundation Logo" />
          </a>
        </div>
        <div class="mobile-menu-btn" id="mobile-menu-btn">
          <span></span><span></span><span></span>
        </div>
        <nav class="nav-links" id="nav-links">
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="projects.html">Projects</a>
          <a href="contact.html">Contact</a>
          <a href="https://www.canadahelps.org/en/charities/oak-bay-fire-fighters-charitable-foundation/" target="_blank" rel="noopener noreferrer" class="btn-primary donate-btn">Donate</a>
        </nav>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer class="footer">
      <div class="container footer-container">
        <div class="footer-info">
          <p class="footer-legal"><strong>Oak Bay Firefighters Charitable Foundation</strong> is a registered Canadian charity.</p>
          <p class="footer-charity">CRA Registered Charity # <strong>850474487RR0001</strong> &bull; Tax receipts issued for eligible donations.</p>
        </div>
        <div class="footer-links">
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="projects.html">Projects</a>
          <a href="contact.html">Contact & Donate</a>
          <a href="privacy.html">Privacy Policy</a>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Oak Bay Firefighters Charitable Foundation. All rights reserved. 100% Volunteer Operated.</p>
        </div>
      </div>
    </footer>
  `;

  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (navbarPlaceholder) navbarPlaceholder.innerHTML = navbarHTML;
  if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;
}

function setupInteractions() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (path.includes(href) || (path === '/' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinksContainer = document.getElementById('nav-links');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      navLinksContainer.classList.toggle('show-mobile');
    });
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.slide-up').forEach(el => {
    observer.observe(el);
  });
}

let payloadBaseUrl = 'https://obfcf.vercel.app';

async function fetchPayloadData(endpoint) {
  // If running locally, check local servers first
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
      const res = await fetch(`http://localhost:3000/api/${endpoint}`);
      if (res.ok) {
        payloadBaseUrl = 'http://localhost:3000';
        return res;
      }
    } catch (e) {
      try {
        const res = await fetch(`http://localhost:3001/api/${endpoint}`);
        if (res.ok) {
          payloadBaseUrl = 'http://localhost:3001';
          return res;
        }
      } catch (e) {}
    }
  }

  // Production (or fallback if local is off)
  const res = await fetch(`https://obfcf.vercel.app/api/${endpoint}`);
  if (res.ok) {
    payloadBaseUrl = 'https://obfcf.vercel.app';
    return res;
  }
  
  throw new Error("API not connected");
}

async function fetchAboutData() {
  const aboutContainer = document.getElementById('about-content');
  if (!aboutContainer) return;

  try {
    const settingsRes = await fetchPayloadData('globals/site-settings');
    const settings = await settingsRes.json();
    if (settings && settings.aboutUsText) {
      aboutContainer.innerHTML = settings.aboutUsText
        .split('\n')
        .filter(text => text.trim() !== '')
        .map(text => `<p>${text.trim()}</p>`)
        .join('');
    }
  } catch (error) {
    // Retain comprehensive static pre-rendered HTML
  }
}

function resolveProjectUrl(project) {
  if (project.projectUrl && project.projectUrl.trim() !== '') {
    return project.projectUrl;
  }
  const title = (project.title || '').toLowerCase();
  if (title.includes('burn fund')) return 'project-burn-fund.html';
  if (title.includes('scoreboard')) return 'project-scoreboard.html';
  if (title.includes('santa')) return 'project-santas-anonymous.html';
  if (title.includes('nicu') || title.includes('neonatal')) return 'project-nicu.html';
  if (title.includes('bursar')) return 'project-bursaries.html';
  
  // Any newly added project in Payload CMS automatically gets its dynamic detail page
  if (project.id) {
    return `project-detail.html?id=${project.id}`;
  }
  return 'projects.html';
}

async function fetchProjectsData() {
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer) return;

  try {
    const projectsRes = await fetchPayloadData('projects');
    const projectsData = await projectsRes.json();
    const projects = projectsData.docs;

    if (projects && projects.length > 0) {
      projectsContainer.innerHTML = projects.map(project => {
        const imgUrl = project.imageUrl || 'https://placehold.co/800x500/1a1a2e/ffffff?text=No+Image';
        const projectHref = resolveProjectUrl(project);
        const isExternal = projectHref.startsWith('http');
        
        return `
        <div class="project-card">
          <div class="project-img-container">
            <img src="${imgUrl}" alt="${project.title}" class="project-img">
          </div>
          <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-excerpt">${project.excerpt}</p>
            <a href="${projectHref}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="project-link">Learn More</a>
          </div>
        </div>
      `;
      }).join('');
    }
  } catch (error) {
    // Retain comprehensive static pre-rendered project cards
  }
}

async function fetchSingleProjectData() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const titleEl = document.getElementById('project-title');
  const imgEl = document.getElementById('project-img');
  const bodyEl = document.getElementById('project-body');
  const partnerCard = document.getElementById('partner-card');
  const partnerLink = document.getElementById('partner-link');

  if (!projectId) {
    if (titleEl) titleEl.textContent = 'Project Not Specified';
    if (bodyEl) bodyEl.innerHTML = '<p>Please select a project from our <a href="projects.html" class="highlight">Projects page</a>.</p>';
    return;
  }

  try {
    const projectsRes = await fetchPayloadData('projects');
    const projectsData = await projectsRes.json();
    const project = (projectsData.docs || []).find(p => String(p.id) === String(projectId));

    if (project) {
      document.title = `${project.title} | Oak Bay Firefighters Charitable Foundation`;
      if (titleEl) titleEl.textContent = project.title;

      if (imgEl && project.imageUrl) {
        imgEl.src = project.imageUrl;
        imgEl.alt = project.title;
        imgEl.style.display = 'block';
        imgEl.onerror = () => { imgEl.style.display = 'none'; };
      }

      if (bodyEl && project.excerpt) {
        bodyEl.innerHTML = project.excerpt
          .split('\n')
          .filter(p => p.trim() !== '')
          .map(p => `<p>${p.trim()}</p>`)
          .join('');
      }

      if (partnerCard && partnerLink && project.projectUrl && project.projectUrl.trim() !== '') {
        partnerLink.href = project.projectUrl;
        partnerCard.style.display = 'block';
      }
    } else {
      if (titleEl) titleEl.textContent = 'Project Not Found';
      if (bodyEl) bodyEl.innerHTML = '<p>The requested project could not be found. View all our active initiatives on the <a href="projects.html" class="highlight">Projects page</a>.</p>';
    }
  } catch (err) {
    if (titleEl) titleEl.textContent = 'Project Information';
    if (bodyEl) bodyEl.innerHTML = '<p>Unable to load project details at this time. Please explore our work on the <a href="projects.html" class="highlight">Projects page</a>.</p>';
  }
}



