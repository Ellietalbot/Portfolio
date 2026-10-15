// About page — two independent pieces:
//   1) The rotating story card: photo slides, auto-advancing progress bars,
//      click zones to manually step forward/back, looping continuously.
//   2) The Professional Journey tabs + experience accordion.

(function(){
  const SLIDE_DURATION = 3500; // ms per slide

  const slides = [
    // `pos` is the CSS object-position, i.e. which part of the photo stays
    // in frame when it's cropped to the tall story shape
    { photo: 'images/about-lake.jpg',      pos: '35% 50%', caption: 'Traveling, searching for inspiration all around the world', alt: 'Ellie smiling in a rain hood in front of a mountain lake' },
    { photo: 'images/about-campus.jpg',    pos: '50% 50%', caption: 'Doing a cognitive walkthrough on campus', alt: 'Ellie outside the Hyrum Manwaring Center' },
    { photo: 'images/about-waterfall.jpg', pos: '80% 50%', caption: 'Loving waterfall hikes with my favorite people', alt: 'Ellie and a friend in front of a tall waterfall' },
    { photo: 'images/about-painting.jpg',  pos: '50% 50%', caption: 'Painting when I\'m not designing', alt: 'An oil painting of a golden field and trees, painted by Ellie' }
  ];

  slides.forEach(s => { if (s.photo) { const i = new Image(); i.src = s.photo; } });

  let slideIndex = 0;
  let timer = null;

  const progressEl = document.getElementById('storyProgress');
  const illustrationEl = document.getElementById('storyIllustration');
  const captionEl = document.getElementById('storyCaption');
  const zoneLeft = document.getElementById('zoneLeft');
  const zoneRight = document.getElementById('zoneRight');

  function buildProgressSegments(){
    progressEl.innerHTML = '';
    slides.forEach(() => {
      const seg = document.createElement('div');
      seg.className = 'seg';
      const fill = document.createElement('span');
      fill.className = 'seg-fill';
      seg.appendChild(fill);
      progressEl.appendChild(seg);
    });
  }

  function renderSlide(){
    const slide = slides[slideIndex];
    if (slide.photo) {
      illustrationEl.style.background = '#1A1A1A';
      illustrationEl.innerHTML = `<img class="story-photo" src="${slide.photo}" alt="${slide.alt || ''}" style="object-position:${slide.pos || '50% 50%'}">`;
    } else {
      illustrationEl.style.background = slide.bg;
      illustrationEl.innerHTML = `<svg viewBox="0 0 300 350" width="100%" height="100%">${slide.icon}</svg>`;
    }
    captionEl.textContent = slide.caption;

    const segs = progressEl.querySelectorAll('.seg-fill');
    segs.forEach((fill, i) => {
      fill.style.transition = 'none';
      if (i < slideIndex) {
        fill.style.width = '100%';
      } else {
        fill.style.width = '0%';
      }
    });

    // force reflow on each fill so the width:0 reset is applied before we
    // re-enable the transition — otherwise the browser coalesces both style
    // changes and the fill jumps straight to 100% with no visible animation
    segs.forEach(fill => void fill.offsetWidth);

    const current = segs[slideIndex];
    current.style.transition = `width ${SLIDE_DURATION}ms linear`;
    current.style.width = '100%';
  }

  function clearTimer(){
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function scheduleNext(){
    clearTimer();
    timer = setTimeout(nextSlide, SLIDE_DURATION);
  }

  function nextSlide(){
    slideIndex = (slideIndex + 1) % slides.length;
    renderSlide();
    scheduleNext();
  }

  function prevSlide(){
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    renderSlide();
    scheduleNext();
  }

  zoneRight.addEventListener('click', nextSlide);
  zoneLeft.addEventListener('click', prevSlide);

  buildProgressSegments();
  renderSlide();
  scheduleNext();
})();

(function(){
  // ---------------- EXPERIENCE ACCORDION DATA ----------------
  const experience = [
    {
      role: 'UX Designer & Researcher', company: 'BYU-Idaho', dates: 'Sept 2025 – Present',
      bullets: [
        'Organized webpages and flows using Figma, HTML, CSS, and JS that are used on the current official university sites.',
        'Researched with a variety of testing methods, analyzed data with AI tools, and presented findings.',
        'Reduced user friction by 80% by researching and suggesting changes to the ticket-buying process, increasing retention and profits for the activities and events departments.',
        'Partnered with developers to implement front-end and back-end solutions based on research findings.'
      ]
    },
    {
      role: 'Operator', company: 'Becklar Monitoring Center (Life-Saving Help for Seniors)', dates: 'May 2025 – Sept 2025',
      bullets: [
        'Coordinated with subscribers, dispatchers, and dealers to provide service and life-saving help.',
        'Responded to subscribers to identify needs and make life-saving decisions under pressure.',
        'Followed protocol and strict guidelines to protect subscribers and the company.'
      ]
    },
    {
      role: 'Etsy Shop Owner', company: 'Self-Employed', dates: 'July 2020 – Present',
      bullets: [
        'Created, managed, and sold 10,000 digitally designed products (planners, stationery, etc.).',
        'Received over 600 reviews with a 4.5-star average for customer service and product quality.',
        'Designed product mockups, marketing graphics, and responsive layouts for digital listings.',
        'Used tools such as InDesign, Photoshop, Illustrator, Canva, and Procreate.'
      ]
    },
    {
      role: 'Administrator, Team Lead & Tutor', company: 'BYU-Idaho Study Skills Center', dates: 'Feb 2024 – Apr 2025',
      bullets: [
        'Led teams of 10-20 tutors in meetings to improve performance and increase workplace unity.',
        'Conducted one-on-one interviews and created reports to measure employee performance.',
        'Scheduled and managed over 200 appointments weekly with Microsoft tools (Excel, Word, Teams).',
        'Coached 10+ students weekly on study, time management, and life skills.'
      ]
    }
  ];

  const accordion = document.getElementById('accordion');
  experience.forEach((job, i) => {
    const item = document.createElement('div');
    item.className = 'accordion-item' + (i === 0 ? ' open' : '');
    item.innerHTML = `
      <div class="accordion-head">
        <h3>${job.role} | ${job.company} | ${job.dates}</h3>
        <svg class="accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="accordion-body">
        <div class="accordion-body-inner">
          <ul>${job.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        </div>
      </div>
    `;
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      accordion.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
    accordion.appendChild(item);
  });

  // ---------------- TABS ----------------
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
    });
  });
})();

