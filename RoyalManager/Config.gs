/**
 * ROYAL MANAGER
 * Config.gs
 * Contains global configurations and constants.
 */

var CONFIG = {
  // Replace with your actual Spreadsheet ID if not bound to the spreadsheet
  // SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', 
  
  SHEETS: {
    MATTERS: 'Matters',
    TASKS: 'Tasks',
    EMAILS: 'Emails',
    DOCUMENTS: 'Documents',
    CALENDAR_EVENTS: 'CalendarEvents',
    SETTINGS: 'Settings',
    MASTER_DATA: 'MasterData',
    ACTIVITY_LOG: 'ActivityLog'
  },
  
  STATUS: {
    PENDING: 'Pending',
    UNDER_PROCESS: 'Under Process',
    WAITING_CLIENT: 'Waiting for Client',
    WAITING_REGISTRY: 'Waiting for Registry / Court',
    COMPLETED: 'Completed',
    CLOSED: 'Closed',
    OVERDUE: 'Overdue' // This is a dynamic status mostly
  },
  
  PRIORITY: {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low'
  },
  
  CATEGORIES: {
    TRADEMARK: 'Trademark',
    COPYRIGHT: 'Copyright',
    COMPANY_TASKS: 'Company Tasks',
    GENERAL_TASKS: 'General Tasks'
  }
};

/**
 * Gets the active spreadsheet.
 * Uses getActiveSpreadsheet() if the script is bound to a sheet,
 * otherwise uses openById if SPREADSHEET_ID is provided.
 */
function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}
