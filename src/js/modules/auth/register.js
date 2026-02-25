document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  if (!registerForm) {
    console.error('❌ No se encontró el formulario con id="registerForm"');
    return;
  }

  console.log("✅ Formulario de registro encontrado");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Mostrar loading
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Registrando...";
    submitBtn.disabled = true;

    try {
     
      const password = registerForm.querySelector('input[name="password"]').value;
      const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;
      
      if (password !== confirmPassword) {
        alert("❌ Las contraseñas no coinciden");
        return;
      }

      
      const formData = new FormData(registerForm);
      const datos = Object.fromEntries(formData.entries());
      delete datos.confirmPassword; // Eliminar campo de confirmación

      console.log("📤 Enviando datos:", datos);

     
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      console.log("📨 Status de respuesta:", response.status);

      
      if (!response.ok) {
        const errorData = await response.json();
        console.log("🚨 ERROR DEL BACKEND:", errorData);
        
        // 🎯 MEJORA: Mostrar todos los errores en un alert legible
        if (errorData.errors && errorData.errors.length > 0) {
          const erroresTexto = errorData.errors.join('\n• ');
          alert("❌ Errores de validación:\n• " + erroresTexto);
        } else {
          alert("❌ Error: " + errorData.message);
        }
        return;
      }

      const result = await response.json();
      alert("✅ " + result.message);
      console.log("🎉 Registro exitoso:", result);
      window.location.href = "login.html";

    } catch (error) {
      console.error("💥 Error:", error);
      alert("💥 Error de conexión con el servidor");
    } finally {
      // Restaurar botón
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});