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

// List of admin emails (loaded from Firestore + hardcoded primary)
var ADMIN_EMAILS = [ADMIN_CONFIG.email];

function loadAdminEmails() {
  if (typeof firebase === 'undefined') return;
  var db = firebase.firestore();
  db.collection('users').where('role', '==', 'admin').get()
    .then(function(snapshot) {
      snapshot.forEach(function(doc) {
        var email = doc.data().email;
        if (ADMIN_EMAILS.indexOf(email) === -1) ADMIN_EMAILS.push(email);
      });
    });
}

function isAdminEmail(email) {
  return ADMIN_EMAILS.indexOf(email) >= 0;
}

// ===== MEMBER ID GENERATOR (2 digits + 4 uppercase letters) =====
function generateMemberId() {
  var digits = String(Math.floor(Math.random() * 90) + 10);
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  var letters = '';
  for (var i = 0; i < 4; i++) {
    letters += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return digits + letters;
}

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
      // Check if admin by email list or Firestore role
      var userEmail = credential.user.email;
      if (isAdminEmail(userEmail)) {
        showToast('Welcome, Admin! Redirecting... 🛡️', 'success');
        setTimeout(function() { window.location.href = 'admin.html'; }, 1000);
        return;
      }
      // Check Firestore for admin role
      var db = firebase.firestore();
      db.collection('users').doc(credential.user.uid).get().then(function(doc) {
        if (doc.exists && doc.data().role === 'admin') {
          showToast('Welcome, Admin! Redirecting... 🛡️', 'success');
          setTimeout(function() { window.location.href = 'admin.html'; }, 1000);
        } else {
          showToast('Welcome back! Redirecting... ✨', 'success');
          setTimeout(function() { window.location.href = 'dashboard.html'; }, 1000);
        }
      });
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
            var memberId = generateMemberId();

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
              memberId: memberId,
              deleted: false,
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
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">ID</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Name</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Phone</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Email</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Plan</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Joined</th>';
      html += '<th style="padding: 12px 16px; border-bottom: 2px solid var(--blush);">Actions</th>';
      html += '</tr></thead><tbody>';

      var hasMembers = false;
      snapshot.forEach(function(doc) {
        var m = doc.data();
        if (m.deleted) return; // skip soft-deleted members
        hasMembers = true;
        var uid = doc.id;
        var joined = m.joinedDate ? new Date(m.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        var planEmoji = m.plan === 'Empress' ? '👑' : (m.plan === 'Radiance' ? '✨' : (m.plan === 'Personal Training' ? '🏋️' : '🌱'));
        var isPT = m.plan === 'Personal Training';
        var mid = m.memberId || '—';

        html += '<tr style="border-bottom: 1px solid #f0e8e4;">';
        html += '<td style="padding: 12px 16px; font-family: monospace; font-weight: 700; letter-spacing: 1px; color: var(--plum); font-size: 0.85rem;">' + escapeHtml(mid) + '</td>';
        html += '<td style="padding: 12px 16px; font-weight: 500;">' + escapeHtml(m.name) + '</td>';
        html += '<td style="padding: 12px 16px;">' + escapeHtml(m.phone) + '</td>';
        html += '<td style="padding: 12px 16px; font-size: 0.82rem; color: var(--text-medium);">' + escapeHtml(m.email) + '</td>';
        html += '<td style="padding: 12px 16px;">' + planEmoji + ' ' + escapeHtml(m.plan) + '</td>';
        html += '<td style="padding: 12px 16px; font-size: 0.82rem; color: var(--text-light);">' + joined + '</td>';
        html += '<td style="padding: 10px 16px; white-space: nowrap;">';
        html += '<button onclick="openMemberEdit(\'' + uid + '\')" style="background: var(--blush-light); border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; color: var(--plum); font-weight: 500; margin-right: 4px;">✏️ Edit</button>';
        if (!isPT) {
          html += '<button onclick="enablePT(\'' + uid + '\', \'' + escapeHtml(m.name).replace(/'/g, "\\'") + '\')" style="background: linear-gradient(135deg, var(--plum), var(--plum-light)); border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; color: white; font-weight: 500; margin-right: 4px;">🏋️ PT</button>';
        } else {
          html += '<span style="font-size: 0.75rem; color: var(--rose); font-weight: 500; margin-right: 4px;">✅ PT</span>';
        }
        html += '<button onclick="openDeleteModal(\'' + uid + '\', \'' + escapeHtml(mid).replace(/'/g, "\\'") + '\', \'' + escapeHtml(m.name).replace(/'/g, "\\'") + '\')" style="background: #fee2e2; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; color: #e74c3c; font-weight: 500;">🗑️ Delete</button>';
        html += '</td>';
        html += '</tr>';
      });

      if (!hasMembers) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No active members. Add your first member! 🌸</p>';
        return;
      }

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
        var data = doc.data();
        if (data.deleted) return;
        total++;
        var plan = data.plan;
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
      showToast(name + ' is now a PT member! 🏋️', 'success');
      loadMembersList();
      loadMembersStats();
    })
    .catch(function() {
      showToast('Failed to update. Try again.', 'error');
    });
}

