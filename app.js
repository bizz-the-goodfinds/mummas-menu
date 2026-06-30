(function () {
  "use strict";

  const STORAGE_KEY = "mummasMenuCart";
  let cart = loadCart();

  const menuGrid = document.getElementById("menuGrid");
  const categoryPills = document.getElementById("categoryPills");
  const cartItemsEl = document.getElementById("cartItems");
  const cartCountEl = document.getElementById("cartCount");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const toastEl = document.getElementById("toast");

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function itemKey(name) {
    return name.replace(/\s+/g, "_").toLowerCase();
  }

  function findItem(key) {
    for (const cat of MENU_DATA) {
      for (const item of cat.items) {
        if (itemKey(item.name) === key) return { ...item, emoji: cat.emoji, category: cat.category };
      }
    }
    return null;
  }

  // ---------- Render Menu ----------
  function renderMenu() {
    categoryPills.innerHTML = "";
    menuGrid.innerHTML = "";

    MENU_DATA.forEach((cat, idx) => {
      const pill = document.createElement("button");
      pill.className = "cat-pill" + (idx === 0 ? " active" : "");
      pill.textContent = cat.emoji + " " + cat.category;
      pill.addEventListener("click", () => {
        document.getElementById("cat-" + idx).scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        setActivePill(idx);
      });
      categoryPills.appendChild(pill);

      const section = document.createElement("div");
      section.className = "menu-category";
      section.id = "cat-" + idx;

      const heading = document.createElement("h3");
      heading.innerHTML = `<span>${cat.emoji}</span> ${cat.category}`;
      section.appendChild(heading);

      const itemsWrap = document.createElement("div");
      itemsWrap.className = "menu-items";

      cat.items.forEach((item) => {
        const key = itemKey(item.name);
        const card = document.createElement("div");
        card.className = "menu-item glass";
        card.id = "item-" + key;
        card.innerHTML = `
          <div class="item-emoji">${cat.emoji}</div>
          <div class="item-info">
            <h4>${item.name}</h4>
            <span>₹${item.price}</span>
          </div>
          <div class="item-action" data-key="${key}"></div>
        `;
        itemsWrap.appendChild(card);
      });

      section.appendChild(itemsWrap);
      menuGrid.appendChild(section);
    });

    renderItemActions();
  }

  function setActivePill(idx) {
    [...categoryPills.children].forEach((p, i) => p.classList.toggle("active", i === idx));
  }

  function renderItemActions() {
    document.querySelectorAll(".item-action").forEach((el) => {
      const key = el.dataset.key;
      const qty = cart[key]?.qty || 0;
      if (qty > 0) {
        el.innerHTML = `
          <div class="qty-control">
            <button data-action="dec" data-key="${key}">−</button>
            <span>${qty}</span>
            <button data-action="inc" data-key="${key}">+</button>
          </div>
        `;
      } else {
        el.innerHTML = `<button class="add-btn" data-action="add" data-key="${key}">+</button>`;
      }
    });
  }

  menuGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const key = btn.dataset.key;
    const action = btn.dataset.action;
    if (action === "add" || action === "inc") addToCart(key);
    if (action === "dec") removeFromCart(key);
  });

  function addToCart(key) {
    const item = findItem(key);
    if (!item) return;
    if (!cart[key]) {
      cart[key] = { name: item.name, price: item.price, emoji: item.emoji, qty: 0 };
    }
    cart[key].qty += 1;
    saveCart();
    renderItemActions();
    renderCart();
    showToast(`Added ${item.name}`);
  }

  function removeFromCart(key) {
    if (!cart[key]) return;
    cart[key].qty -= 1;
    if (cart[key].qty <= 0) delete cart[key];
    saveCart();
    renderItemActions();
    renderCart();
  }

  // ---------- Cart Drawer ----------
  function renderCart() {
    const entries = Object.entries(cart);
    const totalQty = entries.reduce((sum, [, v]) => sum + v.qty, 0);
    const totalPrice = entries.reduce((sum, [, v]) => sum + v.qty * v.price, 0);

    cartCountEl.textContent = totalQty;
    cartTotalEl.textContent = `₹${totalPrice}`;

    if (entries.length === 0) {
      cartItemsEl.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Add some delicious items! 🍲</div>`;
      return;
    }

    cartItemsEl.innerHTML = entries
      .map(
        ([key, v]) => `
        <div class="cart-item">
          <div class="item-emoji">${v.emoji}</div>
          <div class="cart-item-info">
            <h5>${v.name}</h5>
            <span>₹${v.price} × ${v.qty} = ₹${v.price * v.qty}</span>
          </div>
          <div class="qty-control">
            <button data-action="dec" data-key="${key}">−</button>
            <span>${v.qty}</span>
            <button data-action="inc" data-key="${key}">+</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const key = btn.dataset.key;
    if (btn.dataset.action === "inc") addToCart(key);
    if (btn.dataset.action === "dec") removeFromCart(key);
  });

  function openCart() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  }
  function closeCartFn() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  }

  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCartFn);
  cartOverlay.addEventListener("click", closeCartFn);

  // ---------- WhatsApp ----------
  function buildOrderMessage() {
    const entries = Object.entries(cart);
    if (entries.length === 0) return `Hi ${SITE_CONFIG.brandName}! I'd like to place an order.`;

    let msg = `Hi ${SITE_CONFIG.brandName}! 👋 I'd like to order:\n\n`;
    let total = 0;
    entries.forEach(([, v]) => {
      const lineTotal = v.qty * v.price;
      total += lineTotal;
      msg += `• ${v.name} x${v.qty} — ₹${lineTotal}\n`;
    });
    msg += `\n*Total: ₹${total}*\n\nPlease confirm my order. Thank you!`;
    return msg;
  }

  function whatsappLink(message) {
    return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function setupWhatsappLinks() {
    const generalMsg = `Hi ${SITE_CONFIG.brandName}! 👋 I'd like to know more about your menu.`;
    document.getElementById("heroWhatsapp").href = whatsappLink(generalMsg);
    document.getElementById("footerWhatsapp").href = whatsappLink(generalMsg);
    document.getElementById("socialWhatsapp").href = whatsappLink(generalMsg);
    document.getElementById("floatWhatsapp").href = whatsappLink(generalMsg);
    document.getElementById("footerCall").href = `tel:+${SITE_CONFIG.whatsappNumber}`;
  }

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
      showToast("Your cart is empty!");
      return;
    }
    const message = buildOrderMessage();
    window.open(whatsappLink(message), "_blank", "noopener");
  });

  // ---------- Toast ----------
  let toastTimer;
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  // ---------- Mobile Nav ----------
  const navLinks = document.getElementById("navLinks");
  const menuToggle = document.getElementById("menuToggle");
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );

  // ---------- Scroll spy for category pills ----------
  function setupScrollSpy() {
    const sections = MENU_DATA.map((_, idx) => document.getElementById("cat-" + idx));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target);
            if (idx !== -1) setActivePill(idx);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => s && observer.observe(s));
  }

  // ---------- Init ----------
  document.getElementById("year").textContent = new Date().getFullYear();
  renderMenu();
  renderCart();
  setupWhatsappLinks();
  setupScrollSpy();
})();
