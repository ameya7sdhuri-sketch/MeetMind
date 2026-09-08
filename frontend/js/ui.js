/**
 * MeetMind Common UI Utilities & Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initToastSystem();
  initUserDropdown();
  initMobileMenu();
  init3DRotatingDeck();
  // Standard multi-page navigation preserves full DOM lifecycle & script execution
});

/**
 * Dark / Light Mode Switcher & Global Theme Handler
 */
function applyTheme(theme) {
  const isDark = theme === 'dark';
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  localStorage.setItem('meetmind_theme', isDark ? 'dark' : 'light');
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem('meetmind_theme') || 'light';
  applyTheme(savedTheme);
}

// Global Delegated Theme Toggle Event Listener
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-toggle-btn, [aria-label="Toggle Light and Dark Mode"]');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const targetTheme = isCurrentlyDark ? 'light' : 'dark';
    applyTheme(targetTheme);

    if (typeof window.showToast === 'function') {
      window.showToast(`Switched to ${targetTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info', 2000);
    }
    return;
  }

  const deleteBtn = e.target.closest('#btn-delete-meeting, #btn-delete-active-meeting, .btn-delete-meeting');
  if (deleteBtn) {
    e.preventDefault();
    e.stopPropagation();

    localStorage.removeItem('current_meeting_analysis');
    sessionStorage.removeItem('current_meeting_analysis');

    const activeBanner = document.getElementById('active-meeting-banner');
    if (activeBanner) activeBanner.classList.add('hidden');

    if (typeof window.showToast === 'function') {
      window.showToast('Meeting deleted successfully. Ready for a new upload.', 'success', 3000);
    }

    if (window.location.pathname.includes('transcript')) {
      setTimeout(() => {
        window.location.href = 'upload.html';
      }, 350);
    }
  }
});


/**
 * Toast Notification System
 */
function initToastSystem() {
  if (!document.getElementById('toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(toastContainer);
  }
}

window.showToast = function(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'error' ? 'bg-red-900/90 border-red-500/30' : type === 'success' ? 'bg-emerald-900/90 border-emerald-500/30' : 'bg-surface-container-highest/95 border-outline-variant/30';
  const icon = type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info';

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-4 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px] ${type === 'error' ? 'text-red-400' : type === 'success' ? 'text-emerald-400' : 'text-primary'}">${icon}</span>
    <span class="font-body-md text-sm">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger smooth enter
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

/**
 * User Avatar Dropdown Menu
 */
function initUserDropdown() {
  const avatarBtns = document.querySelectorAll('.user-avatar-btn');
  avatarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = btn.nextElementSibling;
      if (menu && menu.classList.contains('user-dropdown-menu')) {
        menu.classList.toggle('hidden');
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.user-dropdown-menu').forEach(menu => menu.classList.add('hidden'));
  });
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav-drawer');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }
}

/**
 * 3D Rotating Fan Card Deck Stack Controller
 */
function init3DRotatingDeck() {
  const viewport = document.getElementById('deck-viewport');
  const paginationContainer = document.getElementById('deck-pagination-dots');

  if (!viewport) return;

  const cards = Array.from(viewport.querySelectorAll('.rotating-card'));
  if (cards.length === 0) return;

  let activeIndex = 0;
  let startX = 0;
  let isDragging = false;

  // Render pagination dots
  if (paginationContainer) {
    paginationContainer.innerHTML = cards.map((_, i) => `
      <button aria-label="Go to card ${i + 1}" onclick="deckGoTo(${i})" class="deck-dot h-3 rounded-full ${i === 0 ? 'active-dot' : 'w-3 bg-outline-variant/40 hover:bg-outline'}"></button>
    `).join('');
  }

  function updateDeckLayout() {
    const total = cards.length;

    cards.forEach((card, i) => {
      // Calculate circular signed offset relative to activeIndex
      let diff = (i - activeIndex + total) % total;
      if (diff > total / 2) diff -= total;

      card.classList.remove('is-active');

      if (diff === 0) {
        // Active Center Front Card
        card.style.transform = `translate3d(-50%, -50%, 0px) rotate(0deg) scale(1)`;
        card.style.zIndex = '30';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        card.classList.add('is-active');
      } else if (diff === 1) {
        // Right Card Stack Behind
        card.style.transform = `translate3d(calc(-50% + 155px), -50%, -120px) rotate(13deg) scale(0.85)`;
        card.style.zIndex = '20';
        card.style.opacity = '0.75';
        card.style.pointerEvents = 'auto';
      } else if (diff === -1) {
        // Left Card Stack Behind
        card.style.transform = `translate3d(calc(-50% - 155px), -50%, -120px) rotate(-13deg) scale(0.85)`;
        card.style.zIndex = '20';
        card.style.opacity = '0.75';
        card.style.pointerEvents = 'auto';
      } else if (diff === 2) {
        // Far Right Card Stack
        card.style.transform = `translate3d(calc(-50% + 265px), -50%, -240px) rotate(22deg) scale(0.70)`;
        card.style.zIndex = '10';
        card.style.opacity = '0.35';
        card.style.pointerEvents = 'auto';
      } else if (diff === -2) {
        // Far Left Card Stack
        card.style.transform = `translate3d(calc(-50% - 265px), -50%, -240px) rotate(-22deg) scale(0.70)`;
        card.style.zIndex = '10';
        card.style.opacity = '0.35';
        card.style.pointerEvents = 'auto';
      } else {
        // Overflow hidden cards
        card.style.transform = `translate3d(-50%, -50%, -350px) rotate(0deg) scale(0.5)`;
        card.style.zIndex = '0';
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
      }
    });

    // Update Dots
    if (paginationContainer) {
      const dots = Array.from(paginationContainer.children);
      dots.forEach((dot, i) => {
        if (i === activeIndex) {
          dot.className = "deck-dot active-dot h-3 rounded-full";
        } else {
          dot.className = "deck-dot h-3 w-3 rounded-full bg-outline-variant/40 hover:bg-outline";
        }
      });
    }
  }

  window.deckGoTo = function(index) {
    activeIndex = (index + cards.length) % cards.length;
    updateDeckLayout();
  };

  window.handleCardClick = function(index) {
    if (index === activeIndex) {
      activeIndex = (activeIndex + 1) % cards.length;
    } else {
      activeIndex = index;
    }
    updateDeckLayout();
  };

  // Touch / Drag Gesture Seeker
  function handleTouchStart(e) {
    isDragging = true;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = endX - startX;

    if (deltaX < -40) {
      // Swipe left -> Next card
      activeIndex = (activeIndex + 1) % cards.length;
      updateDeckLayout();
    } else if (deltaX > 40) {
      // Swipe right -> Prev card
      activeIndex = (activeIndex - 1 + cards.length) % cards.length;
      updateDeckLayout();
    }
  }

  viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
  viewport.addEventListener('touchend', handleTouchEnd);

  updateDeckLayout();
}

/**
 * MeetMind Dynamic SPA Router & Smooth Page Transition Engine
 */
function initSPARouter() {
  const pageCache = new Map();

  function updateActiveNavLinks(currentPathname) {
    const rawPath = currentPathname || window.location.pathname.split('/').pop() || 'index.html';
    const current = rawPath.split('#')[0] || 'index.html';
    const navLinks = document.querySelectorAll('header nav a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPath = href.split('/').pop() || 'index.html';

      const isActive = (linkPath === current) || 
                       (current === '' && linkPath === 'index.html') || 
                       (current === '/' && linkPath === 'index.html');

      if (isActive) {
        link.classList.add('active-nav-item');
      } else {
        link.classList.remove('active-nav-item');
      }
    });
  }

  function reinitializePageScripts(pathname) {
    const page = pathname.split('/').pop() || 'index.html';

    if (typeof initThemeToggle === 'function') initThemeToggle();
    if (typeof initMobileMenu === 'function') initMobileMenu();

    if (page === 'index.html' || page === '') {
      if (typeof init3DRotatingDeck === 'function') init3DRotatingDeck();
    } else if (page === 'upload.html') {
      if (typeof window.initUploadPage === 'function') window.initUploadPage();
    } else if (page === 'transcript.html') {
      if (typeof window.initTranscriptWorkspace === 'function') window.initTranscriptWorkspace();
    } else if (page === 'ai-assistant.html') {
      if (typeof window.initAIAssistantPage === 'function') window.initAIAssistantPage();
    }
  }

  async function loadPage(url, pushHistory = true) {
    try {
      const targetUrl = new URL(url, window.location.href);
      const pathname = targetUrl.pathname.split('/').pop() || 'index.html';

      const main = document.querySelector('main');
      if (!main) return;

      // 1. Smooth Slide-Out & Blur Transition on <main>
      main.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease, filter 0.2s ease';
      main.style.opacity = '0';
      main.style.transform = 'translateY(-12px) scale(0.985)';
      main.style.filter = 'blur(4px)';

      // 2. Fetch HTML content or retrieve from cache
      let htmlText = pageCache.get(pathname);
      if (!htmlText) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Page fetch failed');
        htmlText = await res.text();
        pageCache.set(pathname, htmlText);
      }

      await new Promise(r => setTimeout(r, 210));

      // 3. Parse fetched HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const newMain = doc.querySelector('main');
      const newTitle = doc.querySelector('title');

      if (newMain) {
        // Swap <main> contents and class names
        main.innerHTML = newMain.innerHTML;
        main.className = newMain.className;

        if (newTitle) {
          document.title = newTitle.innerText;
        }

        if (pushHistory) {
          history.pushState({ path: url }, '', url);
        }

        // 4. Update Navigation Links
        updateActiveNavLinks(pathname);

        // 5. Scroll smoothly to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // 6. Re-initialize page scripts
        reinitializePageScripts(pathname);

        // 7. Smooth Slide-In Entrance Animation on <main>
        main.style.transition = 'none';
        main.style.opacity = '0';
        main.style.transform = 'translateY(16px) scale(0.99)';
        main.style.filter = 'blur(6px)';

        void main.offsetHeight; // Force DOM reflow

        main.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, filter 0.35s ease';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0) scale(1)';
        main.style.filter = 'blur(0)';
      }
    } catch (err) {
      console.warn('SPA Navigation Fallback:', err);
      window.location.href = url;
    }
  }

  // Intercept all internal navigation clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;

    try {
      const targetUrl = new URL(link.href, window.location.href);
      if (targetUrl.origin === window.location.origin) {
        e.preventDefault();
        loadPage(link.href, true);
      }
    } catch (err) {
      // Fallback normal navigation
    }
  });

  // Handle browser Back / Forward history buttons
  window.addEventListener('popstate', () => {
    loadPage(window.location.href, false);
  });
}
