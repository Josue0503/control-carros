# Control de Carros 🚗

Una aplicación web para trackear la compra, reparación y venta de carros. Los datos se guardan automáticamente en Google Sheets y puedes acceder desde cualquier navegador.

## 🚀 Configuración (5 minutos)

Sigue estos pasos una sola vez para que todo funcione:

### Paso 1: Crear un Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea una hoja nueva (o abre una existente)
3. Dale un nombre como "Control de Carros"
4. **Copia la ID de la hoja desde la URL:**
   - La URL se ve así: `https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`
   - Tu ID es: `ABC123XYZ` (la parte entre `/d/` y `/edit`)

---

### Paso 2: Crear el Google Apps Script

1. Desde tu Google Sheet, ve a **Extensiones → Apps Script**
2. Se abrirá una pestaña nueva en google.com
3. **Elimina todo el código que está allí** (por defecto tiene `function myFunction()...`)
4. **Copia y pega este código completo:**

```javascript
const SHEET_NAME = 'Carros';
const EXPENSES_SHEET = 'Gastos';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let response = {};
    
    if (action === 'getCars') {
      response = getCars();
    } else if (action === 'saveCar') {
      response = saveCar(data.data.car);
    } else if (action === 'deleteCar') {
      response = deleteCar(data.data.carId);
    } else {
      response = { success: false, error: 'Acción no reconocida' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getCars() {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: 'Hoja de Carros no encontrada' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const cars = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      
      const carId = row[0];
      const car = {
        id: carId,
        name: row[1] || '',
        purchasePrice: parseFloat(row[2]) || 0,
        purchaseDate: row[3] || '',
        sold: row[4] === 'Sí' || row[4] === true,
        salePrice: parseFloat(row[5]) || null,
        saleDate: row[6] || '',
        expenses: []
      };
      
      const expSheet = ss.getSheetByName(EXPENSES_SHEET);
      if (expSheet) {
        const expData = expSheet.getDataRange().getValues();
        for (let j = 1; j < expData.length; j++) {
          if (expData[j][0] === carId) {
            car.expenses.push({
              id: expData[j][1],
              desc: expData[j][2] || '',
              amount: parseFloat(expData[j][3]) || 0
            });
          }
        }
      }
      
      cars.push(car);
    }
    
    return { success: true, cars: cars };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function saveCar(car) {
  try {
    const ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['ID', 'Nombre', 'Precio Compra', 'Fecha Compra', 'Vendido', 'Precio Venta', 'Fecha Venta']);
    }
    
    let expSheet = ss.getSheetByName(EXPENSES_SHEET);
    if (!expSheet) {
      expSheet = ss.insertSheet(EXPENSES_SHEET);
      expSheet.appendRow(['Car ID', 'Gasto ID', 'Descripción', 'Monto']);
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === car.id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    const carRow = [
      car.id,
      car.name,
      car.purchasePrice,
      car.purchaseDate,
      car.sold ? 'Sí' : 'No',
      car.salePrice || '',
      car.saleDate || ''
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, carRow.length).setValues([carRow]);
    } else {
      sheet.appendRow(carRow);
    }
    
    const expData = expSheet.getDataRange().getValues();
    for (let i = expData.length - 1; i >= 1; i--) {
      if (expData[i][0] === car.id) {
        expSheet.deleteRow(i + 1);
      }
    }
    
    if (car.expenses && car.expenses.length > 0) {
      for (const expense of car.expenses) {
        expSheet.appendRow([car.id, expense.id, expense.desc, expense.amount]);
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function deleteCar(carId) {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const expSheet = ss.getSheetByName(EXPENSES_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja de Carros no encontrada' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === carId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    if (expSheet) {
      const expData = expSheet.getDataRange().getValues();
      for (let i = expData.length - 1; i >= 1; i--) {
        if (expData[i][0] === carId) {
          expSheet.deleteRow(i + 1);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
```

5. Presiona **Ctrl+S** (o **Cmd+S** en Mac) para guardar
6. Pon un nombre al proyecto: "Control de Carros"

---

### Paso 3: Desplegar el Script

1. En la parte izquierda de Apps Script, busca **"Implementar" → "Implementación nueva"**
2. En el menú que aparece, selecciona:
   - **Tipo:** "Aplicación web"
   - **Ejecutar como:** Tu cuenta de Google
   - **Quién tiene acceso:** "Cualquiera"
3. Haz clic en **"Implementar"**
4. Se abrirá una ventana de autorización — **autoriza el acceso** (es tu script, es seguro)
5. **Copia la URL que te aparece** — se ve así:
   ```
   https://script.google.com/macros/s/ABC123XYZ.../usercopy
   ```

---

### Paso 4: Configurar el HTML

1. Abre el archivo `index.html` en un editor de texto (Bloc de notas, VS Code, etc.)
2. **Busca esta línea** (está cerca del inicio del `<script>`):
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercopy';
   ```
3. **Reemplaza `YOUR_SCRIPT_ID`** con tu URL completa del Paso 3:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/ABC123XYZ.../usercopy';
   ```
4. **Guarda el archivo**

---

### Paso 5: Subir a GitHub

1. Crea una cuenta en [github.com](https://github.com) (si no la tienes)
2. Crea un repositorio nuevo llamado `control-carros`
3. Sube estos archivos:
   - `index.html`
   - `README.md`
   - `google-apps-script.js` (opcional, solo para referencia)

4. Ve a **Settings → Pages** en tu repositorio
5. Selecciona **"Deploy from a branch"** y elige la rama **main**
6. Tu sitio estará en: `https://tu-usuario.github.io/control-carros/`

---

## 📝 Cómo usar

- **Agregar carro:** Haz clic en "+ Agregar carro"
- **Agregar gasto:** Abre un carro y agrega gastos (piezas, mano de obra, etc.)
- **Marcar vendido:** Cuando lo vendas, usa "Marcar como vendido" y pon el precio
- **Sincronizar:** El botón "↻ Sincronizar" carga los datos del Google Sheet
- **Google Sheet:** Puedes abrir tu hoja y ver todos los datos en tiempo real — incluso editarlos manualmente

---

## 🔒 Seguridad

- Los datos viven en **tu Google Sheet personal** — solo tú tienes acceso
- El Apps Script es **código tuyo ejecutándose en Google** — no es un servidor externo
- La app en GitHub es solo **HTML + JavaScript** — no almacena nada localmente

---

## 🐛 Solución de problemas

**"Error de conexión"**
- Revisa que hayas copiado correctamente la URL del Apps Script

**"La hoja no se crea"**
- Ve a tu Google Sheet y crea manualmente las hojas "Carros" y "Gastos" con los headers correctos

**"Nada se sincroniza"**
- Abre la consola del navegador (F12 → Console) y mira los errores
- Asegúrate de que el Apps Script esté implementado

---

## 📊 Estructura de datos

Los datos se almacenan en dos hojas de Google Sheets:

**Hoja "Carros":**
- ID | Nombre | Precio Compra | Fecha Compra | Vendido | Precio Venta | Fecha Venta

**Hoja "Gastos":**
- Car ID | Gasto ID | Descripción | Monto

---

¡Listo! Ya tienes tu aplicación de control de carros corriendo. 🎉
