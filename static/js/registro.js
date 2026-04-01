const SUPABASE_URL = 'https://vnaljolhwsuighaevntb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWxqb2xod3N1aWdoYWV2bnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MzY4MTksImV4cCI6MjA5MDQxMjgxOX0.JsoOAii0dHzSrl1qLar80StrBZO0FuXWLZbLbcZZ5yo';

document.addEventListener('DOMContentLoaded', () => {
    const form         = document.getElementById('registro-form');
    const btnRegistrar = document.getElementById('btn-registrar');
    const btnLimpiar   = document.getElementById('btn-limpiar');
    const tabla        = document.querySelector('#tabla-registros tbody');
    const aviso        = document.getElementById('registro-control');

    function limpiarAviso() {
        aviso.textContent = 'Aquí aparecerán los huéspedes registrados recientemente.';
        aviso.className = aviso.className.replace('text-green-600', 'text-slate-700');
    }

    function agregarFilaTabla(values) {
        if (tabla.querySelector('tr td[colspan]')) {
            tabla.innerHTML = '';
        }
        const fila = document.createElement('tr');
        fila.className = 'hover:bg-slate-50';
        fila.innerHTML = `
            <td class="whitespace-nowrap px-4 py-3">${values.tipo_documento.toUpperCase()} ${values.numero_documento}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.nombres}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.apellidos}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.edad}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.sexo}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.nacionalidad}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.ciudad}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.fecha_ingreso}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.fecha_salida}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.motivo_viaje}</td>
        `;
        tabla.appendChild(fila);
    }

    btnRegistrar.addEventListener('click', async () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = {
            tipo_documento:   form['tipo_documento'].value,
            numero_documento: form['numero_documento'].value.trim(),
            nombres:          form['nombres'].value.trim(),
            apellidos:        form['apellidos'].value.trim(),
            edad:             parseInt(form['edad'].value),
            fecha_nacimiento: form['fecha_nacimiento'].value || null,
            sexo:             form['sexo'].value,
            nacionalidad:     form['nacionalidad'].value.trim(),
            ciudad:           form['ciudad'].value.trim(),
            fecha_ingreso:    form['fecha_ingreso'].value || null,
            fecha_salida:     form['fecha_salida'].value || null,
            motivo_viaje:     form['motivo_viaje'].value.trim(),
        };

        btnRegistrar.disabled = true;
        btnRegistrar.textContent = 'Guardando...';
        limpiarAviso();

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/huespedes`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al guardar');
            }

            agregarFilaTabla(data);
            aviso.textContent = '✅ Registro guardado correctamente en Supabase.';
            aviso.classList.add('text-green-600');
            form.reset();

        } catch (error) {
            aviso.textContent = `❌ Error: ${error.message}`;
            console.error(error);
        } finally {
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = 'Registrar';
        }
    });

    btnLimpiar.addEventListener('click', () => {
        form.reset();
        limpiarAviso();
    });
});