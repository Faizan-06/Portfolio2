const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const sections = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
const revealEls = document.querySelectorAll('.reveal');
const backToTopBtn = document.querySelector('.back-to-top');
const yearSpan = document.getElementById('year');
const progressBar = document.querySelector('.scroll-progress-bar');
const skillChips = document.querySelectorAll('.skill-chips span[data-skill]');
const skillInfoBox = document.getElementById('skill-info-box');
const header = document.querySelector('.header');
const typingTextEl = document.getElementById('typing-text');
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const contactForm = document.getElementById('contact-form');
const toast = document.getElementById('toast');
const magneticBtns = document.querySelectorAll('.magnetic');
const tiltElements = document.querySelectorAll('[data-tilt]');

let lastScrollY = 0;
let ticking = false;

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      e.preventDefault();
      const headerOffset = 70;
      const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (navLinks && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        if (navToggle) {
          navToggle.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
      }
    }
  });
});

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('show');
    navToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function onScrollSetActive() {
  const scrollPos = window.scrollY + 90;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

function toggleBackToTop() {
  if (!backToTopBtn) return;
  backToTopBtn.classList.toggle('show', window.scrollY > 500);
}

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function updateScrollProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${scrolled}%`;
}

function updateHeaderOnScroll() {
  if (!header) return;
  const currentScrollY = window.scrollY;

  header.classList.toggle('header-scrolled', currentScrollY > 20);

  if (currentScrollY > lastScrollY && currentScrollY > 250) {
    header.classList.add('header-hidden');
  } else {
    header.classList.remove('header-hidden');
  }

  lastScrollY = currentScrollY;
}

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

let selectedSkill = null;

function activateSkillChips() {
  skillChips.forEach(chip => {
    const level = parseInt(chip.getAttribute('data-skill'), 10) || 80;
    const offset = `${level - 100}%`;
    chip.style.setProperty('--skill-offset', offset);
    chip.classList.add('active');
  });
}

if (skillChips.length && skillInfoBox) {
  skillChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (selectedSkill) {
        selectedSkill.classList.remove('selected');
      }
      chip.classList.add('selected');
      selectedSkill = chip;

      const name = chip.textContent.trim();
      const level = parseInt(chip.getAttribute('data-skill'), 10) || 80;

      const infoContent = skillInfoBox.querySelector('.skill-info-content');
      const progressFill = skillInfoBox.querySelector('.skill-progress-fill');

      if (infoContent) {
        infoContent.innerHTML = `<strong>${name}</strong> <span style="color: var(--text-muted);">· Proficiency: ${level}%</span>`;
      }

      if (progressFill) {
        progressFill.style.width = '0%';
        setTimeout(() => {
          progressFill.style.width = `${level}%`;
        }, 100);
      }

      skillInfoBox.classList.add('show');
    });
  });
}

if ('IntersectionObserver' in window && skillChips.length) {
  const skillsObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activateSkillChips();
          skillsObserver.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  const skillsSection = document.getElementById('skills');
  if (skillsSection) skillsObserver.observe(skillsSection);
} else {
  activateSkillChips();
}

const typingPhrases = [
  'Passionate Web Creator',
  'Design-Loving Developer',
  'Curious Mind',
  'Always Learning, Always Building'
];
let typingPhraseIndex = 0;
let typingCharIndex = 0;
let isDeleting = false;

function typeLoop() {
  if (!typingTextEl) return;

  const currentPhrase = typingPhrases[typingPhraseIndex];
  const visibleText = isDeleting
    ? currentPhrase.slice(0, typingCharIndex--)
    : currentPhrase.slice(0, typingCharIndex++);

  typingTextEl.textContent = visibleText;

  let delay = isDeleting ? 60 : 120;

  if (!isDeleting && typingCharIndex === currentPhrase.length + 1) {
    delay = 2500;
    isDeleting = true;
  } else if (isDeleting && typingCharIndex < 0) {
    isDeleting = false;
    typingPhraseIndex = (typingPhraseIndex + 1) % typingPhrases.length;
    delay = 600;
  }

  setTimeout(typeLoop, delay);
}

typeLoop();

if (cursor && cursorFollower && window.innerWidth > 992) {
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.25;
    cursorY += (mouseY - cursorY) * 0.25;
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;

    cursor.style.transform = `translate(${cursorX - 6}px, ${cursorY - 6}px)`;
    cursorFollower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  const hoverElements = document.querySelectorAll('a, button, .skill-chips span, .project-card, .about-card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorFollower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorFollower.classList.remove('hover');
    });
  });
} else if (cursor && cursorFollower) {
  cursor.style.display = 'none';
  cursorFollower.style.display = 'none';
}

magneticBtns.forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    const span = btn.querySelector('span');
    if (span) {
      span.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    }
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    const span = btn.querySelector('span');
    if (span) {
      span.style.transform = '';
    }
  });
});

tiltElements.forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

function showToast(message) {
  if (!toast) return;
  const toastMessage = toast.querySelector('.toast-message');
  if (toastMessage) {
    toastMessage.textContent = message;
  }
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name && email && message) {
      showToast('Thanks for reaching out! I\'ll get back to you soon.');
      contactForm.reset();
    } else {
      showToast('Please fill in all fields.');
    }
  });
}

function handleScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      onScrollSetActive();
      toggleBackToTop();
      updateScrollProgress();
      updateHeaderOnScroll();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });

handleScroll();

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.classList.add('hidden');
  }
  
  if (!('IntersectionObserver' in window)) {
    setTimeout(() => {
      revealEls.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      });
    }, 50);
  }
});