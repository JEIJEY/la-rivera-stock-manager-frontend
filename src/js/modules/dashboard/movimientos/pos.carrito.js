/**
 * pos.carrito.js — Carrito POS para salidas múltiples
 *
 * Estado: array de { id_producto, nombre, stock, cantidad }
 * Cada id_producto aparece una sola vez.
 * Escanear el mismo producto dos veces incrementa su cantidad.
 *
 * Uso:
 *   const carrito = crearCarrito({ bodyEl, vacioEl, totalEl, onCambio });
 *   carrito.agregar(producto);   // { id_producto, nombre, stock, ... }
 *   carrito.getItems();          // copia del estado actual
 *   carrito.limpiar();
 */

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Edita cantidad con prompt nativo — funciona sin conflictos en móvil */
function abrirEditorCantidad(item, onConfirm) {
  const input = prompt(`Cantidad para "${item.nombre}"\n(Stock disponible: ${item.stock})`, "");
  if (input === null) return; // usuario canceló
  const val = parseFloat(input);
  if (!isNaN(val) && val > 0) {
    onConfirm(Math.min(item.stock, +val.toFixed(2)));
  }
}

export function crearCarrito({ bodyEl, vacioEl, totalEl, onCambio }) {
  let items = []; // [{ id_producto, nombre, stock, cantidad }]

  // ── Helpers ───────────────────────────────────────────────────────────

  function actualizarTotal() {
    if (!totalEl) return;
    totalEl.textContent = items.length === 0
      ? "0 productos en el carrito"
      : `${items.length} producto(s) · ${items.reduce((s, i) => s + i.cantidad, 0).toFixed(2)} unidades`;
  }

  // ── Render completo (solo al agregar / quitar / limpiar) ──────────────

  function render() {
    bodyEl.innerHTML = "";

    items.forEach((item) => {
      const tr = document.createElement("tr");
      if (item.cantidad > item.stock) tr.classList.add("pos-fila--sin-stock");

      tr.dataset.id = item.id_producto;
      tr.innerHTML = `
        <td>${escapeHtml(item.nombre)}</td>
        <td class="num">${item.stock}</td>
        <td class="num">
          <div class="pos-qty-control">
            <button type="button" class="pos-qty-control__btn pos-decr" aria-label="Restar">−</button>
            <button type="button" class="pos-qty-control__display pos-qty-display" title="Tocar para editar">${item.cantidad}</button>
            <button type="button" class="pos-qty-control__btn pos-incr" aria-label="Sumar">+</button>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn--ghost btn--sm pos-quitar" aria-label="Quitar">✕</button>
        </td>
      `;

      // Eventos de la fila
      tr.querySelector(".pos-decr").addEventListener("click", (e) => {
        e.stopPropagation();
        setCantidad(item.id_producto, Math.max(0.01, +(item.cantidad - 1).toFixed(2)));
      });
      tr.querySelector(".pos-incr").addEventListener("click", (e) => {
        e.stopPropagation();
        setCantidad(item.id_producto, Math.min(item.stock, +(item.cantidad + 1).toFixed(2)));
      });
      // Tocar la cantidad abre prompt nativo para editar
      tr.querySelector(".pos-qty-display").addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        abrirEditorCantidad(item, (nueva) => setCantidad(item.id_producto, nueva));
      });
      tr.querySelector(".pos-quitar").addEventListener("click", () => {
        quitar(item.id_producto);
      });

      bodyEl.appendChild(tr);
    });

    // Mostrar/ocultar mensaje vacío
    if (vacioEl) vacioEl.hidden = items.length > 0;

    actualizarTotal();
    onCambio([...items]);
  }

  // ── Mutaciones ────────────────────────────────────────────────────────

  function agregar(producto) {
    const existente = items.find((i) => i.id_producto === producto.id_producto);
    if (existente) {
      // Incrementa cantidad sin superar el stock
      existente.cantidad = Math.min(
        existente.stock,
        +(existente.cantidad + 1).toFixed(2)
      );
    } else {
      items.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        stock: Number(producto.stock ?? 0),
        cantidad: 1,
      });
    }
    render();
  }

  function quitar(id_producto) {
    items = items.filter((i) => i.id_producto !== id_producto);
    render();
  }

  function setCantidad(id_producto, cantidad) {
    const item = items.find((i) => i.id_producto === id_producto);
    if (!item) return;
    item.cantidad = cantidad;

    // Actualizar solo los nodos afectados — sin reconstruir la tabla
    const tr = bodyEl.querySelector(`tr[data-id="${id_producto}"]`);
    if (tr) {
      const display = tr.querySelector(".pos-qty-display");
      if (display) display.textContent = cantidad;
      tr.classList.toggle("pos-fila--sin-stock", cantidad > item.stock);
    }
    actualizarTotal();
    onCambio([...items]);
  }

  function limpiar() {
    items = [];
    render();
  }

  function getItems() {
    return [...items];
  }

  // Render inicial
  render();

  return { agregar, quitar, setCantidad, limpiar, getItems };
}
