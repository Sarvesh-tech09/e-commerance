import products from './products.js';

document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    const productGrid = document.getElementById('product-grid');
    const cartItemsContainer = document.getElementById('cart-items');
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');
    const cartTotal = document.getElementById('cart-total');
    
    // UI Elements
    const cartToggle = document.getElementById('cart-toggle');
    const wishlistToggle = document.getElementById('wishlist-toggle');
    const overlay = document.getElementById('overlay');
    const cartPanel = document.getElementById('cart-panel');
    const wishlistPanel = document.getElementById('wishlist-panel');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Initialize
    updateUI();
    renderProducts();

    function renderProducts() {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <button class="wishlist-btn ${wishlist.some(item => item.id === product.id) ? 'active' : ''}" 
                        onclick="toggleWishlistItem(${product.id})">
                    <i class="fa-solid fa-heart"></i>
                </button>
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    window.addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        const existing = cart.find(item => item.id === productId);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        saveAndSwap();
        showNotification(`${product.name} added to cart!`);
    };

    window.toggleWishlistItem = (productId) => {
        const product = products.find(p => p.id === productId);
        const index = wishlist.findIndex(item => item.id === productId);
        
        if (index > -1) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push(product);
        }
        
        saveAndSwap();
        renderProducts(); // Refresh heart icons
    };

    window.removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveAndSwap();
    };

    function saveAndSwap() {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateUI();
    }

    function updateUI() {
        // Update Counts
        cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
        wishlistCount.textContent = wishlist.length;

        // Update Cart Items
        cartItemsContainer.innerHTML = cart.length === 0 
            ? '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Your cart is empty.</p>'
            : cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 style="font-size: 0.9rem;">${item.name}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted)">$${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `).join('');

        // Update Total
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;

        // Update Wishlist Items
        wishlistItemsContainer.innerHTML = wishlist.length === 0
            ? '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Your wishlist is empty.</p>'
            : wishlist.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 style="font-size: 0.9rem;">${item.name}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted)">$${item.price.toFixed(2)}</p>
                    </div>
                    <button class="add-to-cart" style="width: auto; padding: 4px 8px; font-size: 0.7rem;" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            `).join('');
    }

    // Modal Control
    window.toggleCart = () => {
        cartPanel.classList.toggle('open');
        overlay.style.display = cartPanel.classList.contains('open') ? 'block' : 'none';
        wishlistPanel.classList.remove('open');
    };

    window.toggleWishlist = () => {
        wishlistPanel.classList.toggle('open');
        overlay.style.display = wishlistPanel.classList.contains('open') ? 'block' : 'none';
        cartPanel.classList.remove('open');
    };

    cartToggle.addEventListener('click', toggleCart);
    wishlistToggle.addEventListener('click', toggleWishlist);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            // Save order
            localStorage.setItem('lastOrder', JSON.stringify({
                items: cart,
                date: new Date().toISOString(),
                total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
            }));
            
            // Clear cart
            cart = [];
            saveAndSwap();
            
            // Redirect
            window.location.href = 'order-status.html';
        });
    }
    overlay.addEventListener('click', () => {
        cartPanel.classList.remove('open');
        wishlistPanel.classList.remove('open');
        overlay.style.display = 'none';
    });

    function showNotification(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--text-main);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 2000;
            animation: slideIn 0.3s forwards;
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});

// Add animations to CSS via JS or in style.css directly
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