// ===== ADMIN: CREATE NEW ADMIN =====
function handleCreateAdmin(e) {
  e.preventDefault();

  var name = document.getElementById('adminName').value.trim();
  var email = document.getElementById('adminEmail').value.trim();
  var phone = sanitizePhone(document.getElementById('adminPhone').value);

  if (!name || !email || !phone || phone.length !== 10) {
    showToast('Please fill all fields with a valid 10-digit phone.', 'error');
    return false;
  }

  var btn = document.getElementById('createAdminBtn');
  btn.textContent = 'Creating...';
  btn.disabled = true;

  var db = firebase.firestore();
  var tempPassword = generateTempPassword();

  db.collection('phoneMap').doc(phone).get()
    .then(function(doc) {
      if (doc.exists) {
        throw { custom: true, message: 'An account with this phone already exists.' };
      }

      var secondaryApp = firebase.initializeApp(firebaseConfig, 'SecondaryAdmin');
      return secondaryApp.auth().createUserWithEmailAndPassword(email, tempPassword)
        .then(function(credential) {
          var uid = credential.user.uid;
          return credential.user.updateProfile({ displayName: name }).then(function() {
            return secondaryApp.auth().signOut();
          }).then(function() {
            return secondaryApp.delete();
          }).then(function() {
            var batch = db.batch();
            batch.set(db.collection('users').doc(uid), {
              name: name,
              email: email,
              phone: phone,
              role: 'admin',
              joinedDate: new Date().toISOString()
            });
            batch.set(db.collection('phoneMap').doc(phone), { email: email });
            return batch.commit();
          }).then(function() {
            ADMIN_EMAILS.push(email);
            return firebase.auth().sendPasswordResetEmail(email);
          });
        });
    })
    .then(function() {
      showToast('Admin "' + name + '" created! Password reset email sent. 🛡️', 'success');
      document.getElementById('createAdminForm').reset();
      btn.textContent = 'Create Admin Account 🛡️';
      btn.disabled = false;
    })
    .catch(function(error) {
      var message = error.custom ? error.message : 'Failed to create admin.';
      if (error.code === 'auth/email-already-in-use') message = 'Email already in use.';
      showToast(message, 'error');
      btn.textContent = 'Create Admin Account 🛡️';
      btn.disabled = false;
      try { firebase.app('SecondaryAdmin').delete(); } catch(e) {}
    });

  return false;
}

// ===== ADMIN: DELETE MEMBER (SOFT DELETE) =====
function openDeleteModal(uid, memberId, name) {
  document.getElementById('deleteUid').value = uid;
  document.getElementById('deleteExpectedMemberId').value = memberId;
  document.getElementById('deleteExpectedName').value = name;
  document.getElementById('deleteConfirmMemberId').value = '';
  document.getElementById('deleteConfirmName').value = '';
  document.getElementById('memberDeleteModal').style.display = 'block';
}

