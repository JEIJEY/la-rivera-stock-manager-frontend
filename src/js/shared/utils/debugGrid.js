// js/utilities/debugGrid.js
// Debug grid overlay que replica EXACTAMENTE grid-template-columns/rows
// Crea celdas reales dentro de .debug-grid usando las variables CSS del :root

// Helper: lee variable CSS y retorna string (o fallback)
function readVar(name, fallback = "") {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

// Crear overlay y usar grid real
export function crearGrillaExacta() {
  const main = document.querySelector(".dashboard-main");
  if (!main) {
    console.warn("⚠️ crearGrillaExacta: no se encontró .dashboard-main");
    return null;
  }

  // Elimina cualquier overlay previo
  const existente = main.querySelector(".debug-grid");
  if (existente) existente.remove();

  // Crear overlay
  const grid = document.createElement("div");
  grid.className = "debug-grid";

  // Leer templates desde :root
  const cols = readVar("--dbg-template-columns", "1fr 1fr 1fr 1fr");
  const rows = readVar("--dbg-template-rows", "auto auto auto auto");

  // Aplica como estilos inline al overlay (esto replica exactamente el grid)
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = cols;
  grid.style.gridTemplateRows = rows;
  grid.style.gridGap = readVar("--dbg-grid-gap", "0px");

  // Añadir celdas (fantasma) para visualizar la estructura exacta
  const colCount = cols.split(/\s+/).length;
  const rowCount = rows.split(/\s+/).length;
  const total = colCount * rowCount;

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const cell = document.createElement("div");
      cell.className = "debug-cell";
      // atributo para numeración opcional: CxRy
      cell.dataset.coord = `C${c+1}R${r+1}`;
      grid.appendChild(cell);
    }
  }

  // Opcional: añadir numeración visible si la variable está activa
  const showNumbers = readVar("--dbg-show-numbers", "0") === "1";
  if (showNumbers) {
    Array.from(grid.children).forEach((cell) => {
      const label = document.createElement("div");
      label.className = "debug-cell__label";
      label.textContent = cell.dataset.coord;
      cell.appendChild(label);
    });
  }

  // Insertar overlay dentro de main. Asegurarse que overlay no afecte layout.
  // Lo añadimos como último hijo para que esté sobre el contenido.
  main.appendChild(grid);

  // Forzar repaint para evitar glitches al calcular tamaños
  void grid.offsetWidth;

  console.log(`✅ Grilla exacta creada: ${colCount}×${rowCount}`);
  return grid;
}

// Alternar visibilidad (si no existe, crea)
export function toggleGrilla() {
  const main = document.querySelector(".dashboard-main");
  if (!main) return console.warn("⚠️ No se encontró .dashboard-main");

  let grid = main.querySelector(".debug-grid");
  if (!grid) grid = crearGrillaExacta();

  // alterna clase visible (mejor que manipular display inline)
  grid.classList.toggle("debug-grid--visible");
  console.log(grid.classList.contains("debug-grid--visible") ? "🧩 Grilla ACTIVADA" : "🧱 Grilla DESACTIVADA");
}

// Observador: si cambian tamaños del contenedor, recrea grilla si está visible
let _resizeObserver;
export function observarRedimensionamiento() {
  const main = document.querySelector(".dashboard-main");
  if (!main) return;

  if (_resizeObserver) _resizeObserver.disconnect();

  _resizeObserver = new ResizeObserver(() => {
    const grid = main.querySelector(".debug-grid");
    if (!grid) return;
    if (!grid.classList.contains("debug-grid--visible")) return;
    // recrear para recalcular fr/auto
    grid.remove();
    crearGrillaExacta();
  });

  _resizeObserver.observe(main);
}
