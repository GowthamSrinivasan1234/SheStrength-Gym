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

// ===== ADMIN CONFIG =====
var ADMIN_CONFIG = {
  phone: '9952418551',
  email: 'gowthamsrinivasan1234@gmail.com'
};

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function() {
  var navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// ===== MOBILE HAMBURGER MENU =====
var hamburger = document.getElementById('hamburger');
var navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });

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

  showToast('Thank you, ' + name + '! We\'ll get back to you soon. 💌', 'success');
  e.target.reset();
  return false;
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type) {
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

  if (!document.getElementById('toast-styles')) {
    var style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent =
      '@keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } } ' +
      '@keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100px); } }';
    document.head.appendChild(style);
  }

  setTimeout(function() {
    toast.style.animation = 'slideOutRight 0.4s ease forwards';
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

// ===== UTILITY: Generate Temp Password =====
function generateTempPassword() {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  var password = '';
  var array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (var i = 0; i < 16; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

// ===== UTILITY: Sanitize Phone =====
function sanitizePhone(phone) {
  return phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);
}

// ===== MEMBER LOGIN HANDLER (Phone-based) =====
function handleLogin(e) {
  e.preventDefault();

  var phone = sanitizePhone(document.getElementById('loginPhone').value);
  var password = document.getElementById('password').value.trim();

  if (!phone || phone.length !== 10) {
    showToast('Please enter a valid 10-digit phone number.', 'error');
    return false;
  }
  if (!password) {
    showToast('Please enter your password.', 'error');
    return false;
  }

  var btn = document.getElementById('loginBtn');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  // If admin phone, use config email directly; otherwise look up Firestore
  var emailPromise;
  if (phone === ADMIN_CONFIG.phone) {
    emailPromise = Promise.resolve(ADMIN_CONFIG.email);
  } else {
    var db = firebase.firestore();
    emailPromise = db.collection('phoneMap').doc(phone).get()
      .then(function(doc) {
        if (!doc.exists) {
          throw { code: 'auth/user-not-found' };
        }
        return doc.data().email;
      });
  }

  emailPromise
    .then(function(email) {
      return firebase.auth().signInWithEmailAndPassword(email, password);
    })
    .then(function(credential) {
      var isAdmin = credential.user.email === ADMIN_CONFIG.email;
      showToast(isAdmin ? 'Welcome, Admin! Redirecting... 🛡️' : 'Welcome back! Redirecting... ✨', 'success');
      setTimeout(function() {
        window.location.href = isAdmin ? 'admin.html' : 'dashboard.html';
      }, 1000);
    })
    .catch(function(error) {
      var message = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this phone number. Please contact the gym.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      }
      showToast(message, 'error');
      btn.textContent = 'Login to My Account ✨';
      btn.disabled = false;
    });

  return false;
}

// ===== FORGOT PASSWORD =====
function toggleForgotPassword() {
  var section = document.getElementById('forgotPasswordSection');
  var form = document.getElementById('loginForm');
  if (section.style.display === 'none') {
    section.style.display = 'block';
    form.style.display = 'none';
  } else {
    section.style.display = 'none';
    form.style.display = 'block';
  }
}

function handleForgotPassword(e) {
  e.preventDefault();

  var phone = sanitizePhone(document.getElementById('forgotPhone').value);
  if (!phone || phone.length !== 10) {
    showToast('Please enter a valid 10-digit phone number.', 'error');
    return false;
  }

  var btn = document.getElementById('resetBtn');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  var db = firebase.firestore();
  db.collection('phoneMap').doc(phone).get()
    .then(function(doc) {
      if (!doc.exists) {
        throw { code: 'not-found' };
      }
      var email = doc.data().email;
      return firebase.auth().sendPasswordResetEmail(email);
    })
    .then(function() {
      showToast('Password reset email sent! Check your inbox. 📧', 'success');
      btn.textContent = 'Send Reset Link 📧';
      btn.disabled = false;
      toggleForgotPassword();
    })
    .catch(function(error) {
      var message = error.code === 'not-found'
        ? 'No account found with this phone number. Contact the gym.'
        : 'Failed to send reset email. Please try again.';
      showToast(message, 'error');
      btn.textContent = 'Send Reset Link 📧';
      btn.disabled = false;
    });

  return false;
}

// (Admin login is handled via the unified login page)

// ===== ADMIN: CREATE MEMBER =====
function handleCreateMember(e) {
  e.preventDefault();

  var name = document.getElementById('memberName').value.trim();
  var email = document.getElementById('memberEmail').value.trim();
  var phone = sanitizePhone(document.getElementById('memberPhone').value);
  var age = document.getElementById('memberAge').value;
  var weight = document.getElementById('memberWeight').value;
  var height = document.getElementById('memberHeight').value;
  var plan = document.getElementById('memberPlan').value;
  var goal = document.getElementById('memberGoal').value.trim();
  var notes = document.getElementById('memberNotes').value.trim();

  if (!name || !email || !phone || phone.length !== 10 || !plan) {
    showToast('Please fill in all required fields with a valid 10-digit phone.', 'error');
    return false;
  }

  var btn = document.getElementById('createMemberBtn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  var db = firebase.firestore();
  var tempPassword = generateTempPassword();

  // Check if phone already exists
  db.collection('phoneMap').doc(phone).get()
    .then(function(doc) {
      if (doc.exists) {
        throw { custom: true, message: 'A member with this phone number already exists.' };
      }

      // Create user via secondary Firebase app (so admin stays logged in)
      var secondaryApp = firebase.initializeApp(firebaseConfig, 'Secondary');
      return secondaryApp.auth().createUserWithEmailAndPassword(email, tempPassword)
        .then(function(credential) {
          var uid = credential.user.uid;

          // Update display name
          return credential.user.updateProfile({ displayName: name }).then(function() {
            // Sign out from secondary and delete it
            return secondaryApp.auth().signOut();
          }).then(function() {
            return secondaryApp.delete();
          }).then(function() {
            // Store member profile in Firestore
            var batch = db.batch();

            batch.set(db.collection('users').doc(uid), {
              name: name,
              email: email,
              phone: phone,
              age: age || '',
              weight: weight || '',
              height: height || '',
              plan: plan,
              goal: goal || '',
              notes: notes || '',
              role: 'member',
              joinedDate: new Date().toISOString()
            });

            // Store phone → email mapping
            batch.set(db.collection('phoneMap').doc(phone), {
              email: email
            });

            return batch.commit();
          }).then(function() {
            // Send password reset email so member sets their own password
            return firebase.auth().sendPasswordResetEmail(email);
          });
        });
    })
    .then(function() {
      showToast('Member "' + name + '" created! Password reset email sent. 🎉', 'success');
      document.getElementById('createMemberForm').reset();
      btn.textContent = 'Create Member Account & Send Password Email 📧';
      btn.disabled = false;
      loadMembersList();
      loadMembersStats();
    })
    .catch(function(error) {
      var message = error.custom ? error.message : 'Failed to create member.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      showToast(message, 'error');
      btn.textContent = 'Create Member Account & Send Password Email 📧';
      btn.disabled = false;

      // Clean up secondary app if it still exists
      try { firebase.app('Secondary').delete(); } catch(e) {}
    });

  return false;
}

// ===== ADMIN: LOAD MEMBERS LIST =====
function loadMembersList() {
  var container = document.getElementById('membersListContainer');
  if (!container) return;

  container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Loading members...</p>';

  var db = firebase.firestore();
  db.collection('users').where('role', '==', 'member').orderBy('joinedDate', 'desc').get()
    .then(function(snapshot) {
      if (snapshot.empty) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No members registered yet. Add your first member! 🌸</p>';
        return;
      }

      var html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">';
      html += '<thead><tr style="background: var(--cream-warm); text-align: left;">';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Name</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Phone</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Email</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Plan</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Age</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Joined</th>';
      html += '</tr></thead><tbody>';

      snapshot.forEach(function(doc) {
        var m = doc.data();
        var joined = m.joinedDate ? new Date(m.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        var planEmoji = m.plan === 'Empress' ? '👑' : (m.plan === 'Radiance' ? '✨' : '🌱');

        html += '<tr style="border-bottom: 1px solid #f0e8e4;">';
        html += '<td style="padding: 12px 16px; font-weight: 500;">' + escapeHtml(m.name) + '</td>';
        html += '<td style="padding: 12px 16px;">' + escapeHtml(m.phone) + '</td>';
        html += '<td style="padding: 12px 16px; font-size: 0.82rem; color: var(--text-medium);">' + escapeHtml(m.email) + '</td>';
        html += '<td style="padding: 12px 16px;">' + planEmoji + ' ' + escapeHtml(m.plan) + '</td>';
        html += '<td style="padding: 12px 16px;">' + (m.age || '—') + '</td>';
        html += '<td style="padding: 12px 16px; font-size: 0.82rem; color: var(--text-light);">' + joined + '</td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';
      container.innerHTML = html;
    })
    .catch(function(error) {
      container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 40px;">Error loading members. Check Firestore setup.</p>';
    });
}

// ===== ADMIN: LOAD STATS =====
function loadMembersStats() {
  var db = firebase.firestore();
  db.collection('users').where('role', '==', 'member').get()
    .then(function(snapshot) {
      var total = 0, radiance = 0, empress = 0;

      snapshot.forEach(function(doc) {
        total++;
        var plan = doc.data().plan;
        if (plan === 'Radiance') radiance++;
        if (plan === 'Empress') empress++;
      });

      var el;
      el = document.getElementById('totalMembersCount');
      if (el) el.textContent = total;
      el = document.getElementById('radianceMembersCount');
      if (el) el.textContent = radiance;
      el = document.getElementById('empressMembersCount');
      if (el) el.textContent = empress;
    });
}

// ===== ESCAPE HTML (prevent XSS) =====
function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ===== ADMIN SECTION SWITCHING =====
function showAdminSection(sectionId, clickedLink) {
  var sections = document.querySelectorAll('#adminDashboard .dashboard-section');
  sections.forEach(function(section) {
    section.style.display = 'none';
  });

  var target = document.getElementById('admin-section-' + sectionId);
  if (target) {
    target.style.display = 'block';
  }

  if (clickedLink) {
    var menuLinks = document.querySelectorAll('#adminDashboard .sidebar-menu a');
    menuLinks.forEach(function(link) {
      link.classList.remove('active');
    });
    clickedLink.classList.add('active');
  }

  var pageTitle = document.getElementById('adminPageTitle');
  if (pageTitle) {
    var titles = {
      'overview': 'Overview',
      'addmember': 'Add New Member',
      'members': 'All Members'
    };
    pageTitle.textContent = titles[sectionId] || 'Overview';
  }

  if (sectionId === 'members') {
    loadMembersList();
  }
}

// ===== DASHBOARD SECTION SWITCHING =====
function showSection(sectionId, clickedLink) {
  var sections = document.querySelectorAll('.dashboard-section');
  sections.forEach(function(section) {
    section.style.display = 'none';
  });

  var target = document.getElementById('section-' + sectionId);
  if (target) {
    target.style.display = 'block';
  }

  if (clickedLink) {
    var menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach(function(link) {
      link.classList.remove('active');
    });
    clickedLink.classList.add('active');
  }

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

  var main = document.querySelector('.dashboard-main');
  if (main) main.scrollTop = 0;
}

// ===== LOGOUT HANDLER =====
function handleLogout() {
  firebase.auth().signOut().then(function() {
    window.location.href = 'login.html';
  });
}

// ===== DASHBOARD AUTH CHECK (Member Dashboard) =====
if (typeof firebase !== 'undefined' && window.location.pathname.includes('dashboard')) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      // Load profile from Firestore
      var db = firebase.firestore();
      db.collection('users').doc(user.uid).get()
        .then(function(doc) {
          var displayName = user.displayName || user.email.split('@')[0];
          var plan = '';

          if (doc.exists) {
            var data = doc.data();
            displayName = data.name || displayName;
            plan = data.plan || '';

            // Update profile section if it exists
            var profileName = document.querySelector('#section-profile .user-full-name');
            var profileEmail = document.querySelector('#section-profile .user-email');
            var profilePhone = document.querySelector('#section-profile .user-phone');
            var profilePlan = document.querySelector('#section-profile .user-plan');

            if (profileName) profileName.textContent = data.name || '';
            if (profileEmail) profileEmail.textContent = data.email || '';
            if (profilePhone) profilePhone.textContent = data.phone || '';
            if (profilePlan) profilePlan.textContent = data.plan || '';
          }

          var welcomeHeading = document.querySelector('.dashboard-welcome h2');
          var topbarName = document.querySelector('.topbar-user .user-info strong');

          var hour = new Date().getHours();
          var greeting = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');

          if (welcomeHeading) welcomeHeading.textContent = greeting + ', ' + displayName + '! ☀️';
          if (topbarName) topbarName.textContent = displayName;
        });
    }
  });
}

// ===== ADMIN AUTH CHECK =====
if (typeof firebase !== 'undefined' && window.location.pathname.includes('admin')) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user || user.email !== ADMIN_CONFIG.email) {
      // Not admin — redirect to login
      window.location.href = 'login.html';
    } else {
      document.getElementById('adminDashboard').style.display = 'flex';
      loadMembersList();
      loadMembersStats();
    }
  });
}

// ===== REDIRECT LOGGED-IN USERS FROM LOGIN PAGE =====
if (typeof firebase !== 'undefined' && window.location.pathname.includes('login')) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.href = user.email === ADMIN_CONFIG.email ? 'admin.html' : 'dashboard.html';
    }
  });
}
