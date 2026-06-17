/**
 * Shared category data utilities for 随手记账.
 * Categories use Material Symbols icon names (matching home.html style).
 */

(function () {
  "use strict";

  const STORAGE_KEY = "ssj_categories_v2";

  const EXPENSE_ICONS = [
    "restaurant",
    "directions_car",
    "shopping_bag",
    "movie",
    "home",
    "medical_services",
    "school",
    "local_cafe",
    "flight",
    "sports_esports",
    "shopping_cart",
    "checkroom",
    "pets",
    "gift",
    "build",
    "local_gas_station",
    "commute",
    "more_horiz",
  ];

  const INCOME_ICONS = [
    "payments",
    "account_balance_wallet",
    "savings",
    "redeem",
    "trending_up",
    "card_giftcard",
    "replay",
    "emoji_events",
    "work",
    "monetization_on",
    "paid",
    "more_horiz",
  ];

  const DEFAULT_CATEGORIES = {
    expense: [
      { id: "e1", name: "餐饮", icon: "restaurant" },
      { id: "e2", name: "交通", icon: "directions_car" },
      { id: "e3", name: "购物", icon: "shopping_bag" },
      { id: "e4", name: "居家", icon: "home" },
      { id: "e5", name: "娱乐", icon: "movie" },
      { id: "e6", name: "医疗", icon: "medical_services" },
      { id: "e7", name: "教育", icon: "school" },
      { id: "e8", name: "其他", icon: "more_horiz" },
    ],
    income: [
      { id: "i1", name: "工资", icon: "payments" },
      { id: "i2", name: "劳务", icon: "work" },
      { id: "i3", name: "外快", icon: "monetization_on" },
      { id: "i4", name: "奖金", icon: "redeem" },
      { id: "i5", name: "理财", icon: "trending_up" },
      { id: "i6", name: "红包", icon: "card_giftcard" },
      { id: "i7", name: "退款", icon: "replay" },
      { id: "i8", name: "其他", icon: "more_horiz" },
    ],
  };

  const TYPE_CONFIG = {
    expense: { label: "支出", defaultIcon: "restaurant", icons: EXPENSE_ICONS },
    income: { label: "收入", defaultIcon: "payments", icons: INCOME_ICONS },
  };

  function loadCategories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_CATEGORIES;
      const parsed = JSON.parse(raw);
      return {
        expense: Array.isArray(parsed.expense)
          ? parsed.expense
          : DEFAULT_CATEGORIES.expense,
        income: Array.isArray(parsed.income)
          ? parsed.income
          : DEFAULT_CATEGORIES.income,
      };
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  }

  function saveCategories(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function generateId(type) {
    return type + "_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  }

  window.SSJCategories = {
    STORAGE_KEY,
    DEFAULT_CATEGORIES,
    TYPE_CONFIG,
    EXPENSE_ICONS,
    INCOME_ICONS,
    loadCategories,
    saveCategories,
    generateId,
  };
})();
