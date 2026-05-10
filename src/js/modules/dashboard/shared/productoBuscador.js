/**
 * productoBuscador.js — Autocomplete reutilizable para elegir productos.
 *
 * Reemplaza un <select> con cientos/miles de productos por un input
 * con dropdown de coincidencias en vivo (filtrado en memoria).
 *
 * Uso:
 *   import { crearBuscadorProducto } from "../shared/productoBuscador.js";
 *
 *   const buscador = crearBuscadorProducto({
 *     contenedor: document.getElementById("buscadorEntrada"),
 *     productos: arrayProductos,
 *     placeholder: "Buscar producto…",
 *     nombreCampo: "id_producto",   // name del hidden input para FormData
 *     conStock: true,
 *     onCambio: (prod) => { ... },
 *   });
 *
 *   buscador.setProductos(nuevoArray);
 *   buscador.setValor(idProducto | null);
 *   buscador.getValor();      // -> id_producto | null
 *   buscador.getProducto();   // -> objeto producto completo | null
 *   buscador.limpiar();
 *   buscador.focus();
 *
 * Diseño:
 * - El DOM es la fuente de verdad (hidden input + dropdown.hidden).
 * - Idempotente: si el contenedor ya tiene la campana montada, retorna
 *   la instancia existente (no duplica listeners).
 * - Sin librerías externas. Vanilla JS.
 */

const MAX_RESULTADOS = 30;

/** Normaliza string: lowercase, sin acentos, sin espacios extra */
function normalizar(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diacríticos (acentos, tildes)
    .toLowerCase()
    .trim();
}

/** Resalta las ocurrencias de `query` dentro de `texto` con un <mark>. */
function resaltar(texto, query) {
  const t = String(texto ?? "");
  if (!query) return escapeHtml(t);
  const qN = normalizar(query);
  const tN = normalizar(t);
  const idx = tN.indexOf(qN);
  if (idx < 0) return escapeHtml(t);
  // Devolver texto original con la sección coincidente envuelta en <mark>
  return (
    escapeHtml(t.substring(0, idx)) +
    "<mark>" + escapeHtml(t.substring(idx, idx + query.length)) + "</mark>" +
    escapeHtml(t.substring(idx + query.length))
  );
}

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Filtra productos por nombre o código de barras y los ordena:
 * 1) Empieza con la query   2) Contiene la query   3) Match por código
 */
function filtrarYOrdenar(productos, query) {
  const q = normalizar(query);
  if (!q) return productos.slice(0, MAX_RESULTADOS);

  const empieza = [];
  const contiene = [];
  const porCodigo = [];

  for (const p of productos) {
    const nombre = normalizar(p.nombre);
    const codigo = String(p.codigo_barras ?? "");
    if (nombre.startsWith(q)) empieza.push(p);
    else if (nombre.includes(q)) contiene.push(p);
    else if (codigo && codigo.includes(q)) porCodigo.push(p);
  }
  return [...empieza, ...contiene, ...porCodigo].slice(0, MAX_RESULTADOS);
}

