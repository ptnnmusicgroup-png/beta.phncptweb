import { db } from "./firebase-init.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const catalog = [
  {
    id: "laptop-study",
    name: "Laptop daily mềm gọn",
    label: "Laptop daily",
    category: ["work"],
    price: 7900000,
    image: "assets/product-laptop.svg",
    alt: "Laptop học tập và làm việc",
    description: "Máy gọn cho học, văn phòng, creator nhẹ, ưu tiên pin và màn hình dễ nhìn.",
    specs: ["SSD 512GB", "RAM 16GB", "Màn 14-15 inch"],
  },
  {
    id: "pc-custom",
    name: "PC custom cute power",
    label: "PC custom",
    category: ["play"],
    price: 9500000,
    image: "assets/product-pc.svg",
    alt: "PC custom màu nâu mềm",
    description: "Case build riêng, hiệu năng đúng ngân sách, phối màu coffee, caramel và graphite.",
    specs: ["Gaming 1080p", "Tản mát", "Nâng cấp dễ"],
  },
  {
    id: "accessory-kit",
    name: "Combo phụ kiện góc bàn",
    label: "Phụ kiện",
    category: ["work", "play"],
    price: 150000,
    image: "assets/product-accessory.svg",
    alt: "Bàn phím chuột phụ kiện",
    description: "Bàn phím, chuột, hub, tai nghe nhìn xinh nhưng vẫn dùng chắc mỗi ngày.",
    specs: ["Keycap êm", "Chuột nhẹ", "Hub gọn"],
  },
  {
    id: "care-service",
    name: "Gói chăm máy kỹ",
    label: "Dịch vụ",
    category: ["care"],
    price: 0,
    image: "assets/product-service.svg",
    alt: "Dịch vụ sửa chữa máy tính",
    description: "Vệ sinh, nâng cấp SSD/RAM, cài đặt và sửa lỗi, kiểm tra trước khi báo giá.",
    specs: ["Test trước", "Báo giá rõ", "Tối ưu nhiệt"],
  },
  {
    id: "ssd-upgrade",
    name: "Nâng cấp SSD tốc độ",
    label: "Nâng cấp",
    category: ["care", "work"],
    price: 690000,
    image: "assets/product-service.svg",
    alt: "Nâng cấp SSD máy tính",
    description: "Tăng tốc khởi động, mở app nhanh hơn, clone dữ liệu khi phù hợp.",
    specs: ["NVMe/SATA", "Clone dữ liệu", "Test sức khỏe"],
  },
  {
    id: "stream-mini",
    name: "Mini setup stream nhẹ",
    label: "Setup",
    category: ["play"],
    price: 1290000,
    image: "assets/product-accessory.svg",
    alt: "Setup stream nhẹ",
    description: "Mic, tai nghe và đèn nhỏ cho góc stream, học online hoặc họp video.",
    specs: ["Mic rõ", "Đèn ấm", "Dây gọn"],
  },
];

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "work", label: "Học & làm" },
  { id: "play", label: "Gaming" },
  { id: "care", label: "Chăm máy" },
];

const services = [
  {
    title: "Kiểm tra lỗi",
    text: "Đọc tình trạng máy, khoanh vùng lỗi và báo phương án trước khi làm.",
  },
  {
    title: "Nâng cấp cấu hình",
    text: "SSD, RAM, tản nhiệt, nguồn và tối ưu lại máy theo nhu cầu thật.",
  },
  {
    title: "Chăm máy định kỳ",
    text: "Vệ sinh, thay keo, dọn phần mềm và kiểm tra nhiệt độ sau khi hoàn tất.",
  },
];

