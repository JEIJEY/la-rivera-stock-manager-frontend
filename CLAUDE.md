# Proyecto: La Rivera Stock Manager

## Convención de Commits

Usa **Conventional Commits** en todos los mensajes de commit.

### Estructura
```
tipo(alcance): descripción en infinitivo
```

### Tipos
| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de error |
| `refactor` | Cambio interno sin alterar funcionalidad |
| `style` | Formato, indentación (sin lógica) |
| `test` | Agregar o modificar pruebas |
| `docs` | Cambios en documentación |
| `chore` | Tareas técnicas (deps, config) |

### Scopes del proyecto

**Backend (API):** `auth` · `categorias` · `productos` · `proveedores` · `swagger` · `config` · `middlewares` · `shared`

**Frontend:** `auth` · `dashboard` · `layouts` · `pages` · `shared` · `atoms` · `molecules` · `organisms` · `assets`

### Buenas prácticas
- Verbo en infinitivo: `agregar`, `corregir`, `implementar`
- Sin mayúsculas al inicio
- Sin punto final
- Mensaje corto y claro

### Regla de Oro
- Agrega algo nuevo → `feat`
- Corrige un error → `fix`
- Reorganiza sin cambiar funcionalidad → `refactor`
- Solo documentación → `docs`

### Ejemplos reales
```
feat(auth): agregar ruta protegida con JWT
feat(auth): integrar Swagger con bearerAuth
refactor(auth): separar responsabilidades en service y repository
docs(auth): documentar endpoints en Swagger
fix(auth): manejar error de correo duplicado correctamente
feat(productos): crear endpoint para registrar producto
refactor(auth): atomizar vistas de login en componentes
style(dashboard): mejorar layout de tarjetas de resumen
```

---

## Instrucción para Claude Code

Cuando el usuario describa un cambio que hizo, **genera directamente el mensaje de commit correcto** siguiendo esta convención. Si el cambio es ambiguo, pregunta si agrega algo nuevo, corrige un error, o reorganiza código existente.
