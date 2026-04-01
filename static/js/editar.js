const SUPABASE_URL = 'https://vnaljolhwsuighaevntb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWxqb2xod3N1aWdoYWV2bnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MzY4MTksImV4cCI6MjA5MDQxMjgxOX0.JsoOAii0dHzSrl1qLar80StrBZO0FuXWLZbLbcZZ5yo';

let resultados = [];

// ── Toast ───────────────────────────────────────────────────────────────────────
function mostrarToast(mensaje, tipo = 'exito') {
    const colores = tipo === 'exito'
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white';

    const toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg ${colores} text-sm font-semibold transition-all duration-300 opacity-0 translate-y-2`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    // Aparecer
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');
    });

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Helpers ─────────────────────────────────────────────────────────────────────
function formatFecha(f) {
    if (!f) return '';
    return new Date(f).toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function resetBusqueda() {
    document.getElementById('input-buscar').value = '';
    document.getElementById('resultados-busqueda').classList.add('hidden');
    document.getElementById('tbody-busqueda').innerHTML = '';
    document.getElementById('msg-busqueda').classList.add('hidden');
    document.getElementById('modal-editar').classList.add('hidden');
    resultados = [];
}

function renderTabla() {
    const tbody     = document.getElementById('tbody-busqueda');
    const contenedor = document.getElementById('resultados-busqueda');

    if (!resultados.length) {
        contenedor.classList.add('hidden');
        return;
    }

    contenedor.classList.remove('hidden');
    tbody.innerHTML = resultados.map(item => `
        <tr class="hover:bg-slate-50 border-t border-slate-100">
            <td class="px-4 py-3 whitespace-nowrap">${item.tipo_documento ?? ''} ${item.numero_documento ?? ''}</td>
            <td class="px-4 py-3 whitespace-nowrap">${item.nombres ?? ''}</td>
            <td class="px-4 py-3 whitespace-nowrap">${item.apellidos ?? ''}</td>
            <td class="px-4 py-3 whitespace-nowrap">${item.ciudad ?? ''}</td>
            <td class="px-4 py-3 whitespace-nowrap">${formatFecha(item.fecha_ingreso)}</td>
            <td class="px-4 py-3 whitespace-nowrap flex gap-2">
                <button onclick="abrirEditar(${item.id})"
                    class="rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200 transition-colors">
                    ✏️ Editar
                </button>
                <button onclick="eliminar(${item.id}, '${item.nombres} ${item.apellidos}')"
                    class="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors">
                    🗑️ Eliminar
                </button>
            </td>
        </tr>`).join('');
}

// ── Buscar ───────────────────────────────────────────────────────────────────────
async function buscar() {
    const termino = document.getElementById('input-buscar').value.trim();
    if (!termino) return;

    const msg = document.getElementById('msg-busqueda');
    msg.textContent = 'Buscando...';
    msg.classList.remove('hidden');
    document.getElementById('resultados-busqueda').classList.add('hidden');
    document.getElementById('modal-editar').classList.add('hidden');

    try {
        const url = `${SUPABASE_URL}/rest/v1/huespedes?select=*&or=(nombres.ilike.*${encodeURIComponent(termino)}*,apellidos.ilike.*${encodeURIComponent(termino)}*)&order=nombres.asc`;
        const res = await fetch(url, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();

        if (!data.length) {
            msg.textContent = 'No se encontraron registros con ese nombre.';
            return;
        }

        msg.classList.add('hidden');
        resultados = data;
        renderTabla();

    } catch (err) {
        msg.textContent = `❌ Error: ${err.message}`;
    }
}

// ── Editar ───────────────────────────────────────────────────────────────────────
window.abrirEditar = function(id) {
    const item = resultados.find(r => r.id === id);
    if (!item) return;

    document.getElementById('edit-id').value               = item.id;
    document.getElementById('edit-tipo_documento').value   = item.tipo_documento ?? 'dni';
    document.getElementById('edit-numero_documento').value = item.numero_documento ?? '';
    document.getElementById('edit-nombres').value          = item.nombres ?? '';
    document.getElementById('edit-apellidos').value        = item.apellidos ?? '';
    document.getElementById('edit-edad').value             = item.edad ?? '';
    document.getElementById('edit-fecha_nacimiento').value = item.fecha_nacimiento ?? '';
    document.getElementById('edit-sexo').value             = item.sexo ?? 'masculino';
    document.getElementById('edit-nacionalidad').value     = item.nacionalidad ?? '';
    document.getElementById('edit-ciudad').value           = item.ciudad ?? '';
    document.getElementById('edit-fecha_ingreso').value    = item.fecha_ingreso ?? '';
    document.getElementById('edit-fecha_salida').value     = item.fecha_salida ?? '';
    document.getElementById('edit-motivo_viaje').value     = item.motivo_viaje ?? '';

    document.getElementById('subtitle-editar').textContent = `${item.nombres} ${item.apellidos}`;
    document.getElementById('msg-editar').classList.add('hidden');
    document.getElementById('modal-editar').classList.remove('hidden');
    document.getElementById('modal-editar').scrollIntoView({ behavior: 'smooth' });
};

// ── Eliminar ─────────────────────────────────────────────────────────────────────
window.eliminar = async function(id, nombre) {
    if (!confirm(`¿Seguro que deseas eliminar el registro de "${nombre}"?\nEsta acción no se puede deshacer.`)) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/huespedes?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });

        if (!res.ok) throw new Error('Error al eliminar');

        resultados = resultados.filter(r => r.id !== id);
        document.getElementById('modal-editar').classList.add('hidden');
        document.getElementById('msg-busqueda').classList.add('hidden');
        renderTabla();

        mostrarToast(`🗑️ Registro de "${nombre}" eliminado correctamente.`, 'exito');

    } catch (err) {
        mostrarToast(`❌ Error al eliminar: ${err.message}`, 'error');
    }
};

// ── DOMContentLoaded ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const inputBuscar      = document.getElementById('input-buscar');
    const btnBuscar        = document.getElementById('btn-buscar');
    const btnLimpiarBuscar = document.getElementById('btn-limpiar-buscar');
    const btnCancelar      = document.getElementById('btn-cancelar-editar');
    const btnGuardar       = document.getElementById('btn-guardar-editar');
    const msgEditar        = document.getElementById('msg-editar');

    btnBuscar.addEventListener('click', buscar);
    inputBuscar.addEventListener('keydown', (e) => { if (e.key === 'Enter') buscar(); });
    btnLimpiarBuscar.addEventListener('click', resetBusqueda);
    btnCancelar.addEventListener('click', () => document.getElementById('modal-editar').classList.add('hidden'));

    btnGuardar.addEventListener('click', async () => {
        const id = document.getElementById('edit-id').value;
        const data = {
            tipo_documento:   document.getElementById('edit-tipo_documento').value,
            numero_documento: document.getElementById('edit-numero_documento').value.trim(),
            nombres:          document.getElementById('edit-nombres').value.trim(),
            apellidos:        document.getElementById('edit-apellidos').value.trim(),
            edad:             parseInt(document.getElementById('edit-edad').value),
            fecha_nacimiento: document.getElementById('edit-fecha_nacimiento').value || null,
            sexo:             document.getElementById('edit-sexo').value,
            nacionalidad:     document.getElementById('edit-nacionalidad').value.trim(),
            ciudad:           document.getElementById('edit-ciudad').value.trim(),
            fecha_ingreso:    document.getElementById('edit-fecha_ingreso').value || null,
            fecha_salida:     document.getElementById('edit-fecha_salida').value || null,
            motivo_viaje:     document.getElementById('edit-motivo_viaje').value.trim(),
        };

        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';
        msgEditar.classList.add('hidden');

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/huespedes?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Error al actualizar'); }

            resultados = resultados.map(r => r.id == id ? { ...r, ...data } : r);
            renderTabla();
            document.getElementById('modal-editar').classList.add('hidden');
            mostrarToast('✅ Registro actualizado correctamente.', 'exito');

        } catch (err) {
            msgEditar.textContent = `❌ Error: ${err.message}`;
            msgEditar.className = 'mt-3 text-sm text-red-600';
            msgEditar.classList.remove('hidden');
            mostrarToast(`❌ Error: ${err.message}`, 'error');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar cambios';
        }
    });
});