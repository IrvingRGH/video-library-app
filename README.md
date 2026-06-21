# Video Library - Aplicación de Escritorio

Reproductor de videos con biblioteca integrada estilo MSI Center.

##  Inicio Rápido

### Instalación

```bash
cd video-library-app
npm install
```

### Desarrollo

**Opción 1: Modo Web**
```bash
npm run dev:vite
```
Abre http://localhost:5173/

**Opción 2: Modo Desktop (aplicación Electron)**

En Windows, usa el script batch:
```bash
start.bat
```

O manualmente (ejecuta en orden):
```bash
# Terminal 1: Iniciar Vite primero
npm run dev:vite

# Terminal 2: Espera 3 segundos, luego ejecuta Electron
npm run dev:electron
```

> [!IMPORTANT]
> Para que Electron funcione correctamente, **debes iniciar Vite primero** y esperar a que diga "ready". Luego ejecuta Electron en otra terminal. El script `start.bat` hace esto automáticamente.

### Producción

```bash
# Construir todo y generar instalador
npm run build

# O paso a paso:
npm run build:vite    # Construir frontend
npm run build:electron # Generar instalador
```

El instalador estará en `release/`

##  Uso

1. **Agregar Video**: 
   - Click en "Agregar Video"
   - Pega la URL del video O el código completo del iframe
   - (Opcional) Sube una imagen personalizada como miniatura
   - Agrega título y descripción
2. **Reproducir**: Click en cualquier video de la biblioteca para reproducirlo
3. **Eliminar**: Hover sobre un video y click en el ícono de papelera
4. **Buscar**: Usa el campo de búsqueda para filtrar videos

##  Características

- ✅ Reproductor integrado (sin abrir navegador)
- ✅ Soporte YouTube, Vimeo, AnimeFLV, JKAnime, TioAnime, MonosChinos
- ✅ Soporte para **cualquier URL** de video embebido (iframes)
- ✅ **Extracción automática** de URL desde código HTML de iframe
- ✅ **Miniaturas personalizadas** - sube tus propios screenshots
- ✅ Thumbnails automáticos (YouTube)
- ✅ Búsqueda en biblioteca
- ✅ Persistencia de datos (localStorage)
- ✅ Diseño moderno dark theme
- ✅ Script de inicio fácil para Windows (start.bat)

##  Tecnologías

- **Electron** - Framework desktop
- **React** - UI framework
- **Vite** - Build tool
- **CSS3** - Glassmorphism y animaciones

##  Notas

- Los videos se almacenan en localStorage
- Los thumbnails de YouTube se cargan automáticamente
- La app funciona offline una vez cargada (excepto la reproducción de videos online)
