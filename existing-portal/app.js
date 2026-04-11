/* ─────────────────────────────────────────
   CLIENT PORTAL · app.js
───────────────────────────────────────── */

let allClients = [];

// ── Boot ──────────────────────────────────
async function init() {
  try {
    const res = await fetch('data/clients.json');
    if (!res.ok) throw new Error('Could not load client data.');
    const data = await res.json();
    allClients = data.clients || [];

    // Restore session if browser was refreshed
    const saved = sessionStorage.getItem('clientId');
    if (saved) {
      const client = allClients.find(c => c.id === saved);
      if (client) { renderPortal(client); return; }
    }

    setupLoginForm();
  } catch (err) {
    document.querySelector('.login-sub').textContent =
      'Unable to load portal. Please contact your designer.';
    console.error(err);
  }
}

// ── Login ─────────────────────────────────
function setupLoginForm() {
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('password-input');
    const pass  = input.value.trim();
    const results = await Promise.all(allClients.map(c => dcodeIO.bcrypt.compare(pass, c.password)));
    const client = allClients.find((_, i) => results[i]);

    if (client) {
      sessionStorage.setItem('clientId', client.id);
      renderPortal(client);
    } else {
      document.getElementById('error-msg').classList.remove('hidden');
      input.value = '';
      input.focus();
    }
  });

  // Hide error on new keystroke
  document.getElementById('password-input').addEventListener('input', () => {
    document.getElementById('error-msg').classList.add('hidden');
  });
}

// ── Render portal ─────────────────────────
function renderPortal(client) {
  document.getElementById('login-screen').classList.add('hidden');

  const portal = document.getElementById('portal');
  portal.classList.remove('hidden');
  requestAnimationFrame(() => portal.classList.add('visible'));

  // Hero
  document.getElementById('hero-label').textContent    = client.label    || 'Project';
  document.getElementById('hero-title').textContent    = client.name     || '';
  document.getElementById('hero-subtitle').textContent = client.subtitle || '';
  document.getElementById('footer-name').textContent   = client.name     || '';
  document.title = `${client.name} — Studio Portal`;

  // Sections
  buildMoodboard(client.moodboard  || []);
  buildProducts (client.products   || []);
  buildPalette  (client.palette    || []);

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('clientId');
    location.reload();
  });
}

// ── Mood Board ────────────────────────────
function buildMoodboard(images) {
  const grid = document.getElementById('moodboard-grid');
  if (!images.length) { hideSection(grid); return; }

  grid.innerHTML = images.map((src, i) => `
    <div class="mood-item">
      <img class="mood-img"
           src="${esc(src)}"
           alt="Mood board image ${i + 1}"
           loading="${i < 3 ? 'eager' : 'lazy'}">
    </div>
  `).join('');
}

// ── Products ──────────────────────────────
function buildProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!products.length) { hideSection(grid); return; }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img-wrap">
        <img class="product-img"
             src="${esc(p.image || '')}"
             alt="${esc(p.name)}"
             loading="lazy">
      </div>
      <div class="product-body">
        ${ p.brand  ? `<p class="product-brand">${esc(p.brand)}</p>`   : '' }
        <h3 class="product-name">${esc(p.name)}</h3>
        ${ p.notes  ? `<p class="product-notes">${esc(p.notes)}</p>`   : '' }
        <div class="product-foot">
          ${ p.price ? `<span class="product-price">${esc(p.price)}</span>` : '<span></span>' }
          ${ safeLink(p.link) }
        </div>
      </div>
    </div>
  `).join('');
}

// ── Palette ───────────────────────────────
function buildPalette(colors) {
  const row = document.getElementById('palette-row');
  if (!colors.length) { hideSection(row); return; }

  row.innerHTML = colors.map(c => `
    <div class="swatch">
      <div class="swatch-color" style="background-color:${esc(c.hex)};"></div>
      <div class="swatch-info">
        <p class="swatch-name">${esc(c.name)}</p>
        <p class="swatch-code">${esc(c.hex)}${ c.code ? ' · ' + esc(c.code) : '' }</p>
      </div>
    </div>
  `).join('');
}

// ── Helpers ───────────────────────────────
function hideSection(el) {
  // Walk up to the nearest <section> and hide it
  let node = el;
  while (node && node.tagName !== 'SECTION') node = node.parentElement;
  if (node) node.style.display = 'none';
}

/** Safe product link — blocks javascript: URIs */
function safeLink(url) {
  if (!url) return '';
  const clean = String(url).trim();
  if (!/^https?:\/\//i.test(clean)) return '';
  return `<a class="product-link" href="${esc(clean)}" target="_blank" rel="noopener noreferrer">View →</a>`;
}

/** Minimal HTML escape to prevent XSS */
function esc(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

init();
