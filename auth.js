// Auth & Transition Logic

// --- Transition Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Page Transition Fade In
    const transitionOverlay = document.querySelector('.page-transition');
    if (transitionOverlay) {
        setTimeout(() => {
            transitionOverlay.classList.remove('active');
        }, 100);
    }

    // 2. Handle Link Clicks (Fade Out)
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ignore hash links or empty links
            if (!href || href === '#' || href.startsWith('#')) return;

            // Prevent default navigation
            e.preventDefault();

            // Check Authentication for protected routes
            if (isProtectedRoute(href) && !isAuthenticated()) {
                animateAndRedirect('login.html');
            } else if (href === 'login.html' && isAuthenticated()) {
                // If logged in and going to login page, maybe redirect to album or allow it?
                // For now allow it, user might want to switch accounts
                animateAndRedirect(href);
            } else {
                animateAndRedirect(href);
            }
        });
    });

    // 3. Update Navbar UI (Runs on every page)
    updateNavbar();

    // 4. Check Route Protection
    checkRouteProtection();

    // 5. Setup Password Toggles (if on login page)
    setupToggle('toggle-login-pass', 'login-pass');
    setupToggle('toggle-signup-pass', 'signup-pass');

    // 6. Failsafe: Remove any lingering hamburger menus if they exist
    const rogueHamburger = document.querySelectorAll('.hamburger, .fa-bars');
    rogueHamburger.forEach(el => {
        // Only remove if it's NOT inside the admin panel user list (which uses fa-user, fa-trash, etc but NOT fa-bars usually)
        // Actually, fa-bars is specific to the menu.
        el.style.display = 'none';
        el.remove();
    });
});


function animateAndRedirect(url) {
    const transitionOverlay = document.querySelector('.page-transition');
    if (transitionOverlay) {
        transitionOverlay.classList.add('active');
        setTimeout(() => {
            window.location.href = url;
        }, 500); // Match CSS transition time
    } else {
        window.location.href = url;
    }
}

// --- Auth Logic ---

// Protected Routes List
const protectedPages = ['album.html', 'planes.html', 'calendario.html'];

function isProtectedRoute(url) {
    if (!url) return false;
    return protectedPages.some(page => url.includes(page));
}

function isAuthenticated() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

function updateNavbar() {
    const isAuthenticatedUser = isAuthenticated();
    const user = sessionStorage.getItem('currentUser');
    const loginBtn = document.querySelector('.login-btn');

    // Only update if logged in AND we found the button
    if (loginBtn && isAuthenticatedUser && user) {
        // Change text to Username
        loginBtn.innerHTML = `${user} <i class="fa-solid fa-caret-down" style="font-size: 0.8em; margin-left: 5px;"></i>`;
        loginBtn.href = "#";
        loginBtn.classList.add('logged-in');

        // Create Logout Tooltip/Dropdown
        // We check if it exists to avoid duplicates if this runs multiple times
        if (!loginBtn.querySelector('.logout-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.className = 'logout-tooltip';
            // Build Tooltip Content
            let tooltipHtml = '';

            // 1. Admin Panel (if admin)
            if (sessionStorage.getItem('isAdmin') === 'true') {
                tooltipHtml += `
                    <div class="dropdown-item" id="admin-panel-btn"><i class="fa-solid fa-screwdriver-wrench"></i> Panel Admin</div>
                `;
            }

            // 2. Logout
            tooltipHtml += `
                <div class="dropdown-item" id="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</div>
            `;

            tooltip.innerHTML = tooltipHtml;

            // Add Delete Account ONLY if not admin
            if (sessionStorage.getItem('isAdmin') !== 'true') {
                tooltip.innerHTML += `
                    <div class="dropdown-item" id="delete-account-btn" style="color: red; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                        <i class="fa-solid fa-user-xmark"></i> Borrar Cuenta
                    </div>
                `;
            }

            loginBtn.appendChild(tooltip);

            // Admin Panel Action
            const adminBtn = tooltip.querySelector('#admin-panel-btn');
            if (adminBtn) {
                adminBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.location.href = 'admin.html';
                });
            }

            // Logout Action
            tooltip.querySelector('#logout-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                // Clear Session
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('currentUser');
                sessionStorage.removeItem('isAdmin');

                // Redirect to Home or Login
                window.location.href = 'index.html';
            });

            // Delete Account Action
            const deleteBtn = tooltip.querySelector('#delete-account-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    const currentUser = sessionStorage.getItem('currentUser');
                    showDeleteConfirmation(() => {
                        // Delete from Storage
                        localStorage.removeItem(currentUser);

                        // Clear Session
                        sessionStorage.removeItem('isLoggedIn');
                        sessionStorage.removeItem('currentUser');
                        sessionStorage.removeItem('isAdmin');

                        // Redirect to Home or Login
                        window.location.href = 'index.html';
                    });
                });
            }
        }
    }
}

