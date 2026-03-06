/* ============================================
   SheStrength - Main JavaScript
   ============================================ */

// ===== FIREBASE INIT =====
var firebaseConfig = {
  apiKey: "AIzaSyARh58ffWN1VEwE1eATGchrCh-ArfpZIeM",
  authDomain: "mygym-d2be6.firebaseapp.com",
  projectId: "mygym-d2be6",
  storageBucket: "mygym-d2be6.firebasestorage.app",
  messagingSenderId: "252919057112",
  appId: "1:252919057112:web:61598662ab88d7fae6e5ad",
  measurementId: "G-D30DY7NE8Q"
};

if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}

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

  var email = document.getElementById('memberEmail').value.trim();
  var password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showToast('Please enter your email and password.', 'error');
    return false;
  }

  // Disable button while loading
  var btn = document.querySelector('.btn-login');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(userCredential) {
      showToast('Welcome back! Redirecting... ✨', 'success');
      setTimeout(function() {
        window.location.href = 'dashboard.html';
      }, 1000);
    })
    .catch(function(error) {
      var message = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found. Please contact the gym.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      }
      showToast(message, 'error');
      btn.textContent = 'Login to My Account ✨';
      btn.disabled = false;
    });

  return false;
}

// ===== LOGOUT HANDLER =====
function handleLogout() {
  firebase.auth().signOut().then(function() {
    window.location.href = 'login.html';
  });
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
if (typeof firebase !== 'undefined' && window.location.pathname.includes('dashboard')) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      // Update dashboard with user info
      var displayName = user.displayName || user.email.split('@')[0];
      var welcomeHeading = document.querySelector('.dashboard-welcome h2');
      var topbarName = document.querySelector('.topbar-user .user-info strong');
      var profileName = document.querySelector('#section-profile h4');

      var hour = new Date().getHours();
      var greeting = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');

      if (welcomeHeading) welcomeHeading.textContent = greeting + ', ' + displayName + '! ☀️';
      if (topbarName) topbarName.textContent = displayName;
    }
  });
}

// Redirect away from login page if already logged in
if (typeof firebase !== 'undefined' && (window.location.pathname.includes('login') || window.location.pathname.endsWith('login.html'))) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });
}
