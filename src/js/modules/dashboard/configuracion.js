export function inicializarConfiguracion() {
  const contenedor = document.getElementById("contenedor-configuracion");
  if (!contenedor) return console.error("❌ No se encontró el contenedor de configuración");

  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.minHeight = "100vh";
  iframe.style.border = "none";
  contenedor.appendChild(iframe);

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Configuración del Sistema</title>
    </head>
    <body class="p-6 bg-gray-50 min-h-screen">
      <h1 class="text-2xl font-semibold text-sky-700 mb-8">
        ⚙️ Configuración del Sistema
      </h1>

      <div class="space-y-8">

        <!-- 🏢 Datos de la Empresa -->
        <div class="bg-white shadow-md rounded-xl p-6">
          <h2 class="text-lg font-semibold text-sky-600 mb-4">
            Datos de la Empresa
          </h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Nombre</label>
              <input type="text" placeholder="La Rivera S.A.S"
                     class="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-sky-300"/>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Correo</label>
              <input type="email" placeholder="contacto@larivera.com"
                     class="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-sky-300"/>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Teléfono</label>
              <input type="text" placeholder="+57 300 123 4567"
                     class="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-sky-300"/>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Logo</label>
              <input type="file" accept="image/*"
                     class="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring focus:ring-sky-300"/>
            </div>
          </div>
        </div>

        <!-- 🎨 Preferencias Visuales -->
        <div class="bg-white shadow-md rounded-xl p-6">
          <h2 class="text-lg font-semibold text-sky-600 mb-4">
            Preferencias Visuales
          </h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Tema</label>
              <select class="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-sky-300">
                <option value="claro">Claro</option>
                <option value="oscuro">Oscuro</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Color principal</label>
              <input type="color"
                     class="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"/>
            </div>
          </div>
        </div>

        <!-- 📦 Parámetros del Inventario -->
        <div class="bg-white shadow-md rounded-xl p-6">
          <h2 class="text-lg font-semibold text-sky-600 mb-4">
            Parámetros del Inventario
          </h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Stock mínimo</label>
              <input type="number" placeholder="10"
                     class="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-sky-300"/>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 font-medium">Tipo de moneda</label>
              <select class="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-sky-300">
                <option value="COP">COP (Peso Colombiano)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 🔔 Notificaciones -->
        <div class="bg-white shadow-md rounded-xl p-6">
          <h2 class="text-lg font-semibold text-sky-600 mb-4">Notificaciones</h2>
          <label class="flex items-center space-x-2">
            <input type="checkbox" class="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-400"/>
            <span class="text-gray-700">Activar alertas automáticas</span>
          </label>
        </div>

        <!-- 💾 Botones -->
        <div class="flex justify-end space-x-4">
          <button class="bg-gray-400 hover:bg-gray-500 text-white rounded-lg px-4 py-2 transition">
            Restablecer
          </button>
          <button class="bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-4 py-2 transition">
            Guardar Configuración
          </button>
        </div>

      </div>
    </body>
    </html>
  `;

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
}
