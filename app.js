// ==========================
// DATA PRODUK (dummy)
// ==========================
const PRODUCTS = [
  { id: 1, name: "Gantungan Kunci Kayu", category: "Aksesoris", price: 25000, stock: 50000, icon: "🪵", desc: "Handmade, ringan, cocok untuk souvenir." },
  { id: 2, name: "Tas Rajut", category: "Fashion", price: 100000, stock: 20000, icon: "🧶", desc: "Tas rajut kuat dan estetik, cocok harian." },
  { id: 3, name: "Mug Custom", category: "Rumah", price: 60000, stock: 10000, icon: "☕", desc: "Bisa custom nama/gambar, hadiah terbaik." },
  { id: 4, name: "Lilin Aromaterapi", category: "Rumah", price: 57000, stock: 9000000, icon: "🕯️", desc: "Aroma menenangkan untuk relaksasi." },
  { id: 5, name: "Gelang Manik", category: "Aksesoris", price: 30000, stock: 100000, icon: "📿", desc: "Warna bervariasi, cocok untuk hadiah." },
  { id: 6, name: "Dompet Kulit Handmade", category: "Fashion", price: 155000, stock: 100000000, icon: "👝", desc: "Kulit premium, jahitan rapi, awet." },
  { id: 7, name: "Hiasan Dinding Macrame", category: "Dekorasi", price: 905000, stock: 10000, icon: "🪢", desc: "Dekor rumah minimalis, nuansa hangat." },
  { id: 8, name: "Notebook Kertas Daur Ulang", category: "Stationery", price: 400000, stock: 90, icon: "📒", desc: "Eco-friendly, cocok untuk catatan kuliah." },
];

// ==========================
// HELPERS
// ==========================
const rupiah = (n) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(n);

const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

// ==========================
// CART STATE (localStorage)
// cart = { [productId]: qty }
// ==========================
const CART_KEY = "ns_cart_v1";
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ==========================
// UI ELEMENTS
// ==========================
const productGrid = qs("#productGrid");
const searchInput = qs("#searchInput");
const categorySelect = qs("#categorySelect");

const openCartBtn = qs("#openCartBtn");
const closeCartBtn = qs("#closeCartBtn");
const cartDrawer = qs("#cartDrawer");
const backdrop = qs("#backdrop");

const cartItemsEl = qs("#cartItems");
const cartTotalEl = qs("#cartTotal");
const cartCountEl = qs("#cartCount");

const checkoutBtn = qs("#checkoutBtn");
const clearCartBtn = qs("#clearCartBtn");

// ==========================
// RENDER: CATEGORY OPTIONS
// ==========================
function renderCategories() {
  const cats = ["all", ...new Set(PRODUCTS.map(p => p.category))];
  categorySelect.innerHTML = cats.map(c => {
    const label = c === "all" ? "Semua kategori" : c;
    return `<option value="${c}">${label}</option>`;
  }).join("");
}

// ==========================
// RENDER: PRODUCT GRID
// ==========================
function getFilteredProducts() {
  const q = (searchInput.value || "").trim().toLowerCase();
  const cat = categorySelect.value;

  return PRODUCTS.filter(p => {
    const matchQuery =
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q);

    const matchCat = (cat === "all") ? true : p.category === cat;
    return matchQuery && matchCat;
  });
}

function renderProducts() {
  const list = getFilteredProducts();

  if (list.length === 0) {
    productGrid.innerHTML = `<div class="muted">Produk tidak ditemukan.</div>`;
    return;
  }

  productGrid.innerHTML = list.map(p => {
    const inCart = cart[p.id] || 0;
    return `
      <article class="card">
        <div class="thumb">${p.icon}</div>
        <div class="card-body">
          <h3>${p.name}</h3>
          <div class="meta">
            <span class="tag">${p.category}</span>
            <span class="price">${rupiah(p.price)}</span>
          </div>
          <p class="desc">${p.desc}</p>
        </div>
        <div class="card-footer">
          <div class="qty">Stok: <strong>${p.stock}</strong> • Di keranjang: <strong>${inCart}</strong></div>
          <button class="btn btn-primary" data-add="${p.id}">
            + Tambah
          </button>
        </div>
      </article>
    `;
  }).join("");

  // bind add buttons
  qsa("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      addToCart(id, 1);
    });
  });
}

