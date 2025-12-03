document.addEventListener('DOMContentLoaded', () => {
    
    const USER_KEY = 'users'; 
    const ACTIVE_USER_KEY = 'activeUserEmail';
    const CATALOG_KEY = 'productCatalog';

    // ==============================
    // 👑 ADMIN PREDEFINIDO
    // ==============================
    (function ensureDefaultAdmin() {
        let storedUsers = JSON.parse(localStorage.getItem(USER_KEY)) || [];

        const defaultAdmin = {
            id: 1,
            name: "Admin",
            email: "admin@vinilos.com",
            password: "admin123",
            isAdmin: true,
            purchases: []
        };

        const adminExists = storedUsers.some(user => user.email === defaultAdmin.email);

        if (!adminExists) {
            storedUsers.push(defaultAdmin);
            localStorage.setItem(USER_KEY, JSON.stringify(storedUsers));
            console.log("Administrador por defecto añadido.");
        }
    })();

    const currentUserEmail = localStorage.getItem(ACTIVE_USER_KEY);
    let allUsers = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    const currentUser = allUsers.find(user => user.email === currentUserEmail);

    if (!currentUserEmail || !currentUser) {
        alert("No hay sesión activa o el usuario no existe. Serás redirigido al inicio de sesión.");
        localStorage.removeItem(ACTIVE_USER_KEY);
        window.location.href = 'login.html';
        return;
    }

    if (!currentUser.isAdmin) {
        alert("Acceso denegado. Serás redirigido al inicio de sesión.");
        localStorage.removeItem(ACTIVE_USER_KEY);
        window.location.href = 'login.html';
        return;
    }

    function saveUsers() {
        const userIndex = allUsers.findIndex(user => user.email === currentUser.email);
        if (userIndex !== -1) {
            allUsers[userIndex] = currentUser;
            localStorage.setItem(USER_KEY, JSON.stringify(allUsers));
        }
    }

    function saveAllUsers() {
        localStorage.setItem(USER_KEY, JSON.stringify(allUsers));
    }

    function renderProfile() {
        const adminNameEl = document.getElementById('admin-name');
        const adminEmailEl = document.getElementById('admin-email');
        if (adminNameEl) adminNameEl.textContent = currentUser.name;
        if (adminEmailEl) adminEmailEl.textContent = currentUser.email;
    }

    const navButtons = document.querySelectorAll('.list-group-item-action');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetSectionId = e.target.getAttribute('data-section');

            navButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            contentSections.forEach(section => {
                if (section.id === targetSectionId) {
                    section.classList.remove('hidden');
                    section.style.display = 'block';
                } else {
                    section.classList.add('hidden');
                    section.style.display = 'none';
                }
            });

            if (targetSectionId === 'product-management') {
                loadProducts();
            } else if (targetSectionId === 'admin-management') {
                loadAdmins();
            }
        });
    });

    const defaultSection = document.getElementById('profile');
    if (defaultSection) {
        defaultSection.style.display = 'block';
        defaultSection.classList.remove('hidden');
        const defaultNavButton = document.querySelector('.list-group-item-action[data-section="profile"]');
        if (defaultNavButton) defaultNavButton.classList.add('active');
    }

    const editFormContainers = document.querySelectorAll('.edit-form-container');
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            editFormContainers.forEach(container => {
                if (container.id !== targetId.substring(1)) {
                    container.classList.add('hidden');
                }
            });
            document.querySelector(targetId).classList.toggle('hidden');
        });
    });

    document.getElementById('admin-name-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('newAdminName').value;
        if (newName) {
            currentUser.name = newName;
            saveUsers();
            renderProfile();
            alert("Nombre actualizado con éxito.");
            document.getElementById('form-edit-admin-name').classList.add('hidden');
        }
    });

    document.getElementById('admin-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('oldAdminPassword').value;
        const newPassword = document.getElementById('newAdminPassword').value;

        if (oldPassword !== currentUser.password) {
            alert("Contraseña anterior incorrecta.");
            return;
        }

        if (oldPassword === newPassword) {
            alert("La nueva contraseña debe ser diferente.");
            return;
        }

        currentUser.password = newPassword;
        saveUsers();
        alert("Contraseña cambiada con éxito.");
        document.getElementById('admin-password-form').reset();
        document.getElementById('form-edit-admin-password').classList.add('hidden');
    });

    function loadProducts() {
        const productList = document.getElementById('productList');
        let products = JSON.parse(localStorage.getItem(CATALOG_KEY)) || [];
        
        if (products.length === 0) {
            productList.innerHTML = `<p class="text-muted p-2">No hay productos en el catálogo.</p>`;
            return;
        }

        let html = '';
        products.forEach(p => {
            html += `<li class="list-group-item list-group-item-product">
                        <div>
                            <strong>${p.nombre}</strong> <span class="text-muted">(${p.artista})</span>
                            <br><small>$${p.precio.toFixed(2)}</small>
                        </div>
                        <button class="btn btn-danger btn-sm delete-product-btn" data-id="${p.id}" aria-label="Eliminar producto">
                            <i class="bi bi-trash"></i>
                        </button>
                    </li>`;
        });
        productList.innerHTML = html;
        attachProductDeleteListeners();
    }

    function addProduct(name, artist, price) {
        let products = JSON.parse(localStorage.getItem(CATALOG_KEY)) || [];
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1; 
        
        const newProduct = {
            id: newId,
            nombre: name,
            artista: artist,
            precio: parseFloat(price),
            imagen: "img/disco.png" 
        };
        
        products.push(newProduct);
        localStorage.setItem(CATALOG_KEY, JSON.stringify(products));
        loadProducts();
        alert(`Producto "${name}" añadido.`);
    }

    function deleteProduct(id) {
        if (!confirm("¿Está seguro de que desea eliminar este producto del catálogo?")) return;
        
        let products = JSON.parse(localStorage.getItem(CATALOG_KEY)) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem(CATALOG_KEY, JSON.stringify(products));
        loadProducts();
        alert("Producto eliminado del catálogo.");
    }

    function attachProductDeleteListeners() {
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const idToDelete = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteProduct(idToDelete);
            });
        });
    }

    document.getElementById('add-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const artist = document.getElementById('productArtist').value;
        const price = document.getElementById('productPrice').value;

        if (name && artist && !isNaN(price) && parseFloat(price) > 0) {
            addProduct(name, artist, price);
            document.getElementById('add-product-form').reset();
        } else {
            alert("Por favor, complete todos los campos correctamente.");
        }
    });
    
    function loadAdmins() {
        const adminList = document.getElementById('adminList');
        const admins = allUsers.filter(user => user.isAdmin);

        if (admins.length === 0) {
            adminList.innerHTML = `<p class="text-danger p-2">¡ATENCIÓN! No hay administradores activos.</p>`;
            return;
        }

        let html = '';
        admins.forEach(a => {
            const isCurrentUser = a.email === currentUserEmail;
            html += `<li class="list-group-item list-group-item-product ${isCurrentUser ? 'list-group-item-warning' : ''}">
                        <div>
                            <strong>${a.name}</strong> 
                            <span class="text-muted">(${a.email})</span>
                            ${isCurrentUser ? ' <span class="badge bg-dark">Tú</span>' : ''}
                        </div>
                        <button class="btn btn-danger btn-sm delete-admin-btn" data-email="${a.email}" ${isCurrentUser ? 'disabled' : ''} aria-label="Eliminar administrador">
                            <i class="bi bi-person-slash"></i>
                        </button>
                    </li>`;
        });
        adminList.innerHTML = html;
        attachAdminDeleteListeners();
    }

    function addAdmin(name, email, password) {
        const emailExists = allUsers.some(user => user.email === email);
        if (emailExists) {
            alert("Este correo ya está registrado como usuario o administrador.");
            return;
        }

        const newId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id || 0)) + 1 : 1; 

        const newAdmin = {
            id: newId,
            name: name,
            email: email,
            password: password,
            isAdmin: true,
            purchases: []
        };
        
        allUsers.push(newAdmin);
        saveAllUsers();
        loadAdmins();
        alert(`Administrador "${name}" añadido.`);
    }

    function deleteAdmin(email) {
        if (email === currentUserEmail) {
            alert("No puedes eliminar tu propia cuenta de administrador.");
            return;
        }
        if (!confirm(`¿Está seguro de que desea eliminar al administrador con correo: ${email}?`)) return;

        allUsers = allUsers.filter(user => user.email !== email);
        saveAllUsers();
        loadAdmins();
        alert("Administrador eliminado.");
    }

    function attachAdminDeleteListeners() {
        document.querySelectorAll('.delete-admin-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const emailToDelete = e.currentTarget.getAttribute('data-email');
                deleteAdmin(emailToDelete);
            });
        });
    }

    document.getElementById('add-admin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('adminNewName').value;
        const email = document.getElementById('adminNewEmail').value;
        const password = document.getElementById('adminNewPassword').value;

        if (name && email && password) {
            addAdmin(name, email, password);
            document.getElementById('add-admin-form').reset();
        } else {
            alert("Por favor, complete todos los campos para el nuevo administrador.");
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem(ACTIVE_USER_KEY);
        alert("Sesión cerrada. Serás redirigido al inicio de sesión.");
        window.location.href = 'login.html';
    });

    renderProfile();
    loadProducts(); 
    loadAdmins(); 
});