function closeDeleteModal() {
  document.getElementById('memberDeleteModal').style.display = 'none';
}

function confirmDeleteMember() {
  var uid = document.getElementById('deleteUid').value;
  var expectedId = document.getElementById('deleteExpectedMemberId').value.toUpperCase();
  var expectedName = document.getElementById('deleteExpectedName').value.trim().toLowerCase();
  var enteredId = document.getElementById('deleteConfirmMemberId').value.trim().toUpperCase();
  var enteredName = document.getElementById('deleteConfirmName').value.trim().toLowerCase();

  if (!enteredId || !enteredName) {
    showToast('Please enter both Member ID and Name.', 'error');
    return;
  }
  if (enteredId !== expectedId) {
    showToast('Member ID does not match. Check and try again.', 'error');
    return;
  }
  if (enteredName !== expectedName) {
    showToast('Member name does not match. Check and try again.', 'error');
    return;
  }

  var db = firebase.firestore();
  db.collection('users').doc(uid).update({ deleted: true, deletedAt: new Date().toISOString() })
    .then(function() {
      showToast('Member deactivated successfully.', 'success');
      closeDeleteModal();
      loadMembersList();
      loadMembersStats();
    })
    .catch(function() {
      showToast('Failed to delete. Try again.', 'error');
    });
}

// ===== ESCAPE HTML (prevent XSS) =====
function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ===== ADMIN: LOAD ADMIN PROFILE =====
function loadAdminProfile(user) {
  // For primary admin, always set name immediately (don't wait for Firestore)
  if (user.email === ADMIN_CONFIG.email) {
    setAdminDisplayName('Gowtham');
  }
  var db = firebase.firestore();
  db.collection('users').doc(user.uid).get().then(function(doc) {
    if (!doc.exists) {
      // Auto-create admin doc for primary admin
      var adminName = user.displayName || user.email.split('@')[0];
      if (user.email === ADMIN_CONFIG.email) adminName = 'Gowtham';
      db.collection('users').doc(user.uid).set({
        name: adminName,
        email: user.email,
        phone: ADMIN_CONFIG.phone,
        role: 'admin',
        joinedDate: new Date().toISOString()
      });
      setAdminDisplayName(adminName);
    } else {
      var data = doc.data();
      var displayName = data.name || 'Gowtham';
      // Always fix name for primary admin
      if (user.email === ADMIN_CONFIG.email) {
        displayName = 'Gowtham';
        if (data.name !== 'Gowtham') {
          db.collection('users').doc(user.uid).update({ name: 'Gowtham' });
        }
      }
      setAdminDisplayName(displayName);
      // Load admin photo
      if (data.photoURL) {
        var img = document.getElementById('adminAvatarImg');
        var emoji = document.getElementById('adminAvatarEmoji');
        if (img) { img.src = data.photoURL; img.style.display = 'block'; }
        if (emoji) emoji.style.display = 'none';
      }
    }
  }).catch(function() {
    // If Firestore fails, still show name for primary admin
    if (user.email === ADMIN_CONFIG.email) {
      setAdminDisplayName('Gowtham');
    }
  });
}

function setAdminDisplayName(name) {
  var el = document.getElementById('adminDisplayName');
  if (el) el.textContent = name;
  var wel = document.getElementById('adminWelcomeText');
  if (wel) wel.textContent = 'Welcome, ' + name + '! 🛡️';
}

