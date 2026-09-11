const initHeroPhotoParticles = () => {
  const sourceImg = document.querySelector("img.hero-photo");

  if (!sourceImg || typeof HTMLCanvasElement === "undefined") {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // All visible printable ASCII characters (space/control codes have no glyph).
  const CHARS = Array.from({ length: 94 }, (_, index) => String.fromCharCode(33 + index));
  const DURATIONS = { hold: 2800, exploding: 1800, scattered: 3600, reassembling: 2200 };

  const canvas = document.createElement("canvas");
  canvas.className = sourceImg.className;
  canvas.setAttribute("aria-hidden", "true");

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  sourceImg.replaceWith(canvas);

  let particles = [];
  let sourceImage = null;
  let rafId = null;
  let phase = "hold";
  let phaseStart = performance.now();
  let imgDrawX = 0;
  let imgDrawY = 0;
  let imgDrawW = 0;
  let imgDrawH = 0;
  let nameBounds = null;
  let namePoints = [];

  const currentThemeColor = () => "247, 251, 255";
  const currentImageFilter = () => "grayscale(1) contrast(1.15)";
  const currentImageAlpha = () => 0.6;

  const buildParticles = () => {
    if (!sourceImage) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    if (rect.width < 1 || rect.height < 1) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const imgW = sourceImage.naturalWidth;
    const imgH = sourceImage.naturalHeight;
    const photoWidth = Math.min(rect.width * 0.48, rect.height * 2 / 3);
    const scale = Math.min(photoWidth / imgW, rect.height * 0.96 / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = rect.width - drawW - 8;
    const offsetY = (rect.height - drawH) / 2;

    imgDrawX = offsetX;
    imgDrawY = offsetY;
    imgDrawW = drawW;
    imgDrawH = drawH;

    const heading = document.querySelector(".hero-copy h1");
    if (heading) {
      const range = document.createRange();
      range.selectNodeContents(heading);
      const bounds = range.getBoundingClientRect();
      nameBounds = {
        x: bounds.left - rect.left,
        y: bounds.top - rect.top,
        width: bounds.width,
        height: bounds.height,
      };
      const nameCanvas = document.createElement("canvas");
      nameCanvas.width = Math.max(1, Math.ceil(bounds.width));
      nameCanvas.height = Math.max(1, Math.ceil(bounds.height));
      const nameCtx = nameCanvas.getContext("2d");
      namePoints = [];
      if (nameCtx) {
        const headingStyle = getComputedStyle(heading);
        nameCtx.font = `${headingStyle.fontWeight} ${headingStyle.fontSize} ${headingStyle.fontFamily}`;
        nameCtx.textBaseline = "middle";
        nameCtx.fillText(heading.textContent.trim(), 0, bounds.height / 2, bounds.width);
        const pixels = nameCtx.getImageData(0, 0, nameCanvas.width, nameCanvas.height).data;
        for (let y = 0; y < nameCanvas.height; y += 5) {
          for (let x = 0; x < nameCanvas.width; x += 5) {
            if (pixels[(y * nameCanvas.width + x) * 4 + 3] > 100) {
              namePoints.push({ x: nameBounds.x + x, y: nameBounds.y + y });
            }
          }
        }
        namePoints.sort((a, b) => a.x - b.x || a.y - b.y);
      }
    }

    const spacing = Math.max(3, Math.sqrt(drawW * drawH / 12000));
    const sampleCols = Math.max(28, Math.round(drawW / spacing));
    const sampleRows = Math.max(28, Math.round(drawH / spacing));

    const off = document.createElement("canvas");
    off.width = sampleCols;
    off.height = sampleRows;
    const offCtx = off.getContext("2d");

    if (!offCtx) {
      return;
    }

    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = "high";
    offCtx.drawImage(sourceImage, 0, 0, sampleCols, sampleRows);
    const data = offCtx.getImageData(0, 0, sampleCols, sampleRows).data;

    const cellW = drawW / sampleCols;
    const cellH = drawH / sampleRows;
    const nextParticles = [];

    for (let row = 0; row < sampleRows; row += 1) {
      for (let col = 0; col < sampleCols; col += 1) {
        const idx = (row * sampleCols + col) * 4;
        const a = data[idx + 3];

        if (a < 40) {
          continue;
        }

        const luminance = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;

        if (luminance < 0.1) {
          continue;
        }

        const tx = offsetX + col * cellW + cellW / 2;
        const ty = offsetY + row * cellH + cellH / 2;
        const charIndex = Math.min(CHARS.length - 1, Math.floor((1 - luminance) * CHARS.length));

        nextParticles.push({
          tx,
          ty,
          x: tx,
          y: ty,
          scatterX: tx,
          scatterY: ty,
          char: CHARS[charIndex],
          size: 7,
          alpha: 0.25 + luminance * 0.5,
          drawAlpha: 1,
          column: col,
          row,
          seed: Math.random(),
          nextCharAt: 0,
          nameX: nameBounds ? nameBounds.x + (col + 0.5) / sampleCols * nameBounds.width : tx,
          nameY: nameBounds ? nameBounds.y + (row + 0.5) / sampleRows * nameBounds.height : ty,
        });
      }
    }

    particles = nextParticles;
    if (namePoints.length) {
      particles.forEach((p) => {
        const target = namePoints[Math.floor(Math.random() * namePoints.length)];
        p.nameX = target.x;
        p.nameY = target.y;
      });
    }
  };

  const scatterTargets = () => {
    const rect = canvas.getBoundingClientRect();
    particles.forEach((p) => {
      // Independent launch times and curved paths break up the image grid.
      p.delay = Math.random() * 1.15;
      p.flightDuration = 2.1 + Math.random() * 1.7;
      const angle = Math.random() * Math.PI * 2;
      const radius = 45 + Math.random() * 150;
      p.controlX = Math.max(8, Math.min(rect.width - 8, p.tx + Math.cos(angle) * radius));
      p.controlY = Math.max(8, Math.min(rect.height - 8, p.ty + Math.sin(angle) * radius));
      p.arrivalX = p.nameX + (Math.random() - 0.5) * 100;
      p.arrivalY = p.nameY + (Math.random() - 0.5) * 160;
      p.returnDelay = Math.random() * 0.18;
      p.nextCharAt = 0;
    });
  };

  const easeInCubic = (t) => t * t * t;
  const smoothstep = (t) => t * t * (3 - 2 * t);
  const CROSSFADE_MS = 700;

  const updateFragments = (seconds, now) => {
    particles.forEach((p) => {
      const t = Math.max(0, Math.min(1, (seconds - p.delay) / p.flightDuration));
      const u = 1 - t;
      p.x = u ** 3 * p.tx + 3 * u * u * t * p.controlX
        + 3 * u * t * t * p.arrivalX + t ** 3 * p.nameX;
      p.y = u ** 3 * p.ty + 3 * u * u * t * p.controlY
        + 3 * u * t * t * p.arrivalY + t ** 3 * p.nameY;
      const arrival = smoothstep(Math.max(0, (t - 0.8) / 0.2));
      p.drawAlpha = (0.65 + p.seed * 0.35) * (1 - arrival * 0.92);
      p.head = p.seed > 0.92;
      if (now >= p.nextCharAt) {
        p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        p.nextCharAt = now + 100 + p.seed * 180;
      }
    });
  };

  let imageAlpha = 1;
  let particleAlphaMult = 0;

  const draw = () => {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (imageAlpha > 0.01 && sourceImage) {
      ctx.save();
      ctx.globalAlpha = currentImageAlpha() * imageAlpha;
      ctx.filter = currentImageFilter();
      ctx.drawImage(sourceImage, imgDrawX, imgDrawY, imgDrawW, imgDrawH);
      ctx.restore();
    }

    if (particleAlphaMult > 0.01) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const color = currentThemeColor();

      particles.forEach((p) => {
        ctx.font = `${p.size}px "Courier New", monospace`;
        const glyphColor = p.head ? "255, 255, 255" : color;
        ctx.fillStyle = `rgba(${glyphColor}, ${(p.alpha * p.drawAlpha * particleAlphaMult).toFixed(3)})`;
        ctx.fillText(p.char, p.x, p.y);
      });
    }
  };

  const tick = (now) => {
    const elapsed = now - phaseStart;
    const dur = DURATIONS[phase];

    if (phase === "hold") {
      imageAlpha = 1;
      particleAlphaMult = 0;

      if (elapsed >= dur) {
        scatterTargets();
        phase = "exploding";
        phaseStart = now;
      }
    } else if (phase === "exploding") {
      const t = Math.min(1, elapsed / dur);
      const crossfadeT = Math.min(1, elapsed / CROSSFADE_MS);

      imageAlpha = 1 - smoothstep(crossfadeT);
      particleAlphaMult = smoothstep(crossfadeT);
      updateFragments(Math.min(elapsed, dur) / 1000, now);

      if (t >= 1) {
        phase = "scattered";
        phaseStart = now;
      }
    } else if (phase === "scattered") {
      imageAlpha = 0;
      particleAlphaMult = 1;

      updateFragments((DURATIONS.exploding + Math.min(elapsed, dur)) / 1000, now);

      if (elapsed >= dur) {
        particles.forEach((p) => {
          p.scatterX = p.x;
          p.scatterY = p.y;
          p.returnAlpha = p.drawAlpha;
        });
        phase = "reassembling";
        phaseStart = now;
      }
    } else if (phase === "reassembling") {
      const t = Math.min(1, elapsed / dur);
      const crossfadeStart = dur - CROSSFADE_MS;
      const crossfadeT = Math.max(0, Math.min(1, (elapsed - crossfadeStart) / CROSSFADE_MS));

      imageAlpha = easeInCubic(crossfadeT);
      particleAlphaMult = 1 - easeInCubic(crossfadeT);

      particles.forEach((p) => {
        const e = smoothstep(Math.max(0, Math.min(1, (t - p.returnDelay) / 0.8)));
        const u = 1 - e;
        p.x = u ** 3 * p.scatterX + 3 * u * u * e * p.arrivalX
          + 3 * u * e * e * p.controlX + e ** 3 * p.tx;
        p.y = u ** 3 * p.scatterY + 3 * u * u * e * p.arrivalY
          + 3 * u * e * e * p.controlY + e ** 3 * p.ty;
        p.drawAlpha = p.returnAlpha + e * (1 - p.returnAlpha);
      });

      if (t >= 1) {
        phase = "hold";
        phaseStart = now;
      }
    }

    draw();
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (rafId) {
      return;
    }

    phase = "hold";
    phaseStart = performance.now();
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = null;
  };

  const drawStatic = () => {
    imageAlpha = 1;
    particleAlphaMult = 0;
    draw();
  };

  const img = new Image();

  img.onload = () => {
    sourceImage = img;
    buildParticles();

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      start();
    }
  };

  img.src = sourceImg.getAttribute("src") || "assets/icons/my_picture.png";

  document.fonts?.ready.then(() => {
    if (sourceImage) {
      buildParticles();
      if (prefersReducedMotion) {
        drawStatic();
      } else {
        stop();
        start();
      }
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      buildParticles();

      if (prefersReducedMotion) {
        drawStatic();
      } else {
        stop();
        start();
      }
    }, 200);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else if (!prefersReducedMotion) {
      start();
    }
  });
};

