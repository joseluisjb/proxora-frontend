# Proxora — Panel de Administración Académica

## 🚀 Cómo ejecutar el proyecto

### Requisitos
- Node.js 18 o superior → https://nodejs.org

### Pasos

```bash
# 1. Entra a la carpeta del proyecto
cd proxora

# 2. Instala las dependencias (solo la primera vez)
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Luego abre tu navegador en **http://localhost:5173**

---

### Otros comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con hot-reload |
| `npm run build` | Genera la versión de producción en `/dist` |
| `npm run preview` | Previsualiza el build de producción |

---

## 📁 Estructura del proyecto

```
proxora/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              ← Punto de entrada
    ├── App.jsx               ← Enrutador principal
    ├── styles/
    │   └── globals.css       ← Estilos globales y design tokens
    ├── components/
    │   ├── Sidebar.jsx
    │   └── Sidebar.css
    └── pages/
        ├── GestionUsuarios.jsx
        ├── GestionUsuarios.css
        ├── ConfigAcademica.jsx
        ├── ConfigAcademica.css
        ├── SupervisionProyectos.jsx
        └── SupervisionProyectos.css
```
