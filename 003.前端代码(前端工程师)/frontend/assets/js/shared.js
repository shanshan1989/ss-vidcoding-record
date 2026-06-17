/**
 * Shared utilities for 随手记账 frontend pages.
 */

(function () {
  "use strict";

  const PAGE_MAP = {
    home: { label: "首页", icon: "dashboard", mobileOnly: false },
    transactions: { label: "流水", icon: "receipt_long", mobileOnly: false },
    statistics: { label: "统计", icon: "analytics", mobileOnly: false },
    savings: { label: "储蓄", icon: "savings", mobileOnly: false },
    settings: { label: "设置", icon: "settings", mobileOnly: false },
    "edit-profile": { label: "资料", icon: "account_circle", mobileOnly: false },
  };

  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.split("/").pop() || "index.html";
    return file.replace(/\.html$/, "");
  }

  function highlightCurrentNav() {
    const current = getCurrentPage();

    // Desktop side nav / top nav
    document.querySelectorAll("nav a, aside nav a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const target = href.replace(/^\.\//, "").replace(/\.html$/, "");
      if (target === current) {
        link.classList.add(
          "bg-primary-container",
          "text-on-primary-container",
          "font-bold"
        );
        link.classList.remove(
          "text-on-surface-variant",
          "hover:bg-surface-variant",
          "text-secondary"
        );
        const icon = link.querySelector(".material-symbols-outlined");
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
      }
    });

    // Mobile bottom nav
    document.querySelectorAll(".bottom-nav a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const target = href.replace(/^\.\//, "").replace(/\.html$/, "");
      if (target === current) {
        link.classList.add("text-primary", "font-bold");
        link.classList.remove("text-on-surface-variant", "text-secondary");
        const icon = link.querySelector(".material-symbols-outlined");
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
      }
    });
  }

  function initTheme() {
    const saved = localStorage.getItem("ssj-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    }
  }

  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("ssj-theme", isDark ? "dark" : "light");
  }

  function initRipple() {
    document.querySelectorAll("button, a").forEach((el) => {
      el.addEventListener("click", function () {
        this.classList.add("active:scale-95");
        setTimeout(() => this.classList.remove("active:scale-95"), 150);
      });
    });
  }

  function init() {
    initTheme();
    highlightCurrentNav();
    initRipple();
  }

  document.addEventListener("DOMContentLoaded", init);

  // Expose utilities globally
  window.SSJ = {
    getCurrentPage,
    highlightCurrentNav,
    toggleDarkMode,
    PAGE_MAP,
  };
})();
