const SUPABASE_URL = "https://vnaljolhwsuighaevntb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWxqb2xod3N1aWdoYWV2bnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MzY4MTksImV4cCI6MjA5MDQxMjgxOX0.JsoOAii0dHzSrl1qLar80StrBZO0FuXWLZbLbcZZ5yo";

let datosActuales = [];
let filtroActual  = {};

function formateaFecha(fecha) {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString("es-PE", {
        year: "numeric", month: "2-digit", day: "2-digit",
    });
}

function resetTabla() {
    document.getElementById("reportes-body").innerHTML = `
        <tr>
            <td colspan="10" class="px-4 py-10 text-center text-sm text-slate-500">
                Utiliza el filtro para ver los registros.
            </td>
        </tr>`;
    document.getElementById("resultado-cantidad").textContent = "Mostrando 0 registros";
    document.getElementById("btn-generar-pdf").classList.add("hidden");
    datosActuales = [];
}

function mostrarResultados(datos) {
    const cuerpo   = document.getElementById("reportes-body");
    const cantidad = document.getElementById("resultado-cantidad");
    const btnPDF   = document.getElementById("btn-generar-pdf");

    datosActuales = datos;

    if (!datos.length) {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="10" class="px-4 py-10 text-center text-sm text-slate-500">
                    No se encontraron registros para los filtros aplicados.
                </td>
            </tr>`;
        cantidad.textContent = "Mostrando 0 registros";
        btnPDF.classList.add("hidden");
        return;
    }

    cantidad.textContent = `Mostrando ${datos.length} registro${datos.length === 1 ? "" : "s"}`;
    btnPDF.classList.remove("hidden");

    cuerpo.innerHTML = datos.map((item) => `
        <tr class="hover:bg-slate-50 border-t border-slate-100">
            <td class="whitespace-nowrap px-4 py-3">${item.tipo_documento ?? ""} ${item.numero_documento ?? ""}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.nombres ?? ""}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.apellidos ?? ""}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.edad ?? ""}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.sexo ?? ""}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.nacionalidad ?? ""}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.ciudad ?? ""}</td>
            <td class="whitespace-nowrap px-4 py-3">${formateaFecha(item.fecha_ingreso)}</td>
            <td class="whitespace-nowrap px-4 py-3">${formateaFecha(item.fecha_salida)}</td>
            <td class="whitespace-nowrap px-4 py-3">${item.motivo_viaje ?? ""}</td>
        </tr>`).join("");
}

function mostrarCargando() {
    document.getElementById("reportes-body").innerHTML = `
        <tr>
            <td colspan="10" class="px-4 py-10 text-center text-sm text-slate-400">
                Cargando registros...
            </td>
        </tr>`;
    document.getElementById("btn-generar-pdf").classList.add("hidden");
}

function mostrarError(msg) {
    document.getElementById("reportes-body").innerHTML = `
        <tr>
            <td colspan="10" class="px-4 py-10 text-center text-sm text-red-500">
                ❌ ${msg}
            </td>
        </tr>`;
    document.getElementById("resultado-cantidad").textContent = "Error al cargar";
    document.getElementById("btn-generar-pdf").classList.add("hidden");
}

async function fetchReportes({ desde = "", hasta = "", dni = "" } = {}) {
    mostrarCargando();
    filtroActual = { desde, hasta, dni };

    try {
        let url = `${SUPABASE_URL}/rest/v1/huespedes?select=*&order=fecha_ingreso.desc`;
        if (dni) {
            url += `&numero_documento=eq.${encodeURIComponent(dni)}`;
        } else {
            if (desde) url += `&fecha_ingreso=gte.${desde}`;
            if (hasta) url += `&fecha_ingreso=lte.${hasta}`;
        }

        const res = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Error al obtener datos de Supabase");
        const data = await res.json();
        mostrarResultados(data);

    } catch (error) {
        mostrarError(error.message);
        console.error(error);
    }
}

function generarPDF() {
    if (!datosActuales.length) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Título
    const hoy = new Date().toLocaleDateString("es-PE");
    let titulo = "Reporte de Huéspedes";
    if (filtroActual.dni) {
        titulo += ` — DNI: ${filtroActual.dni}`;
    } else if (filtroActual.desde || filtroActual.hasta) {
        titulo += ` — Del ${filtroActual.desde ? formateaFecha(filtroActual.desde) : "inicio"} al ${filtroActual.hasta ? formateaFecha(filtroActual.hasta) : "hoy"}`;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado el ${hoy} · Total: ${datosActuales.length} registro(s)`, 14, 23);

    // Tabla
    const columnas = [
        "Documento", "Nombres", "Apellidos", "Edad",
        "Sexo", "Nacionalidad", "Ciudad",
        "Ingreso", "Salida", "Motivo del viaje"
    ];

    const filas = datosActuales.map((item) => [
        `${item.tipo_documento ?? ""} ${item.numero_documento ?? ""}`.trim(),
        item.nombres ?? "",
        item.apellidos ?? "",
        item.edad ?? "",
        item.sexo ?? "",
        item.nacionalidad ?? "",
        item.ciudad ?? "",
        formateaFecha(item.fecha_ingreso),
        formateaFecha(item.fecha_salida),
        item.motivo_viaje ?? "",
    ]);

    doc.autoTable({
        head: [columnas],
        body: filas,
        startY: 28,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [2, 132, 199], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [240, 249, 255] },
        margin: { left: 14, right: 14 },
    });

    // Nombre del archivo
    const fecha = new Date().toISOString().slice(0, 10);
    doc.save(`reporte-huespedes-${fecha}.pdf`);
}

window.addEventListener("DOMContentLoaded", () => {
    const btnFiltrar    = document.getElementById("btn-filtrar");
    const btnLimpiar    = document.getElementById("btn-limpiar");
    const fechaDesde    = document.getElementById("fecha-desde");
    const fechaHasta    = document.getElementById("fecha-hasta");
    const btnFiltrarDNI = document.getElementById("btn-filtrar-dni");
    const btnLimpiarDNI = document.getElementById("btn-limpiar-dni");
    const inputDNI      = document.getElementById("dni");
    const btnPDF        = document.getElementById("btn-generar-pdf");

    inputDNI.addEventListener("input", () => {
        inputDNI.value = inputDNI.value.replace(/\D/g, "");
    });

    resetTabla();

    btnFiltrar.addEventListener("click", () => {
        fetchReportes({ desde: fechaDesde.value, hasta: fechaHasta.value });
    });

    btnLimpiar.addEventListener("click", () => {
        fechaDesde.value = "";
        fechaHasta.value = "";
        resetTabla();
    });

    btnFiltrarDNI.addEventListener("click", () => {
        if (inputDNI.value.trim()) fetchReportes({ dni: inputDNI.value.trim() });
    });

    inputDNI.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && inputDNI.value.trim()) fetchReportes({ dni: inputDNI.value.trim() });
    });

    btnLimpiarDNI.addEventListener("click", () => {
        inputDNI.value = "";
        resetTabla();
    });

    btnPDF.addEventListener("click", generarPDF);
});