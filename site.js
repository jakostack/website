// Shared by every page: loads content/site.json, builds the hover menu,
// then hands the content to the page's own render function.
// All text and images are edited in Pages CMS (app.pagescms.org).

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad = n => String(n).padStart(2, '0');

function buildMenu(d, current) {
  const link = (href, label, key) =>
    `<li><a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a></li>`;
  const menu = document.createElement('nav');
  menu.className = 'menu';
  menu.setAttribute('aria-label', 'Site');
  menu.innerHTML = `
    <button class="menu-toggle" aria-expanded="false" aria-controls="menu-panel">
      <span>${esc(d.name)}</span><span class="hint">Menu</span>
    </button>
    <div class="menu-panel" id="menu-panel">
      <div>
        <ul class="pages">
          ${link('/', 'Projects', 'projects')}
          ${link('/playground.html', 'Playground', 'playground')}
          ${link('/about.html', 'About', 'about')}
        </ul>
        <ol class="index">${(d.projects || []).map((p, i) =>
          `<li><span class="n">${pad(i + 1)}</span><a href="/project.html?p=${slug(p.title)}" data-slug="${slug(p.title)}"${current === 'project:' + slug(p.title) ? ' aria-current="page"' : ''}>${esc(p.title)}</a></li>`).join('')}</ol>
      </div>
      <div class="contact">
        <p class="label">Freelance &amp; inquiries</p>
        <p><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></p>
        ${d.instagram ? `<p><a href="${esc(d.instagram)}" target="_blank" rel="noopener">Instagram</a></p>` : ''}
        <p class="fine">© ${esc(d.name)} ${new Date().getFullYear()}</p>
      </div>
    </div>`;
  document.body.prepend(menu);

  // Touch screens and keyboards: tap or press to open, tap outside / Escape / a link to close.
  const btn = menu.querySelector('.menu-toggle');
  const hint = btn.querySelector('.hint');
  const set = open => {
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    hint.textContent = open ? 'Close' : 'Menu';
  };
  btn.addEventListener('click', () => set(!menu.classList.contains('is-open')));
  document.addEventListener('click', e => { if (!menu.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); btn.focus(); } });
  menu.querySelectorAll('.menu-panel a').forEach(a => a.addEventListener('click', () => set(false)));
}

function loadSite(current, render) {
  fetch('/content/site.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(d => {
      buildMenu(d, current);
      render(d);
    });
}
