/* ─── API layer ─── */
const API = 'http://localhost:3001/api';

function getToken() { return localStorage.getItem('ecure_token'); }
function setToken(t) { localStorage.setItem('ecure_token', t); }
function removeToken() { localStorage.removeItem('ecure_token'); localStorage.removeItem('ecure_user'); }
function getUser() { try { return JSON.parse(localStorage.getItem('ecure_user')); } catch { return null; } }
function setUser(u) { localStorage.setItem('ecure_user', JSON.stringify(u)); }

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
}

/* ─── Toast ─── */
function toast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const colors = { success: 'var(--green-400)', error: '#f87171', warning: '#facc15', info: 'var(--blue-400)' };
  const el = document.createElement('div');
  el.className = `toast ${type !== 'success' ? type : ''}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.success}" style="color:${colors[type] || colors.success}"></i><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-fade');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/* ─── Nav update ─── */
function updateNav() {
  const user = getUser();
  const authEl = document.querySelector('.nav-auth');
  if (!authEl) return;
  if (user) {
    authEl.innerHTML = `
      <div class="nav-user-info">
        <div class="nav-avatar">${user.name ? user.name[0].toUpperCase() : 'U'}</div>
        <span style="font-size:0.85rem;font-weight:600">${user.name || 'User'}</span>
      </div>
      <a href="dashboard.html" class="btn btn-sm btn-secondary">Dashboard</a>
      <button onclick="logoutUser()" class="btn btn-sm btn-ghost">Logout</button>
    `;
  } else {
    authEl.innerHTML = `
      <a href="auth.html" class="btn btn-sm btn-secondary">Login</a>
      <a href="auth.html?signup=true" class="btn btn-sm btn-primary">Sign Up</a>
    `;
  }
}

function logoutUser() {
  removeToken();
  toast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'index.html', 1000);
}

/* ─── Mobile menu ─── */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  if (btn && links) btn.addEventListener('click', () => links.classList.toggle('open'));
}

/* ─── Smooth scroll ─── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

/* ─── Animated counters ─── */
function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = 0;
  const startTime = performance.now();
  const update = now => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.counter), el.dataset.suffix || '');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(el => observer.observe(el));
}

/* ─── Live stats from backend ─── */
async function loadGlobalStats() {
  try {
    const stats = await apiFetch('/stats');
    const map = {
      'stat-devices': stats.totalDevicesRecycled,
      'stat-co2': stats.totalCo2Saved,
      'stat-users': stats.totalUsers + 500,
      'stat-collectors': 50
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) { el.dataset.counter = val; animateCounter(el, val, el.dataset.suffix || ''); }
    });
  } catch { /* silently fail if backend not running */ }
}

/* ════════════ AUTH PAGE ════════════ */
async function initAuthPage() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const signinContainer = document.getElementById('signin-form');
  const signupContainer = document.getElementById('signup-form');
  const btnSignin = document.getElementById('showSigninBtn');
  const btnSignup = document.getElementById('showSignupBtn');

  // redirect if already logged in
  if (getToken() && getUser()) { window.location.href = 'dashboard.html'; return; }

  const showSignin = () => {
    signinContainer.style.display = 'block';
    signupContainer.style.display = 'none';
    btnSignin.classList.add('active'); btnSignup.classList.remove('active');
  };
  const showSignup = () => {
    signinContainer.style.display = 'none';
    signupContainer.style.display = 'block';
    btnSignup.classList.add('active'); btnSignin.classList.remove('active');
  };

  if (new URLSearchParams(location.search).get('signup') === 'true') showSignup(); else showSignin();
  btnSignin.addEventListener('click', showSignin);
  btnSignup.addEventListener('click', showSignup);

  // password toggles
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const inp = icon.previousElementSibling;
      if (!inp || inp.tagName !== 'INPUT') return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('fa-eye'); icon.classList.toggle('fa-eye-slash');
    });
  });

  // Login
  loginForm && loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type=submit]');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    try {
      btn.disabled = true; btn.textContent = 'Signing in…';
      const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setToken(data.token); setUser(data.user);
      toast('Welcome back, ' + data.user.name + '! 🌿');
      setTimeout(() => window.location.href = 'dashboard.html', 900);
    } catch (err) {
      if (errEl) { errEl.textContent = err.message; errEl.classList.add('show'); }
      toast(err.message, 'error');
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  });

  // Signup
  signupForm && signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = signupForm.querySelector('button[type=submit]');
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const errEl = document.getElementById('signupError');
    if (password !== confirm) {
      if (errEl) { errEl.textContent = "Passwords don't match"; errEl.classList.add('show'); }
      return;
    }
    try {
      btn.disabled = true; btn.textContent = 'Creating account…';
      const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      setToken(data.token); setUser(data.user);
      toast('Account created! Welcome to E-Cure Earth 🌍');
      setTimeout(() => window.location.href = 'dashboard.html', 900);
    } catch (err) {
      if (errEl) { errEl.textContent = err.message; errEl.classList.add('show'); }
      toast(err.message, 'error');
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  });
}

/* ════════════ DASHBOARD PAGE ════════════ */
async function initDashboardPage() {
  const token = getToken();
  if (!token) { window.location.href = 'auth.html'; return; }

  try {
    const user = await apiFetch('/auth/me');
    setUser(user);
    // fill in UI
    ['dash-username','sidebar-name'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = user.name;
    });
    const avatarEls = document.querySelectorAll('.sidebar-avatar, .nav-avatar');
    avatarEls.forEach(el => el.textContent = (user.name || 'U')[0].toUpperCase());

    document.getElementById('stat-devices') && (document.getElementById('stat-devices').textContent = user.devicesRecycled || 0);
    document.getElementById('stat-weight') && (document.getElementById('stat-weight').textContent = (user.totalWeight || 0).toFixed(1) + ' kg');
    document.getElementById('stat-co2') && (document.getElementById('stat-co2').textContent = (user.co2Saved || 0).toFixed(1) + ' kg');
    document.getElementById('stat-points') && (document.getElementById('stat-points').textContent = user.points || 0);

    // load pickups
    const pickups = await apiFetch('/pickups');
    const list = document.getElementById('activity-list');
    if (list) {
      if (!pickups.length) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">♻️</div><h3>No activity yet</h3><p>Schedule your first pickup to get started.</p></div>';
      } else {
        list.innerHTML = pickups.slice(0,5).map(p => `
          <div class="activity-item">
            <div class="activity-icon green" style="background:rgba(34,197,94,0.12);color:var(--green-400)"><i class="fas fa-recycle"></i></div>
            <div class="activity-info"><p>${p.collectorName} Pickup</p><span>${new Date(p.createdAt).toLocaleDateString()} · ${p.deviceCount} device(s)</span></div>
            <span class="badge badge-${p.status==='scheduled'?'teal':'green'}">${p.status}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    toast('Session expired. Please log in again.', 'error');
    setTimeout(() => { removeToken(); window.location.href = 'auth.html'; }, 1500);
  }
}