initHeroPhotoParticles();

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const backToTopButton = document.querySelector(".back-to-top");
const revealItems = document.querySelectorAll(".reveal");
const animatedButtons = document.querySelectorAll(".button, .back-to-top");
const heroButtons = document.querySelectorAll(".hero-actions .button");
const spotlightItems = document.querySelectorAll(
  ".hero-copy, .hero-panel-card, .metric-card, .about-card, .project-card, .service-card, .contact-card, .button"
);
const featuredProjectVideo = document.querySelector("[data-lightbox-video]");
const videoLightbox = document.querySelector(".video-lightbox");
const videoLightboxPlayer = document.querySelector(".video-lightbox-player");
const videoProgress = document.querySelector(".video-progress");
const currentTimeLabel = document.querySelector("[data-time-current]");
const durationLabel = document.querySelector("[data-time-duration]");
const videoActionButtons = document.querySelectorAll("[data-video-action]");
const lightboxCloseTargets = document.querySelectorAll("[data-lightbox-close]");

let inlineVideoWasPlaying = false;
let activeVideoTrigger = null;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const syncVideoProgress = () => {
  if (!videoLightboxPlayer || !videoProgress) {
    return;
  }

  const duration = Number.isFinite(videoLightboxPlayer.duration) ? videoLightboxPlayer.duration : 0;
  const currentTime = Number.isFinite(videoLightboxPlayer.currentTime) ? videoLightboxPlayer.currentTime : 0;

  videoProgress.value = String(duration > 0 ? (currentTime / duration) * 100 : 0);

  if (currentTimeLabel) {
    currentTimeLabel.textContent = formatTime(currentTime);
  }

  if (durationLabel) {
    durationLabel.textContent = formatTime(duration);
  }
};

