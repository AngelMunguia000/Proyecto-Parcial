document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const userIcon = document.getElementById("userIcon");
    const userModal = document.getElementById("userModal");
    const closeModal = document.querySelector(".close");
    const toggleFormLink = document.getElementById("toggleFormLink");
    const modalTitle = document.getElementById("modalTitle");
    const authForm = document.getElementById("authForm");
    const message = document.getElementById("message");
    const toggleForm = document.getElementById("toggleForm");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const cartIcon = document.querySelector('.fa-basket-shopping');
    const messageModal = document.getElementById("messageModal");
    const messageText = document.getElementById("messageText");

    let isLogin = true;

    function showMessageModal(message) {
        messageText.textContent = message;
        messageModal.style.display = "block";
        const closeBtn = messageModal.querySelector('.close');
        closeBtn.addEventListener('click', () => messageModal.style.display = "none");
        setTimeout(() => messageModal.style.display = "none", 3000);
    }

    if (userIcon) {
        userIcon.addEventListener("click", () => {
            console.log("User icon clicked");
            userModal.style.display = "block";
        });
    } else {
        console.error("User icon not found");
    }

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            console.log("Close button clicked");
            userModal.style.display = "none";
        });
    } else {
        console.error("Close button not found");
    }

    if (userModal) {
        window.addEventListener("click", (event) => {
            if (event.target === userModal) {
                console.log("Clicked outside modal");
                userModal.style.display = "none";
            }
        });
    } else {
        console.error("User modal not found");
    }

    if (toggleFormLink) {
        toggleFormLink.addEventListener("click", () => {
            isLogin = !isLogin;
            if (isLogin) {
                modalTitle.textContent = "Iniciar Sesión";
                toggleForm.innerHTML = '¿No tienes cuenta? <span id="toggleFormLink">Regístrate aquí</span>';
            } else {
                modalTitle.textContent = "Registrar";
                toggleForm.innerHTML = '¿Ya tienes cuenta? <span id="toggleFormLink">Inicia sesión aquí</span>';
            }

            document.getElementById("toggleFormLink").addEventListener("click", () => {
                isLogin = !isLogin;
                if (isLogin) {
                    modalTitle.textContent = "Iniciar Sesión";
                    toggleForm.innerHTML = '¿No tienes cuenta? <span id="toggleFormLink">Regístrate aquí</span>';
                } else {
                    modalTitle.textContent = "Registrar";
                    toggleForm.innerHTML = '¿Ya tienes cuenta? <span id="toggleFormLink">Inicia sesión aquí</span>';
                }
            });
        });
    } else {
        console.error("Toggle form link not found");
    }

    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Form submitted");
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const endpoint = isLogin ? '/login' : '/register';

            fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.text().then(text => ({ status: response.status, text })))
            .then(({ status, text }) => {
                message.textContent = text;
                if (status === 200) {
                    userModal.style.display = "none";
                    if (isLogin) {
                        userNameDisplay.textContent = username;
                        localStorage.setItem('username', username); // Guarda el nombre de usuario en localStorage
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                message.textContent = 'Error: ' + error.message;
            });
        });
    } else {
        console.error("Auth form not found");
    }

    const addToCartButtons = document.querySelectorAll('.add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.card-product');
            const productId = productCard.dataset.productId;
            const productName = productCard.querySelector('h3').textContent;
            const productImage = productCard.querySelector('img').src;
            const price = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
            const username = userNameDisplay.textContent;

            if (!username) {
                message.textContent = 'Inicia sesión para añadir productos al carrito';
                userModal.style.display = 'block';
                return;
            }

            fetch('http://localhost:3000/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, productId, productName, productImage, price, quantity: 1 })
            })
            .then(response => response.text().then(text => ({ status: response.status, text })))
            .then(({ status, text }) => {
                showMessageModal('Producto añadido al carrito');
                if (status === 200) {
                    updateCartCount(username);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                message.textContent = 'Error: ' + error.message;
            });
        });
    });

    function updateCartCount(username) {
        fetch(`http://localhost:3000/cart/${username}`)
            .then(response => response.json())
            .then(cart => {
                const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
                document.querySelector('.content-shopping-cart .number').textContent = `(${cartCount})`;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    cartIcon.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
});
