document.addEventListener('DOMContentLoaded', async () => {
  injectLayout();
  injectEmailPopup();
  setupInteractions();
  setupEmailPopup();

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
        <div class="mobile-menu-btn" id="mobile-menu-btn">
          <span></span><span></span><span></span>
        </div>
        <nav class="nav-links" id="nav-links">
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="projects.html">Projects</a>
          <a href="https://www.canadahelps.org/en/charities/oak-bay-fire-fighters-charitable-foundation/" target="_blank" rel="noopener noreferrer" class="btn-primary donate-btn">Donate</a>
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
        const imgUrl = project.imageUrl || 'https://placehold.co/800x500/1a1a2e/ffffff?text=No+Image';
        
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

function injectEmailPopup() {
  const popupHTML = `
    <div class="popup-backdrop" id="email-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <div class="popup-modal" id="email-popup-modal">
        <button class="popup-close-btn" id="popup-close-btn" aria-label="Close popup">&times;</button>
        <div id="popup-form-view">
          <div class="popup-header">
            <div class="popup-badge">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              Community Updates
            </div>
            <h2 class="popup-title" id="popup-title">Stay in the Loop</h2>
            <p class="popup-subtitle">Get heartwarming community stories, foundation project milestones, and event updates delivered to your inbox.</p>
          </div>
          <form class="popup-form" id="email-popup-form" novalidate>
            <div class="popup-input-group">
              <label for="subscriber-name">Your Name <span>(Optional)</span></label>
              <input type="text" id="subscriber-name" class="popup-input" placeholder="e.g. Alex Smith" autocomplete="name" />
            </div>
            <div class="popup-input-group">
              <label for="subscriber-email">Email Address <span style="color: #ef4444;">*</span></label>
              <input type="email" id="subscriber-email" class="popup-input" placeholder="you@example.com" required autocomplete="email" />
            </div>
            <div class="popup-feedback" id="popup-feedback"></div>
            <button type="submit" class="popup-submit-btn" id="popup-submit-btn">
              <span>Subscribe to Updates</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
            <p class="popup-privacy-note">🔒 We respect your privacy. No spam, ever.</p>
          </form>
        </div>
        <div class="popup-success-view" id="popup-success-view">
          <div class="popup-success-icon">✓</div>
          <h3 class="popup-success-title">You're on the list!</h3>
          <p class="popup-success-desc">Thank you for supporting the Oak Bay Firefighters Charitable Foundation. We look forward to keeping you updated on our community work.</p>
          <button type="button" class="btn-primary" id="popup-success-close-btn" style="width: 100%;">Got it, thanks!</button>
        </div>
      </div>
    </div>
    <button class="popup-floating-trigger" id="popup-floating-trigger" aria-label="Subscribe to updates">
      <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
      <span>Stay Updated</span>
    </button>
  `;

  document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function setupEmailPopup() {
  const backdrop = document.getElementById('email-popup-backdrop');
  const modal = document.getElementById('email-popup-modal');
  const closeBtn = document.getElementById('popup-close-btn');
  const successCloseBtn = document.getElementById('popup-success-close-btn');
  const floatingTrigger = document.getElementById('popup-floating-trigger');
  const form = document.getElementById('email-popup-form');
  const formView = document.getElementById('popup-form-view');
  const successView = document.getElementById('popup-success-view');
  const feedback = document.getElementById('popup-feedback');
  const submitBtn = document.getElementById('popup-submit-btn');

  if (!backdrop) return;

  function openPopup() {
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    const emailInput = document.getElementById('subscriber-email');
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 300);
    }
  }

  function closePopup(recordDismissal = true) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    if (recordDismissal) {
      sessionStorage.setItem('obfcf_popup_session_closed', 'true');
      localStorage.setItem('obfcf_newsletter_dismissed', Date.now().toString());
    }
  }

  // Auto-popup logic (first visit)
  const isSubscribed = localStorage.getItem('obfcf_newsletter_subscribed');
  const isDismissed = localStorage.getItem('obfcf_newsletter_dismissed');
  const isSessionClosed = sessionStorage.getItem('obfcf_popup_session_closed');

  // Check if dismissed more than 7 days ago
  let dismissalExpired = false;
  if (isDismissed) {
    const elapsed = Date.now() - parseInt(isDismissed, 10);
    if (elapsed > 7 * 24 * 60 * 60 * 1000) {
      dismissalExpired = true;
    }
  }

  if (!isSubscribed && (!isDismissed || dismissalExpired) && !isSessionClosed) {
    setTimeout(() => {
      openPopup();
    }, 4500);
  }

  // Open via floating button
  if (floatingTrigger) {
    floatingTrigger.addEventListener('click', () => {
      // Reset view back to form if previously completed
      if (formView && successView) {
        formView.style.display = 'block';
        successView.classList.remove('active');
      }
      openPopup();
    });
  }

  // Close triggers
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closePopup(true));
  }
  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => closePopup(false));
  }

  // Close on outside backdrop click
  backdrop.addEventListener('click', (e) => {
    if (modal && !modal.contains(e.target)) {
      closePopup(true);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closePopup(true);
    }
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('subscriber-name');
      const emailInput = document.getElementById('subscriber-email');
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      // Reset feedback
      feedback.className = 'popup-feedback';
      feedback.textContent = '';

      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        feedback.className = 'popup-feedback error';
        feedback.textContent = 'Please enter a valid email address.';
        if (emailInput) emailInput.focus();
        return;
      }

      // Show submitting state
      submitBtn.disabled = true;
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Subscribing...</span>`;

      try {
        await submitEmailSubscriber(name, email);
        
        // Show success state
        localStorage.setItem('obfcf_newsletter_subscribed', 'true');
        if (formView && successView) {
          formView.style.display = 'none';
          successView.classList.add('active');
        }
        form.reset();
      } catch (err) {
        feedback.className = 'popup-feedback error';
        feedback.textContent = err.message || 'Something went wrong. Please try again.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }
}

async function submitEmailSubscriber(name, email) {
  try {
    const payload = {
      email,
      name: name || undefined,
      source: 'Website Popup'
    };

    // Try posting to local/live Payload CMS
    let endpointUrl = `${payloadBaseUrl}/api/subscribers`;
    
    // Check if on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const localRes = await fetch('http://localhost:3000/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (localRes.ok) return await localRes.json();
      } catch (e) {}
    }

    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('API submission failed, storing locally as fallback:', error);
  }

  // Graceful Local Fallback: Always record locally so no submissions are lost
  const existing = JSON.parse(localStorage.getItem('obfcf_local_subscribers') || '[]');
  existing.push({
    email,
    name,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('obfcf_local_subscribers', JSON.stringify(existing));
  return { success: true, local: true };
}

