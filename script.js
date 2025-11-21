// Inventory Dashboard - JavaScript with Working Buttons and reactive UI

// Product data
const products = [
  { id: 1, name: 'Blue T-shirt', sku: 'BT-001', price: 299, stock: 24 },
  { id: 2, name: 'Wireless Mouse', sku: 'MOU-203', price: 899, stock: 6 },
  { id: 3, name: 'Ceramic Mug', sku: 'MUG-12', price: 199, stock: 120 },
  { id: 4, name: 'Phone Charger', sku: 'CHG-04', price: 399, stock: 0 },
  { id: 5, name: 'Spiral Notebook', sku: 'NB-99', price: 69, stock: 420 },
  { id: 6, name: 'Wireless Earbuds', sku: 'EB-66', price: 1599, stock: 14 }
];

// Keep initial stock snapshot for settings reset
const initialStocks = {};
products.forEach(p => initialStocks[p.id] = p.stock);

// Image array mapping
const images = ['Blue shirts.webp', 'mouse.webp', 'mug.webp', 'charger.webp', 'spiral.webp', 'buds.webp'];

// Activity log
const activityLog = [
  { action: '+ 120 units received', time: '12:03' },
  { action: 'Order allocated: Wireless Mouse', time: '09:41' }
];

// Utility: format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function calculateInventoryValue() {
  return products.reduce((sum, p) => sum + (p.price * p.stock), 0);
}

