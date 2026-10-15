// Hero scroll animation — drives the "memoji scales down and settles
// above an iMessage-style chat window" effect as the user scrolls through
// the pinned hero section. All values are computed from a single 0-1
// scroll `progress` value derived from the pinWrapper's position.
(function(){
  const pinWrapper = document.getElementById('pinWrapper');
  const memojiStage = document.getElementById('memojiStage');
  const heroText = document.getElementById('heroText');
  const namePill = document.getElementById('namePill');
  const namePillWrap = document.getElementById('namePillWrap');
  const memojiFace = document.querySelector('.memoji-face');
  const eyebrow = document.getElementById('eyebrow');
  const headline = document.getElementById('headline');
  const chatWindow = document.getElementById('chatWindow');
  const bubbles = ['b1','b2','b3','b4'].map(id => document.getElementById(id));
  const stickers = Array.from(document.querySelectorAll('.sticker'));
  const pinInner = document.getElementById('pinInner');

  // Easing
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  let ticking = false;

  function update(){
    ticking = false;

    const rect = pinWrapper.getBoundingClientRect();
    const scrollDistance = pinWrapper.offsetHeight - window.innerHeight;
    // progress: 0 when wrapper top hits viewport top, 1 when wrapper bottom hits viewport bottom
    const raw = -rect.top / scrollDistance;
    const progress = clamp(raw, 0, 1);
    const eased = easeOutCubic(progress);

    // Phase A (0 -> 0.55): shrink + move memoji up, fade text out
    const shrinkT = clamp(progress / 0.55, 0, 1);
    const shrinkE = easeOutCubic(shrinkT);
    const scale = lerp(1, 0.44, shrinkE);
    const translateY = lerp(0, -20, shrinkE);
    memojiStage.style.transform = `translateY(${translateY}px) scale(${scale})`;
    memojiStage.style.marginBottom = `${-(240 * (1 - scale))}px`;

    // Face starts larger than the circle (overflowing, like the reference image)
    // and shrinks down to comfortably sit inside the circle once settled.
    const faceNaturalWidth = 232;
    const faceTargetWidth = lerp(232, 148, shrinkE); // 232 = overflow in hero, 148 = fits inside 190px circle
    memojiFace.style.transform = `scale(${faceTargetWidth / faceNaturalWidth})`;

    // Pill shrinks from 120px (hero) to 90px (settled above chat) — independent
    // of the circle's own scale, since we counteract the parent transform.
    const pillNaturalWidth = 111.6; // .name-pill's unscaled CSS width
    const desiredPillWidth = lerp(120, 90, shrinkE);
    namePill.style.transform = `scale(${desiredPillWidth / pillNaturalWidth / scale})`;

    // Vertical placement: sits clear below the circle in the hero (no overlap),
    // and ends up tucked slightly (5px) behind the circle's bottom edge once settled.
    const circleLocalBottom = 196; // memoji-glow's local top(6) + height(190)
    const gapPx = lerp(40, -5, shrinkE); // +40px gap at hero (clears the ponytail's tip), -5px overlap when settled
    namePillWrap.style.top = `${circleLocalBottom + gapPx / scale}px`;

    const textFadeT = clamp(progress / 0.35, 0, 1);
    const textOpacity = 1 - textFadeT;
    const textShift = lerp(0, -16, textFadeT);
    [eyebrow, headline].forEach(el => {
      el.style.opacity = textOpacity;
      el.style.transform = `translateY(${textShift}px)`;
    });
    stickers.forEach(el => {
      el.style.opacity = textOpacity;
    });
    // Height collapse starts only *after* opacity has fully faded (progress > 0.35),
    // so the text is already invisible before max-height can ever clip it.
    const heightCollapseT = clamp((progress - 0.35) / 0.15, 0, 1);
    heroText.style.maxHeight = `${lerp(340, 0, easeOutCubic(heightCollapseT))}px`;
    heroText.style.marginTop = `${lerp(14, -10, easeOutCubic(heightCollapseT))}px`;

    // Phase B (0.4 -> 0.75): chat window fades/slides in
    const chatT = clamp((progress - 0.4) / 0.35, 0, 1);
    const chatE = easeOutCubic(chatT);
    chatWindow.style.opacity = chatE;
    chatWindow.style.transform = `translateY(${lerp(24, 0, chatE)}px)`;

    // Phase C: bubbles pop in one by one, staggered across 0.55 -> 0.95
    bubbles.forEach((b, i) => {
      const start = 0.55 + i * 0.09;
      const on = progress > start;
      b.classList.toggle('shown', on);
    });

    // subtle internal settle as you scroll (nav clearance is handled by
    // pin-inner's sticky `top` offset, not by this padding)
    pinInner.style.paddingTop = `${lerp(6, 2, eased)}vh`;
  }

  function onScroll(){
    if(!ticking){
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