export function crearBuscadorProducto({
  contenedor,
  productos = [],
  placeholder = "Buscar producto…",
  nombreCampo = "id_producto",
  conStock = true,
  onCambio = null,
} = {}) {
  if (!contenedor) throw new Error("crearBuscadorProducto: contenedor requerido");

  // Idempotencia: si ya está montado en este contenedor, devolver la instancia.
  if (contenedor._pbInstance) return contenedor._pbInstance;

  // ── Estado ───────────────────────────────────────────────────────────
  let lista = Array.isArray(productos) ? productos.slice() : [];
  let productoSeleccionado = null;
  let resultadosActuales = [];
  let indiceHighlight = -1;

  // ── DOM ──────────────────────────────────────────────────────────────
  contenedor.classList.add("pb-buscador");
  contenedor.innerHTML = `
    <div class="pb-buscador__campo">
      <svg class="pb-buscador__lupa" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" class="pb-buscador__input db-campo__control"
             placeholder="${escapeHtml(placeholder)}"
             autocomplete="off" spellcheck="false"
             inputmode="search" />
      <button type="button" class="pb-buscador__limpiar" hidden aria-label="Limpiar selección">✕</button>
      <input type="hidden" class="pb-buscador__valor" name="${escapeHtml(nombreCampo)}" />
    </div>
    <ul class="pb-buscador__resultados" hidden role="listbox"></ul>
  `;

  const input = contenedor.querySelector(".pb-buscador__input");
  const btnLimpiar = contenedor.querySelector(".pb-buscador__limpiar");
  const valorOculto = contenedor.querySelector(".pb-buscador__valor");
  const resultados = contenedor.querySelector(".pb-buscador__resultados");

  // ── Helpers ──────────────────────────────────────────────────────────
  function dropdownAbierto() {
    return !resultados.hidden;
  }

  function abrirDropdown() {
    if (dropdownAbierto()) return;
    resultados.hidden = false;
    setTimeout(() => {
      if (dropdownAbierto()) {
        document.addEventListener("click", onClickFuera);
        document.addEventListener("keydown", onKeyEscape);
      }
    }, 0);
  }

  function cerrarDropdown() {
    resultados.hidden = true;
    indiceHighlight = -1;
    document.removeEventListener("click", onClickFuera);
    document.removeEventListener("keydown", onKeyEscape);
  }

  function onClickFuera(e) {
    if (!dropdownAbierto()) return;
    if (contenedor.contains(e.target)) return;
    cerrarDropdown();
  }

  function onKeyEscape(e) {
    if (e.key === "Escape") cerrarDropdown();
  }

  /** Query actual usado para resaltar coincidencias en los resultados */
  let queryActual = "";

  function renderResultados() {
    if (resultadosActuales.length === 0) {
      resultados.innerHTML = `<li class="pb-buscador__vacio">No se encontraron coincidencias</li>`;
      return;
    }
    const header = queryActual
      ? `<li class="pb-buscador__header">${resultadosActuales.length} resultado(s) para "<strong>${escapeHtml(queryActual)}</strong>"</li>`
      : "";
    resultados.innerHTML = header + resultadosActuales
      .map((p, i) => {
        const sinStock = Number(p.stock ?? 0) <= 0;
        const nombreHtml = resaltar(p.nombre || `#${p.id_producto}`, queryActual);
        const meta = [];
        if (conStock) meta.push(`stock: ${Number(p.stock ?? 0)}`);
        if (p.codigo_barras) {
          // Resaltar también el código si la query lo matchea
          const codigoHtml = resaltar(p.codigo_barras, queryActual);
          meta.push(`código: ${codigoHtml}`);
        }
        return `
          <li class="pb-buscador__item ${sinStock ? "pb-buscador__item--sin-stock" : ""} ${i === indiceHighlight ? "pb-buscador__item--highlight" : ""}"
              data-id="${p.id_producto}" data-index="${i}" role="option">
            <span class="pb-buscador__item-nombre">${nombreHtml}</span>
            ${meta.length ? `<span class="pb-buscador__item-meta">${meta.join(" · ")}</span>` : ""}
          </li>`;
      })
      .join("");
  }

  function actualizarHighlight() {
    contenedor.querySelectorAll(".pb-buscador__item").forEach((li, i) => {
      li.classList.toggle("pb-buscador__item--highlight", i === indiceHighlight);
      if (i === indiceHighlight) {
        // Scroll into view si está fuera
        const liRect = li.getBoundingClientRect();
        const ulRect = resultados.getBoundingClientRect();
        if (liRect.bottom > ulRect.bottom || liRect.top < ulRect.top) {
          li.scrollIntoView({ block: "nearest" });
        }
      }
    });
  }

  function recargar(query = "") {
    queryActual = String(query ?? "").trim();
    resultadosActuales = filtrarYOrdenar(lista, queryActual);
    indiceHighlight = resultadosActuales.length > 0 ? 0 : -1;
    renderResultados();
  }

  function seleccionar(producto) {
    productoSeleccionado = producto;
    if (producto) {
      const stockTxt = conStock ? ` (stock: ${Number(producto.stock ?? 0)})` : "";
      input.value = `${producto.nombre}${stockTxt}`;
      valorOculto.value = producto.id_producto;
      btnLimpiar.hidden = false;
    } else {
      input.value = "";
      valorOculto.value = "";
      btnLimpiar.hidden = true;
    }
    cerrarDropdown();
    if (typeof onCambio === "function") onCambio(producto);
  }

  function limpiarSeleccion() {
    seleccionar(null);
    input.focus();
  }

  // ── Eventos ──────────────────────────────────────────────────────────
  input.addEventListener("input", () => {
    // Si el usuario está escribiendo y había una selección, la limpia
    if (productoSeleccionado) {
      productoSeleccionado = null;
      valorOculto.value = "";
      btnLimpiar.hidden = true;
      if (typeof onCambio === "function") onCambio(null);
    }
    recargar(input.value);
    abrirDropdown();
  });

  input.addEventListener("focus", () => {
    // Si hay un producto seleccionado, seleccionar todo el texto del input
    // para que el usuario pueda escribir y reemplazar fácilmente (UX común
    // de barras de búsqueda).
    if (productoSeleccionado) {
      input.select();
    }
    recargar(input.value);
    abrirDropdown();
  });

  input.addEventListener("keydown", (e) => {
    if (!dropdownAbierto() && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      abrirDropdown();
      recargar(input.value);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (resultadosActuales.length === 0) return;
      indiceHighlight = (indiceHighlight + 1) % resultadosActuales.length;
      actualizarHighlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (resultadosActuales.length === 0) return;
      indiceHighlight = indiceHighlight <= 0 ? resultadosActuales.length - 1 : indiceHighlight - 1;
      actualizarHighlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = indiceHighlight >= 0 ? indiceHighlight : 0;
      const elegido = resultadosActuales[idx];
      if (elegido) seleccionar(elegido);
    } else if (e.key === "Escape") {
      cerrarDropdown();
    }
  });

  // Click en un item del dropdown
  resultados.addEventListener("click", (e) => {
    const li = e.target.closest(".pb-buscador__item");
    if (!li) return;
    const idx = Number(li.dataset.index);
    const elegido = resultadosActuales[idx];
    if (elegido) seleccionar(elegido);
  });

  // Hover en items mueve el highlight (UX consistente con teclado)
  resultados.addEventListener("mouseover", (e) => {
    const li = e.target.closest(".pb-buscador__item");
    if (!li) return;
    const idx = Number(li.dataset.index);
    if (!isNaN(idx)) {
      indiceHighlight = idx;
      actualizarHighlight();
    }
  });

  // Botón ✕
  btnLimpiar.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    limpiarSeleccion();
  });

  // ── API pública ──────────────────────────────────────────────────────
  const api = {
    setProductos(arr) {
      lista = Array.isArray(arr) ? arr.slice() : [];
      // Si había selección, mantenerla si el producto sigue existiendo
      if (productoSeleccionado) {
        const sigueExistiendo = lista.find(
          (p) => p.id_producto === productoSeleccionado.id_producto
        );
        if (sigueExistiendo) {
          // Re-seleccionar con datos frescos (stock pudo cambiar)
          seleccionar(sigueExistiendo);
        } else {
          seleccionar(null);
        }
      }
      // Si el dropdown está abierto, refrescar resultados
      if (dropdownAbierto()) recargar(input.value);
    },

    setValor(idProducto) {
      if (idProducto == null) {
        seleccionar(null);
        return;
      }
      const prod = lista.find((p) => p.id_producto === Number(idProducto));
      if (prod) seleccionar(prod);
    },

    getValor() {
      return valorOculto.value ? Number(valorOculto.value) : null;
    },

    getProducto() {
      return productoSeleccionado;
    },

    limpiar() {
      seleccionar(null);
    },

    focus() {
      input.focus();
    },
  };

  contenedor._pbInstance = api;
  return api;
}
