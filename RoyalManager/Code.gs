/**
 * ROYAL MANAGER
 * Code.gs
 * Main entry point and exposed functions for frontend.
 */

/**
 * Serves the web application HTML.
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Royal Manager')
    .setFaviconUrl('https://www.google.com/images/favicon.ico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Includes HTML snippets into the main page.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ==========================================
 * EXPOSED FUNCTIONS FOR FRONTEND (google.script.run)
 * ==========================================
 */

function getDashboardData() {
  return ReportService.getDashboardSummary();
}

function getAllMatters() {
  return MatterService.getAllMatters();
}

function getMatterById(id) {
  return MatterService.getMatterById(id);
}

function saveMatter(matterData) {
  return MatterService.saveMatter(matterData);
}

function deleteMatter(id, deleteCalendarEvent) {
  return MatterService.deleteMatter(id, deleteCalendarEvent);
}

function getAllTasks() {
  return TaskService.getAllTasks();
}

function saveTask(taskData) {
  return TaskService.saveTask(taskData);
}

function getSettings() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!sheet) return {};
  
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function saveSettings(settingsData) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!sheet) return;
  
  // Clear existing settings except headers
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
  }
  
  var newRows = [];
  for (var key in settingsData) {
    newRows.push([key, settingsData[key]]);
  }
  
  if (newRows.length > 0) {
    sheet.getRange(2, 1, newRows.length, 2).setValues(newRows);
  }
  return settingsData;
}

function saveCalendarSettings(calendarSettings) {
  var existing = getSettings();
  for (var k in calendarSettings) {
    existing[k] = calendarSettings[k];
  }
  return saveSettings(existing);
}

/**
 * Tests the Google Calendar API connection.
 * Since we're in Apps Script, CalendarApp is always available via the bound script.
 * This validates the credentials are stored and tests basic calendar access.
 */
function testCalendarApiConnection(clientId, clientSecret) {
  try {
    if (!clientId || !clientSecret) {
      return { success: false, error: 'Missing credentials' };
    }
    
    // Test basic calendar access via CalendarApp
    var calendar = CalendarApp.getDefaultCalendar();
    var calName = calendar.getName();
    
    // Save the credentials if test passes
    var existing = getSettings();
    existing.gcal_client_id = clientId;
    existing.gcal_client_secret = clientSecret;
    existing.gcal_connected = 'true';
    existing.gcal_connected_at = new Date().toISOString();
    saveSettings(existing);
    
    return { success: true, calendarName: calName };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Syncs all matter events to Google Calendar.
 * Uses the CalendarService to create/update events for all matters with reminders enabled.
 */
function syncAllCalendarEvents() {
  try {
    var matters = MatterService.getAllMatters();
    var synced = 0;
    
    for (var i = 0; i < matters.length; i++) {
      var m = matters[i];
      if (m['Reminder Enabled'] === 'Yes' && m['Next Date']) {
        CalendarService.syncMatterEvent(m);
        synced++;
      }
    }
    
    // Update sync metadata
    var existing = getSettings();
    existing.gcal_last_sync = new Date().toISOString();
    existing.gcal_sync_count = String(synced);
    saveSettings(existing);
    
    return { synced: synced, timestamp: new Date().toISOString() };
  } catch (e) {
    throw new Error('Calendar sync failed: ' + e.toString());
  }
}

/**
 * ==========================================
 * MASTER DATA MANAGEMENT (Individual Items)
 * ==========================================
 */
function getMasterData() {
  var ss = getSpreadsheet();
  if (!ss) return { companies: [], brands: [], agents: [] };
  
  var sheet = ss.getSheetByName(CONFIG.SHEETS.MASTER_DATA);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.MASTER_DATA);
    var headers = ['ID', 'Type', 'Value', 'Created Date'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e0e0e0");
    sheet.setFrozenRows(1);
  }
  
  var rows = Database.readAll(CONFIG.SHEETS.MASTER_DATA);
  
  // Auto-migrate legacy comma-separated values from Settings if MasterData is empty
  if (rows.length === 0) {
    var legacySettings = getSettings();
    var seedType = function(type, legacyVal, defaults) {
      var items = [];
      if (legacyVal && typeof legacyVal === 'string' && legacyVal.trim()) {
        items = legacyVal.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
      }
      if (items.length === 0 && defaults) {
        items = defaults;
      }
      for (var i = 0; i < items.length; i++) {
        var id = type.toLowerCase() + '_' + Utils.generateUUID().substring(0, 8);
        var record = {
          'ID': id,
          'Type': type,
          'Value': items[i],
          'Created Date': new Date().toISOString()
        };
        Database.insert(CONFIG.SHEETS.MASTER_DATA, record);
        rows.push(record);
      }
    };
    
    seedType('Company', legacySettings.companies, ['Royal Enterprises Pvt Ltd', 'Astra Technologies Inc.', 'Heritage Mills']);
    seedType('Brand', legacySettings.brands, ['Sunrise', 'Royal Shield Logo', 'Astra Global Tech']);
    seedType('Agent', legacySettings.agents, ['S. Majumdar', 'Royal', 'Admin']);
  }
  
  var result = {
    companies: [],
    brands: [],
    agents: []
  };
  
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var type = (r.Type || '').toLowerCase();
    var item = { id: r.ID, value: r.Value };
    if (type === 'company') {
      result.companies.push(item);
    } else if (type === 'brand') {
      result.brands.push(item);
    } else if (type === 'agent') {
      result.agents.push(item);
    }
  }
  
  return result;
}

