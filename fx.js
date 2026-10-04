/* =====================================================================
   DOVE — fx.js  (à charger dans le <head>, sans defer)
   - thème clair/sombre (mémorisé)
   - écran d'ouverture « bon mood hien » avec sortie douce
   - navigation sans effet de verre brisé
   - lueur autour de la souris (mode sombre)
   ===================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "dove-theme";
  var LOADER_TEXT = "bon mood hien";          // ← modifie ici le texte d'ouverture
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getSaved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  /* ---------- thème (appliqué tout de suite : pas de flash) ---------- */
  var theme = getSaved() === "light" ? "light" : "dark";
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  /* ---------- type de page ---------- */
  var isHome = root.getAttribute("data-page") === "home";
  var fromInner = false;
  try {
    fromInner = sessionStorage.getItem("dove-inner") === "1";
    if (isHome) sessionStorage.removeItem("dove-inner");
    else sessionStorage.setItem("dove-inner", "1");
  } catch (e) {}
  if (!isHome) root.setAttribute("data-page", "inner");

  var showLoader = isHome && !fromInner;
  window.doveReady = !showLoader;
  if (showLoader) root.classList.add("fx-loading");

  function fireReady() {
    if (window.doveReady && window.__doveFired) return;
    window.doveReady = true;
    window.__doveFired = true;
    window.dispatchEvent(new CustomEvent("dove:ready"));
  }

  function onDom(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* =================================================================
     1. LOADER
     ================================================================= */
  function makeTriangles(cols, rows) {
    var pts = [], i, j;
    for (j = 0; j <= rows; j++) {
      pts[j] = [];
      for (i = 0; i <= cols; i++) {
        var x = i / cols * 100, y = j / rows * 100;
        if (i > 0 && i < cols) x += (Math.random() - 0.5) * (100 / cols) * 0.75;
        if (j > 0 && j < rows) y += (Math.random() - 0.5) * (100 / rows) * 0.75;
        pts[j][i] = [x, y];
      }
    }
    var out = [];
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i + 1], d = pts[j + 1][i];
        if (Math.random() < 0.5) { out.push([a, b, c]); out.push([a, c, d]); }
        else { out.push([a, b, d]); out.push([b, c, d]); }
      }
    }
    return out;
  }

  function buildLoader() {
    var L = document.createElement("div");
    L.id = "fx-loader";
    L.setAttribute("aria-hidden", "true");

    var base = document.createElement("div");
    base.className = "fx-loader-base";
    L.appendChild(base);

    var glow = document.createElement("div");
    glow.className = "fx-loader-glow";
    L.appendChild(glow);

    var center = document.createElement("div");
    center.className = "fx-loader-center";
    var text = document.createElement("div");
    text.className = "fx-loader-text";
    LOADER_TEXT.split("").forEach(function (ch, i) {
      var s = document.createElement("span");
      s.className = "fx-ch" + (ch === " " ? " sp" : "");
      s.style.setProperty("--i", i);
      s.textContent = ch === " " ? "\u00a0" : ch;
      text.appendChild(s);
    });
    var line = document.createElement("div");
    line.className = "fx-loader-line";
    line.innerHTML = "<i></i>";
    center.appendChild(text);
    center.appendChild(line);
    L.appendChild(center);

    document.body.appendChild(L);
    root.classList.add("fx-loader-up");

    var startedAt = Date.now();
    var MIN = reduce ? 600 : 1800;
    var loaded = document.readyState === "complete";
    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      if (L.parentNode) L.parentNode.removeChild(L);
      root.classList.remove("fx-loading", "fx-loader-up");
      fireReady();
    }

    function leave() {
      if (finished) return;
      L.classList.add("leaving");
      if (reduce) {
        setTimeout(finish, 350);
        return;
      }
      base.animate([{opacity:1},{opacity:0}], {duration:650,easing:"cubic-bezier(.7,0,.2,1)",fill:"forwards"});
      glow.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(1.18)"}], {duration:700,easing:"cubic-bezier(.7,0,.2,1)",fill:"forwards"});
      center.animate([{opacity:1,transform:"translateY(0) scale(1)"},{opacity:0,transform:"translateY(-12px) scale(.98)"}], {duration:520,easing:"cubic-bezier(.7,0,.2,1)",fill:"forwards"});
      setTimeout(finish, 720);
    }

    function tryLeave() {
      if (!loaded) return;
      var wait = Math.max(0, MIN - (Date.now() - startedAt));
      setTimeout(leave, wait);
    }
    if (!loaded) window.addEventListener("load", function () { loaded = true; tryLeave(); });
    setTimeout(function () { loaded = true; tryLeave(); }, 6000);
    tryLeave();
  }

  /* =================================================================
     2. BOUTON THÈME
     ================================================================= */
  var themeBtn = null;

  function applyTheme(next) {
    theme = next;
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    save(next);
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", next === "light" ? "Passer en mode sombre" : "Passer en mode clair");
      themeBtn.setAttribute("title", next === "light" ? "Mode sombre" : "Mode clair");
    }
    window.dispatchEvent(new CustomEvent("dove:theme", { detail: next }));
  }

  function setTheme(next, x, y) {
    if (document.startViewTransition && !reduce) {
      var t = document.startViewTransition(function () { applyTheme(next); });
      t.ready.then(function () {
        var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        root.animate(
          { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
          { duration: 800, easing: "cubic-bezier(.7,0,.2,1)", pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(function () {});
    } else {
      applyTheme(next);
    }
  }

  function buildThemeButton() {
    themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "fx-theme";
    themeBtn.innerHTML =
      '<svg class="fx-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/>' +
      '<path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/></svg>' +
      '<svg class="fx-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"/></svg>';
    themeBtn.addEventListener("click", function (e) {
      var rect = themeBtn.getBoundingClientRect();
      setTheme(theme === "light" ? "dark" : "light", rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    var actions = document.querySelector(".header-actions");
    if (actions) {
      actions.insertBefore(themeBtn, document.getElementById("menu-toggle"));
    } else {
      var header = document.getElementById("site-header") || document.querySelector(".topbar");
      if (!header) { document.body.appendChild(themeBtn); themeBtn.style.cssText = "position:fixed;top:14px;right:14px;z-index:999"; }
      else {
        var right = header.querySelector(".back-link, .back");
        var wrap = document.createElement("div");
        wrap.className = "fx-actions";
        if (right) { header.insertBefore(wrap, right); wrap.appendChild(right); }
        else header.appendChild(wrap);
        wrap.appendChild(themeBtn);
      }
    }
    applyTheme(theme);
  }

  /* =================================================================
     3. LUEUR SOURIS
     ================================================================= */
  function buildGlow() {
    if (window.matchMedia && matchMedia("(hover:none)").matches) return;
    var g = document.createElement("div");
    g.className = "fx-glow";
    g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);

    var tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, raf = null;
    function loop() {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      g.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      raf = (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(loop) : null;
    }
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      g.classList.add("on");
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", function () { g.classList.remove("on"); });
    document.documentElement.addEventListener("mouseenter", function () { g.classList.add("on"); });
  }


  /* ---------- démarrage ---------- */
  onDom(function () {
    buildThemeButton();
    buildGlow();
    if (showLoader) buildLoader();
    else fireReady();
  });
})();
