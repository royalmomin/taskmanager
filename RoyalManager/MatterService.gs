/**
 * ROYAL MANAGER
 * MatterService.gs
 * Business logic for Matters.
 */

var MatterService = {
  
  getAllMatters: function() {
    var matters = Database.readAll(CONFIG.SHEETS.MATTERS);
    return this._processDynamicStatus(matters);
  },
  
  getMatterById: function(id) {
    var matter = Database.findById(CONFIG.SHEETS.MATTERS, 'ID', id);
    if (!matter) return null;
    return this._processDynamicStatus([matter])[0];
  },
  
  saveMatter: function(matterData) {
    var isNew = !matterData.ID;
    
    if (isNew) {
      matterData.ID = Utils.generateUUID();
      matterData['Created Date'] = new Date().toISOString();
    }
    matterData['Updated Date'] = new Date().toISOString();
    
    // Check if we need to sync with Calendar
    if (matterData['Reminder Enabled'] === 'Yes' || matterData['Reminder Enabled'] === true) {
      matterData['Reminder Enabled'] = 'Yes';
    } else {
      matterData['Reminder Enabled'] = 'No';
    }
    
    // Manage Calendar Event Sync
    // We pass the matter to CalendarService which returns updated calendar info
    try {
      matterData = CalendarService.syncMatterEvent(matterData);
    } catch(e) {
      Logger.log("Calendar sync failed: " + e.toString());
      // Optionally store an error flag in the sheet if you want to retry later
    }
    
    if (isNew) {
      Database.insert(CONFIG.SHEETS.MATTERS, matterData);
    } else {
      Database.update(CONFIG.SHEETS.MATTERS, 'ID', matterData.ID, matterData);
    }
    
    // Log Activity
    ActivityService.logActivity(
      isNew ? 'Matter Created' : 'Matter Updated', 
      matterData.ID, 
      matterData['Matter Name']
    );
    
    return matterData;
  },
  
  deleteMatter: function(id, deleteCalendarEvent) {
    var matter = this.getMatterById(id);
    if (!matter) throw new Error("Matter not found.");
    
    if (deleteCalendarEvent && matter['Calendar Event ID']) {
      try {
        CalendarService.deleteEvent(matter['Calendar Event ID']);
      } catch(e) {
        Logger.log("Failed to delete calendar event: " + e.toString());
      }
    }
    
    var success = Database.deleteRow(CONFIG.SHEETS.MATTERS, 'ID', id);
    if (success) {
      ActivityService.logActivity('Matter Deleted', id, matter['Matter Name']);
    }
    return success;
  },
  
  /**
   * Internal function to process 'Overdue' status dynamically based on dates.
   */
  _processDynamicStatus: function(matters) {
    for (var i = 0; i < matters.length; i++) {
      var m = matters[i];
      m._displayStatus = m.Status; // Keep original for backend
      m._daysLeft = null;
      
      if (m['Next Date'] && m.Status !== CONFIG.STATUS.COMPLETED && m.Status !== CONFIG.STATUS.CLOSED) {
        var daysDiff = Utils.getDaysDifference(m['Next Date']);
        m._daysLeft = daysDiff;
        if (daysDiff < 0) {
          m._displayStatus = CONFIG.STATUS.OVERDUE;
        }
      }
    }
    return matters;
  }
};
