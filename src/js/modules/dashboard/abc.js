// ======================================================
// ⚙️ FRONTEND ABC - Conexión con backend
// ======================================================
const API_BASE = "http://localhost:3001/api";

// ======================================================
// 🚀 Inicialización automática del módulo ABC
// ======================================================
// ❌ ELIMINAR ESTO:
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("📊 Módulo ABC cargado correctamente");
//   cargarDatosABC();
// });

// ✅ REEMPLAZAR CON ESTO:
console.log("📊 Módulo ABC cargado correctamente");
cargarDatosABC();

// ======================================================
// 🔹 Función para cargar datos del reporte ABC
// ======================================================
async function cargarDatosABC() {
  try {
    const response = await fetch(`${API_BASE}/abc/reporte`);
    const result = await response.json();

    if (result.success) {
      actualizarVistaABC(result);
    } else {
      console.warn("⚠️ Error en respuesta del servidor", result);
    }
  } catch (error) {
    console.error("❌ Error cargando ABC:", error);
  }
}

// ======================================================
// 🔹 Función para actualizar los datos visuales del panel
// ======================================================
function actualizarVistaABC(data) {
  // 🔸 Actualizar contadores
  document.getElementById("count-A").textContent = data.stats.A;
  document.getElementById("count-B").textContent = data.stats.B;
  document.getElementById("count-C").textContent = data.stats.C;

  // 🔸 Calcular porcentajes (según total)
  const porcentajeA = Math.round((data.stats.A / data.stats.total) * 100);
  const porcentajeB = Math.round((data.stats.B / data.stats.total) * 100);
  const porcentajeC = Math.round((data.stats.C / data.stats.total) * 100);

  // 🔸 Subtítulos con porcentajes
  document.querySelector(".invp-abc-card--A .invp-abc-card__subtitle").textContent =
    `${porcentajeA}% del total`;
  document.querySelector(".invp-abc-card--B .invp-abc-card__subtitle").textContent =
    `${porcentajeB}% del total`;
  document.querySelector(".invp-abc-card--C .invp-abc-card__subtitle").textContent =
    `${porcentajeC}% del total`;

  // 🔸 Barras visuales
  document.querySelector(".invp-abc-card--A .fill").style.width = `${porcentajeA}%`;
  document.querySelector(".invp-abc-card--B .fill").style.width = `${porcentajeB}%`;
  document.querySelector(".invp-abc-card--C .fill").style.width = `${porcentajeC}%`;
}

// ======================================================
// 🔄 Función para recalcular ABC
// ======================================================
async function recalcularABC(event) {
  try {
    const btn = event?.target || document.querySelector(".invp-abc-block__refresh");
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Calculando...";
    btn.disabled = true;

    const response = await fetch(`${API_BASE}/abc/recalcular`, { method: "POST" });
    const result = await response.json();

    if (result.success) {
      alert("✅ ABC actualizado correctamente");
      cargarDatosABC(); // Recarga los datos
    } else {
      alert("⚠️ " + (result.message || result.error));
    }
  } catch (error) {
    alert("❌ Error de conexión con el servidor");
    console.error(error);
  } finally {
    const btn = document.querySelector(".invp-abc-block__refresh");
    if (btn) {
      btn.innerHTML = "🔄 Actualizar ABC";
      btn.disabled = false;
    }
  }
}

// ======================================================
// 🧭 Filtrar productos por clase
// ======================================================
function filtrarProductos(clase) {
  console.log(`🔍 Filtrando productos clase ${clase}`);
  // Redirección simulada (puedes cambiarla por tu vista real)
  window.location.href = `productos.html?filtro=${clase}`;
}

// ======================================================
// 🌐 Exportar globalmente para HTML
// ======================================================
window.recalcularABC = recalcularABC;
window.filtrarProductos = filtrarProductos;
window.cargarDatosABC = cargarDatosABC;