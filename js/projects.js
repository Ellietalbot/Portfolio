// Projects gallery logic — tag filtering and sorting (by date, both
// directions, and alphabetically). Dates like "Winter 2025" are parsed
// into a real sortable number so "Newest first" is actually chronological,
// not just alphabetical luck.
(function(){
  const projects = [
    {
      title: 'BYUI Ticketing', tag: 'UX', date: 'Spring 2025', bg: 'linear-gradient(160deg,#BFE3FF,#5BA6FF)',
      href: 'ticketing-case-study.html',
      image: 'images/ticketing-event-pair-pink.jpg',
      icon: `<rect x="18" y="30" width="64" height="40" rx="8" fill="none" stroke="#1A1A1A" stroke-width="2.4"/>
             <path d="M18 44h64" stroke="#1A1A1A" stroke-width="2.4"/>
             <path d="M32 44v26" stroke="#1A1A1A" stroke-width="2" stroke-dasharray="3 4"/>`
    },
    // coming soon — no case study page yet, so these render as non-clickable
    // cards. once a page exists: add an `href` and remove `comingSoon`.
    {
      title: 'Registration Redesign', tag: 'UX', date: 'Coming soon', comingSoon: true,
      bg: 'var(--orange-soft)', image: 'images/registration-cover.jpg'
    },
    {
      title: 'Student Health', tag: 'UX', date: 'Coming soon', comingSoon: true,
      bg: 'var(--orange-soft)', image: 'images/studenthealth-cover.jpg'
    },
    {
      title: 'BYUI Design System', tag: 'UX', date: 'Coming soon', comingSoon: true,
      bg: 'var(--orange-soft)', image: 'images/designsystem-colors-cover.jpg'
    },
    {
      title: 'SafeWalk', tag: 'UX', date: 'Coming soon', comingSoon: true,
      bg: 'var(--orange-soft)', image: 'images/safewalk-cover.jpg'
    }
  ];

  // parse "Season YYYY" into a sortable numeric value
  const SEASON_ORDER = { spring: 0.0, summer: 0.25, fall: 0.5, winter: 0.75 };
  function sortValue(dateStr){
    // anything without a "Season YYYY" date (e.g. "Coming soon") has no
    // real date to sort by — render() keeps those after the dated projects
    if (!/^(spring|summer|fall|winter) \d{4}$/i.test(dateStr)) return null;
    const [season, year] = dateStr.split(' ');
    return parseInt(year, 10) + (SEASON_ORDER[season.toLowerCase()] ?? 0);
  }
  projects.forEach(p => p.sortVal = sortValue(p.date));

  const grid = document.getElementById('grid');
  const tagBar = document.getElementById('tagBar');
  const sortSelect = document.getElementById('sortSelect');

  let activeTag = 'All';
  let sortMode = 'newest';

  // a category (the "All" view or any single tag) always shows at least
  // MIN_CARDS cards — real ones first, padded out with placeholders when
  // there aren't enough real items yet. once real items reach MIN_CARDS,
  // placeholders disappear entirely and the grid just keeps growing with
  // whatever real items exist (6, 7, 8, ...).
  const MIN_CARDS = 5;

  function cardHTML(p){
    const visual = p.image
      ? `<img src="${p.image}" alt="${p.title} cover photo" loading="lazy">`
      : `<svg viewBox="0 0 100 100">${p.icon}</svg>`;
    return `
      <div class="p-thumb" style="background:${p.bg}">
        <span class="p-tag">${p.tag}</span>
        ${visual}
      </div>
      <div class="p-meta">
        <div class="p-title">${p.title}</div>
        <div class="p-date">${p.date}</div>
      </div>
    `;
  }

  function placeholderHTML(){
    return `
      <div class="p-thumb p-thumb-placeholder">
        <span class="p-tag p-tag-placeholder">Coming soon</span>
        <svg viewBox="0 0 100 100"><path d="M50 30v40M30 50h40" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
      </div>
      <div class="p-meta">
        <div class="p-title p-title-placeholder">New project</div>
        <div class="p-date p-date-placeholder">TBA</div>
      </div>
    `;
  }

  function render(){
    let list = activeTag === 'All' ? projects.slice() : projects.filter(p => p.tag === activeTag);

    // date sorts only order projects that have a real date; "coming soon"
    // projects are left out of that ordering and always follow, A–Z
    const undated = (a, b) => (a.sortVal === null) - (b.sortVal === null);
    if (sortMode === 'newest') list.sort((a, b) => undated(a, b) || (b.sortVal - a.sortVal) || a.title.localeCompare(b.title));
    else if (sortMode === 'oldest') list.sort((a, b) => undated(a, b) || (a.sortVal - b.sortVal) || a.title.localeCompare(b.title));
    else if (sortMode === 'az') list.sort((a, b) => a.title.localeCompare(b.title));

    grid.innerHTML = '';

    const actualItemCount = list.length;
    const placeholderCount = Math.max(0, MIN_CARDS - actualItemCount);

    // real items first — never replaced or recycled, just appended to
    list.forEach((p) => {
      const card = document.createElement(p.comingSoon ? 'div' : 'a');
      card.className = 'p-card' + (p.comingSoon ? ' p-card-soon' : '');
      if (!p.comingSoon) card.href = p.href || '#';
      card.innerHTML = cardHTML(p);
      grid.appendChild(card);
    });

    // pad up to MIN_CARDS only while the category is under-filled
    for (let i = 0; i < placeholderCount; i++) {
      const div = document.createElement('div');
      div.className = 'p-card p-card-placeholder';
      div.setAttribute('aria-hidden', 'true');
      div.innerHTML = placeholderHTML();
      grid.appendChild(div);
    }
  }

  function buildTagBar(){
    const uniqueTags = [...new Set(projects.map(p => p.tag))];
    const all = ['All', ...uniqueTags];
    if (!all.includes(activeTag)) activeTag = 'All'; // tag may have disappeared

    tagBar.innerHTML = '';
    all.forEach((tag) => {
      const btn = document.createElement('button');
      btn.className = 'tag-pill' + (tag === activeTag ? ' active' : '');
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        activeTag = tag;
        tagBar.querySelectorAll('.tag-pill').forEach(b => b.classList.toggle('active', b === btn));
        render();
      });
      tagBar.appendChild(btn);
    });
  }

  // ---- dynamic add/remove — keeps tag bar + grid in sync automatically ----
  function addProject(p){
    p.sortVal = sortValue(p.date);
    projects.push(p);
    buildTagBar();
    render();
  }

  function removeProject(predicate){
    const idx = projects.findIndex(predicate);
    if (idx === -1) return false;
    projects.splice(idx, 1);
    buildTagBar();
    render();
    return true;
  }

  sortSelect.addEventListener('change', () => {
    sortMode = sortSelect.value;
    render();
  });

  buildTagBar();
  render();

  // exposed so projects can be added/removed at runtime (e.g. from a future
  // CMS/admin flow or the console) and have the grid react immediately
  window.ProjectsGallery = { addProject, removeProject };
})();
