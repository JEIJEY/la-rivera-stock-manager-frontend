// ========================================
// Cliente HTTP centralizado para La Rivera
// ========================================

const API_BASE = "http://localhost:3001/api/v1";

// ========================================
// UTILITY: Obtener JWT del localStorage
// ========================================
function getToken() {
  return localStorage.getItem("token");
}

function getAuthHeader() {
  const token = getToken();
  if (!token) throw new Error("Token no disponible. Inicia sesión primero.");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ========================================
// UTILITY: Manejo de respuestas
// ========================================
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Error: ${response.status}`);
  }
  return response.json();
}

// ========================================
// AUTH MODULE
// ========================================
export const auth = {
  async register(datos) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const result = await handleResponse(response);
    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return result;
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await handleResponse(response);
    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return result;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!getToken();
  },
};

// ========================================
// PRODUCTOS MODULE
// ========================================
export const productos = {
  async getAll() {
    const response = await fetch(`${API_BASE}/productos`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE}/productos/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getByCategoria(id_categoria) {
    const response = await fetch(`${API_BASE}/productos/categoria/${id_categoria}`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async create(datos) {
    const response = await fetch(`${API_BASE}/productos`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async update(id, datos) {
    const response = await fetch(`${API_BASE}/productos/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE}/productos/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Categorías secundarias
  async getSecundarias(id_producto) {
    const response = await fetch(`${API_BASE}/productos/${id_producto}/categorias/secundarias`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async addSecundaria(id_producto, id_categoria, orden = 0) {
    const response = await fetch(`${API_BASE}/productos/${id_producto}/categorias/secundarias`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify({ id_categoria, orden }),
    });
    return handleResponse(response);
  },

  async removeSecundaria(id_producto, id_categoria) {
    const response = await fetch(
      `${API_BASE}/productos/${id_producto}/categorias/secundarias/${id_categoria}`,
      {
        method: "DELETE",
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },
};

// ========================================
// CATEGORÍAS MODULE
// ========================================
export const categorias = {
  async getAll() {
    const response = await fetch(`${API_BASE}/categorias`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE}/categorias/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getJerarquia() {
    const response = await fetch(`${API_BASE}/categorias/jerarquia`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getByParent(parentId = null) {
    const query = parentId ? `?parent_id=${parentId}` : "";
    const response = await fetch(`${API_BASE}/categorias${query}`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async create(datos) {
    const response = await fetch(`${API_BASE}/categorias`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async update(id, datos) {
    const response = await fetch(`${API_BASE}/categorias/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE}/categorias/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ========================================
// MARCAS MODULE
// ========================================
export const marcas = {
  async getAll() {
    const response = await fetch(`${API_BASE}/marcas`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE}/marcas/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async create(datos) {
    const response = await fetch(`${API_BASE}/marcas`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async update(id, datos) {
    const response = await fetch(`${API_BASE}/marcas/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE}/marcas/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ========================================
// PROVEEDORES MODULE
// ========================================
export const proveedores = {
  async getAll() {
    const response = await fetch(`${API_BASE}/proveedores`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE}/proveedores/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async create(datos) {
    const response = await fetch(`${API_BASE}/proveedores`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async update(id, datos) {
    const response = await fetch(`${API_BASE}/proveedores/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE}/proveedores/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ========================================
// ABC MODULE (Clasificación ABC)
// ========================================
export const abc = {
  async getReporte() {
    const response = await fetch(`${API_BASE}/abc/reporte`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async recalcular() {
    const response = await fetch(`${API_BASE}/abc/recalcular`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getAlertas() {
    const response = await fetch(`${API_BASE}/abc/alertas`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ========================================
// ALERTS MODULE (Alertas de stock)
// ========================================
export const alerts = {
  async getAll() {
    const response = await fetch(`${API_BASE}/alerts`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getByProducto(id_producto) {
    const response = await fetch(`${API_BASE}/alerts/producto/${id_producto}`, {
      method: "GET",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async create(datos) {
    const response = await fetch(`${API_BASE}/alerts`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async update(id, datos) {
    const response = await fetch(`${API_BASE}/alerts/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE}/alerts/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};
