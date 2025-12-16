document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Admin Permission
    if (sessionStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 2. Load Users
    loadUsers();

    // 3. Logout Logic specific for Admin Page
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        });
    }
});

function loadUsers() {
    const list = document.getElementById('user-list');
    list.innerHTML = ''; // Clear current list

    let userCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);

        try {
            const parsed = JSON.parse(val);
            // Identify if this key is a user.
            // Our auth.js saves users as { password: "..." }
            // We assume any key with a JSON value containing 'password' is a user.
            // Also exclude 'loglevel' or other common keys if they happen to match, though unlikely.
            if (parsed && parsed.password) {
                // It is a user
                userCount++;
                renderUserRow(list, key);
            }
        } catch (e) {
            // Not a JSON object, ignore
        }
    }

    if (userCount === 0) {
        list.innerHTML = '<div class="no-users">No hay usuarios registrados aparte del Admin.</div>';
    }
}

function renderUserRow(container, username) {
    const card = document.createElement('div');
    card.className = 'user-card';

    // Username Section
    const nameSpan = document.createElement('span');
    nameSpan.className = 'user-name';
    nameSpan.innerHTML = `<i class="fa-solid fa-user"></i> ${username}`;

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';
    deleteBtn.onclick = () => deleteUser(username);

    card.appendChild(nameSpan);
    card.appendChild(deleteBtn);

    container.appendChild(card);
}

function deleteUser(username) {
    // Use the custom modal from auth.js if available, otherwise fallback to confirm
    if (typeof showDeleteConfirmation === 'function') {
        showDeleteConfirmation(() => {
            performDelete(username);
        }, `¿Estás seguro de que deseas eliminar al usuario "${username}"?`);
    } else {
        if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${username}"?`)) {
            performDelete(username);
        }
    }
}

function performDelete(username) {
    localStorage.removeItem(username);
    // If the deleted user happens to be the one logged in (unlikely in admin panel, but good practice)
    if (sessionStorage.getItem('currentUser') === username) {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('isAdmin');
        window.location.href = 'index.html';
    }

    // Refresh the list immediately
    loadUsers();

    // Optional: Show a small toast/alert that it was successful?
    // For now, the visual removal is enough feedback as requested.
}