const closeVideoLightbox = () => {
  if (!videoLightbox || !videoLightboxPlayer) {
    return;
  }

  videoLightbox.classList.remove("is-open");
  videoLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  videoLightboxPlayer.pause();
  videoLightboxPlayer.removeAttribute("src");
  videoLightboxPlayer.load();
  syncVideoProgress();

  if (featuredProjectVideo && inlineVideoWasPlaying) {
    featuredProjectVideo.play().catch(() => {});
  }

  activeVideoTrigger?.focus();
  activeVideoTrigger = null;
};

const openVideoLightbox = () => {
  if (!featuredProjectVideo || !videoLightbox || !videoLightboxPlayer) {
    return;
  }

  activeVideoTrigger = featuredProjectVideo;
  inlineVideoWasPlaying = !featuredProjectVideo.paused;
  featuredProjectVideo.pause();

  videoLightboxPlayer.src = featuredProjectVideo.dataset.videoSrc || "assets/trafficflow.mp4";
  videoLightboxPlayer.poster = featuredProjectVideo.dataset.videoPoster || "assets/trafficflow.png";
  videoLightbox.classList.add("is-open");
  videoLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  videoLightboxPlayer.currentTime = 0;
  syncVideoProgress();
  videoLightboxPlayer.play().catch(() => {});
};

