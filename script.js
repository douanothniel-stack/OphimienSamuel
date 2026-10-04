document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ===== PARTICULES — sombre : réseau néon / clair : cristaux de glace ===== */
  function initParticles(theme) {
    if (typeof particlesJS === "undefined") return;
    if (window.pJSDom && window.pJSDom.length) {
      try { window.pJSDom[0].pJS.fn.vendors.destroypJS(); } catch (e) {}
      window.pJSDom = [];
    }
    const light = theme === "light";
    particlesJS("particles-js", {
      particles: {
        number: { value: light ? 55 : 70, density: { enable: true, value_area: 900 } },
        color: { value: light ? "#5fb4e6" : "#00d9ff" },
        shape: light
          ? { type: "polygon", polygon: { nb_sides: 6 } }
          : { type: "circle" },
        opacity: { value: light ? 0.55 : 0.5, random: true, anim: { enable: true, speed: 0.6, opacity_min: 0.1 } },
        size: { value: light ? 4 : 3, random: true },
        line_linked: { enable: true, distance: 140, color: light ? "#8cc8ee" : "#00d9ff", opacity: light ? 0.35 : 0.25, width: 1 },
        move: { enable: true, speed: light ? 1 : 1.4, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: { grab: { distance: 160, line_linked: { opacity: 0.6 } }, push: { particles_nb: 3 } }
      },
      retina_detect: true
    });
  }
  initParticles(document.documentElement.getAttribute("data-theme") || "dark");
  window.addEventListener("dove:theme", e => initParticles(e.detail));

  /* ===== MENU PLEIN ÉCRAN — trois barres → croix ===== */
  const menuBtn = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.setAttribute("aria-hidden", String(!open));
  }
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) setMenu(false); });

  /* ===== HEADER — effet au scroll ===== */
  const header = document.getElementById("site-header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
  });

  /* ===== TOUT CE QUI « APPARAÎT » attend la fin de l'écran d'ouverture ===== */
  let started = false;
  function startShow() {
    if (started) return;
    started = true;

    /* machine à écrire */
    if (typeof Typed !== "undefined") {
      new Typed("#typing", {
        strings: [
          "Technicien Fibre Optique FTTH",
          "Développeur Web",
          "Passionné d'Électronique",
          "Créateur d'expériences numériques"
        ],
        typeSpeed: 55,
        backSpeed: 30,
        backDelay: 1500,
        startDelay: 400,
        loop: true,
        smartBackspace: true
      });
    }

    /* reveal entrée/sortie */
    const revealEls = document.querySelectorAll("[data-reveal]");
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle("in", entry.isIntersecting));
    }, { threshold: 0.2 });
    revealEls.forEach(el => revealObserver.observe(el));

    /* barres de compétences */
    const skillBars = document.querySelectorAll(".bar span");
    const skillObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "none";
          void entry.target.offsetWidth;
          entry.target.style.animation = "load 1.6s ease forwards";
        }
      });
    }, { threshold: 0.4 });
    skillBars.forEach(bar => skillObserver.observe(bar));
  }
  if (window.doveReady) startShow();
  else {
    window.addEventListener("dove:ready", startShow);
    setTimeout(startShow, 9000); // sécurité si fx.js ne répond pas
  }

  /* ===== FORMULAIRE CONTACT — envoi réel vers contact.php ===== */
  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Envoi en cours...";
      feedback.textContent = "";
      feedback.className = "form-feedback";

      try {
        const response = await fetch("contact.php", {
          method: "POST",
          body: new FormData(form)
        });
        const data = await response.json();

        if (data.success) {
          feedback.textContent = data.message || "Message envoyé ✓";
          feedback.classList.add("ok");
          form.reset();
        } else {
          feedback.textContent = data.message || "Une erreur est survenue.";
          feedback.classList.add("error");
        }
      } catch (err) {
        feedback.textContent = "Impossible d'envoyer le message pour le moment.";
        feedback.classList.add("error");
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

});
