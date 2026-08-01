# ⚡ Guía Rápida de Instalación

Sigue estos 5 pasos (toma ~5 minutos la primera vez):

## 1️⃣ Crear Google Sheet

→ Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva
→ Dale el nombre "Control de Carros"
→ **Copia tu ID de la URL:** `https://docs.google.com/spreadsheets/d/**ABC123**/edit`

## 2️⃣ Crear Google Apps Script

→ Abre tu Google Sheet
→ Click en **Extensiones → Apps Script**
→ Elimina todo el código
→ [Copia todo este código](google-apps-script.js) y pégalo
→ **Ctrl+S** para guardar
→ Dale nombre: "Control de Carros"

## 3️⃣ Desplegar el Script

→ Click en **"Implementar" → "Implementación nueva"**
→ Selecciona:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Tu cuenta**
   - Quién tiene acceso: **Cualquiera**
→ Click **"Implementar"**
→ **Autoriza el acceso**
→ **Copia la URL** que aparece (se ve así):
```
https://script.google.com/macros/s/1abc2def3ghi4jkl5mnop6qrs7tuv8wxyz9/usercopy
```

## 4️⃣ Configurar el HTML

→ Abre `index.html` en un editor de texto
→ Busca esta línea:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercopy';
```
→ **Reemplaza la URL completa** con la del Paso 3
→ **Guarda el archivo**

## 5️⃣ Subir a GitHub

→ Crea cuenta en [github.com](https://github.com)
→ Crea repositorio nuevo: `control-carros`
→ Sube estos archivos:
   - `index.html`
   - `README.md`
   - `google-apps-script.js`
   - `package.json`

→ Ve a **Settings → Pages**
→ Selecciona **"Deploy from a branch" → main**
→ ¡Listo! Tu app estará en: `https://tu-usuario.github.io/control-carros/`

---

## 📱 Usar la app

1. Abre tu URL de GitHub Pages
2. Click **"+ Agregar carro"**
3. Rellena info del carro
4. Abre el carro y agrega gastos
5. Cuando lo vendas, **"Marcar como vendido"**
6. ¡Los datos se guardan automáticamente en tu Google Sheet!

---

## 🔗 Flujo de datos

```
Tu navegador (index.html)
        ↓ (envía datos)
Google Apps Script (código en Google)
        ↓ (lee/escribe)
Google Sheets (tu hoja de datos)
```

---

## ❓ Preguntas frecuentes

**¿Dónde se guardan mis datos?**
En tu Google Sheet. Solo tú tienes acceso.

**¿Funciona sin internet?**
No, necesitas internet para sincronizar.

**¿Puedo editar los datos en Google Sheets?**
Sí, puedes abrir tu hoja y editarlos manualmente.

**¿Es gratis?**
100% gratis. Google Sheets y GitHub Pages son gratis.

**¿Qué pasa si cierro la pestaña?**
Nada, los datos se guardan en Google Sheets, no en tu navegador.

---

## 🆘 Si algo no funciona

1. **Verifica que el Apps Script esté implementado**
   - Ve a tu Apps Script → debería ver un deployment activo

2. **Revisa la URL en index.html**
   - Debe ser exactamente igual a la que obtuviste al desplegar

3. **Abre la consola del navegador** (F12 → Console)
   - Busca mensajes de error en rojo

4. **Recarga la página** (Ctrl+F5)

---

¡Listo! Ya tienes todo. 🎉