// ===== PHOTO UPLOAD (Admin) =====
function handleAdminPhotoUpload(input) {
  var file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Please select an image file.', 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB.', 'error'); return; }

  var user = firebase.auth().currentUser;
  if (!user) return;

  showToast('Uploading photo...', 'success');
  var storageRef = firebase.storage().ref('profilePhotos/' + user.uid);
  storageRef.put(file).then(function(snapshot) {
    return snapshot.ref.getDownloadURL();
  }).then(function(url) {
    return firebase.firestore().collection('users').doc(user.uid).update({ photoURL: url }).then(function() { return url; });
  }).then(function(url) {
    var img = document.getElementById('adminAvatarImg');
    var emoji = document.getElementById('adminAvatarEmoji');
    if (img) { img.src = url; img.style.display = 'block'; }
    if (emoji) emoji.style.display = 'none';
    showToast('Profile photo updated! 📸', 'success');
  }).catch(function(err) {
    if (err && err.code && err.code.indexOf('storage') !== -1) {
      showToast('📷 Photo upload is not enabled yet. Contact admin.', 'error');
    } else {
      showToast('Failed to upload photo. Try again.', 'error');
    }
  });
  input.value = '';
}

// ===== PHOTO UPLOAD (Member) =====
function handleMemberPhotoUpload(input) {
  var file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Please select an image file.', 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB.', 'error'); return; }

  var user = firebase.auth().currentUser;
  if (!user) return;

  showToast('Uploading photo...', 'success');
  var storageRef = firebase.storage().ref('profilePhotos/' + user.uid);
  storageRef.put(file).then(function(snapshot) {
    return snapshot.ref.getDownloadURL();
  }).then(function(url) {
    return firebase.firestore().collection('users').doc(user.uid).update({ photoURL: url }).then(function() { return url; });
  }).then(function(url) {
    var img = document.getElementById('profileAvatarImg');
    var emoji = document.getElementById('profileAvatarEmoji');
    if (img) { img.src = url; img.style.display = 'block'; }
    if (emoji) emoji.style.display = 'none';
    showToast('Profile photo updated! 📸', 'success');
  }).catch(function(err) {
    if (err && err.code && err.code.indexOf('storage') !== -1) {
      showToast('📷 Photo upload is not enabled yet. Contact admin.', 'error');
    } else {
      showToast('Failed to upload photo. Try again.', 'error');
    }
  });
  input.value = '';
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
      'pt': 'Personal Training',
      'addadmin': 'Add Admin'
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
      'community': 'Member Spotlights',
      'mytraining': 'My Training',
      'profile': 'My Profile'
    };
    pageTitle.textContent = titles[sectionId] || 'Dashboard';
  }

  if (sectionId === 'community') {
    loadCommunityMembers();
  }

  var main = document.querySelector('.dashboard-main');
  if (main) main.scrollTop = 0;
}

