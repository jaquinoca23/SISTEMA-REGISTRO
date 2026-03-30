document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    const validUser = 'john';
    const validPassword = '73538479';

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (username === validUser && password === validPassword) {
            window.location.href = 'registro.html';
            return;
        }

        loginError.textContent = 'Usuario o contraseña incorrectos.';
        loginError.classList.remove('hidden');
        passwordInput.focus();
    });
});
