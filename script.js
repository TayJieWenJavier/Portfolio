(() => {
  'use strict';

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const topButtons = document.querySelectorAll('[data-back-top]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
  let lastDialogTrigger = null;

  function closeNavigation() {
    navLinks?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
  }

  navToggle?.addEventListener('click', () => {
    const open = !navLinks.classList.contains('is-open');
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', closeNavigation);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation();
  });
  document.addEventListener('click', (event) => {
    if (navLinks?.classList.contains('is-open') && !header?.contains(event.target)) closeNavigation();
  });

  // Scroll to the document's actual first pixel, not the last navigation section.
  // There is no snap-scrolling, no next-section shortcut and no hash navigation here.
  topButtons.forEach((button) => button.addEventListener('click', () => {
    closeNavigation();
    document.querySelectorAll('.case-dialog[open]').forEach((dialog) => dialog.close());
    if (location.protocol === 'https:' || location.protocol === 'http:') {
      history.replaceState(null, '', location.pathname + location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior() });
  }));

  const floatingTop = document.querySelector('.floating-top');
  let scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      floatingTop?.classList.toggle('is-visible', window.scrollY > 560);
      scheduled = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('[data-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.dialog);
      if (!(dialog instanceof HTMLDialogElement)) return;
      lastDialogTrigger = button;
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add('dialog-open');
    });
  });
  document.querySelectorAll('.case-dialog').forEach((dialog) => {
    dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.querySelectorAll('[data-close-then-nav]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        dialog.close();
        if (target) {
          history.replaceState(null, '', link.getAttribute('href'));
          target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
        }
      });
    });
    dialog.addEventListener('click', (event) => {
      // Clicking the backdrop closes, while clicking dialog content does not.
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('.case-dialog[open]')) document.body.classList.remove('dialog-open');
      lastDialogTrigger?.focus({ preventScroll: true });
    });
  });

  // Subtle transitions; content remains visible if JavaScript or observer support is absent.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const reveal = document.querySelectorAll('.project-card, .skill-tile, .award-card, .timeline-item');
    reveal.forEach((node) => node.classList.add('can-reveal'));
    const observer = new IntersectionObserver((entries, self) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        self.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    reveal.forEach((node) => observer.observe(node));
  }
  // Reading progress (visual only)
  const bar = document.getElementById('reading-progress');
  function progress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h <= 0 ? 0 : Math.min(100, Math.max(0, window.scrollY / h * 100))) + '%';
  }
  window.addEventListener('scroll', () => requestAnimationFrame(progress), { passive: true });
  window.addEventListener('resize', progress, { passive: true });
  progress();

  // Hidden extra: Ctrl + Shift + H toggles Blueprint Mode
  const toast = document.getElementById('mode-toast');
  let toastTimer;
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyH') {
      event.preventDefault();
      const on = document.body.classList.toggle('blueprint');
      if (toast) {
        toast.textContent = on ? 'BLUEPRINT MODE // ENABLED' : 'BLUEPRINT MODE // DISABLED';
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 2300);
      }
    }
  });
})();
