document.addEventListener('DOMContentLoaded', () => {
    const form        = document.getElementById('registro-form');
    const btnRegistrar = document.getElementById('btn-registrar');
    const btnLimpiar  = document.getElementById('btn-limpiar');
    const tabla       = document.querySelector('#tabla-registros tbody');
    const aviso       = document.getElementById('registro-control');
    const tabButtons  = document.querySelectorAll('.tab-button');
 
    function limpiarAviso() {
        aviso.textContent = 'Aquí aparecerán los huéspedes registrados recientemente.';
    }
 
    function agregarFilaTabla(values) {
        if (tabla.querySelector('tr td[colspan]')) {
            tabla.innerHTML = '';
        }
        const fila = document.createElement('tr');
        fila.className = 'hover:bg-slate-50';
        fila.innerHTML = `
            <td class="whitespace-nowrap px-4 py-3">${values.tipoDocumento.toUpperCase()} ${values.numeroDocumento}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.nombres}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.apellidos}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.edad}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.sexo}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.nacionalidad}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.ciudad}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.fechaIngreso}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.fechaSalida}</td>
            <td class="whitespace-nowrap px-4 py-3">${values.motivo_Viaje}</td>
        `;
        tabla.appendChild(fila);
    }
 
    btnRegistrar.addEventListener('click', async () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
 
        const data = {
            tipoDocumento:   form['tipo_documento'].value,
            numeroDocumento: form['numero_documento'].value.trim(),
            nombres:         form['nombres'].value.trim(),
            apellidos:       form['apellidos'].value.trim(),
            edad:            parseInt(form['edad'].value),
            fechaNacimiento: form['fecha_nacimiento'].value,
            sexo:            form['sexo'].value,
            nacionalidad:    form['nacionalidad'].value.trim(),
            ciudad:          form['ciudad'].value.trim(),
            fechaIngreso:    form['fecha_ingreso'].value,
            fechaSalida:     form['fecha_salida'].value,
            motivo_Viaje:    form['motivo_viaje'].value.trim(),
        };
 
        btnRegistrar.disabled = true;
        btnRegistrar.textContent = 'Guardando...';
 
        try {
            const res = await fetch('/api/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
 
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al guardar');
            }
 
            agregarFilaTabla(data);
            aviso.textContent = '✅ Registro guardado correctamente en la base de datos.';
            aviso.className = aviso.className.replace('text-slate-500', 'text-green-600');
 
        } catch (error) {
            aviso.textContent = `❌ Error: ${error.message}`;
            console.error(error);
        } finally {
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = 'Registrar';
        }
    });
 
    // Tabs de navegación
    function setActiveTab(button) {
        tabButtons.forEach((tab) => {
            tab.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
            tab.classList.add('text-slate-600');
        });
        button.classList.remove('text-slate-600');
        button.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    }
 
    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetPage = {
                'tab-login':    'login.html',
                'tab-registro': 'registro.html',
                'tab-reporte':  'reportes.html',
            }[button.id];
 
            if (targetPage) {
                window.location.href = targetPage;
                return;
            }
            setActiveTab(button);
        });
    });
 
    btnLimpiar.addEventListener('click', () => {
        form.reset();
        limpiarAviso();
    });
});