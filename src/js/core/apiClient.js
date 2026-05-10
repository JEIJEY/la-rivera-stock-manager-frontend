// apiClient.js — Wrapper completo para peticiones API con autenticación
class ApiClient {
    constructor(baseURL = "http://localhost:3001/api/v1") {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // ✅ OBTENER EL TOKEN DE AUTENTICACIÓN EN CADA SOLICITUD
        const token = localStorage.getItem('authToken');
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // ✅ AGREGAR EL TOKEN AL HEADER SI EXISTE
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`🔐 Incluyendo token en solicitud: ${endpoint}`);
        } else {
            console.warn(`⚠️ Sin token de autenticación para: ${endpoint}`);
        }

        // Si hay body y es objeto, lo convertimos a JSON
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            console.log(`🔄 API Call: ${config.method} ${url}`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                // Manejar errores de autenticación específicamente
                if (response.status === 401) {
                    console.error('❌ Error 401 - No autorizado. Token inválido o expirado.');
                    // Opcional: Redirigir al login
                    // window.location.href = '/login.html';
                }
                
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return null; // Para respuestas sin cuerpo

        } catch (error) {
            console.error('❌ API request failed:', error);
            throw error;
        }
    }

    // ======================
    // 🟦 MÉTODOS DE AUTENTICACIÓN
    // ======================

    async login(credentials) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
        
        // Guardar token si la respuesta lo incluye
        if (result.token) {
            localStorage.setItem('authToken', result.token);
            console.log('✅ Token guardado en localStorage');
        }
        
        return result;
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    logout() {
        localStorage.removeItem('authToken');
        console.log('✅ Token removido - Sesión cerrada');
    }

    // Verificar si hay un token activo
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    // ======================
    // 🟦 CATEGORÍAS
    // ======================

    async getCategorias() {
        return this.request('/categorias');
    }

    async getCategoriaById(id) {
        return this.request(`/categorias/${id}`);
    }

    async createCategoria(categoriaData) {
        return this.request('/categorias', {
            method: 'POST',
            body: categoriaData
        });
    }

    async updateCategoria(id, categoriaData) {
        return this.request(`/categorias/${id}`, {
            method: 'PUT',
            body: categoriaData
        });
    }

    async deleteCategoria(id) {
        return this.request(`/categorias/${id}`, {
            method: 'DELETE'
        });
    }

    // ✅ Obtener jerarquía completa
    async getJerarquiaCategorias() {
        return this.request('/categorias/jerarquia');
    }

    // ✅ Obtener subcategorías
    async getSubcategorias(categoriaId) {
        return this.request(`/categorias/${categoriaId}/subcategorias`);
    }

    // ======================
    // 🟩 PRODUCTOS
    // ======================

    async getProductos() {
        return this.request('/productos');
    }

    async getProductoById(id) {
        return this.request(`/productos/${id}`);
    }

    async createProducto(productoData) {
        return this.request('/productos', {
            method: 'POST',
            body: productoData
        });
    }

    async updateProducto(id, productoData) {
        return this.request(`/productos/${id}`, {
            method: 'PUT',
            body: productoData
        });
    }

    async deleteProducto(id) {
        return this.request(`/productos/${id}`, {
            method: 'DELETE'
        });
    }

    // ✅ NUEVO: Productos por categoría
    async getProductosPorCategoria(categoriaId) {
        return this.request(`/productos/categoria/${categoriaId}`);
    }

    // ======================
    // 📊 MOVIMIENTOS
    // ======================

    async getMovimientos(filtros = {}) {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(filtros)) {
            if (v !== undefined && v !== null && v !== '') qs.set(k, v);
        }
        const suffix = qs.toString() ? `?${qs}` : '';
        return this.request(`/movimientos${suffix}`);
    }

    async getMovimientoById(id) {
        return this.request(`/movimientos/${id}`);
    }

    async getMovimientosPorProducto(id_producto) {
        return this.request(`/movimientos/producto/${id_producto}`);
    }

    async registrarEntrada(data) {
        return this.request('/movimientos/entrada', { method: 'POST', body: data });
    }

    async registrarSalida(data) {
        return this.request('/movimientos/salida', { method: 'POST', body: data });
    }

    async registrarBaja(data) {
        return this.request('/movimientos/baja', { method: 'POST', body: data });
    }

    // ======================
    // 👥 EMPLEADOS
    // ======================

    async getEmpleados(filtros = {}) {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(filtros)) {
            if (v !== undefined && v !== null && v !== '') qs.set(k, v);
        }
        const suffix = qs.toString() ? `?${qs}` : '';
        return this.request(`/empleados${suffix}`);
    }

    async getEmpleadoById(id) {
        return this.request(`/empleados/${id}`);
    }

    async getEmpleadoPorEmail(email) {
        return this.request(`/empleados/email/${encodeURIComponent(email)}`);
    }

    async actualizarEmpleado(id, data) {
        return this.request(`/empleados/${id}`, { method: 'PUT', body: data });
    }

    async cambiarRolEmpleado(id, id_rol) {
        return this.request(`/empleados/${id}/rol`, { method: 'PUT', body: { id_rol } });
    }

    async cambiarEstadoEmpleado(id, estado) {
        return this.request(`/empleados/${id}/estado`, { method: 'PUT', body: { estado } });
    }

    // ======================
    // 🛡️ ROLES
    // ======================

    async getRoles() {
        return this.request('/roles');
    }

    async getRolById(id) {
        return this.request(`/roles/${id}`);
    }

    async crearRol(data) {
        return this.request('/roles', { method: 'POST', body: data });
    }

    async actualizarRol(id, data) {
        return this.request(`/roles/${id}`, { method: 'PUT', body: data });
    }

    async desactivarRol(id) {
        return this.request(`/roles/${id}`, { method: 'DELETE' });
    }

    // ======================
    // 🌐 MÉTODOS GENÉRICOS
    // ======================

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ======================
    // 🛡️ MANEJO DE TOKENS
    // ======================

    // Establecer token manualmente (útil después del login)
    setToken(token) {
        localStorage.setItem('authToken', token);
        console.log('✅ Token establecido manualmente');
    }

    // Obtener token actual
    getToken() {
        return localStorage.getItem('authToken');
    }

    // Verificar validez del token (básico)
    isTokenValid() {
        const token = this.getToken();
        if (!token) return false;
        
        // Decodificar el token JWT para verificar expiración
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch (error) {
            console.error('❌ Error decodificando token:', error);
            return false;
        }
    }
}

// ✅ Instancia global para toda la app
const apiClient = new ApiClient();

// ✅ Hacer disponible globalmente para debugging
window.apiClient = apiClient;

export default apiClient;