const moods = {
  study: {
    label: "Study",
    title: "Study desk",
    text: "Laptop mỏng, bàn phím low-profile, hub USB-C, đèn bàn ánh ấm.",
    badge: "Góc học tập gọn",
    note: "Ưu tiên máy nhẹ, pin ổn, màn dễ nhìn và phụ kiện ít dây.",
  },
  play: {
    label: "Play",
    title: "Play corner",
    text: "PC custom nhỏ gọn, tai nghe êm, chuột nhẹ và ánh sáng coffee/caramel vừa đủ.",
    badge: "Gaming vừa đủ",
    note: "Cân hiệu năng, nhiệt độ và khả năng nâng cấp để không đội ngân sách.",
  },
  studio: {
    label: "Studio",
    title: "Mini studio",
    text: "Màn hình màu chuẩn, SSD nhanh, mic gọn và dock để giữ bàn sạch.",
    badge: "Sáng tạo sạch bàn",
    note: "Tập trung lưu trữ nhanh, màn đẹp, âm thanh rõ và dây kết nối gọn.",
  },
};

const tickerItems = ["Máy rõ nguồn", "Build PC cân ngân sách", "Phụ kiện xinh, dùng bền", "Vệ sinh và nâng cấp nhanh"];
const needOptions = ["Tư vấn mua laptop", "Build PC", "Sửa chữa / nâng cấp", "Mua phụ kiện", "Phối setup góc bàn"];
const defaultUser = {
  id: "admin-phncpt-default",
  name: "admin-phncpt",
  email: "phncpt.cskh@gmail.com",
  password: "phncpt1admin",
};
const adminEmail = "phncpt.cskh@gmail.com";