(function(){
  // ---------------- TOOLKIT TILE POPOVERS ----------------
  // Each toolkit row (.toolkit-icons) gets its own popover element. Clicking
  // a tile opens a small "macOS window" above it with that tool's blurb;
  // clicking the same tile again, a different tile in the same row, or
  // anywhere outside closes/switches it.
  const rows = document.querySelectorAll('.toolkit-icons');

  rows.forEach(row => {
    const tiles = Array.from(row.querySelectorAll('.toolkit-icon'));
    if (!tiles.length) return;

    const popover = document.createElement('div');
    popover.className = 'toolkit-popover';
    popover.innerHTML = `
      <div class="popover-dots"><span></span><span></span><span></span></div>
      <h4></h4>
      <p></p>
    `;
    row.appendChild(popover);

    const titleEl = popover.querySelector('h4');
    const descEl = popover.querySelector('p');
    let activeTile = null;

    function closePopover(){
      popover.classList.remove('open');
      if (activeTile) activeTile.classList.remove('active');
      activeTile = null;
    }

    function positionPopover(tile){
      const popW = popover.offsetWidth;
      const rowW = row.offsetWidth;
      let left = tile.offsetLeft + tile.offsetWidth / 2 - popW / 2;
      left = Math.max(0, Math.min(left, rowW - popW));
      popover.style.left = `${left}px`;
    }

    function openPopover(tile){
      titleEl.textContent = tile.dataset.tool || '';
      descEl.textContent = tile.dataset.desc || '';
      popover.classList.add('open');
      positionPopover(tile);
      tile.classList.add('active');
      activeTile = tile;
    }

    tiles.forEach(tile => {
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeTile === tile) {
          closePopover();
        } else {
          if (activeTile) activeTile.classList.remove('active');
          openPopover(tile);
        }
      });
    });

    // reposition on resize so it stays anchored to its tile
    window.addEventListener('resize', () => {
      if (activeTile) positionPopover(activeTile);
    });

    document.addEventListener('click', (e) => {
      if (activeTile && !row.contains(e.target)) closePopover();
    });
  });
})();