// ===== COMMUNITY: LOAD FEATURED MEMBERS =====
function loadCommunityMembers() {
  var container = document.getElementById('communityContainer');
  if (!container) return;

  var db = firebase.firestore();
  db.collection('users').where('featured', '==', true).get()
    .then(function(snapshot) {
      var members = [];
      snapshot.forEach(function(doc) {
        var m = doc.data();
        if (m.deleted) return;
        members.push(m);
      });

      if (members.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 60px 20px; grid-column: 1 / -1;">' +
          '<div style="font-size: 3rem; margin-bottom: 12px;">🌸</div>' +
          '<h3 style="font-family: Playfair Display, serif; color: var(--plum); margin-bottom: 8px;">Spotlights Coming Soon!</h3>' +
          '<p style="color: var(--text-light);">Our amazing members will be featured here soon.</p>' +
          '</div>';
        return;
      }

      container.innerHTML = '';
      members.forEach(function(m) {
        var photoHTML = m.photoURL
          ? '<img src="' + m.photoURL + '" alt="' + (m.name || '') + '" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid var(--blush-light);">'
          : '<div style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #f8d7e8, #f0b8d0); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; border: 3px solid var(--blush-light);">💪</div>';

        var card = document.createElement('div');
        card.className = 'community-spotlight-card';
        card.innerHTML =
          '<div style="text-align: center; padding: 28px 20px;">' +
            '<div style="margin-bottom: 14px;">' + photoHTML + '</div>' +
            '<h3 style="font-family: Playfair Display, serif; color: var(--plum); font-size: 1.15rem; margin-bottom: 4px;">' + (m.name || 'Member') + '</h3>' +
            (m.occupation ? '<p style="color: var(--rose); font-weight: 500; font-size: 0.88rem; margin-bottom: 10px;">💼 ' + m.occupation + '</p>' : '') +
            (m.funFact ? '<p style="color: var(--text-medium); font-size: 0.85rem; font-style: italic; line-height: 1.5;">✨ "' + m.funFact + '"</p>' : '') +
          '</div>';
        container.appendChild(card);
      });
    });
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
    document.getElementById('editOccupation').value = m.occupation || '';
    document.getElementById('editFunFact').value = m.funFact || '';
    document.getElementById('editFeatured').checked = m.featured || false;
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
    notes: document.getElementById('editNotes').value.trim(),
    occupation: document.getElementById('editOccupation').value.trim(),
    funFact: document.getElementById('editFunFact').value.trim(),
    featured: document.getElementById('editFeatured').checked
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
        if (m.deleted) return;
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
var ptCaloriesChartInst = null;
var ptTypesChartInst = null;
var ptWeightChartInst = null;

function loadMyPTProgress(uid) {
  var container = document.getElementById('myPTProgressContainer');
  if (!container) return;

  var db = firebase.firestore();
  db.collection('progress').doc(uid).collection('logs').orderBy('date', 'desc').limit(50).get()
    .then(function(snapshot) {
      if (snapshot.empty) {
        container.innerHTML = '<div class="dash-card" style="margin-top: 20px;"><p style="text-align: center; color: var(--text-light); padding: 40px;">No training progress logged yet. Your trainer will update this for you! 💪</p></div>';
        return;
      }

      // ---- Collect all entries (chronological for charts) ----
      var entries = [];
      snapshot.forEach(function(doc) { entries.push(doc.data()); });
      var chronological = entries.slice().reverse(); // oldest first for charts

      // ---- Compute Stats ----
      var totalCal = 0, totalMin = 0, totalSessions = entries.length;
      var typeCounts = {};
      var calDates = [], calValues = [];
      var weightDates = [], weightValues = [];
      var workoutWeeks = {};

      chronological.forEach(function(p) {
        if (p.calories) totalCal += parseInt(p.calories) || 0;
        if (p.duration) totalMin += parseInt(p.duration) || 0;
        if (p.sessionType) typeCounts[p.sessionType] = (typeCounts[p.sessionType] || 0) + 1;
        if (p.calories && p.date) { calDates.push(p.date); calValues.push(parseInt(p.calories) || 0); }
        if (p.weight && p.date) { weightDates.push(p.date); weightValues.push(parseFloat(p.weight) || 0); }
        if (p.date) {
          var d = new Date(p.date);
          var weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
          workoutWeeks[weekStart.toISOString().split('T')[0]] = true;
        }
      });

      // Streak: consecutive weeks with at least 1 workout
      var weekKeys = Object.keys(workoutWeeks).sort().reverse();
      var streak = 0;
      if (weekKeys.length > 0) {
        var now = new Date(); now.setDate(now.getDate() - now.getDay());
        var currentWeek = now.toISOString().split('T')[0];
        // Allow current or previous week as starting point
        if (weekKeys[0] === currentWeek || weekKeys.indexOf(currentWeek) >= 0) {
          for (var wi = 0; wi < weekKeys.length; wi++) {
            var expected = new Date(now); expected.setDate(expected.getDate() - (wi * 7));
            if (weekKeys.indexOf(expected.toISOString().split('T')[0]) >= 0) streak++;
            else break;
          }
        } else {
          streak = 1; // at least had workouts
        }
      }

      // ---- Show Stats Grid ----
      var statsGrid = document.getElementById('ptStatsGrid');
      if (statsGrid) {
        statsGrid.style.display = 'grid';
        document.getElementById('ptStatTotalCal').textContent = totalCal.toLocaleString();
        document.getElementById('ptStatSessions').textContent = totalSessions;
        document.getElementById('ptStatTotalMin').textContent = totalMin.toLocaleString();
        document.getElementById('ptStatStreak').textContent = streak;
      }

      // ---- Motivation Banner ----
      var banner = document.getElementById('ptMotivationBanner');
      if (banner) {
        banner.style.display = 'block';
        var motivations = [
          { emoji: '🔥', title: 'You\'re on fire!', text: 'Every rep counts. You\'ve burned ' + totalCal.toLocaleString() + ' calories so far!' },
          { emoji: '💪', title: 'Stronger every day!', text: totalSessions + ' workouts completed. Your consistency is inspiring!' },
          { emoji: '⭐', title: 'Star performer!', text: 'You\'ve trained for ' + totalMin.toLocaleString() + ' minutes total. That\'s incredible dedication!' },
          { emoji: '🏆', title: 'Champion vibes!', text: streak + '-week streak! Keep showing up and magic happens.' },
          { emoji: '🌟', title: 'You\'re unstoppable!', text: 'Hard work beats talent. You\'re proving it every session!' },
          { emoji: '💜', title: 'Queen of the gym!', text: 'Your strength journey is beautiful. Keep going, warrior!' }
        ];
        var m = motivations[Math.floor(Math.random() * motivations.length)];
        document.getElementById('ptMotivationEmoji').textContent = m.emoji;
        document.getElementById('ptMotivationTitle').textContent = m.title;
        document.getElementById('ptMotivationText').textContent = m.text;
      }

      // ---- Achievement Badges ----
      var badgesCard = document.getElementById('ptBadgesCard');
      var badgesContainer = document.getElementById('ptBadgesContainer');
      if (badgesCard && badgesContainer) {
        var badges = [];
        if (totalSessions >= 1) badges.push({ icon: '🌱', label: 'First Workout', color: '#e8f5e9' });
        if (totalSessions >= 5) badges.push({ icon: '⭐', label: '5 Sessions', color: '#fff3e0' });
        if (totalSessions >= 10) badges.push({ icon: '🔥', label: '10 Sessions', color: '#fce4ec' });
        if (totalSessions >= 25) badges.push({ icon: '💎', label: '25 Sessions', color: '#e3f2fd' });
        if (totalSessions >= 50) badges.push({ icon: '👑', label: '50 Sessions', color: '#f3e5f5' });
        if (totalCal >= 1000) badges.push({ icon: '🔥', label: '1K Cal Burned', color: '#fff8e1' });
        if (totalCal >= 5000) badges.push({ icon: '🌋', label: '5K Cal Burned', color: '#fbe9e7' });
        if (totalCal >= 10000) badges.push({ icon: '☄️', label: '10K Cal Burned', color: '#ffebee' });
        if (totalMin >= 300) badges.push({ icon: '⏰', label: '5 Hours Trained', color: '#e0f7fa' });
        if (totalMin >= 600) badges.push({ icon: '🕐', label: '10 Hours Trained', color: '#e8eaf6' });
        if (streak >= 2) badges.push({ icon: '🔗', label: streak + '-Week Streak', color: '#f1f8e9' });
        if (streak >= 4) badges.push({ icon: '💪', label: 'Month Warrior', color: '#ede7f6' });

        if (badges.length > 0) {
          badgesCard.style.display = 'block';
          var bhtml = '';
          badges.forEach(function(b) {
            bhtml += '<div style="display: flex; align-items: center; gap: 8px; background: ' + b.color + '; padding: 10px 16px; border-radius: 12px; min-width: 120px;">';
            bhtml += '<span style="font-size: 1.4rem;">' + b.icon + '</span>';
            bhtml += '<span style="font-size: 0.82rem; font-weight: 600; color: var(--plum);">' + b.label + '</span>';
            bhtml += '</div>';
          });
          badgesContainer.innerHTML = bhtml;
        }
      }

      // ---- Charts ----
      if (typeof Chart !== 'undefined') {
        // Calories Chart (line)
        var chartsRow = document.getElementById('ptChartsRow');
        if (chartsRow && calValues.length >= 2) {
          chartsRow.style.display = 'grid';
          var calCtx = document.getElementById('ptCaloriesChart').getContext('2d');
          if (ptCaloriesChartInst) ptCaloriesChartInst.destroy();
          ptCaloriesChartInst = new Chart(calCtx, {
            type: 'line',
            data: {
              labels: calDates.map(function(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }),
              datasets: [{
                label: 'Calories Burned',
                data: calValues,
                borderColor: '#E8728A',
                backgroundColor: 'rgba(232,114,138,0.15)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#C94C6E',
                pointRadius: 5,
                pointHoverRadius: 7
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
              }
            }
          });
        }

        // Workout Types Chart (doughnut)
        var typeLabels = Object.keys(typeCounts);
        if (chartsRow && typeLabels.length >= 1) {
          chartsRow.style.display = 'grid';
          var typeCtx = document.getElementById('ptTypesChart').getContext('2d');
          var typeColors = ['#E8728A', '#6B2D5B', '#F4A0B5', '#a855f7', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];
          if (ptTypesChartInst) ptTypesChartInst.destroy();
          ptTypesChartInst = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
              labels: typeLabels,
              datasets: [{
                data: typeLabels.map(function(k) { return typeCounts[k]; }),
                backgroundColor: typeColors.slice(0, typeLabels.length),
                borderWidth: 2,
                borderColor: '#fff'
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } }
              }
            }
          });
        }

        // Weight Progress Chart (line)
        var weightRow = document.getElementById('ptWeightChartRow');
        if (weightRow && weightValues.length >= 2) {
          weightRow.style.display = 'block';
          var weightCtx = document.getElementById('ptWeightChart').getContext('2d');
          if (ptWeightChartInst) ptWeightChartInst.destroy();
          ptWeightChartInst = new Chart(weightCtx, {
            type: 'line',
            data: {
              labels: weightDates.map(function(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }),
              datasets: [{
                label: 'Weight (kg)',
                data: weightValues,
                borderColor: '#6B2D5B',
                backgroundColor: 'rgba(107,45,91,0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#6B2D5B',
                pointRadius: 5,
                pointHoverRadius: 7
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
              }
            }
          });
        }
      }

      // ---- Workout History Cards ----
      var histTitle = document.getElementById('ptHistoryTitle');
      if (histTitle) histTitle.style.display = 'block';

      var html = '';
      entries.forEach(function(p) {
        var intensityColor = p.intensity === 'Intense' ? '#e74c3c' : (p.intensity === 'High' ? '#f39c12' : (p.intensity === 'Moderate' ? '#f1c40f' : '#2ecc71'));
        var sessionIcon = {
          'Strength Training': '🏋️', 'Cardio': '🏃‍♀️', 'HIIT': '⚡', 'Flexibility & Mobility': '🧘‍♀️',
          'Full Body': '💪', 'Upper Body': '🤸‍♀️', 'Lower Body': '🦵', 'Core': '🔥'
        };
        var icon = sessionIcon[p.sessionType] || '🏋️';

        html += '<div class="dash-card" style="margin-top: 16px; border-left: 4px solid ' + intensityColor + ';">';
        html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">';
        html += '<div style="display: flex; align-items: center; gap: 10px;">';
        html += '<span style="font-size: 1.6rem;">' + icon + '</span>';
        html += '<div>';
        html += '<h4 style="color: var(--plum); margin: 0;">' + escapeHtml(p.sessionType || 'Workout') + '</h4>';
        html += '<span style="font-size: 0.82rem; color: var(--text-light);">📅 ' + escapeHtml(p.date || '—') + '</span>';
        html += '</div></div>';
        html += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
        if (p.intensity) html += '<span style="background: ' + intensityColor + '; color: white; padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 500;">' + escapeHtml(p.intensity) + '</span>';
        html += '</div></div>';

        // Quick stats bar
        html += '<div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 14px; padding: 12px 16px; background: var(--blush-light); border-radius: 10px;">';
        if (p.duration) html += '<div style="text-align: center;"><div style="font-size: 1.1rem; font-weight: 700; color: var(--plum);">' + escapeHtml(String(p.duration)) + '</div><div style="font-size: 0.72rem; color: var(--text-light);">minutes</div></div>';
        if (p.calories) html += '<div style="text-align: center;"><div style="font-size: 1.1rem; font-weight: 700; color: var(--rose);">' + escapeHtml(String(p.calories)) + '</div><div style="font-size: 0.72rem; color: var(--text-light);">calories</div></div>';
        if (p.weight) html += '<div style="text-align: center;"><div style="font-size: 1.1rem; font-weight: 700; color: var(--plum);">' + escapeHtml(String(p.weight)) + '</div><div style="font-size: 0.72rem; color: var(--text-light);">kg</div></div>';
        html += '</div>';

        // Exercises
        html += '<div style="margin-bottom: 8px;"><strong style="font-size: 0.85rem; color: var(--text-dark);">Exercises:</strong>';
        html += '<p style="font-size: 0.88rem; color: var(--text-medium); white-space: pre-line; margin-top: 4px; line-height: 1.6;">' + escapeHtml(p.exercises) + '</p></div>';

        if (p.trainerNotes) {
          html += '<div style="background: linear-gradient(135deg, #f3e5f5, #fce4ec); padding: 12px 16px; border-radius: 10px; margin-top: 8px;">';
          html += '<span style="font-size: 0.82rem; font-weight: 600; color: var(--plum);">🗒️ Trainer says:</span>';
          html += '<p style="font-size: 0.85rem; color: var(--text-dark); margin-top: 4px; font-style: italic;">"' + escapeHtml(p.trainerNotes) + '"</p>';
          html += '</div>';
        }

        html += '</div>';
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
            el = document.getElementById('profileMemberId');
            if (el) el.textContent = data.memberId || '—';
            el = document.getElementById('profileJoined');
            if (el && data.joinedDate) el.textContent = new Date(data.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

            // Load profile photo
            if (data.photoURL) {
              var pImg = document.getElementById('profileAvatarImg');
              var pEmoji = document.getElementById('profileAvatarEmoji');
              if (pImg) { pImg.src = data.photoURL; pImg.style.display = 'block'; }
              if (pEmoji) pEmoji.style.display = 'none';
            }

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
  loadAdminEmails();
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    // Check hardcoded admin or Firestore role
    if (isAdminEmail(user.email)) {
      document.getElementById('adminDashboard').style.display = 'flex';
      loadAdminProfile(user);
      loadMembersList();
      loadMembersStats();
    } else {
      // Check Firestore for admin role
      firebase.firestore().collection('users').doc(user.uid).get().then(function(doc) {
        if (doc.exists && doc.data().role === 'admin') {
          document.getElementById('adminDashboard').style.display = 'flex';
          loadAdminProfile(user);
          loadMembersList();
          loadMembersStats();
        } else {
          window.location.href = 'login.html';
        }
      });
    }
  });
}

// ===== REDIRECT LOGGED-IN USERS FROM LOGIN PAGE =====
if (typeof firebase !== 'undefined' && window.location.pathname.includes('login')) {
  loadAdminEmails();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      if (isAdminEmail(user.email)) {
        window.location.href = 'admin.html';
      } else {
        firebase.firestore().collection('users').doc(user.uid).get().then(function(doc) {
          window.location.href = (doc.exists && doc.data().role === 'admin') ? 'admin.html' : 'dashboard.html';
        });
      }
    }
  });
}