const state = {
  filter: "all",
  search: "",
  mood: "study",
  authMode: "login",
  cart: readJSON("pnc-cart", []),
  users: readJSON("pnc-users", []),
  currentUser: readJSON("pnc-current-user", null),
  firestoreReady: true,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elements = {
  filters: $("[data-filters]"),
  products: $("[data-products]"),
  resultLine: $("[data-result-line]"),
  search: $("[data-search]"),
  services: $("[data-services]"),
  moods: $("[data-moods]"),
  moodResult: $("[data-mood-result]"),
  ticker: $("[data-ticker]"),
  heroBadge: $("[data-hero-badge]"),
  heroNote: $("[data-hero-note]"),
  cartDrawer: $("[data-cart-drawer]"),
  cartItems: $("[data-cart-items]"),
  cartCount: $("[data-cart-count]"),
  cartTotal: $("[data-cart-total]"),
  quotePreview: $("[data-quote-preview]"),
  accountPreview: $("[data-account-preview]"),
  needSelect: $("[data-need-select]"),
  form: $("[data-contact-form]"),
  formMessage: $("[data-form-message]"),
  authModal: $("[data-auth-modal]"),
  authTitle: $("[data-auth-title]"),
  authLabel: $("[data-auth-label]"),
  authForms: $("[data-auth-forms]"),
  authUser: $("[data-auth-user]"),
  authName: $("[data-auth-name]"),
  authEmail: $("[data-auth-email]"),
  authMessage: $("[data-auth-message]"),
  loginForm: $("[data-login-form]"),
  registerForm: $("[data-register-form]"),
  toast: $("[data-toast]"),
  adminLink: $("[data-admin-link]"),
  adminSection: $("[data-admin-section]"),
  adminRefresh: $("[data-admin-refresh]"),
  postForm: $("[data-post-form]"),
  adminMessage: $("[data-admin-message]"),
  adminOrders: $("[data-admin-orders]"),
  adminPosts: $("[data-admin-posts]"),
  todayVisitors: $("[data-today-visitors]"),
  todayLabel: $("[data-today-label]"),
  orderCount: $("[data-order-count]"),
  postCount: $("[data-post-count]"),
};

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function saveCart() {
  localStorage.setItem("pnc-cart", JSON.stringify(state.cart));
}

function saveAuth() {
  localStorage.setItem("pnc-users", JSON.stringify(state.users));
  localStorage.setItem("pnc-current-user", JSON.stringify(state.currentUser));
}

function seedDefaultUser() {
  const exists = state.users.some((user) => user.email === defaultUser.email);
  if (exists) return;

  state.users.push(defaultUser);
  saveAuth();
}

function isAdmin() {
  return state.currentUser?.email === adminEmail;
}

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function safeFirestore(action, fallbackMessage) {
  try {
    return await action();
  } catch (error) {
    state.firestoreReady = false;
    console.warn(fallbackMessage, error);
    showToast(fallbackMessage);
    return null;
  }
}

function formatPrice(price) {
  return price > 0 ? `Từ ${money.format(price)}` : "Kiểm tra trước khi báo giá";
}

function getProduct(id) {
  return catalog.find((product) => product.id === id);
}

function renderTicker() {
  elements.ticker.innerHTML = tickerItems.map((item) => `<span>${item}</span>`).join("");
}

function renderFilters() {
  elements.filters.innerHTML = filters
    .map(
      (filter) => `
        <button class="${filter.id === state.filter ? "active" : ""}" data-filter="${filter.id}" type="button">
          ${filter.label}
        </button>
      `,
    )
    .join("");
}

function getVisibleProducts() {
  const query = state.search.trim().toLowerCase();

  return catalog.filter((product) => {
    const inFilter = state.filter === "all" || product.category.includes(state.filter);
    const haystack = [product.name, product.label, product.description, ...product.specs].join(" ").toLowerCase();
    return inFilter && (!query || haystack.includes(query));
  });
}

function renderProducts() {
  const products = getVisibleProducts();

  elements.resultLine.textContent = `${products.length} gợi ý phù hợp`;
  elements.products.innerHTML = products.length
    ? products.map(renderProductCard).join("")
    : `<div class="empty-state">Chưa thấy món phù hợp. Thử từ khóa khác hoặc chọn "Tất cả".</div>`;
}

function renderProductCard(product) {
  const inCart = state.cart.some((item) => item.id === product.id);
  const specs = product.specs.map((spec) => `<li>${spec}</li>`).join("");

  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.alt}" />
      <div class="product-info">
        <p>${product.label}</p>
        <h3>${product.name}</h3>
        <span>${formatPrice(product.price)}</span>
        <ul class="spec-list">${specs}</ul>
        <button class="button product-action ${inCart ? "secondary" : "primary"}" type="button" data-add="${product.id}">
          ${inCart ? "Đã thêm" : "Thêm tư vấn"}
        </button>
      </div>
    </article>
  `;
}

function renderServices() {
  elements.services.innerHTML = services
    .map(
      (service, index) => `
        <article>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${service.title}</h3>
          <p>${service.text}</p>
        </article>
      `,
    )
    .join("");
}

function renderMoods() {
  elements.moods.innerHTML = Object.entries(moods)
    .map(
      ([id, mood]) => `
        <button class="mood ${id === state.mood ? "active" : ""}" type="button" data-mood="${id}">
          <span></span>
          ${mood.label}
        </button>
      `,
    )
    .join("");

  const mood = moods[state.mood];
  elements.moodResult.innerHTML = `<strong>${mood.title}</strong><p>${mood.text}</p>`;
  elements.heroBadge.textContent = mood.badge;
  elements.heroNote.textContent = mood.note;
}

function renderNeedOptions() {
  elements.needSelect.innerHTML = needOptions.map((option) => `<option>${option}</option>`).join("");
}

function renderCart() {
  state.cart = state.cart.filter((item) => getProduct(item.id));
  const cartProducts = state.cart.map((item) => ({ ...getProduct(item.id), quantity: item.quantity }));
  const total = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const count = cartProducts.reduce((sum, product) => sum + product.quantity, 0);

  elements.cartCount.textContent = count;
  elements.cartTotal.textContent = money.format(total);
  elements.quotePreview.textContent = cartProducts.length
    ? `Bạn đang chọn: ${cartProducts.map((product) => `${product.name} x${product.quantity}`).join(", ")}.`
    : "Chưa có món nào trong giỏ tư vấn.";

  elements.cartItems.innerHTML = cartProducts.length
    ? cartProducts.map(renderCartItem).join("")
    : `<div class="empty-state">Thêm sản phẩm hoặc dịch vụ để shop tư vấn combo hợp hơn.</div>`;

  saveCart();
}

function renderCartItem(product) {
  return `
    <article class="cart-item">
      <img src="${product.image}" alt="" />
      <div>
        <strong>${product.name}</strong>
        <span>${formatPrice(product.price)}</span>
        <div class="qty-controls">
          <button type="button" data-dec="${product.id}" aria-label="Giảm số lượng">-</button>
          <b>${product.quantity}</b>
          <button type="button" data-inc="${product.id}" aria-label="Tăng số lượng">+</button>
          <button type="button" data-remove="${product.id}">Bỏ</button>
        </div>
      </div>
    </article>
  `;
}

function renderAuth() {
  const user = state.currentUser;
  const loggedIn = Boolean(user);

  elements.authLabel.textContent = loggedIn ? user.name : "Đăng nhập";
  elements.accountPreview.textContent = loggedIn
    ? `Đang đăng nhập với tài khoản ${user.name} (${user.email}).`
    : "Bạn có thể đăng nhập để lưu thông tin tư vấn trên trình duyệt này.";

  elements.authUser.hidden = !loggedIn;
  elements.authForms.hidden = loggedIn;
  elements.authTitle.textContent = loggedIn ? "Tài khoản của bạn" : state.authMode === "login" ? "Đăng nhập" : "Đăng kí";

  if (loggedIn) {
    elements.authName.textContent = user.name;
    elements.authEmail.textContent = user.email;
  }

  $$("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === state.authMode);
  });

  elements.loginForm.classList.toggle("active", state.authMode === "login");
  elements.registerForm.classList.toggle("active", state.authMode === "register");
  renderAdminAccess();
}

function renderAdminAccess() {
  const admin = isAdmin();
  elements.adminLink.hidden = !admin;
  elements.adminSection.hidden = !admin;
}

function getCartProducts() {
  return state.cart
    .filter((item) => getProduct(item.id))
    .map((item) => {
      const product = getProduct(item.id);
      return {
        id: product.id,
        name: product.name,
        label: product.label,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    });
}

function renderAdminList(target, items, emptyText) {
  target.innerHTML = items.length
    ? items.join("")
    : `<div class="empty-state">${emptyText}</div>`;
}

async function trackDailyVisit() {
  const today = getTodayKey();
  const visitKey = `pnc-visit-${today}`;

  if (localStorage.getItem(visitKey)) {
    return;
  }

  await safeFirestore(
    () =>
      setDoc(
        doc(db, "dailyVisitors", today),
        {
          date: today,
          count: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ),
    "Chưa ghi được lượt khách vào Firestore.",
  );

  localStorage.setItem(visitKey, "1");
}

async function saveOrderToFirestore(formData) {
  const cartProducts = getCartProducts();
  const total = cartProducts.reduce((sum, item) => sum + item.subtotal, 0);

  return safeFirestore(
    () =>
      addDoc(collection(db, "orders"), {
        customerName: formData.name,
        need: formData.need,
        budget: formData.budget || "",
        note: formData.note || "",
        user: state.currentUser,
        items: cartProducts,
        total,
        status: "new",
        createdAt: serverTimestamp(),
      }),
    "Chưa lưu được đơn hàng vào Firestore.",
  );
}

async function createPost(form) {
  const data = Object.fromEntries(new FormData(form));

  const result = await safeFirestore(
    () =>
      addDoc(collection(db, "posts"), {
        title: data.title.trim(),
        content: data.content.trim(),
        author: state.currentUser,
        createdAt: serverTimestamp(),
      }),
    "Chưa đăng được bài viết lên Firestore.",
  );

  if (!result) return;
  form.reset();
  elements.adminMessage.textContent = "Đã đăng bài viết lên Firestore.";
  showToast("Đã thêm bài viết.");
  await loadAdminDashboard();
}

async function loadAdminDashboard() {
  if (!isAdmin()) return;

  const today = getTodayKey();
  const visitSnapshot = await safeFirestore(
    () => getDoc(doc(db, "dailyVisitors", today)),
    "Chưa đọc được thống kê khách.",
  );

  const todayCount = visitSnapshot?.exists() ? visitSnapshot.data().count || 0 : 0;
  elements.todayVisitors.textContent = todayCount;
  elements.todayLabel.textContent = `Ngày ${today}`;

  const orderSnapshot = await safeFirestore(
    () => getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(20))),
    "Chưa đọc được đơn hàng.",
  );

  const orders = orderSnapshot
    ? orderSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    : [];

  elements.orderCount.textContent = orders.length;
  renderAdminList(
    elements.adminOrders,
    orders.map(renderOrderItem),
    "Chưa có đơn hàng nào trong Firestore.",
  );

  const postSnapshot = await safeFirestore(
    () => getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10))),
    "Chưa đọc được bài viết.",
  );

  const posts = postSnapshot ? postSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })) : [];

  elements.postCount.textContent = posts.length;
  renderAdminList(
    elements.adminPosts,
    posts.map(renderPostItem),
    "Chưa có bài viết nào trong Firestore.",
  );
}

function renderOrderItem(order) {
  const total = typeof order.total === "number" ? money.format(order.total) : "Đang cập nhật";
  const items = Array.isArray(order.items) && order.items.length
    ? order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")
    : "Không có sản phẩm cụ thể";

  return `
    <article class="admin-list-item">
      <strong>${order.customerName || "Khách chưa đặt tên"}</strong>
      <span>${order.user?.email || "Chưa có email tài khoản"} · ${total}</span>
      <p>${order.need || "Nhu cầu chưa rõ"} - ${items}</p>
    </article>
  `;
}

function renderPostItem(post) {
  return `
    <article class="admin-list-item">
      <strong>${post.title || "Bài viết chưa có tiêu đề"}</strong>
      <span>${post.author?.name || "Admin"}</span>
      <p>${post.content || ""}</p>
    </article>
  `;
}

function addToCart(id) {
  const found = state.cart.find((item) => item.id === id);

  if (found) {
    found.quantity += 1;
  } else {
    state.cart.push({ id, quantity: 1 });
  }

  showToast("Đã thêm vào giỏ tư vấn.");
  renderProducts();
  renderCart();
}

function changeQuantity(id, delta) {
  const found = state.cart.find((item) => item.id === id);
  if (!found) return;

  found.quantity += delta;
  if (found.quantity <= 0) {
    state.cart = state.cart.filter((item) => item.id !== id);
  }

  renderProducts();
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  renderProducts();
  renderCart();
}

function openCart() {
  elements.cartDrawer.classList.add("is-open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  elements.cartDrawer.classList.remove("is-open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
}

function openAuth() {
  elements.authModal.classList.add("is-open");
  elements.authModal.setAttribute("aria-hidden", "false");
}

function closeAuth() {
  elements.authModal.classList.remove("is-open");
  elements.authModal.setAttribute("aria-hidden", "true");
  elements.authMessage.textContent = "";
}

function registerUser(form) {
  const data = Object.fromEntries(new FormData(form));
  const email = data.email.trim().toLowerCase();

  if (state.users.some((user) => user.email === email)) {
    elements.authMessage.textContent = "Email này đã có tài khoản. Chuyển qua đăng nhập nhé.";
    return;
  }

  const user = {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
    name: data.name.trim(),
    email,
    password: data.password,
  };

  state.users.push(user);
  state.currentUser = { id: user.id, name: user.name, email: user.email };
  saveAuth();
  form.reset();
  renderAuth();
  if (isAdmin()) loadAdminDashboard();
  showToast("Đăng kí thành công.");
}

function loginUser(form) {
  const data = Object.fromEntries(new FormData(form));
  const email = data.email.trim().toLowerCase();
  const user = state.users.find((item) => item.email === email && item.password === data.password);

  if (!user) {
    elements.authMessage.textContent = "Email hoặc mật khẩu chưa đúng.";
    return;
  }

  state.currentUser = { id: user.id, name: user.name, email: user.email };
  saveAuth();
  form.reset();
  renderAuth();
  if (isAdmin()) loadAdminDashboard();
  showToast("Đăng nhập thành công.");
}

function logoutUser() {
  state.currentUser = null;
  saveAuth();
  state.authMode = "login";
  renderAuth();
  showToast("Đã đăng xuất.");
}

let toastTimer;
function showToast(text) {
  elements.toast.textContent = text;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

function bindEvents() {
  elements.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    state.filter = button.dataset.filter;
    renderFilters();
    renderProducts();
  });

  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  elements.products.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    addToCart(button.dataset.add);
  });

  elements.moods.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mood]");
    if (!button) return;
    state.mood = button.dataset.mood;
    renderMoods();
  });

  elements.cartItems.addEventListener("click", (event) => {
    const inc = event.target.closest("[data-inc]");
    const dec = event.target.closest("[data-dec]");
    const remove = event.target.closest("[data-remove]");

    if (inc) changeQuantity(inc.dataset.inc, 1);
    if (dec) changeQuantity(dec.dataset.dec, -1);
    if (remove) removeFromCart(remove.dataset.remove);
  });

  $$("[data-cart-open]").forEach((button) => button.addEventListener("click", openCart));
  $$("[data-cart-close]").forEach((button) => button.addEventListener("click", closeCart));
  $$("[data-auth-open]").forEach((button) => button.addEventListener("click", openAuth));
  $$("[data-auth-close]").forEach((button) => button.addEventListener("click", closeAuth));

  elements.cartDrawer.addEventListener("click", (event) => {
    if (event.target === elements.cartDrawer) closeCart();
  });

  elements.authModal.addEventListener("click", (event) => {
    if (event.target === elements.authModal) closeAuth();

    const modeButton = event.target.closest("[data-auth-mode]");
    if (modeButton) {
      state.authMode = modeButton.dataset.authMode;
      elements.authMessage.textContent = "";
      renderAuth();
    }

    if (event.target.closest("[data-auth-logout]")) {
      logoutUser();
    }
  });

  elements.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginUser(elements.loginForm);
  });

  elements.registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    registerUser(elements.registerForm);
  });

  elements.postForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin()) {
      elements.adminMessage.textContent = "Chỉ tài khoản admin mới được thêm bài viết.";
      return;
    }
    createPost(elements.postForm);
  });

  elements.adminRefresh.addEventListener("click", () => {
    loadAdminDashboard();
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(elements.form));
    if (!state.currentUser) {
      elements.formMessage.textContent = "Bạn cần đăng nhập hoặc đăng kí trước khi đặt hàng.";
      openAuth();
      return;
    }

    const cartText = state.cart.length ? elements.quotePreview.textContent : "Chưa chọn món cụ thể.";
    const accountText = state.currentUser ? `Tài khoản: ${state.currentUser.email}. ` : "";
    const orderRef = await saveOrderToFirestore(data);

    elements.formMessage.textContent = orderRef
      ? `Đã lưu đơn hàng của ${data.name} vào Firestore. ${accountText}Nội dung tư vấn: ${cartText}`
      : `Đã ghi nhận yêu cầu trên trang, nhưng Firestore chưa lưu được. ${accountText}Nội dung tư vấn: ${cartText}`;
    showToast(orderRef ? "Đơn hàng đã lưu vào dashboard admin." : "Đơn hàng chưa lưu được lên Firestore.");
    elements.form.reset();
    if (isAdmin()) loadAdminDashboard();
  });
}

async function init() {
  seedDefaultUser();
  renderTicker();
  renderFilters();
  renderProducts();
  renderServices();
  renderMoods();
  renderNeedOptions();
  renderCart();
  renderAuth();
  bindEvents();
  trackDailyVisit();
  if (isAdmin()) loadAdminDashboard();
}

init();
