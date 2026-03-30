function formateaFecha(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-PE', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
}
 
function mostrarResultados(datos) {
    const cuerpo  = document.getElementById('reportes-body');
    const cantidad = document.getElementById('resultado-cantidad');
 
    if (!datos.length) {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="10" class="px-4 py-10 text-center text-sm text-slate-500">
                    No se encontraron registros para los filtros aplicados.
                </td>
            </tr>
        `;
        cantidad.textContent = 'Mostrando 0 registros';
        return;
    }
 
    cantidad.textContent = `Mostrando ${datos.length} registro${datos.length === 1 ? '' : 's'}`;
    cuerpo.innerHTML = datos.map((item) => `
        <tr class="hover:bg-slate-50 border-t border-slate-100">
            <td class="whitespace-nowrap px-4 py-3">${item.tipo_documento ?? ''} ${item.numero_documento ?? ''}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.nombres ?? ''}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.apellidos ?? ''}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.edad ?? ''}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.sexo ?? ''}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.nacionalidad ?? ''}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.ciudad ?? ''}</td>
            <td class="whitespace-nowrap px-4 py-3">${formateaFecha(item.fecha_ingreso)}</td>
            <td class="whitespace-nowrap px-4 py-3">${formateaFecha(item.fecha_salida)}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.motivo_viaje ?? ''}</td>
        </tr>
    `).join('');
}
 
function mostrarCargando() {
    const cuerpo = document.getElementById('reportes-body');
    cuerpo.innerHTML = `
        <tr>
            <td colspan="10" class="px-4 py-10 text-center text-sm text-slate-400">
                Cargando registros...
            </td>
        </tr>
    `;
}
 
async function fetchReportes(params = {}) {
    mostrarCargando();
    const query = new URLSearchParams(params).toString();
    const url   = `/api/reportes${query ? '?' + query : ''}`;
 
    try {
        const res  = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener datos');
        mostrarResultados(data);
    } catch (error) {
        const cuerpo = document.getElementById('reportes-body');
        cuerpo.innerHTML = `
            <tr>
                <td colspan="10" class="px-4 py-10 text-center text-sm text-red-500">
                    ❌ Error: ${error.message}
                </td>
            </tr>
        `;
        document.getElementById('resultado-cantidad').textContent = 'Error al cargar';
    }
}
 
window.addEventListener('DOMContentLoaded', () => {
    const btnFiltrar    = document.getElementById('btn-filtrar');
    const btnLimpiar    = document.getElementById('btn-limpiar');
    const fechaDesde    = document.getElementById('fecha-desde');
    const fechaHasta    = document.getElementById('fecha-hasta');
 
    const btnFiltrarDNI = document.getElementById('btn-filtrar-dni');
    const btnLimpiarDNI = document.getElementById('btn-limpiar-dni');
    const inputDNI      = document.getElementById('dni');
 
    // Solo números en el campo DNI
    inputDNI.addEventListener('input', () => {
        inputDNI.value = inputDNI.value.replace(/\D/g, '');
    });
 
    // Carga inicial — todos los registros
    fetchReportes();
 
    // Filtro por fechas
    btnFiltrar.addEventListener('click', () => {
        const params = {};
        if (fechaDesde.value) params.desde = fechaDesde.value;
        if (fechaHasta.value) params.hasta = fechaHasta.value;
        fetchReportes(params);
    });
 
    btnLimpiar.addEventListener('click', () => {
        fechaDesde.value = '';
        fechaHasta.value = '';
        fetchReportes();
    });
 
    // Filtro por DNI
    btnFiltrarDNI.addEventListener('click', () => {
        if (inputDNI.value.trim()) {
            fetchReportes({ dni: inputDNI.value.trim() });
        }
    });
 
    inputDNI.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && inputDNI.value.trim()) {
            fetchReportes({ dni: inputDNI.value.trim() });
        }
    });
 
    btnLimpiarDNI.addEventListener('click', () => {
        inputDNI.value = '';
        fetchReportes();
    });
});