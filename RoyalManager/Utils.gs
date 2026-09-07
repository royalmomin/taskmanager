/**
 * ROYAL MANAGER
 * Utils.gs
 * Helper functions.
 */

var Utils = {
  
  /**
   * Generates a simple UUID for unique IDs.
   */
  generateUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  /**
   * Formats a date for display.
   */
  formatDate: function(dateObj) {
    if (!dateObj) return "";
    var d = new Date(dateObj);
    if (isNaN(d.getTime())) return dateObj; // string
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-GB', options);
  },
  
  /**
   * Formats a date for Google Sheets storage (YYYY-MM-DD).
   */
  formatDateForSheet: function(dateObj) {
    if (!dateObj) return "";
    var d = new Date(dateObj);
    if (isNaN(d.getTime())) return dateObj;
    return d.toISOString().split('T')[0];
  },
  
  /**
   * Parses standard form inputs to handle checkboxes.
   */
  parseFormCheckbox: function(val) {
    return val === 'on' || val === true || val === 'Yes' || val === 'true';
  },

  /**
   * Calculates days difference from today.
   * Returns positive for future, negative for past.
   */
  getDaysDifference: function(targetDateStr) {
    if (!targetDateStr) return null;
    var targetDate = new Date(targetDateStr);
    targetDate.setHours(0,0,0,0);
    var today = new Date();
    today.setHours(0,0,0,0);
    var diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};
