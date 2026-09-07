/**
 * ROYAL MANAGER
 * ActivityService.gs
 * Logs actions to the ActivityLog sheet.
 */

var ActivityService = {
  
  logActivity: function(action, matterId, description) {
    try {
      var logData = {
        'Log ID': Utils.generateUUID(),
        'Date': new Date().toISOString(),
        'User': Session.getActiveUser().getEmail(),
        'Action': action,
        'Matter ID': matterId || '',
        'Description': description || ''
      };
      Database.insert(CONFIG.SHEETS.ACTIVITY_LOG, logData);
    } catch(e) {
      Logger.log("Failed to log activity: " + e.toString());
    }
  },
  
  getRecentActivity: function(limit) {
    var logs = Database.readAll(CONFIG.SHEETS.ACTIVITY_LOG);
    logs.sort(function(a, b) {
      return new Date(b.Date) - new Date(a.Date);
    });
    limit = limit || 50;
    return logs.slice(0, limit);
  },
  
  getActivityByMatterId: function(matterId) {
    var logs = Database.readAll(CONFIG.SHEETS.ACTIVITY_LOG);
    var filtered = logs.filter(function(log) {
      return log['Matter ID'] === matterId;
    });
    filtered.sort(function(a, b) {
      return new Date(b.Date) - new Date(a.Date);
    });
    return filtered;
  }
};
