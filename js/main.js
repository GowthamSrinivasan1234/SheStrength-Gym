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
      var total = 0, radiance = 0, empress = 0, pt = 0;

      snapshot.forEach(function(doc) {
        total++;
        var plan = doc.data().plan;
        if (plan === 'Radiance') radiance++;
        if (plan === 'Empress') empress++;
        if (plan === 'Personal Training') pt++;
      });

      var el;
      el = document.getElementById('totalMembersCount');
      if (el) el.textContent = total;
      el = document.getElementById('radianceMembersCount');
      if (el) el.textContent = radiance;
      el = document.getElementById('empressMembersCount');
      if (el) el.textContent = empress;
      el = document.getElementById('ptMembersCount');
      if (el) el.textContent = pt;
    });
}

// ===== ADMIN: ENABLE PT FOR MEMBER =====
function enablePT(uid, name) {
  if (!confirm('Enable Personal Training for ' + name + '? This will change their plan to PT.')) return;

  var db = firebase.firestore();
  db.collection('users').doc(uid).update({ plan: 'Personal Training' })
    .then(function() {
      showToast(name + ' is now a PT member! \ud83c\udfcb\ufe0f', 'success');
      loadMembersList();
      loadMembersStats();
    })
    .catch(function() {
      showToast('Failed to update. Try again.', 'error');
    });
}

