// ======================================================
// 📦 INVENTARIO.JS — CONTROL UNIFICADO PARA INVENTARIO Y PRODUCTOS
// Versión compatible con SPAViewManager (sin duplicar eventos)
// ======================================================

console.log("✅ inventario.js cargado correctamente");

// 📦 Importaciones necesarias
import apiClient from "../../core/apiClient.js";

// ======================================================
// 🚀 FUNCIÓN PRINCIPAL (punto de entrada para SPAViewManager)
// ======================================================
export async function inicializarInventario() {
  console.log("⏳ Esperando a que cargue la vista del módulo Inventario...");

  try {
    await esperarElemento(".invp-dashboard, #tablaProductos");

    if (document.querySelector(".invp-dashboard")) {
      console.log("🎯 Vista: DASHBOARD DE INVENTARIO detectada");
      inicializarInterfazInventario();
    } else if (document.querySelector("#tablaProductos")) {
      console.log("🎯 Vista: PRODUCTOS detectada");
      inicializarProductos();
    } else {
      console.warn("⚠️ Ninguna vista compatible detectada");
    }
  } catch (err) {
    console.warn("⚠️ Elementos del DOM no encontrados:", err);
  }
}

// ======================================================
// 🕓 FUNCIÓN PARA ESPERAR ELEMENTOS DINÁMICOS
// ======================================================
function esperarElemento(selector, timeout = 4000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) return resolve();

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.querySelector(".dashboard-main"), {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(`⛔ Timeout esperando ${selector}`);
    }, timeout);
  });
}

// ======================================================
// 📦 DASHBOARD DE INVENTARIO (tarjetas invp-*)
// ======================================================
function inicializarInterfazInventario() {
  const contenedor = document.querySelector(".invp-dashboard");
  if (!contenedor) return;

  console.log("✅ Inventario Dashboard listo para usar");

  const botones = contenedor.querySelectorAll(".invp-btn");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log(`🪄 Click en botón: ${btn.textContent.trim()}`);
      alert(`Has presionado: ${btn.textContent.trim()}`);
    });
  });
}

