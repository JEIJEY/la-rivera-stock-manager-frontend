src/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── js/
│   ├── core/                          ← infraestructura global
│   │   ├── apiClient.js
│   │   └── EventBus.js
│   │
│   ├── shared/                        ← JS reutilizable
│   │   ├── components/
│   │   └── utils/
│   │
│   └── modules/                       ← dominios (como backend)
│       ├── website/
│       │   └── landing.js
│       │
│       ├── auth/
│       │   ├── login.js
│       │   └── register.js
│       │
│       └── dashboard/
│           ├── dashboard.js
│           ├── inventario.js
│           ├── categorias.js
│           ├── configuracion.js
│           └── SPAViewManager.js
│
├── styles/
│   ├── tokens/                        ← design tokens
│   │   ├── _colors.css
│   │   ├── _spacing.css
│   │   └── _breakpoints.css
│   │
│   ├── base/
│   │   ├── _reset.css
│   │   └── _base.css
│   │
│   ├── shared/                        ← Atomic real (design system)
│   │   ├── atoms/
│   │   │   ├── _button.css
│   │   │   ├── _input.css
│   │   │   └── _label.css
│   │   │
│   │   ├── molecules/
│   │   │   ├── _form-group.css
│   │   │   └── _card.css
│   │   │
│   │   └── organisms/
│   │       ├── _navbar.css
│   │       └── _footer.css
│   │
│   ├── layouts/                       ← Templates conceptualmente
│   │   ├── _website-layout.css
│   │   └── _dashboard-layout.css
│   │
│   ├── website/
│   │   └── _landing.css
│   │
│   ├── auth/
│   │   ├── _login.css
│   │   └── _register.css
│   │
│   └── dashboard/
│       ├── _dashboard.css
│       ├── _inventario.css
│       └── _categorias.css
│
└── pages/
    ├── landing.html
    ├── login.html
    ├── register.html
    └── dashboard.html