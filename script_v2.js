document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const pageIndicator = document.getElementById('page-indicator');
  const audioBtn = document.getElementById('btn-audio');
  const themeBtn = document.getElementById('btn-theme');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const timelineNodes = Array.from(document.querySelectorAll('.timeline-node'));

  // Parallax elements
  const dongsonEl = document.getElementById('parallax-dongson');
  const lotusLeftEl = document.getElementById('parallax-lotus-left');
  const lotusRightEl = document.getElementById('parallax-lotus-right');
  const doveLeftEl = document.getElementById('parallax-dove-left');
  const doveRightEl = document.getElementById('parallax-dove-right');

  let currentIndex = 0;
  let wheelCooldown = false;

  // ==================== 1. 3D TILT CARD EFFECT (ONLY CONTENT CARDS) ====================
  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach((card) => {
      if (!card.querySelector('.tilt-glare')) {
        const glare = document.createElement('div');
        glare.className = 'tilt-glare';
        card.appendChild(glare);
      }
      const glare = card.querySelector('.tilt-glare');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((centerY - y) / centerY) * 11;
        const rotateY = ((x - centerX) / centerX) * 11;

        card.style.transform = `perspective(950px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
          const pctX = (x / rect.width) * 100;
          const pctY = (y / rect.height) * 100;
          glare.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255, 238, 165, 0.42), transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(950px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // ==================== 2. CINEMATIC PARALLAX & TIMELINE ====================
  function updateParallax(index) {
    const progress = index / Math.max(1, slides.length - 1);
    const angle = index * 24;
    const offsetY = Math.sin(index * 0.9) * 24;
    const offsetX = Math.cos(index * 0.8) * 22;

    if (dongsonEl) {
      const scale = index === 0 ? 1.15 : 0.94 + (index % 3) * 0.06;
      dongsonEl.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${angle}deg) scale(${scale})`;
      dongsonEl.style.opacity = index === 0 || index === slides.length - 1 ? '0.18' : '0.11';
    }

    if (lotusLeftEl && lotusRightEl) {
      const lotusLift = (index % 4) * -10;
      lotusLeftEl.style.transform = `translate3d(${progress * 26}px, ${lotusLift}px, 0) rotate(${index * 2.5 - 8}deg)`;
      lotusRightEl.style.transform = `translate3d(${-progress * 26}px, ${lotusLift}px, 0) rotate(${-index * 2.5 + 8}deg) scaleX(-1)`;
    }

    if (doveLeftEl && doveRightEl) {
      const doveY = Math.sin(index * 1.2) * 26;
      const doveX = (index % 2 === 0 ? 1 : -1) * 18;
      doveLeftEl.style.transform = `translate3d(${doveX}px, ${doveY}px, 0) rotate(${(index % 3) * 4 - 5}deg)`;
      doveRightEl.style.transform = `translate3d(${-doveX}px, ${-doveY}px, 0) rotate(${(index % 3) * -4 + 5}deg)`;
    }
  }

  function updateTimelineUI(index) {
    const currentSlide = slides[index];
    const chapter = currentSlide.dataset.chapter || 'intro';
    timelineNodes.forEach((node) => {
      node.classList.toggle('is-active', node.dataset.targetChapter === chapter);
    });
  }

  // ==================== 3. SOULFUL, LYRICAL VIETNAMESE MELODY (ĐÀN TRANH & SÁO TRÚC) ====================
  let audioCtx = null;
  let isAudioPlaying = false;
  let melodyTimer = null;
  let phraseStep = 0;

  // Slow, lyrical, emotional pentatonic phrases (Hò - Xự - Xang - Xê - Cống in F Major / D Minor)
  const lyricalPhrases = [
    { lead: 440.00, flute: 880.00, pad: 220.00, arp: [293.66, 349.23, 440.00] }, // A4 - soulful opening
    { lead: 523.25, flute: 0,      pad: 0,      arp: [349.23, 440.00, 523.25] }, // C5
    { lead: 587.33, flute: 587.33, pad: 196.00, arp: [293.66, 392.00, 587.33] }, // D5 - warm peak
    { lead: 523.25, flute: 0,      pad: 0,      arp: [261.63, 392.00, 523.25] }, // C5
    { lead: 440.00, flute: 659.25, pad: 174.61, arp: [261.63, 349.23, 440.00] }, // A4 + E5 harmony
    { lead: 392.00, flute: 0,      pad: 0,      arp: [261.63, 329.63, 392.00] }, // G4
    { lead: 349.23, flute: 698.46, pad: 146.83, arp: [220.00, 293.66, 349.23] }, // F4 - deep resolution
    { lead: 293.66, flute: 587.33, pad: 0,      arp: [220.00, 293.66, 440.00] }  // D4 - gentle rest
  ];

  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft, Resonant Đàn Tranh (Plucked Zither with warm long decay)
  function playZitherPluck(freq, vol = 0.042, dur = 3.6) {
    if (!audioCtx || !freq) return;
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.8, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.1, now + dur);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
  }

  // Expressive Bamboo Flute / Đàn Bầu with gentle vibrato
  function playLyricalFlute(freq, vol = 0.032, dur = 3.2) {
    if (!audioCtx || !freq) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const vibrato = audioCtx.createOscillator();
    const vibratoGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Gentle 5Hz vibrato for soulful Vietnamese flute/monochord expression
    vibrato.frequency.setValueAtTime(5.2, now);
    vibratoGain.gain.setValueAtTime(3.2, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2.5, now);

    // Slow, breathing attack & release
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.65);
    gain.gain.setValueAtTime(vol * 0.85, now + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    vibrato.start(now);
    osc.stop(now + dur);
    vibrato.stop(now + dur);
  }

  // Warm Ambient Pad (Deep String Harmony)
  function playWarmPad(freq, vol = 0.035, dur = 4.8) {
    if (!audioCtx || !freq) return;
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.5, now); // Perfect fifth warmth

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
  }

  function playGentleSlideChime() {
    if (!audioCtx || !isAudioPlaying) return;
    playZitherPluck(523.25, 0.025, 2.2);
    setTimeout(() => playZitherPluck(659.25, 0.028, 2.5), 140);
  }

  function startSoulfulMelody() {
    if (melodyTimer) clearInterval(melodyTimer);
    phraseStep = 0;

    const triggerBar = () => {
      if (!isAudioPlaying) return;
      const bar = lyricalPhrases[phraseStep % lyricalPhrases.length];

      // 1. Deep warm pad foundation
      if (bar.pad) {
        playWarmPad(bar.pad, 0.036, 4.6);
      }

      // 2. Gentle cascading Đàn Tranh arpeggio
      bar.arp.forEach((arpFreq, idx) => {
        setTimeout(() => {
          if (isAudioPlaying) playZitherPluck(arpFreq, 0.028, 3.2);
        }, idx * 360);
      });

      // 3. Soulful lead note & expressive flute
      setTimeout(() => {
        if (isAudioPlaying && bar.lead) playZitherPluck(bar.lead, 0.044, 3.8);
      }, 720);

      if (bar.flute) {
        setTimeout(() => {
          if (isAudioPlaying) playLyricalFlute(bar.flute, 0.028, 3.1);
        }, 950);
      }

      phraseStep++;
    };

    triggerBar();
    melodyTimer = setInterval(triggerBar, 2400);
  }

  function toggleAudio() {
    ensureAudioContext();
    isAudioPlaying = !isAudioPlaying;
    audioBtn.classList.toggle('is-playing', isAudioPlaying);
    if (isAudioPlaying) {
      audioBtn.innerHTML = '🎶 Nhạc Du Dương: Bật';
      startSoulfulMelody();
    } else {
      audioBtn.innerHTML = '🔈 Nhạc Du Dương: Tắt';
      if (melodyTimer) clearInterval(melodyTimer);
    }
  }

  audioBtn.addEventListener('click', toggleAudio);

  // ==================== 4. SLIDE NAVIGATION ====================
  function goToSlide(targetIndex, withSound = true) {
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    currentIndex = targetIndex;

    slides.forEach((slide, i) => {
      slide.classList.remove('is-active', 'is-prev');
      if (i < currentIndex) slide.classList.add('is-prev');
      else if (i === currentIndex) slide.classList.add('is-active');
    });

    pageIndicator.textContent = `${currentIndex + 1} / ${slides.length}`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === slides.length - 1;

    updateParallax(currentIndex);
    updateTimelineUI(currentIndex);
    if (withSound) playGentleSlideChime();

    // Launch celebratory fireworks automatically when arriving on final slide
    if (currentIndex === slides.length - 1) {
      spawnFireworkBurst(window.innerWidth * 0.28, window.innerHeight * 0.35);
      setTimeout(() => spawnFireworkBurst(window.innerWidth * 0.72, window.innerHeight * 0.32), 260);
    }

    history.replaceState(null, '', `#${currentIndex + 1}`);
  }

  function nextSlide() {
    if (currentIndex < slides.length - 1) goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (currentIndex > 0) goToSlide(currentIndex - 1);
  }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  timelineNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const idx = parseInt(node.dataset.slideIndex, 10);
      if (!isNaN(idx)) goToSlide(idx);
    });
  });

  themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('theme-light');
    themeBtn.innerHTML = isLight ? '🎨 Tông: Trắng Vàng Cổ Điển' : '🎨 Tông: Đỏ Vàng Hào Quang';
  });

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.isContentEditable) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slides.length - 1);
        break;
      case 'f':
      case 'F':
        fullscreenBtn.click();
        break;
      case 'm':
      case 'M':
        toggleAudio();
        break;
    }
  });

  window.addEventListener('wheel', (e) => {
    if (wheelCooldown) return;
    if (Math.abs(e.deltaY) < 26) return;
    wheelCooldown = true;
    if (e.deltaY > 0) nextSlide();
    else prevSlide();
    setTimeout(() => {
      wheelCooldown = false;
    }, 680);
  }, { passive: true });

  // ==================== 5. 2 CUTE MASCOTS INTERACTION (SLIDE 15) ====================
  const mascotDuo = document.getElementById('mascot-duo');
  const mascotSpeech = document.getElementById('mascot-speech');
  const cuteMessages = [
    '“Meow & Gâu~ Nhóm 9 thành viên UNETI xin cảm ơn Cô Lê Thị Lý và các bạn đã lắng nghe ạ! ❤️”',
    '“Chúc Cô và các bạn thật nhiều sức khỏe, niềm vui và thành công rực rỡ! 🌸✨”',
    '“Tự hào sinh viên UNETI giữ gìn văn hóa Việt Nam tiên tiến, đậm đà bản sắc dân tộc! 🇻🇳”',
    '“Nhóm rất mong nhận được ý kiến góp ý và câu hỏi thảo luận từ Cô và các bạn ạ! 🎉”'
  ];
  let msgIdx = 0;

  if (mascotDuo) {
    mascotDuo.addEventListener('click', (e) => {
      mascotDuo.classList.remove('is-celebrating');
      void mascotDuo.offsetWidth;
      mascotDuo.classList.add('is-celebrating');

      msgIdx = (msgIdx + 1) % cuteMessages.length;
      if (mascotSpeech) mascotSpeech.textContent = cuteMessages[msgIdx];

      spawnFireworkBurst(e.clientX || window.innerWidth * 0.5, e.clientY || window.innerHeight * 0.45);
      ensureAudioContext();
      playZitherPluck(523.25, 0.05, 1.8);
      setTimeout(() => playZitherPluck(659.25, 0.05, 1.8), 110);
      setTimeout(() => playZitherPluck(783.99, 0.05, 1.8), 220);
      setTimeout(() => playZitherPluck(1046.50, 0.06, 2.4), 330);
    });
  }

  // ==================== 6. FLOATING LIGHT ORBS, SPARKLES & FIREWORKS ====================
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const orbs = Array.from({ length: 115 }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: i % 6 === 0 ? Math.random() * 4.5 + 2.8 : Math.random() * 2.4 + 0.9,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -Math.random() * 0.62 - 0.16,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.035 + 0.015,
    isStar: i % 5 === 0
  }));

  const sparkles = [];

  window.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.35) {
      sparkles.push({
        x: e.clientX + (Math.random() - 0.5) * 14,
        y: e.clientY + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.4,
        r: Math.random() * 2.6 + 1.1,
        alpha: 0.9,
        color: Math.random() > 0.3 ? '255, 228, 132' : '255, 255, 255'
      });
    }
  }, { passive: true });

  function spawnFireworkBurst(cx, cy) {
    const colors = ['255, 228, 132', '255, 120, 140', '255, 255, 255', '245, 200, 76'];
    for (let i = 0; i < 42; i++) {
      const angle = (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.15;
      const speed = Math.random() * 4.8 + 1.8;
      sparkles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 3.2 + 1.5,
        alpha: 1,
        color: colors[i % colors.length]
      });
    }
  }

  function renderCanvas() {
    ctx.clearRect(0, 0, w, h);
    const isLight = document.body.classList.contains('theme-light');

    for (const o of orbs) {
      o.x += o.vx;
      o.y += o.vy;
      o.phase += o.speed;

      if (o.y < -15) {
        o.y = h + 15;
        o.x = Math.random() * w;
      }
      if (o.x < -15) o.x = w + 15;
      if (o.x > w + 15) o.x = -15;

      const pulse = 0.55 + 0.45 * Math.sin(o.phase);
      const alpha = (isLight ? 0.42 : 0.72) * pulse;

      ctx.save();
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? `rgba(184, 134, 11, ${alpha})`
        : `rgba(255, 228, 132, ${alpha})`;
      ctx.shadowBlur = o.r > 3 ? 16 : 8;
      ctx.shadowColor = 'rgba(255, 215, 90, 0.85)';
      ctx.fill();

      if (o.isStar && pulse > 0.78) {
        ctx.strokeStyle = isLight ? `rgba(184, 134, 11, ${alpha})` : `rgba(255, 250, 220, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(o.x - o.r * 2.4, o.y);
        ctx.lineTo(o.x + o.r * 2.4, o.y);
        ctx.moveTo(o.x, o.y - o.r * 2.4);
        ctx.lineTo(o.x, o.y + o.r * 2.4);
        ctx.stroke();
      }
      ctx.restore();
    }

    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.03;
      s.alpha -= 0.024;

      if (s.alpha <= 0) {
        sparkles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${s.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(renderCanvas);
  }

  initTiltCards();
  renderCanvas();

  const hashMatch = window.location.hash.match(/^#(\d+)$/);
  const initialSlide = hashMatch ? Math.min(slides.length - 1, Math.max(0, parseInt(hashMatch[1], 10) - 1)) : 0;
  goToSlide(initialSlide, false);
});