function addMasterDataItem(type, value) {
  if (!type || !value) throw new Error("Type and Value are required.");
  var validTypes = ['Company', 'Brand', 'Agent'];
  var normType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (validTypes.indexOf(normType) === -1) throw new Error("Invalid type: " + type);
  
  var id = normType.toLowerCase() + '_' + Utils.generateUUID().substring(0, 8);
  var record = {
    'ID': id,
    'Type': normType,
    'Value': value.trim(),
    'Created Date': new Date().toISOString()
  };
  
  Database.insert(CONFIG.SHEETS.MASTER_DATA, record);
  return { success: true, item: { id: id, type: normType, value: value.trim() } };
}

function updateMasterDataItem(id, value) {
  if (!id || !value) throw new Error("ID and Value are required.");
  Database.update(CONFIG.SHEETS.MASTER_DATA, 'ID', id, { 'Value': value.trim() });
  return { success: true, id: id, value: value.trim() };
}

function deleteMasterDataItem(id) {
  if (!id) throw new Error("ID is required.");
  var success = Database.deleteRow(CONFIG.SHEETS.MASTER_DATA, 'ID', id);
  return { success: success, id: id };
}

function getRecentActivity(limit) {

  return ActivityService.getRecentActivity(limit);
}

function getMatterActivity(matterId) {
  return ActivityService.getActivityByMatterId(matterId);
}

// ----------------------------------------------------------------------
// Setup Function (Run this once from the Apps Script Editor)
// ----------------------------------------------------------------------
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheets = [
    { name: CONFIG.SHEETS.MATTERS, headers: ['ID', 'Matter Name', 'Application / Case No.', 'Category', 'Type', 'Sub Type', 'Client / Company', 'Description', 'Status', 'Priority', 'Assigned To', 'Next Action', 'Next Date', 'Reminder Enabled', 'Reminder Days', 'Calendar Event ID', 'Email Thread ID', 'Email Link', 'Drive Folder ID', 'Drive Folder Link', 'Notes', 'Created Date', 'Updated Date'] },
    { name: CONFIG.SHEETS.TASKS, headers: ['Task ID', 'Task Name', 'Matter ID', 'Category', 'Type', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Reminder Enabled', 'Reminder Days', 'Calendar Event ID', 'Notes', 'Created Date', 'Updated Date'] },
    { name: CONFIG.SHEETS.EMAILS, headers: ['Email ID', 'Gmail Thread ID', 'Matter ID', 'Subject', 'From', 'To', 'Email Date', 'Gmail Link', 'Category', 'Created Date'] },
    { name: CONFIG.SHEETS.DOCUMENTS, headers: ['Document ID', 'Matter ID', 'Document Name', 'Drive File ID', 'Drive Folder ID', 'Drive Link', 'Document Type', 'Uploaded Date', 'Notes'] },
    { name: CONFIG.SHEETS.CALENDAR_EVENTS, headers: ['Calendar Event ID', 'Matter ID', 'Task ID', 'Event ID', 'Event Title', 'Event Date', 'Reminder Settings', 'Created Date', 'Updated Date', 'Status'] },
    { name: CONFIG.SHEETS.SETTINGS, headers: ['Setting Key', 'Setting Value'] },
    { name: CONFIG.SHEETS.MASTER_DATA, headers: ['ID', 'Type', 'Value', 'Created Date'] },
    { name: CONFIG.SHEETS.ACTIVITY_LOG, headers: ['Log ID', 'Date', 'User', 'Action', 'Matter ID', 'Description'] }
  ];
  
  for (var i = 0; i < sheets.length; i++) {
    var sheetData = sheets[i];
    var sheet = ss.getSheetByName(sheetData.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetData.name);
      sheet.appendRow(sheetData.headers);
      sheet.getRange(1, 1, 1, sheetData.headers.length).setFontWeight("bold").setBackground("#e0e0e0");
      sheet.setFrozenRows(1);
    }
  }
  
  // Create sample data if Matters is empty
  var matterSheet = ss.getSheetByName(CONFIG.SHEETS.MATTERS);
  if (matterSheet && matterSheet.getLastRow() === 1) {
    createDemoData();
  }
}

function createDemoData() {
  var d1 = new Date(); d1.setDate(d1.getDate() + 15);
  var d2 = new Date(); d2.setDate(d2.getDate() + 3);
  var d3 = new Date(); d3.setDate(d3.getDate() - 2); // Overdue
  
  var demoMatters = [
    { 'Matter Name': 'Powerjeet Bidi', 'Application / Case No.': '6611916', 'Category': 'Trademark', 'Type': 'Opposition', 'Status': 'Pending', 'Priority': 'High', 'Next Action': 'File Opposition', 'Next Date': Utils.formatDateForSheet(d1), 'Reminder Enabled': 'Yes', 'Reminder Days': '7,3,1' },
    { 'Matter Name': 'Sunrise', 'Application / Case No.': '7894561', 'Category': 'Trademark', 'Type': 'New Application', 'Status': 'Under Process', 'Priority': 'High', 'Next Action': 'Send Documents', 'Next Date': Utils.formatDateForSheet(d2), 'Reminder Enabled': 'Yes', 'Reminder Days': '1' },
    { 'Matter Name': 'Creative Arts', 'Application / Case No.': '1456789', 'Category': 'Copyright', 'Type': 'Objection / Reply', 'Status': 'Pending', 'Priority': 'Medium', 'Next Action': 'Reply to Objection', 'Next Date': Utils.formatDateForSheet(d3), 'Reminder Enabled': 'No', 'Reminder Days': '' }
  ];
  
  for (var i = 0; i < demoMatters.length; i++) {
    MatterService.saveMatter(demoMatters[i]);
  }
}
