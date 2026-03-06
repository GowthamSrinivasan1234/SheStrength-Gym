/* ============================================
   SheStrength - Main JavaScript
   ============================================ */

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// ===== MOBILE HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('open');
    });
  });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (href === '#' || href.length < 2) return;

    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      var offset = 80;
      var position = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: position, behavior: 'smooth' });
    }
  });
});

// ===== SCROLL REVEAL ANIMATIONS =====
function revealOnScroll() {
  var elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  var windowHeight = window.innerHeight;

  elements.forEach(function(el) {
    var elementTop = el.getBoundingClientRect().top;
    var revealPoint = 120;

    if (elementTop < windowHeight - revealPoint) {
      el.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== CONTACT FORM HANDLER =====
function handleContactForm(e) {
  e.preventDefault();

  var name = document.getElementById('name').value.trim();
  var phone = document.getElementById('phone').value.trim();

  if (!name || !phone) {
    showToast('Please fill in your name and phone number.', 'error');
    return false;
  }

  // Simulate form submission
  showToast('Thank you, ' + name + '! We\'ll get back to you soon. 💌', 'success');
  e.target.reset();
  return false;
}

// ===== LOGIN HANDLER =====
function handleLogin(e) {
  e.preventDefault();

  // No authorization required — direct access for demo
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('memberName', 'Aishwarya Devi');
  sessionStorage.setItem('memberId', 'SS-2026-042');

  window.location.href = 'dashboard.html';
  return false;
}

// ===== DASHBOARD SECTION SWITCHING =====
function showSection(sectionId, clickedLink) {
  // Hide all sections
  var sections = document.querySelectorAll('.dashboard-section');
  sections.forEach(function(section) {
    section.style.display = 'none';
  });

  // Show target section
  var target = document.getElementById('section-' + sectionId);
  if (target) {
    target.style.display = 'block';
  }

  // Update active link
  if (clickedLink) {
    var menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach(function(link) {
      link.classList.remove('active');
    });
    clickedLink.classList.add('active');
  }

  // Update page title
  var pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    var titles = {
      'dashboard': 'Dashboard',
      'activities': 'Activities & Programs',
      'classes': 'Class Schedule',
      'pricing': 'Pricing & Plans',
      'events': 'Events',
      'announcements': 'Announcements',
      'profile': 'My Profile'
    };
    pageTitle.textContent = titles[sectionId] || 'Dashboard';
  }

  // Scroll to top of main area
  var main = document.querySelector('.dashboard-main');
  if (main) {
    main.scrollTop = 0;
  }
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type) {
  // Remove existing toast if any
  var existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'toast-notification';

  var bgColor = type === 'success' ? 'linear-gradient(135deg, #E8728A, #C94C6E)' : 'linear-gradient(135deg, #e74c3c, #c0392b)';

  toast.style.cssText = 'position: fixed; top: 30px; right: 30px; z-index: 9999; ' +
    'background: ' + bgColor + '; color: white; padding: 16px 28px; ' +
    'border-radius: 16px; font-family: Poppins, sans-serif; font-size: 0.9rem; ' +
    'box-shadow: 0 8px 30px rgba(0,0,0,0.15); animation: slideInRight 0.4s ease; ' +
    'max-width: 400px;';

  toast.textContent = message;
  document.body.appendChild(toast);

  // Add the animation keyframes if not already present
  if (!document.getElementById('toast-styles')) {
    var style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent =
      '@keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } } ' +
      '@keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100px); } }';
    document.head.appendChild(style);
  }

  // Auto-remove after 4 seconds
  setTimeout(function() {
    toast.style.animation = 'slideOutRight 0.4s ease forwards';
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

// ===== DASHBOARD AUTH CHECK =====
// If on dashboard page and not logged in, redirect to login
if (window.location.pathname.includes('dashboard')) {
  if (!sessionStorage.getItem('isLoggedIn')) {
    // For demo purposes, allow viewing without login
    // In production, uncomment the redirect below:
    // window.location.href = 'login.html';
  }
}

// ===== GREETING BASED ON TIME =====
function updateGreeting() {
  var welcomeHeading = document.querySelector('.dashboard-welcome h2');
  if (!welcomeHeading) return;

  var hour = new Date().getHours();
  var greeting;

  if (hour < 12) {
    greeting = 'Good Morning';
  } else if (hour < 17) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }

  var name = sessionStorage.getItem('memberName') || 'Aishwarya';
  welcomeHeading.textContent = greeting + ', ' + name.split(' ')[0] + '! ☀️';
}

// Run greeting update on load
window.addEventListener('load', updateGreeting);