function checkRouteProtection() {
    const path = window.location.pathname;
    const page = path.split('/').pop();

    // If we are on a protected page and NOT logged in
    if (protectedPages.includes(page)) {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
        }
    }
}

// --- Login Page Specifics ---

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const formTitle = document.getElementById('form-title');

if (loginForm) {
    // Login Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        const errorMsg = document.getElementById('login-error');

        if (user === 'pierito.admin' && pass === 'Pierito2005') {
            // Admin Login
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', user);
            sessionStorage.setItem('isAdmin', 'true');
            animateAndRedirect('admin.html');
            return;
        }

        const storedUser = localStorage.getItem(user);

        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.password === pass) {
                // Success
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('currentUser', user);
                sessionStorage.removeItem('isAdmin'); // Ensure not admin
                // Redirect
                animateAndRedirect('album.html');
            } else {
                errorMsg.textContent = "Contraseña incorrecta";
            }
        } else {
            errorMsg.textContent = "Usuario no encontrado";
        }
    });

    // Signup Logic
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('signup-user').value;
        const pass = document.getElementById('signup-pass').value;
        const successMsg = document.getElementById('signup-success');

        if (localStorage.getItem(user)) {
            successMsg.textContent = "El usuario ya existe.";
            successMsg.style.color = "red";
        } else {
            localStorage.setItem(user, JSON.stringify({ password: pass }));
            successMsg.textContent = "Usuario creado exitosamente. Iniciando...";
            successMsg.style.color = "lightgreen";

            setTimeout(() => {
                showLogin();
                // Pre-fill login
                document.getElementById('login-user').value = user;
                document.getElementById('login-pass').value = "";
                successMsg.textContent = "";
            }, 1000);
        }
    });
}

// UI Toggles
function showSignup() {
    if (loginForm && signupForm && formTitle) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        formTitle.innerText = "Crear Cuenta";
    }
}

function showLogin() {
    if (loginForm && signupForm && formTitle) {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        formTitle.innerText = "Bienvenido";
    }
}

// Password Toggle Logic
function setupToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (toggle && input) {
        toggle.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.remove('fa-eye');
                toggle.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                toggle.classList.remove('fa-eye-slash');
                toggle.classList.add('fa-eye');
            }
        });
    }
}

// Custom Modal Logic
function showDeleteConfirmation(onConfirm, message = "Estás a punto de eliminar tu cuenta permanentemente. Esta acción no se puede deshacer.") {
    // Check if modal exists
    let modal = document.querySelector('.custom-modal-overlay');

    // Always update the text content if it exists or when creating it
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal-content">
                <h3>¿Estás seguro?</h3>
                <p id="modal-msg">${message}</p>
                <div class="modal-buttons">
                    <button class="btn-modal btn-cancel">Cancelar</button>
                    <button class="btn-modal btn-confirm">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Cancel action closes modal
        const cancelBtn = modal.querySelector('.btn-cancel');
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Click outside closes modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    } else {
        // Update message if reusing existing modal
        const msgEl = modal.querySelector('#modal-msg');
        if (msgEl) msgEl.textContent = message;
    }

    // Bind Confirm Action
    // Note: If modal was just created, confirmBtn is inside. If existing, we need to find it again.
    const confirmBtn = modal.querySelector('.btn-confirm');

    // Remove old listeners to avoid multiple fires if reused (cloning is easiest way to wipe listeners)
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        modal.classList.remove('active');
    });

    // Show Modal
    setTimeout(() => modal.classList.add('active'), 10);
}
