/**
 * ROYAL MANAGER
 * TaskService.gs
 * Business logic for Tasks.
 */
var TaskService = {
  
  getAllTasks: function() {
    var tasks = Database.readAll(CONFIG.SHEETS.TASKS);
    return this._processDynamicStatus(tasks);
  },
  
  saveTask: function(taskData) {
    var isNew = !taskData['Task ID'];
    if (isNew) {
      taskData['Task ID'] = Utils.generateUUID();
      taskData['Created Date'] = new Date().toISOString();
    }
    taskData['Updated Date'] = new Date().toISOString();
    
    if (isNew) {
      Database.insert(CONFIG.SHEETS.TASKS, taskData);
    } else {
      Database.update(CONFIG.SHEETS.TASKS, 'Task ID', taskData['Task ID'], taskData);
    }
    return taskData;
  },

  deleteTask: function(taskId) {
    return Database.deleteRow(CONFIG.SHEETS.TASKS, 'Task ID', taskId);
  },

  _processDynamicStatus: function(tasks) {
    for (var i = 0; i < tasks.length; i++) {
      var t = tasks[i];
      t._displayStatus = t.Status;
      t._daysLeft = null;
      if (t['Due Date'] && t.Status !== CONFIG.STATUS.COMPLETED && t.Status !== CONFIG.STATUS.CLOSED) {
        var daysDiff = Utils.getDaysDifference(t['Due Date']);
        t._daysLeft = daysDiff;
        if (daysDiff < 0) t._displayStatus = CONFIG.STATUS.OVERDUE;
      }
    }
    return tasks;
  }
};