/* ════════════ MARKETPLACE PAGE ════════════ */
async function initMarketplacePage() {
  updateNav();
  const grid = document.getElementById('listing-grid');
  const searchInput = document.getElementById('mp-search');
  const catFilter = document.getElementById('mp-category');
  const locFilter = document.getElementById('mp-location');
  const addBtn = document.getElementById('add-listing-btn');
  const modal = document.getElementById('listing-modal');
  const closeBtn = document.getElementById('modal-close');
  const listingForm = document.getElementById('listingForm');

  let allListings = [];

  async function loadListings() {
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading listings…</p></div>';
    try {
      const params = new URLSearchParams();
      const search = searchInput?.value; const cat = catFilter?.value; const loc = locFilter?.value;
      if (search) params.set('search', search);
      if (cat && cat !== 'all') params.set('category', cat);
      if (loc && loc !== 'all') params.set('location', loc);
      allListings = await apiFetch('/listings?' + params.toString());
      renderListings(allListings);
    } catch {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load listings</h3><p>Make sure the backend server is running.</p></div>';
    }
  }

  function renderListings(listings) {
    if (!listings.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📭</div><h3>No listings found</h3><p>Try different filters.</p></div>';
      return;
    }
    const catLabel = { laptops:'💻 Laptop', phones:'📱 Phone', tablets:'📟 Tablet', accessories:'🔌 Accessory', other:'📦 Other' };
    grid.innerHTML = listings.map(l => `
      <div class="glass-card listing-card">
        <div class="listing-img">
          <img src="${l.image || 'laptop.jpeg'}" alt="${l.title}" onerror="this.src='laptop.jpeg'">
          <div class="listing-img-overlay"></div>
          <span class="listing-price-tag">₹${l.price}</span>
          <span class="listing-category-tag badge badge-green">${catLabel[l.category] || l.category}</span>
        </div>
        <div class="listing-body">
          <h3>${l.title}</h3>
          <p>${l.description || 'No description provided.'}</p>
          <div class="listing-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${l.location} region</span>
            <span><i class="fas fa-clock"></i> ${timeAgo(l.postedAt)}</span>
          </div>
          <div class="listing-seller"><i class="fas fa-user"></i> ${l.sellerName || 'Anonymous'}</div>
          <button class="btn btn-primary w-full" onclick="contactSeller('${l.sellerName}')">Contact Seller</button>
        </div>
      </div>
    `).join('');
  }

  // Filters
  [searchInput, catFilter, locFilter].forEach(el => {
    if (el) el.addEventListener('change', loadListings);
    if (el === searchInput && el) el.addEventListener('keyup', debounce(loadListings, 400));
  });

  // Modal
  addBtn?.addEventListener('click', () => {
    if (!getToken()) { toast('Please log in to add a listing', 'warning'); setTimeout(() => window.location.href='auth.html', 1000); return; }
    modal?.classList.add('open');
  });
  closeBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  listingForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = listingForm.querySelector('[type=submit]');
    try {
      btn.disabled = true; btn.textContent = 'Submitting…';
      const body = {
        title: document.getElementById('lf-title').value,
        category: document.getElementById('lf-category').value,
        price: document.getElementById('lf-price').value,
        location: document.getElementById('lf-location').value,
        description: document.getElementById('lf-description').value
      };
      await apiFetch('/listings', { method: 'POST', body: JSON.stringify(body) });
      toast('Listing added successfully! 🎉');
      modal.classList.remove('open');
      listingForm.reset();
      loadListings();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Submit Listing';
    }
  });

  loadListings();
}

