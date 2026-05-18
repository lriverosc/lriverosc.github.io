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

const applyRevealPresets = () => {
  document.querySelectorAll("section, .hero").forEach((group) => {
    const items = group.querySelectorAll(".reveal");

    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${index * 90}ms`);

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