// ======================================================
// 💾 LÓGICA DE PRODUCTOS (tabla y fetch API)
// ======================================================
function inicializarProductos() {
  const tabla = document.getElementById("tablaProductos");
  const estado = document.getElementById("estadoCarga");
  const btnRecargar = document.getElementById("btnRecargar");
  const btnCrear = document.getElementById("btnCrearProducto");
  const hostModal = document.getElementById("modalHostProductos");

  if (!tabla || !estado) {
    console.warn("⚠️ Elementos del DOM de productos no encontrados todavía");
    return;
  }

  console.log("✅ Vista de productos lista, cargando datos...");

  async function cargarProductos() {
    tabla.innerHTML = "";
    estado.textContent = "⏳ Cargando productos...";

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        estado.textContent = "❌ No se encontró token. Inicia sesión nuevamente.";
        return;
      }

      const respuesta = await fetch("http://localhost:3001/api/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!respuesta.ok) throw new Error("Error al obtener productos");
      const productos = await respuesta.json();

      if (!productos.length) {
        estado.textContent = "📭 No hay productos registrados.";
        return;
      }

      productos.forEach((p) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.id_producto}</td>
          <td>${p.nombre}</td>
          <td>${p.descripcion || "-"}</td>
          <td>${p.stock || 0}</td>
          <td>${p.unidad_medida || "-"}</td>
          <td>$${p.precio_unitario?.toLocaleString() || "-"}</td>
          <td>${p.categoria_nombre || "-"}</td>
          <td>${p.marca_nombre || "-"}</td>
          <td>${p.proveedor_nombre || "-"}</td>
          <td>${p.estado ? "🟢 Activo" : "🔴 Inactivo"}</td>
          <td>${p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString() : "-"}</td>
          <td>${p.fecha_actualizacion ? new Date(p.fecha_actualizacion).toLocaleDateString() : "-"}</td>
        `;
        tabla.appendChild(fila);
      });

      estado.textContent = "✅ Productos cargados correctamente";
    } catch (err) {
      console.error("💥 Error al cargar productos:", err);
      estado.textContent = "💥 Error al conectar con el servidor.";
    }
  }

  if (!btnRecargar.dataset.listener) {
    btnRecargar.dataset.listener = "true";
    btnRecargar.addEventListener("click", cargarProductos);
  }

  if (btnCrear && !btnCrear.dataset.listener) {
    btnCrear.dataset.listener = "true";
    btnCrear.addEventListener("click", abrirModalCrearProducto);
  }

  cargarProductos();

  async function abrirModalCrearProducto() {
    if (!document.getElementById("modalProductoInventario")) {
      try {
        const res = await fetch("/src/pages/dashboard/modal-producto.html");
        if (!res.ok) throw new Error("No se encontró modal-producto.html");
        hostModal.innerHTML = await res.text();
        console.log("✅ Modal inyectado en el DOM");
      } catch (err) {
        console.error("❌ Error cargando el modal:", err);
        alert("No se pudo cargar el modal. Revisa la ruta del archivo.");
        return;
      }
    } else {
      console.log("ℹ️ El modal ya estaba cargado");
    }

    const modal = document.getElementById("modalProductoInventario");
    if (modal) {
      modal.style.display = "flex";
      console.log("✅ Modal mostrado");

      await cargarCategoriasEnSelect();
      await cargarMarcasEnSelect();
      await cargarProveedoresEnSelect();

      const formProducto = document.getElementById("formProducto");
      const btnCancelar = document.getElementById("cancelarModal");

      btnCancelar?.addEventListener("click", () => {
        modal.style.display = "none";
      });

      formProducto?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await guardarNuevoProducto(modal, cargarProductos);
      });
    }
  }

  async function guardarNuevoProducto(modal, recargar) {
    const nuevoProducto = {
      nombre: document.getElementById("nombre").value.trim(),
      descripcion: document.getElementById("descripcion").value.trim(),
      stock: parseInt(document.getElementById("stock").value || 0),
      unidad_medida: document.getElementById("unidad").value.trim(),
      precio_unitario: parseFloat(document.getElementById("precio").value || 0),
      id_categoria: parseInt(document.getElementById("categoria").value),
      id_marca: parseInt(document.getElementById("marca").value),
      id_proveedor: parseInt(document.getElementById("proveedor").value),
      estado: parseInt(document.getElementById("estado").value),
    };

    if (!nuevoProducto.nombre || !nuevoProducto.precio_unitario || !nuevoProducto.id_categoria) {
      alert("⚠️ Faltan campos obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const respuesta = await fetch("http://localhost:3001/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoProducto),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        alert("✅ Producto agregado correctamente");
        modal.style.display = "none";
        await recargar();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("💥 Error al guardar producto:", error);
      alert("❌ Error al conectar con el servidor");
    }
  }

  async function cargarCategoriasEnSelect() {
    const select = document.getElementById("categoria");
    if (!select) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:3001/api/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener categorías");
      const categorias = await res.json();

      select.innerHTML = `
        <option value="">Seleccione una categoría</option>
        <option value="crear-nueva">➕ Crear nueva categoría...</option>
      `;

      categorias.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat.id_categoria;
        opt.textContent = cat.nombre;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error("💥 Error cargando categorías:", err);
    }
  }

  async function cargarMarcasEnSelect() {
    const select = document.getElementById("marca");
    if (!select) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:3001/api/marcas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener marcas");
      const marcas = await res.json();

      select.innerHTML = `
        <option value="">Seleccione una marca</option>
        <option value="crear-nueva">➕ Crear nueva marca...</option>
      `;

      marcas.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id_marca;
        opt.textContent = m.nombre;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error("💥 Error cargando marcas:", err);
    }
  }

  async function cargarProveedoresEnSelect() {
    const select = document.getElementById("proveedor");
    if (!select) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:3001/api/proveedores", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener proveedores");
      const proveedores = await res.json();

      select.innerHTML = `
        <option value="">Seleccione un proveedor</option>
        <option value="crear-nueva">➕ Crear nuevo proveedor...</option>
      `;

      proveedores.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id_proveedor;
        opt.textContent = p.nombre;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error("💥 Error cargando proveedores:", err);
    }
  }

  document.addEventListener("change", async (e) => {
    if (e.target.id === "categoria" && e.target.value === "crear-nueva") {
      await crearDesdeSelect(e, "categoría", "categorias", "id_categoria", cargarCategoriasEnSelect);
    }
    if (e.target.id === "marca" && e.target.value === "crear-nueva") {
      await crearDesdeSelect(e, "marca", "marcas", "id_marca", cargarMarcasEnSelect);
    }
    if (e.target.id === "proveedor" && e.target.value === "crear-nueva") {
      await crearDesdeSelect(e, "proveedor", "proveedores", "id_proveedor", cargarProveedoresEnSelect);
    }
  });

  async function crearDesdeSelect(e, nombreTipo, endpoint, idCampo, recargar) {
    const nombre = prompt(`🟢 Ingrese el nombre de la nueva ${nombreTipo}:`);
    if (!nombre) return (e.target.value = "");

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:3001/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `Error creando ${nombreTipo}`);
      alert(`✅ ${nombreTipo} creada correctamente`);
      await recargar();
      e.target.value = data[idCampo];
    } catch (err) {
      console.error(`❌ Error creando ${nombreTipo}:`, err);
      alert(`Error al crear ${nombreTipo}`);
      e.target.value = "";
    }
  }
}