function contactSeller(name) {
  if (!getToken()) { toast('Please log in to contact sellers', 'warning'); return; }
  toast(`Message sent to ${name}! They will reply shortly.`);
}

/* ════════════ COLLECTORS PAGE ════════════ */
async function initCollectorsPage() {
  updateNav();
  const grid = document.getElementById('collectors-grid');
  const searchInput = document.getElementById('col-search');
  const locFilter = document.getElementById('col-location');
  const pickupFilter = document.getElementById('col-pickup');

  async function loadCollectors() {
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Finding collectors…</p></div>';
    try {
      const params = new URLSearchParams();
      if (searchInput?.value) params.set('search', searchInput.value);
      if (locFilter?.value && locFilter.value !== 'all') params.set('location', locFilter.value);
      if (pickupFilter?.checked) params.set('pickup', 'true');
      const cols = await apiFetch('/collectors?' + params);
      renderCollectors(cols);
    } catch {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load</h3><p>Backend server not running.</p></div>';
    }
  }

  function renderCollectors(cols) {
    if (!cols.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><h3>No collectors found</h3><p>Try different filters.</p></div>';
      return;
    }
    grid.innerHTML = cols.map(c => `
      <div class="glass-card collector-card">
        <div class="collector-header">
          <div>
            <div class="collector-name">${c.name}</div>
            <div class="collector-rating" style="margin-top:4px">
              ${'★'.repeat(Math.round(c.rating))}${'☆'.repeat(5-Math.round(c.rating))}
              <span>${c.rating} (${c.reviewCount} reviews)</span>
            </div>
          </div>
          <span class="badge badge-${c.certified?'green':'gray'}">${c.certified?'✓ Certified':'Drop-off'}</span>
        </div>
        <div class="collector-detail"><i class="fas fa-map-marker-alt text-green"></i> ${c.address}</div>
        <div class="collector-detail"><i class="fas fa-phone text-green"></i> ${c.phone}</div>
        <div class="collector-detail"><i class="fas fa-clock text-green"></i> ${c.hours}</div>
        <div class="collector-tags">
          ${c.pickupAvailable ? '<span class="badge badge-teal">🚛 Pickup</span>' : ''}
          ${c.dataDestruction ? '<span class="badge badge-blue">🔒 Data Wipe</span>' : ''}
          ${c.acceptedItems.map(i => `<span class="badge badge-gray">${i}</span>`).join('')}
        </div>
        <div class="collector-actions">
          ${c.pickupAvailable ? `<button class="btn btn-primary btn-sm" onclick="openScheduleModal('${c.id}','${c.name}')"><i class="fas fa-calendar-check"></i> Schedule Pickup</button>` : ''}
          <a href="mailto:${c.email}" class="btn btn-secondary btn-sm"><i class="fas fa-envelope"></i> Email</a>
        </div>
      </div>
    `).join('');
  }

  [searchInput, locFilter, pickupFilter].forEach(el => {
    if (el) el.addEventListener('change', loadCollectors);
    if (el === searchInput && el) el.addEventListener('keyup', debounce(loadCollectors, 400));
  });

  loadCollectors();
}

