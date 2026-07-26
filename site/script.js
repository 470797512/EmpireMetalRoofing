const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const backToTop = document.querySelector(".back-to-top");
const quoteModal = document.querySelector(".quote-modal");
const quoteForm = document.querySelector(".quote-form");
const projectModal = document.querySelector(".project-modal");
const projectTrack = document.querySelector("[data-project-track]");
const projectCards = [...document.querySelectorAll(".project-card")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let projectIndex = 0;
let scrollTicking = false;

const setScrollState = () => {
  const scrolled = window.scrollY > 100;
  header.classList.toggle("is-fixed", scrolled);
  backToTop.classList.toggle("visible", window.scrollY > 650);
  scrollTicking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(setScrollState);
  },
  { passive: true },
);
setScrollState();

menuToggle.addEventListener("click", (event) => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  mobileNav.classList.toggle("no-motion", reduceMotion.matches || event.detail === 0);
  menuToggle.setAttribute("aria-expanded", String(!open));
  menuToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  mobileNav.classList.toggle("is-open", !open);
  requestAnimationFrame(() => mobileNav.classList.remove("no-motion"));
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.closest("a, .quote-open")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileNav.classList.remove("is-open");
  }
});

backToTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" }),
);

const dialogTimers = new WeakMap();

const openDialog = (dialog, trigger, animate = true) => {
  window.clearTimeout(dialogTimers.get(dialog));
  dialog.returnFocusTo = trigger;
  dialog.classList.remove("is-closing");
  dialog.classList.toggle("no-motion", !animate || reduceMotion.matches);
  dialog.showModal();
  document.body.classList.add("modal-open");
  if (!animate || reduceMotion.matches) {
    dialog.classList.add("is-visible");
  } else {
    requestAnimationFrame(() => dialog.classList.add("is-visible"));
  }
};

const closeDialog = (dialog, animate = true) => {
  if (!dialog.open) return;
  dialog.classList.remove("is-visible");
  dialog.classList.add("is-closing");
  if (!animate || reduceMotion.matches || dialog.classList.contains("no-motion")) {
    dialog.close();
    return;
  }
  const timer = window.setTimeout(() => dialog.close(), 170);
  dialogTimers.set(dialog, timer);
};

document.querySelectorAll(".quote-open").forEach((button) => {
  button.addEventListener("click", (event) =>
    openDialog(quoteModal, button, event.detail !== 0),
  );
});

quoteModal.querySelector(".modal-close").addEventListener("click", (event) => {
  event.preventDefault();
  closeDialog(quoteModal, event.detail !== 0);
});
quoteModal.addEventListener("click", (event) => {
  if (event.target === quoteModal) closeDialog(quoteModal);
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = quoteForm.querySelector(".form-status");
  status.textContent = "Thanks — your details are ready. Please call 0466 055 970 to confirm your quote request.";
  quoteForm.reset();
});

const cardsVisible = () => {
  if (window.innerWidth <= 620) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
};

const renderProjects = () => {
  const gap = 24;
  const width = projectTrack.parentElement.clientWidth;
  const cardWidth = (width - gap * (cardsVisible() - 1)) / cardsVisible();
  projectTrack.style.transform = `translateX(-${projectIndex * (cardWidth + gap)}px)`;
};

const moveProjects = (direction, animate = true) => {
  const maximum = Math.max(0, projectCards.length - cardsVisible());
  projectIndex += direction;
  if (projectIndex < 0) projectIndex = maximum;
  if (projectIndex > maximum) projectIndex = 0;
  projectTrack.classList.toggle("no-motion", !animate || reduceMotion.matches);
  renderProjects();
  requestAnimationFrame(() => projectTrack.classList.remove("no-motion"));
};

document.querySelector("[data-project-prev]").addEventListener("click", (event) =>
  moveProjects(-1, event.detail !== 0),
);
document.querySelector("[data-project-next]").addEventListener("click", (event) =>
  moveProjects(1, event.detail !== 0),
);
window.addEventListener("resize", () => {
  projectIndex = Math.min(projectIndex, Math.max(0, projectCards.length - cardsVisible()));
  projectTrack.classList.add("no-motion");
  renderProjects();
  requestAnimationFrame(() => projectTrack.classList.remove("no-motion"));
});

projectCards.forEach((card) => {
  card.querySelector(".project-open").addEventListener("click", (event) => {
    const image = card.querySelector("img");
    projectModal.querySelector("[data-project-modal-image]").src = image.src;
    projectModal.querySelector("[data-project-modal-image]").alt = image.alt;
    projectModal.querySelector("[data-project-modal-title]").textContent = card.querySelector("h3").textContent;
    openDialog(projectModal, event.currentTarget, event.detail !== 0);
  });
});

projectModal.querySelector(".project-close").addEventListener("click", (event) => {
  event.preventDefault();
  closeDialog(projectModal, event.detail !== 0);
});
projectModal.addEventListener("click", (event) => {
  if (event.target === projectModal) closeDialog(projectModal);
});

const managedDialogs = [quoteModal, projectModal];
managedDialogs.forEach((dialog) => {
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog(dialog, false);
  });
  dialog.addEventListener("close", () => {
    dialog.classList.remove("is-visible", "is-closing", "no-motion");
    document.body.classList.toggle(
      "modal-open",
      managedDialogs.some((item) => item.open),
    );
    dialog.returnFocusTo?.focus({ preventScroll: true });
  });
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
renderProjects();

const setupRevealMotion = () => {
  const revealGroups = [
    [...document.querySelectorAll(".feature-card")],
    [document.querySelector(".services .section-heading"), ...document.querySelectorAll(".service-card")],
    [document.querySelector(".about-visual"), ...document.querySelectorAll(".about__content > *")],
    [document.querySelector(".portfolio__head"), ...projectCards],
    [...document.querySelectorAll(".why-us__content > *"), document.querySelector(".why-us__visual")],
    [...document.querySelectorAll(".stats article")],
    [document.querySelector(".testimonials .section-heading"), ...document.querySelectorAll(".testimonial-card")],
    [...document.querySelectorAll(".contact-band__inner > *")],
    [...document.querySelectorAll(".footer__grid > *")],
  ];
  const revealItems = [];

  revealGroups.forEach((group) => {
    group.filter(Boolean).forEach((item, index) => {
      item.classList.add("reveal");
      item.style.setProperty("--reveal-delay", `${Math.min(index * 55, 220)}ms`);
      revealItems.push(item);
    });
  });

  document.querySelector(".about-visual")?.classList.add("reveal-image");
  document.querySelector(".why-us__visual")?.classList.add("reveal-image");
  projectCards.forEach((card) => card.classList.add("reveal-image"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  document.body.classList.add("motion-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const delay = Number.parseInt(item.style.getPropertyValue("--reveal-delay"), 10) || 0;
        item.classList.add("is-revealed");
        observer.unobserve(item);
        window.setTimeout(() => {
          item.classList.remove("reveal", "is-revealed");
          item.style.removeProperty("--reveal-delay");
        }, delay + 920);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  revealItems.forEach((item) => observer.observe(item));
};

setupRevealMotion();
