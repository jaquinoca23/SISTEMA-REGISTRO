const SUPABASE_URL = 'https://vnaljolhwsuighaevntb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWxqb2xod3N1aWdoYWV2bnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MzY4MTksImV4cCI6MjA5MDQxMjgxOX0.JsoOAii0dHzSrl1qLar80StrBZO0FuXWLZbLbcZZ5yo';

document.addEventListener('DOMContentLoaded', () => {
    const form          = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError    = document.getElementById('login-error');
    const btnSubmit     = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario    = usernameInput.value.trim();
        const contrasena = passwordInput.value;

        if (!usuario || !contrasena) {
            loginError.textContent = 'Completa todos los campos.';
            loginError.classList.remove('hidden');
            return;
        }

        // Deshabilitar botón mientras carga
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Verificando...';
        loginError.classList.add('hidden');

        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/accesos?usuario=eq.${encodeURIComponent(usuario)}&contrasena=eq.${encodeURIComponent(contrasena)}&select=*`,
                {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.length > 0) {
                // Usuario encontrado — redirigir
                window.location.href = '/registro';
            } else {
                loginError.textContent = 'Usuario o contraseña incorrectos.';
                loginError.classList.remove('hidden');
                passwordInput.value = '';
                passwordInput.focus();
            }

        } catch (error) {
            loginError.textContent = 'Error de conexión. Intenta de nuevo.';
            loginError.classList.remove('hidden');
            console.error(error);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Iniciar sesión';
        }
    });
});