// Google Apps Script para sincronizar datos con Google Sheets
// Este código corre en Google y maneja la lectura/escritura de datos

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
      if (!row[0]) continue; // Skip empty rows
      
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
      
      // Obtener gastos
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
    
    // Crear hoja de Carros si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['ID', 'Nombre', 'Precio Compra', 'Fecha Compra', 'Vendido', 'Precio Venta', 'Fecha Venta']);
    }
    
    // Crear hoja de Gastos si no existe
    let expSheet = ss.getSheetByName(EXPENSES_SHEET);
    if (!expSheet) {
      expSheet = ss.insertSheet(EXPENSES_SHEET);
      expSheet.appendRow(['Car ID', 'Gasto ID', 'Descripción', 'Monto']);
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    // Buscar si el carro ya existe
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === car.id) {
        rowIndex = i + 1; // Google Sheets usa 1-based indexing
        break;
      }
    }
    
    // Actualizar o insertar fila de carro
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
      // Actualizar fila existente
      sheet.getRange(rowIndex, 1, 1, carRow.length).setValues([carRow]);
    } else {
      // Insertar nueva fila
      sheet.appendRow(carRow);
    }
    
    // Eliminar gastos viejos del car
    const expData = expSheet.getDataRange().getValues();
    for (let i = expData.length - 1; i >= 1; i--) {
      if (expData[i][0] === car.id) {
        expSheet.deleteRow(i + 1);
      }
    }
    
    // Agregar nuevos gastos
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
    
    // Eliminar carro
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === carId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    // Eliminar gastos asociados
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

// Función para generar el enlace compartible
function getDeploymentUrl() {
  const scriptId = ScriptApp.getScriptId();
  Logger.log('Script ID: ' + scriptId);
  Logger.log('Usa este formato en tu HTML:');
  Logger.log('https://script.google.com/macros/d/' + scriptId + '/usercopy');
}
