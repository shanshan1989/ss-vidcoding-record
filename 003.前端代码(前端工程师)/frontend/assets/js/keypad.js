/**
 * Home page numeric keypad and expense/income toggle.
 */

(function () {
  "use strict";

  function initKeypad() {
    const display = document.getElementById("amount-input");
    if (!display) return;

    let currentAmount = "0.00";

    // 切换收支类型时重置金额
    document.addEventListener("ssj-type-change", () => {
      currentAmount = "0.00";
      display.value = currentAmount;
    });

    document.querySelectorAll(".keypad-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.innerText.trim();
        const icon = btn.querySelector(".material-symbols-outlined");

        if (icon && icon.getAttribute("data-icon") === "backspace") {
          currentAmount =
            currentAmount.length > 1
              ? currentAmount.slice(0, -1)
              : "0";
          if (currentAmount === "") currentAmount = "0";
        } else if (value === ".") {
          if (!currentAmount.includes(".")) {
            currentAmount += ".";
          }
        } else if (value === "0") {
          if (
            currentAmount !== "0" && currentAmount !== "0.00"
          ) {
            currentAmount += "0";
          } else if (currentAmount === "0.00") {
            currentAmount = "0";
          }
        } else {
          if (
            currentAmount === "0.00" ||
            currentAmount === "0"
          ) {
            currentAmount = value;
          } else {
            currentAmount += value;
          }
        }
        display.value = currentAmount;
      });
    });
  }

  function initTypeToggle() {
    const btnExpense = document.getElementById("btn-expense");
    const btnIncome = document.getElementById("btn-income");
    const symbol = document.getElementById("currency-symbol");
    if (!btnExpense || !btnIncome) return;

    function setActive(active, inactive) {
      active.classList.add(
        "bg-primary-container",
        "text-on-primary-container",
        "font-bold"
      );
      active.classList.remove(
        "text-secondary",
        "font-medium",
        "hover:bg-surface-variant"
      );

      inactive.classList.remove(
        "bg-primary-container",
        "text-on-primary-container",
        "font-bold"
      );
      inactive.classList.add(
        "text-secondary",
        "font-medium",
        "hover:bg-surface-variant"
      );

      if (symbol) {
        if (active.dataset.type === "expense") {
          symbol.classList.remove("text-primary-container");
          symbol.classList.add("text-primary");
        } else {
          symbol.classList.add("text-primary-container");
          symbol.classList.remove("text-primary");
        }
      }
    }

    btnExpense.addEventListener("click", () => setActive(btnExpense, btnIncome));
    btnIncome.addEventListener("click", () => setActive(btnIncome, btnExpense));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initKeypad();
    initTypeToggle();
  });
})();
