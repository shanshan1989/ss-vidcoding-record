/**
 * Auth page interactions: password visibility toggle and form feedback.
 */

(function () {
  "use strict";

  function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "visibility_off";
    } else {
      input.type = "password";
      icon.textContent = "visibility";
    }
  }

  function attachPasswordToggles() {
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inputId = btn.getAttribute('data-toggle-password');
        const icon = btn.querySelector('.material-symbols-outlined');
        togglePassword(inputId, icon ? icon.id : null);
      });
    });
  }

  function showOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    const panel = overlay.querySelector('div');
    if (panel) {
      panel.classList.remove('scale-90');
      panel.classList.add('scale-100');
    }
  }

  function hideOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }

  function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showOverlay('successOverlay');
      setTimeout(() => {
        hideOverlay('successOverlay');
        window.location.href = './pages/home.html';
      }, 1500);
    });

    attachPasswordToggles();

    document.querySelectorAll('input').forEach((input) => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('scale-[1.01]', 'duration-200');
      });
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('scale-[1.01]');
      });
    });
  }

  function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    attachPasswordToggles();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span>';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
        window.location.href = '../index.html';
      }, 1500);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initRegisterForm();
  });

  window.SSJAuth = { togglePassword, showOverlay, hideOverlay };
})();