// ==========================
// CART LOGIC
// ==========================
function addToCart(productId, qty) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const current = cart[productId] || 0;
  const next = current + qty;

  if (next > product.stock) {
    alert(`Stok tidak cukup. Maksimal ${product.stock} untuk "${product.name}".`);
    return;
  }

  cart[productId] = next;
  saveCart();
  renderCart();
  renderProducts();
}

function setQty(productId, qty) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const clamped = Math.max(0, Math.min(qty, product.stock));
  if (clamped === 0) delete cart[productId];
  else cart[productId] = clamped;

  saveCart();
  renderCart();
  renderProducts();
}

function removeItem(productId) {
  delete cart[productId];
  saveCart();
  renderCart();
  renderProducts();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
  renderProducts();
}

function cartSummary() {
  let count = 0;
  let total = 0;

  for (const [idStr, qty] of Object.entries(cart)) {
    const id = Number(idStr);
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) continue;
    count += qty;
    total += product.price * qty;
  }
  return { count, total };
}

// ==========================
// RENDER: CART
// ==========================
function renderCart() {
  const entries = Object.entries(cart)
    .map(([idStr, qty]) => {
      const id = Number(idStr);
      const product = PRODUCTS.find(p => p.id === id);
      return product ? { product, qty } : null;
    })
    .filter(Boolean);

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<p class="muted">Keranjang masih kosong.</p>`;
  } else {
    cartItemsEl.innerHTML = entries.map(({ product, qty }) => `
      <div class="cart-item">
        <div class="cart-icon">${product.icon}</div>
        <div>
          <p class="cart-title">${product.name}</p>
          <div class="cart-sub">${rupiah(product.price)} • Stok ${product.stock}</div>
          <div class="cart-sub"><strong>${rupiah(product.price * qty)}</strong></div>
        </div>
        <div class="cart-actions">
          <button class="small-btn" data-dec="${product.id}" title="Kurangi">−</button>
          <button class="small-btn" data-inc="${product.id}" title="Tambah">+</button>
          <button class="small-btn danger" data-del="${product.id}" title="Hapus">🗑</button>
        </div>
      </div>
    `).join("");

    qsa("[data-dec]").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.getAttribute("data-dec"));
      setQty(id, (cart[id] || 0) - 1);
    }));
    qsa("[data-inc]").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.getAttribute("data-inc"));
      setQty(id, (cart[id] || 0) + 1);
    }));
    qsa("[data-del]").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.getAttribute("data-del"));
      removeItem(id);
    }));
  }

  const { count, total } = cartSummary();
  cartCountEl.textContent = String(count);
  cartTotalEl.textContent = rupiah(total);
}

// ==========================
// DRAWER OPEN/CLOSE
// ==========================
function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
}

// ==========================
// CHECKOUT (dummy)
// ==========================
function checkout() {
  const { count, total } = cartSummary();
  if (count === 0) {
    alert("Keranjang masih kosong.");
    return;
  }

  // Simulasi order ID
  const orderId = "NS-" + Math.random().toString(16).slice(2, 8).toUpperCase();

  alert(
    `Checkout berhasil!\n\nOrder: ${orderId}\nItem: ${count}\nTotal: ${rupiah(total)}\n\n(Simulasi)`
  );

  clearCart();
  closeCart();
}

// ==========================
// EVENTS
// ==========================
searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", checkout);
clearCartBtn.addEventListener("click", clearCart);

// ==========================
// INIT
// ==========================
renderCategories();
renderProducts();
renderCart();