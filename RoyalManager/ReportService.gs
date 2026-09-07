/**
 * ROYAL MANAGER
 * ReportService.gs
 * Aggregates data for Dashboard and Reports.
 */

var ReportService = {
  
  getDashboardSummary: function() {
    var matters = MatterService.getAllMatters();
    
    var summary = {
      top: {
        total: matters.length,
        underProcess: 0,
        pending: 0,
        overdue: 0,
        completed: 0
      },
      trademark: {
        total: 0,
        registration: 0,
        newApp: 0,
        opposition: 0,
        rectification: 0,
        renewal: 0,
        hearing: 0,
        other: 0
      },
      copyright: {
        total: 0,
        totalApp: 0,
        newApp: 0,
        objection: 0,
        hearing: 0,
        registration: 0,
        other: 0
      },
      company: {
        total: 0,
        compliance: 0,
        agreements: 0,
        licences: 0,
        renewals: 0,
        payments: 0,
        other: 0
      }
    };
    
    for (var i = 0; i < matters.length; i++) {
      var m = matters[i];
      var status = m._displayStatus || m.Status;
      
      // Top summary
      if (status === CONFIG.STATUS.UNDER_PROCESS) summary.top.underProcess++;
      else if (status === CONFIG.STATUS.PENDING) summary.top.pending++;
      else if (status === CONFIG.STATUS.OVERDUE) summary.top.overdue++;
      else if (status === CONFIG.STATUS.COMPLETED) summary.top.completed++;
      
      // Categories
      if (m.Category === CONFIG.CATEGORIES.TRADEMARK) {
        summary.trademark.total++;
        if (m.Type === 'Total TM Registration' || m.Type === 'Registration' || m.Type === 'TM Registration' || status === CONFIG.STATUS.COMPLETED) {
          summary.trademark.registration++;
        }
        if (m.Type === 'New Application') summary.trademark.newApp++;
        else if (m.Type === 'Opposition') summary.trademark.opposition++;
        else if (m.Type === 'Rectification') summary.trademark.rectification++;
        else if (m.Type === 'Renewal') summary.trademark.renewal++;
        else if (m.Type === 'Hearing') summary.trademark.hearing++;
        else if (m.Type !== 'Total TM Registration' && m.Type !== 'Registration') summary.trademark.other++;
      }
      else if (m.Category === CONFIG.CATEGORIES.COPYRIGHT) {
        summary.copyright.total++;
        if (m.Type === 'Total Copyright Application' || m.Type === 'New Application' || m.Type === 'Application' || (m.Type && m.Type.indexOf('Application') !== -1)) {
          summary.copyright.totalApp++;
        }
        if (m.Type === 'New Application' || m.Type === 'Application') summary.copyright.newApp++;
        else if (m.Type === 'Objection / Reply') summary.copyright.objection++;
        else if (m.Type === 'Hearing') summary.copyright.hearing++;
        else if (m.Type === 'Registration') summary.copyright.registration++;
        else if (m.Type !== 'Total Copyright Application') summary.copyright.other++;
      }
      else if (m.Category === CONFIG.CATEGORIES.COMPANY_TASKS) {
        summary.company.total++;
        if (m.Type === 'Compliance / ROC') summary.company.compliance++;
        else if (m.Type === 'Agreements') summary.company.agreements++;
        else if (m.Type === 'Licences') summary.company.licences++;
        else if (m.Type === 'Renewals') summary.company.renewals++;
        else if (m.Type === 'Payments') summary.company.payments++;
        else summary.company.other++;
      }
    }
    
    return summary;
  }
};