const applyRevealPresets = () => {
  const groupsByParent = new Map();

  document.querySelectorAll(".reveal").forEach((item) => {
    const parent = item.parentElement;

    if (!groupsByParent.has(parent)) {
      groupsByParent.set(parent, []);
    }

    groupsByParent.get(parent).push(item);
  });

  groupsByParent.forEach((items) => {
    items.forEach((item, index) => {
      const step = item.classList.contains("archive-card") ? 40 : 90;
      item.style.setProperty("--reveal-delay", `${Math.min(index, 12) * step}ms`);

      if (item.classList.contains("hero-copy")) {
        item.classList.add("reveal-left");
        return;
      }

      if (item.classList.contains("hero-panel")) {
        item.classList.add("reveal-right");
        return;
      }

      if (
        item.classList.contains("project-card") ||
        item.classList.contains("service-card") ||
        item.classList.contains("contact-card") ||
        item.classList.contains("archive-card") ||
        item.classList.contains("skills-cloud")
      ) {
        item.classList.add("reveal-pop");
      }
    });
  });

  document.querySelectorAll(".skills-cloud span").forEach((chip, index) => {
    chip.style.setProperty("--chip-delay", `${220 + index * 45}ms`);
  });
};

const bindSpotlight = (elements) => {
  elements.forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      element.style.setProperty("--pointer-x", `${x}%`);
      element.style.setProperty("--pointer-y", `${y}%`);
    });
  });
};

const animateHeroButtons = () => {
  heroButtons.forEach((button, index) => {
    if (button.dataset.animated === "true") {
      return;
    }

    button.dataset.animated = "true";
    button.animate(
      [
        { opacity: 0, transform: "translateY(18px) scale(0.94)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      {
        duration: 680,
        delay: 220 + index * 110,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      }
    );
  });
};

applyRevealPresets();
bindSpotlight(spotlightItems);

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = siteNav.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
    }
  });
}

animatedButtons.forEach((button) => {
  button.addEventListener("pointerdown", () => {
    button.animate(
      [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(1px) scale(0.97)" },
        { transform: "translateY(0) scale(1)" },
      ],
      {
        duration: 240,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      }
    );
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const toggleBackToTop = () => {
  const shouldShow = window.scrollY > 500;
  backToTopButton?.classList.toggle("is-visible", shouldShow);
};

window.addEventListener("scroll", toggleBackToTop, { passive: true });
toggleBackToTop();

backToTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

featuredProjectVideo?.addEventListener("click", openVideoLightbox);

featuredProjectVideo?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  openVideoLightbox();
});

lightboxCloseTargets.forEach((target) => {
  target.addEventListener("click", closeVideoLightbox);
});

videoActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!videoLightboxPlayer) {
      return;
    }

    const action = button.dataset.videoAction;

    if (action === "play") {
      videoLightboxPlayer.play().catch(() => {});
      return;
    }

    if (action === "pause") {
      videoLightboxPlayer.pause();
      return;
    }

    if (action === "stop") {
      videoLightboxPlayer.pause();
      videoLightboxPlayer.currentTime = 0;
      syncVideoProgress();
    }
  });
});

videoProgress?.addEventListener("input", (event) => {
  if (!videoLightboxPlayer || !Number.isFinite(videoLightboxPlayer.duration)) {
    return;
  }

  const target = event.currentTarget;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  videoLightboxPlayer.currentTime = (Number(target.value) / 100) * videoLightboxPlayer.duration;
  syncVideoProgress();
});

videoLightboxPlayer?.addEventListener("click", closeVideoLightbox);
videoLightboxPlayer?.addEventListener("timeupdate", syncVideoProgress);
videoLightboxPlayer?.addEventListener("loadedmetadata", syncVideoProgress);
videoLightboxPlayer?.addEventListener("ended", syncVideoProgress);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && videoLightbox?.classList.contains("is-open")) {
    closeVideoLightbox();
  }
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.classList.contains("hero-copy")) {
          animateHeroButtons();
        }

        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  animateHeroButtons();
}
