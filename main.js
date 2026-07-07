document.addEventListener('DOMContentLoaded', async () => {
  injectLayout();
  setupInteractions();

  // Route-based fetching
  const path = window.location.pathname;
  if (path.includes('about.html')) {
    await fetchAboutData();
  } else if (path.includes('projects.html')) {
    await fetchProjectsData();
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
        <nav class="nav-links">
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="projects.html">Projects</a>
          <a href="https://www.canadahelps.org/en/charities/oak-bay-fire-fighters-charitable-foundation/" target="_blank" rel="noopener noreferrer" class="btn-primary">Donate</a>
        </nav>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 Oak Bay Firefighters Charitable Foundation. All rights reserved.</p>
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
      if (settings.aboutUsText) {
        // Split by newlines and wrap each paragraph in <p> tags so formatting is preserved
        aboutContainer.innerHTML = settings.aboutUsText
          .split('\n')
          .filter(text => text.trim() !== '')
          .map(text => `<p>${text.trim()}</p>`)
          .join('');
      }
      return;
  } catch (error) {
    aboutContainer.innerHTML = `
      <p>The Oak Bay Firefighters Charitable Foundation (OBFCF) is a registered charity operated by the Oak Bay Professional Firefighters Association.</p>
      <p>Our mission is to support programs that benefit the local community, including financial and social support for families, youth extracurriculars, and community infrastructure like the Firefighters Park.</p>
    `;
  }
}

async function fetchProjectsData() {
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer) return;

  try {
    const projectsRes = await fetchPayloadData('projects');
    const projectsData = await projectsRes.json();
      const projects = projectsData.docs;

      projectsContainer.innerHTML = projects.map(project => {
        let imgUrl = 'https://via.placeholder.com/800x500?text=No+Image';
        if (project.mainImage && project.mainImage.url) {
          imgUrl = project.mainImage.url.startsWith('http') ? project.mainImage.url : payloadBaseUrl + project.mainImage.url;
        }
        
        return `
        <div class="project-card">
          <div class="project-img-container">
            <img src="${imgUrl}" alt="${project.title}" class="project-img">
          </div>
          <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-excerpt">${project.excerpt}</p>
            <a href="${project.projectUrl || 'contact.html'}" ${project.projectUrl && project.projectUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="project-link">Learn More</a>
          </div>
        </div>
      `}).join('');
      return;
  } catch (error) {
    const mockProjects = [
      {
        title: "Firefighters Park Rebuild",
        excerpt: "Funding the complete rebuild of the playground at Firefighters Park in Oak Bay to create a fully accessible, fire-themed community space.",
        imageUrl: "https://images.unsplash.com/photo-1595206133361-119159937a04?auto=format&fit=crop&q=80&w=800&h=500"
      },
      {
        title: "Youth Bursary Program",
        excerpt: "Providing scholarships and bursaries to local high school students pursuing higher education and trades.",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800&h=500"
      }
    ];

    projectsContainer.innerHTML = mockProjects.map(project => `
      <div class="project-card">
        <div class="project-img-container">
          <img src="${project.imageUrl}" alt="${project.title}" class="project-img">
        </div>
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-excerpt">${project.excerpt}</p>
          <a href="contact.html" class="project-link">Learn More</a>
        </div>
      </div>
    `).join('');
  }
}