// ===== ADMIN: ENABLE PT FOR MEMBER =====
function enablePT(uid, name) {
  if (!confirm('Enable Personal Training for ' + name + '? This will change their plan to PT.')) return;

  var db = firebase.firestore();
  db.collection('users').doc(uid).update({ plan: 'Personal Training' })
    .then(function() {
      showToast(name + ' is now a PT member! 🏋️', 'success');
      loadMembersList();
      loadMembersStats();
    })
    .catch(function() {
      showToast('Failed to update. Try again.', 'error');
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
      'members': 'All Members',
      'pt': 'Personal Training'
    };
    pageTitle.textContent = titles[sectionId] || 'Overview';
  }

  if (sectionId === 'members') {
    loadMembersList();
  }
  if (sectionId === 'pt') {
    loadPTMembers();
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
      'mytraining': 'My Training',
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

// ===== ADMIN: OPEN MEMBER EDIT =====
function openMemberEdit(uid) {
  var db = firebase.firestore();
  db.collection('users').doc(uid).get().then(function(doc) {
    if (!doc.exists) {
      showToast('Member not found.', 'error');
      return;
    }
    var m = doc.data();
    document.getElementById('editMemberUid').value = uid;
    document.getElementById('editName').value = m.name || '';
    document.getElementById('editEmail').value = m.email || '';
    document.getElementById('editPhone').value = m.phone || '';
    document.getElementById('editPlan').value = m.plan || 'Blossom';
    document.getElementById('editAge').value = m.age || '';
    document.getElementById('editWeight').value = m.weight || '';
    document.getElementById('editHeight').value = m.height || '';
    document.getElementById('editGoal').value = m.goal || '';
    document.getElementById('editNotes').value = m.notes || '';
    document.getElementById('memberEditModal').style.display = 'block';
  });
}

function closeMemberEdit() {
  document.getElementById('memberEditModal').style.display = 'none';
}

// ===== ADMIN: SAVE MEMBER EDIT =====
function handleEditMember(e) {
  e.preventDefault();

  var uid = document.getElementById('editMemberUid').value;
  var btn = document.getElementById('editMemberBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  var db = firebase.firestore();
  db.collection('users').doc(uid).update({
    name: document.getElementById('editName').value.trim(),
    plan: document.getElementById('editPlan').value,
    age: document.getElementById('editAge').value,
    weight: document.getElementById('editWeight').value,
    height: document.getElementById('editHeight').value,
    goal: document.getElementById('editGoal').value.trim(),
    notes: document.getElementById('editNotes').value.trim()
  }).then(function() {
    showToast('Member updated! ✅', 'success');
    btn.textContent = 'Save Changes ✅';
    btn.disabled = false;
    closeMemberEdit();
    loadMembersList();
    loadMembersStats();
  }).catch(function() {
    showToast('Failed to update member.', 'error');
    btn.textContent = 'Save Changes ✅';
    btn.disabled = false;
  });

  return false;
}

// ===== ADMIN: LOAD PT MEMBERS DROPDOWN =====
function loadPTMembers() {
  var select = document.getElementById('ptMemberSelect');
  if (!select) return;

  var db = firebase.firestore();
  db.collection('users').where('plan', '==', 'Personal Training').get()
    .then(function(snapshot) {
      select.innerHTML = '<option value="">Choose a member...</option>';
      snapshot.forEach(function(doc) {
        var m = doc.data();
        var option = document.createElement('option');
        option.value = doc.id;
        option.textContent = m.name + ' (' + m.phone + ')';
        select.appendChild(option);
      });
    });
}

// ===== ADMIN: LOAD PT PROGRESS =====
function loadPTProgress(uid) {
  if (!uid) {
    document.getElementById('ptAddEntryCard').style.display = 'none';
    document.getElementById('ptHistoryCard').style.display = 'none';
    return;
  }

  document.getElementById('ptAddEntryCard').style.display = 'block';
  document.getElementById('ptHistoryCard').style.display = 'block';

  // Set today's date as default
  var today = new Date().toISOString().split('T')[0];
  document.getElementById('ptDate').value = today;

  var container = document.getElementById('ptHistoryContainer');
  container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">Loading...</p>';

  var db = firebase.firestore();
  db.collection('progress').doc(uid).collection('logs').orderBy('date', 'desc').limit(20).get()
    .then(function(snapshot) {
      if (snapshot.empty) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">No progress entries yet. Add the first one!</p>';
        return;
      }

      var html = '';
      snapshot.forEach(function(doc) {
        var p = doc.data();
        var date = p.date || '—';
        var intensityColor = p.intensity === 'Intense' ? '#e74c3c' : (p.intensity === 'High' ? '#f39c12' : (p.intensity === 'Moderate' ? '#f1c40f' : '#2ecc71'));
        html += '<div style="border: 1px solid var(--blush-light); border-radius: 12px; padding: 16px; margin-bottom: 12px;">';
        html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">';
        html += '<strong style="color: var(--plum);">📅 ' + escapeHtml(date) + '</strong>';
        html += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
        if (p.sessionType) html += '<span style="background: var(--lavender); padding: 4px 12px; border-radius: 20px; font-size: 0.78rem;">' + escapeHtml(p.sessionType) + '</span>';
        if (p.intensity) html += '<span style="background: ' + intensityColor + '; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem;">' + escapeHtml(p.intensity) + '</span>';
        html += '</div></div>';
        html += '<p style="font-size: 0.88rem; color: var(--text-dark); margin-bottom: 8px; white-space: pre-line;"><strong>Exercises:</strong>\n' + escapeHtml(p.exercises) + '</p>';
        html += '<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 6px;">';
        if (p.duration) html += '<span style="font-size: 0.84rem; color: var(--text-medium);">⏱️ ' + escapeHtml(String(p.duration)) + ' min</span>';
        if (p.calories) html += '<span style="font-size: 0.84rem; color: var(--text-medium);">🔥 ' + escapeHtml(String(p.calories)) + ' cal</span>';
        if (p.weight) html += '<span style="font-size: 0.84rem; color: var(--text-medium);">⚖️ ' + escapeHtml(String(p.weight)) + ' kg</span>';
        html += '</div>';
        if (p.trainerNotes) html += '<p style="font-size: 0.84rem; color: var(--rose); margin-top: 6px;">🗒️ ' + escapeHtml(p.trainerNotes) + '</p>';
        html += '</div>';
      });

      container.innerHTML = html;
    });
}

// ===== ADMIN: ADD PROGRESS ENTRY =====
function handleAddProgress(e) {
  e.preventDefault();

  var uid = document.getElementById('ptMemberSelect').value;
  if (!uid) {
    showToast('Please select a member first.', 'error');
    return false;
  }

  var btn = document.getElementById('addProgressBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  var db = firebase.firestore();
  db.collection('progress').doc(uid).collection('logs').add({
    date: document.getElementById('ptDate').value,
    sessionType: document.getElementById('ptSessionType').value,
    exercises: document.getElementById('ptExercises').value.trim(),
    duration: document.getElementById('ptDuration').value || '',
    calories: document.getElementById('ptCalories').value || '',
    weight: document.getElementById('ptWeight').value || '',
    intensity: document.getElementById('ptIntensity').value,
    trainerNotes: document.getElementById('ptTrainerNotes').value.trim(),
    addedAt: new Date().toISOString()
  }).then(function() {
    showToast('Workout logged! 🏋️', 'success');
    document.getElementById('ptProgressForm').reset();
    document.getElementById('ptDate').value = new Date().toISOString().split('T')[0];
    btn.textContent = 'Log Workout 🏋️';
    btn.disabled = false;
    loadPTProgress(uid);
  }).catch(function() {
    showToast('Failed to add entry.', 'error');
    btn.textContent = 'Log Workout 🏋️';
    btn.disabled = false;
  });

  return false;
}

// ===== MEMBER: SAVE PROFILE =====
function handleSaveProfile(e) {
  e.preventDefault();

  var user = firebase.auth().currentUser;
  if (!user) return false;

  var btn = document.getElementById('saveProfileBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  var db = firebase.firestore();
  db.collection('users').doc(user.uid).update({
    age: document.getElementById('profileAge').value,
    weight: document.getElementById('profileWeight').value,
    height: document.getElementById('profileHeight').value,
    goal: document.getElementById('profileGoal').value.trim(),
    notes: document.getElementById('profileNotes').value.trim()
  }).then(function() {
    showToast('Profile updated! ✅', 'success');
    btn.textContent = 'Save My Details ✅';
    btn.disabled = false;
  }).catch(function() {
    showToast('Failed to save. Please try again.', 'error');
    btn.textContent = 'Save My Details ✅';
    btn.disabled = false;
  });

  return false;
}

// ===== MEMBER: LOAD MY PT PROGRESS =====
function loadMyPTProgress(uid) {
  var container = document.getElementById('myPTProgressContainer');
  if (!container) return;

  var db = firebase.firestore();
  db.collection('progress').doc(uid).collection('logs').orderBy('date', 'desc').limit(20).get()
    .then(function(snapshot) {
      if (snapshot.empty) {
        container.innerHTML = '<div class="dash-card" style="margin-top: 20px;"><p style="text-align: center; color: var(--text-light); padding: 40px;">No training progress logged yet. Your trainer will update this for you! 💪</p></div>';
        return;
      }

      var html = '';
      snapshot.forEach(function(doc) {
        var p = doc.data();
        var intensityColor = p.intensity === 'Intense' ? '#e74c3c' : (p.intensity === 'High' ? '#f39c12' : (p.intensity === 'Moderate' ? '#f1c40f' : '#2ecc71'));
        html += '<div class="dash-card" style="margin-top: 16px;">';
        html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">';
        html += '<h4 style="color: var(--plum);">📅 ' + escapeHtml(p.date || '—') + '</h4>';
        html += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
        if (p.sessionType) html += '<span style="background: var(--lavender); padding: 5px 14px; border-radius: 20px; font-size: 0.82rem;">' + escapeHtml(p.sessionType) + '</span>';
        if (p.intensity) html += '<span style="background: ' + intensityColor + '; color: white; padding: 5px 14px; border-radius: 20px; font-size: 0.82rem;">' + escapeHtml(p.intensity) + '</span>';
        html += '</div></div>';
        html += '<div class="activity-list">';
        html += '<div class="activity-item"><div class="activity-icon">🏋️</div><div class="activity-details"><strong>Exercises</strong><span style="white-space: pre-line;">' + escapeHtml(p.exercises) + '</span></div></div>';
        if (p.duration) html += '<div class="activity-item"><div class="activity-icon">⏱️</div><div class="activity-details"><strong>Duration</strong><span>' + escapeHtml(String(p.duration)) + ' minutes</span></div></div>';
        if (p.calories) html += '<div class="activity-item"><div class="activity-icon">🔥</div><div class="activity-details"><strong>Calories Burned</strong><span>' + escapeHtml(String(p.calories)) + ' cal</span></div></div>';
        if (p.weight) html += '<div class="activity-item"><div class="activity-icon">⚖️</div><div class="activity-details"><strong>Weight</strong><span>' + escapeHtml(String(p.weight)) + ' kg</span></div></div>';
        if (p.trainerNotes) html += '<div class="activity-item"><div class="activity-icon">🗒️</div><div class="activity-details"><strong>Trainer Notes</strong><span>' + escapeHtml(p.trainerNotes) + '</span></div></div>';
        html += '</div></div>';
      });

      container.innerHTML = html;
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

            // Populate profile display
            var el;
            el = document.getElementById('profileDisplayName');
            if (el) el.textContent = data.name || displayName;
            el = document.getElementById('profileDisplayPlan');
            if (el) el.textContent = plan + ' Member';
            el = document.getElementById('profileEmail');
            if (el) el.textContent = data.email || '';
            el = document.getElementById('profilePhone');
            if (el) el.textContent = data.phone || '';
            el = document.getElementById('profilePlan');
            if (el) el.textContent = plan;
            el = document.getElementById('profileJoined');
            if (el && data.joinedDate) el.textContent = new Date(data.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

            // Populate editable form fields
            el = document.getElementById('profileAge');
            if (el) el.value = data.age || '';
            el = document.getElementById('profileWeight');
            if (el) el.value = data.weight || '';
            el = document.getElementById('profileHeight');
            if (el) el.value = data.height || '';
            el = document.getElementById('profileGoal');
            if (el) el.value = data.goal || '';
            el = document.getElementById('profileNotes');
            if (el) el.value = data.notes || '';

            // Show PT nav link if plan is Personal Training
            var ptNav = document.getElementById('ptNavLink');
            if (ptNav) {
              ptNav.style.display = plan === 'Personal Training' ? 'flex' : 'none';
            }

            // Load PT progress if applicable
            if (plan === 'Personal Training') {
              loadMyPTProgress(user.uid);
            }

            // Update topbar small text
            var topbarSmall = document.querySelector('.topbar-user .user-info small');
            if (topbarSmall) topbarSmall.textContent = plan + ' Member';
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
