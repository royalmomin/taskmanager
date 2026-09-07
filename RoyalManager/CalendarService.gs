/**
 * ROYAL MANAGER
 * CalendarService.gs
 * Google Calendar Integration.
 */

var CalendarService = {
  
  /**
   * Syncs a Matter's calendar event.
   * Creates if it doesn't exist, updates if it does.
   */
  syncMatterEvent: function(matter) {
    if (matter['Reminder Enabled'] !== 'Yes') {
      // If reminder turned off but event exists, we don't automatically delete, 
      // but you could implement that here if desired.
      return matter; 
    }
    
    if (!matter['Next Date']) return matter;
    
    var calendar = CalendarApp.getDefaultCalendar(); // Or get from settings
    
    var eventTitle = "DEADLINE \u2014 " + matter.Type + " \u2014 " + matter['Matter Name'];
    
    var eventDescription = "Matter: " + matter['Matter Name'] + "\n" +
                           "Application No: " + matter['Application / Case No.'] + "\n" +
                           "Type: " + matter.Type + "\n" +
                           "Next Action: " + matter['Next Action'] + "\n" +
                           "Status: " + matter.Status + "\n" +
                           "Priority: " + matter.Priority + "\n";
                           
    if (matter['Email Link']) eventDescription += "Gmail: " + matter['Email Link'] + "\n";
    if (matter['Drive Folder Link']) eventDescription += "Documents: " + matter['Drive Folder Link'] + "\n";
    
    // Parse Date
    var nextDate = new Date(matter['Next Date']);
    if (isNaN(nextDate.getTime())) return matter; // Invalid date
    
    var eventId = matter['Calendar Event ID'];
    var event = null;
    
    if (eventId) {
      try {
        event = calendar.getEventById(eventId);
      } catch(e) {
        // Event might have been deleted manually
        event = null;
      }
    }
    
    if (event) {
      // UPDATE existing
      event.setTitle(eventTitle);
      event.setDescription(eventDescription);
      event.setAllDayDate(nextDate);
      
      // Reminders (clear existing and set new)
      event.removeAllReminders();
      this._applyReminders(event, matter['Reminder Days']);
      
    } else {
      // CREATE new
      event = calendar.createAllDayEvent(eventTitle, nextDate, {description: eventDescription});
      matter['Calendar Event ID'] = event.getId();
      
      // Reminders
      this._applyReminders(event, matter['Reminder Days']);
    }
    
    return matter;
  },
  
  deleteEvent: function(eventId) {
    if (!eventId) return;
    var calendar = CalendarApp.getDefaultCalendar();
    try {
      var event = calendar.getEventById(eventId);
      if (event) {
        event.deleteEvent();
      }
    } catch (e) {
      Logger.log("Event not found or could not be deleted: " + e.toString());
    }
  },
  
  /**
   * Applies reminders to the event.
   * reminderDays can be comma-separated like "1,3,7"
   */
  _applyReminders: function(event, reminderDaysStr) {
    if (!reminderDaysStr) {
      // Use defaults if empty, or just 1 day
      event.addEmailReminder(24 * 60); // 1 day before in minutes
      event.addPopupReminder(24 * 60);
      return;
    }
    
    var daysArr = String(reminderDaysStr).split(',');
    for (var i = 0; i < daysArr.length; i++) {
      var days = parseInt(daysArr[i].trim(), 10);
      if (!isNaN(days) && days > 0) {
        var minutes = days * 24 * 60;
        event.addPopupReminder(minutes);
        // You could also add email reminder if desired:
        // event.addEmailReminder(minutes);
      }
    }
  }
};
