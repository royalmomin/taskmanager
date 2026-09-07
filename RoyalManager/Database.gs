/**
 * ROYAL MANAGER
 * Database.gs
 * Handles core CRUD operations with Google Sheets.
 */

var Database = {
  
  /**
   * Reads all rows from a sheet as an array of objects.
   * Assumes row 1 contains headers.
   */
  readAll: function(sheetName) {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // No data or only headers
    
    var headers = data[0];
    var rows = [];
    
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      rowObj._rowIndex = i + 1; // 1-based index in sheet
      rows.push(rowObj);
    }
    
    return rows;
  },
  
  /**
   * Finds a row by ID.
   */
  findById: function(sheetName, idColumnName, idValue) {
    var rows = this.readAll(sheetName);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][idColumnName] == idValue) {
        return rows[i];
      }
    }
    return null;
  },
  
  /**
   * Inserts a new row into the sheet.
   */
  insert: function(sheetName, obj) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = [];
    
    for (var i = 0; i < headers.length; i++) {
      var val = obj[headers[i]];
      newRow.push(val !== undefined ? val : "");
    }
    
    sheet.appendRow(newRow);
    return obj;
  },
  
  /**
   * Updates an existing row.
   */
  update: function(sheetName, idColumnName, idValue, updatedObj) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) throw new Error("No data in sheet to update.");
    
    var headers = data[0];
    var idColIndex = headers.indexOf(idColumnName);
    if (idColIndex === -1) throw new Error("ID column not found.");
    
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][idColIndex] == idValue) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) throw new Error("Record not found for ID: " + idValue);
    
    // Create an array with updated values
    var updatedRow = [];
    for (var j = 0; j < headers.length; j++) {
      var headerName = headers[j];
      // Only update fields that exist in updatedObj
      if (updatedObj.hasOwnProperty(headerName)) {
        updatedRow.push(updatedObj[headerName]);
      } else {
        updatedRow.push(data[rowIndex - 1][j]); // Keep existing
      }
    }
    
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
    return updatedObj;
  },
  
  /**
   * Deletes a row by ID.
   */
  deleteRow: function(sheetName, idColumnName, idValue) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found.");
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idColIndex = headers.indexOf(idColumnName);
    if (idColIndex === -1) throw new Error("ID column not found.");
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][idColIndex] == idValue) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  }
};
