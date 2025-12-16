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
        list.innerHTML = '<tr><td colspan="2" class="no-users">No hay usuarios registrados aparte del Admin.</td></tr>';
    }
}

function renderUserRow(container, username) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = username;

    const tdAction = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';
    deleteBtn.onclick = () => deleteUser(username);

    tdAction.appendChild(deleteBtn);
    tr.appendChild(tdName);
    tr.appendChild(tdAction);

    container.appendChild(tr);
}

function deleteUser(username) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${username}"?`)) {
        localStorage.removeItem(username);
        alert('Usuario eliminado correctamente.');
        loadUsers(); // Refresh list
    }
}