// Display products with action buttons
function displayProducts() {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  products.forEach(product => {
    const status = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'ok';
    const statusText = product.stock === 0 ? 'Out' : product.stock < 10 ? 'Low stock' : 'In stock';
    
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.innerHTML = `
      <div class="meta">
        <div class="thumb"><img src="${images[product.id - 1]}" alt="${product.name}"></div>
        <div style="flex:1">
          <div class="product-name">${product.name}</div>
          <div class="product-sku">SKU: ${product.sku}</div>
        </div>
        <div class="small muted">${formatCurrency(product.price)}</div>
      </div>
      <div class="stock">
        <div class="small muted">Available: <strong id="stock-${product.id}">${product.stock}</strong></div>
        <div class="badge ${status}" id="badge-${product.id}">${statusText}</div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="btn-add" onclick="addStock(${product.id})">➕ Add</button>
        <button class="btn-remove" onclick="removeStock(${product.id})">➖ Remove</button>
        <button class="btn-info" onclick="showInfo(${product.id})">ℹ️ Info</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Add activity log entry
function addActivity(action) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  activityLog.unshift({ action, time });
  updateActivityLog();
}

// Add stock button function
function addStock(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    product.stock += 5;
    updateDisplay(productId);
    addActivity(`+5 units received (${product.name})`);
    showAlert(`✅ Added 5 units to ${product.name}`);
  }
}

// Remove stock button function
function removeStock(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    const removed = Math.min(5, product.stock);
    product.stock = Math.max(0, product.stock - 5);
    updateDisplay(productId);
    addActivity(`-${removed} units allocated (${product.name})`);
    showAlert(`✅ Removed ${removed} units from ${product.name}`);
  }
}

// Show product info button
function showInfo(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    const html = `
      <div style="display:flex;gap:12px;align-items:flex-start">
        <img src="${images[product.id - 1]}" alt="${product.name}" style="width:96px;height:96px;object-fit:cover;border-radius:6px" />
        <div>
          <div style="font-weight:700;font-size:16px;margin-bottom:6px">${product.name}</div>
          <div class="small muted">SKU: ${product.sku}</div>
          <div style="margin-top:8px">Price: <strong>${formatCurrency(product.price)}</strong></div>
          <div>Stock: <strong>${product.stock} units</strong></div>
          <div style="margin-top:6px">Total value: <strong>${formatCurrency(product.price * product.stock)}</strong></div>
        </div>
      </div>
    `;
    showPopup('Product Info', html);
  }
}

// Update display after stock change
function updateDisplay(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const status = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'ok';
  const statusText = product.stock === 0 ? 'Out' : product.stock < 10 ? 'Low stock' : 'In stock';
  
  const stockEl = document.getElementById(`stock-${productId}`);
  const badgeEl = document.getElementById(`badge-${productId}`);
  if (stockEl) stockEl.textContent = product.stock;
  if (badgeEl) {
    badgeEl.className = `badge ${status}`;
    badgeEl.textContent = statusText;
  }

  // Update all summary/UI panels
  updateSummaryCards();
  updateQuickStats();
  updateLowStockAlerts();
}

// Show alert notification
function showAlert(message) {
  const alert = document.createElement('div');
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: 600;
    animation: slideIn 0.3s ease;`;
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => alert.remove(), 2200);
}

// Popup modal (center) — title + html content
function showPopup(title, htmlContent) {
  // overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1200;padding:16px;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:white;color:#111;border-radius:10px;max-width:560px;width:100%;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,0.3);font-family:inherit';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px';
  const h = document.createElement('div');
  h.style.cssText = 'font-weight:700;font-size:16px';
  h.textContent = title;
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✖';
  closeBtn.style.cssText = 'background:transparent;border:none;font-size:18px;cursor:pointer;color:#666';
  closeBtn.addEventListener('click', () => overlay.remove());

  header.appendChild(h);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.innerHTML = htmlContent;

  const footer = document.createElement('div');
  footer.style.cssText = 'display:flex;justify-content:flex-end;margin-top:14px';
  const ok = document.createElement('button');
  ok.textContent = 'Close';
  ok.style.cssText = 'padding:8px 12px;border-radius:6px;border:none;background:#2196F3;color:white;cursor:pointer;font-weight:600';
  ok.addEventListener('click', () => overlay.remove());
  footer.appendChild(ok);

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Confirmation popup with callback
function showConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1200;padding:16px;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:white;color:#111;border-radius:10px;max-width:420px;width:100%;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,0.3);font-family:inherit';

  const messageEl = document.createElement('div');
  messageEl.style.cssText = 'margin-bottom:14px';
  messageEl.textContent = message;

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;justify-content:flex-end';
  const cancel = document.createElement('button');
  cancel.textContent = 'Cancel';
  cancel.style.cssText = 'padding:8px 12px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer';
  const ok = document.createElement('button');
  ok.textContent = 'OK';
  ok.style.cssText = 'padding:8px 12px;border-radius:6px;border:none;background:#4CAF50;color:white;cursor:pointer;font-weight:600';

  cancel.addEventListener('click', () => overlay.remove());
  ok.addEventListener('click', () => {
    overlay.remove();
    if (typeof onConfirm === 'function') onConfirm();
  });

  actions.appendChild(cancel);
  actions.appendChild(ok);
  modal.appendChild(messageEl);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Add CSS animation for alert + highlight styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .btn-add, .btn-remove, .btn-info {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.15s;
  }
  
  .btn-add { background: #4CAF50; color: white; }
  .btn-add:hover { background: #45a049; transform: translateY(-2px); }
  .btn-remove { background: #f44336; color: white; }
  .btn-remove:hover { background: #da190b; transform: translateY(-2px); }
  .btn-info { background: #2196F3; color: white; }
  .btn-info:hover { background: #0b7dda; transform: translateY(-2px); }

  .product-card.highlight { outline: 3px solid #ff9800; box-shadow: 0 6px 18px rgba(255,152,0,0.12); transform: translateY(-4px); }
`;
document.head.appendChild(style);

// Update summary cards
function updateSummaryCards() {
  const cards = document.querySelectorAll('.summary .card');
  if (!cards || cards.length < 4) return;

  cards[0].querySelector('.value').textContent = products.length.toLocaleString();
  cards[1].querySelector('.value').textContent = products.filter(p => p.stock < 10).length;
  cards[2].querySelector('.value').textContent = '128 units';
  cards[3].querySelector('.value').textContent = formatCurrency(calculateInventoryValue());
}

// Update sidebar quick stats
function updateQuickStats() {
  const nums = document.querySelectorAll('.quick-stats .stat .num');
  if (!nums || nums.length < 4) return;
  nums[0].textContent = products.length.toLocaleString();
  nums[1].textContent = products.filter(p => p.stock < 10).length;
  nums[2].textContent = '3,512';
  nums[3].textContent = formatCurrency(calculateInventoryValue());
}

// Update low stock alerts (leftmost list in panel)
function updateLowStockAlerts() {
  const panelLists = document.querySelectorAll('.panel .list');
  if (!panelLists || panelLists.length === 0) return;
  const panelList = panelLists[0];
  panelList.innerHTML = '';

  const lowStockItems = products.filter(p => p.stock < 50).sort((a,b) => a.stock - b.stock);
  lowStockItems.slice(0,3).forEach(item => {
    const row = document.createElement('div');
    row.className = 'row';
    const badgeClass = item.stock === 0 ? 'out' : item.stock < 10 ? 'low' : 'ok';
    row.innerHTML = `
      <div>
        <div style="font-weight:700">${item.name}</div>
        <div class="small muted">SKU ${item.sku}</div><br>
      </div>
      <div class="badge ${badgeClass}">${item.stock}</div>
    `;
    panelList.appendChild(row);
  });
}

// Update activity log in second panel list
function updateActivityLog() {
  const panelLists = document.querySelectorAll('.panel .list');
  if (!panelLists || panelLists.length < 2) return;
  const activityList = panelLists[1];
  activityList.innerHTML = '';

  activityLog.slice(0,5).forEach(entry => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div>${entry.action}</div><div class="small muted">${entry.time}</div>`;
    activityList.appendChild(row);
  });
}

// Highlight low stock items and scroll to products
function focusLowStock() {
  const productsSection = document.querySelector('.products');
  if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(c => {
    const id = Number(c.dataset.id);
    const p = products.find(x => x.id === id);
    if (p && p.stock < 10) c.classList.add('highlight');
  });
  setTimeout(() => {
    document.querySelectorAll('.product-card.highlight').forEach(c => c.classList.remove('highlight'));
  }, 2500);
}

// Search functionality
function setupSearch() {
  const searchInput = document.querySelector('input[type="search"]');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const grid = document.querySelector('.products-grid');
    grid.innerHTML = '';
    
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color: #999;">No products found</p>';
      return;
    }
    
    filtered.forEach(product => {
      const status = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'ok';
      const statusText = product.stock === 0 ? 'Out' : product.stock < 10 ? 'Low stock' : 'In stock';
      
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.id = product.id;
      card.innerHTML = `
        <div class="meta">
          <div class="thumb"><img src="${images[product.id - 1]}" alt="${product.name}"></div>
          <div style="flex:1">
            <div class="product-name">${product.name}</div>
            <div class="product-sku">SKU: ${product.sku}</div>
          </div>
          <div class="small muted">${formatCurrency(product.price)}</div>
        </div>
        <div class="stock">
          <div class="small muted">Available: <strong id="stock-${product.id}">${product.stock}</strong></div>
          <div class="badge ${status}" id="badge-${product.id}">${statusText}</div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="btn-add" onclick="addStock(${product.id})">➕ Add</button>
          <button class="btn-remove" onclick="removeStock(${product.id})">➖ Remove</button>
          <button class="btn-info" onclick="showInfo(${product.id})">ℹ️ Info</button>
        </div>
      `;
      grid.appendChild(card);
    });
  });
}

// Sidebar handlers: Products, Stock Alerts, Sellers, Settings
function setupSidebarHandlers() {
  const navProducts = document.getElementById('nav-products');
  const navStock = document.getElementById('nav-stock-alerts');
  const navSellers = document.getElementById('nav-sellers');
  const navSettings = document.getElementById('nav-settings');

  if (navProducts) navProducts.addEventListener('click', (e) => { e.preventDefault(); document.querySelector('.products').scrollIntoView({ behavior: 'smooth' }); showAlert('📦 Showing products'); });
  if (navStock) navStock.addEventListener('click', (e) => { e.preventDefault(); focusLowStock(); showAlert('⚠️ Highlighting low stock items'); });
  if (navSellers) navSellers.addEventListener('click', (e) => { e.preventDefault(); showAlert('Sellers: Vikash, Rahul, Anu'); addActivity('Viewed sellers list'); });
  if (navSettings) navSettings.addEventListener('click', (e) => { 
    e.preventDefault();
    showConfirm('Reset all stocks to original values?', () => {
      products.forEach(p => p.stock = initialStocks[p.id]);
      // refresh UI
      displayProducts();
      updateSummaryCards();
      updateQuickStats();
      updateLowStockAlerts();
      updateActivityLog();
      addActivity('Reset stocks from Settings');
      showAlert('⚙️ Stocks reset to default');
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  displayProducts();
  setupSearch();
  setupSidebarHandlers();
  updateSummaryCards();
  updateQuickStats();
  updateLowStockAlerts();
  updateActivityLog();
});