function openScheduleModal(collectorId, collectorName) {
  if (!getToken()) { toast('Please log in to schedule a pickup', 'warning'); setTimeout(() => window.location.href='auth.html',1000); return; }
  const modal = document.getElementById('schedule-modal');
  document.getElementById('sch-collector-id').value = collectorId;
  document.getElementById('sch-collector-name').value = collectorName;
  document.getElementById('sch-collector-label').textContent = collectorName;
  modal?.classList.add('open');
  document.getElementById('modal-close-sch')?.addEventListener('click', () => modal.classList.remove('open'));
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  document.getElementById('scheduleForm')?.addEventListener('submit', async function handler(e) {
    e.preventDefault();
    const btn = this.querySelector('[type=submit]');
    try {
      btn.disabled = true; btn.textContent = 'Scheduling…';
      const body = {
        collectorId: document.getElementById('sch-collector-id').value,
        collectorName: document.getElementById('sch-collector-name').value,
        address: document.getElementById('sch-address').value,
        date: document.getElementById('sch-date').value,
        deviceCount: parseInt(document.getElementById('sch-devices').value) || 1,
        weight: parseFloat(document.getElementById('sch-weight').value) || 2.5
      };
      await apiFetch('/pickups', { method: 'POST', body: JSON.stringify(body) });
      toast('Pickup scheduled! Check your dashboard. 📅');
      modal.classList.remove('open');
      this.reset();
      this.removeEventListener('submit', handler);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Confirm Pickup';
    }
  });
}

/* ─── Helpers ─── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString();
}
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScroll();
  updateNav();
  initCounters();

  const page = window.location.pathname;
  if (page.includes('auth.html')) initAuthPage();
  else if (page.includes('dashboard.html')) initDashboardPage();
  else if (page.includes('marketplace.html')) initMarketplacePage();
  else if (page.includes('collectors.html')) initCollectorsPage();
  else { loadGlobalStats(); } // index
});
