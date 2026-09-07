const fs = require('fs');
const path = require('path');

const dir = __dirname;

function readFile(filename) {
  try {
    return fs.readFileSync(path.join(dir, filename + '.html'), 'utf8');
  } catch(e) {
    console.warn("Could not read " + filename);
    return "";
  }
}

let indexHtml = readFile('Index');

// Simple regex to find <?!= include('File'); ?>
const includeRegex = /<\?!= include\('([^']+)'\); \?>/g;

indexHtml = indexHtml.replace(includeRegex, (match, p1) => {
  return readFile(p1);
});

// Mock google.script.run
const mockScript = `
<script>
  // MOCK GOOGLE SCRIPT RUN FOR LOCAL PREVIEW
  var google = {
    script: {
      run: {
        withSuccessHandler: function(callback) {
          this.successCb = callback;
          return this;
        },
        withFailureHandler: function(callback) {
          this.failureCb = callback;
          return this;
        },
        getDashboardData: function() {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb({
              top: { total: 112, underProcess: 48, pending: 22, overdue: 3, completed: 39 },
              trademark: { total: 45, registration: 24, newApp: 10, opposition: 5, rectification: 2, renewal: 28, hearing: 0, other: 0 },
              copyright: { total: 20, totalApp: 15, newApp: 15, objection: 3, hearing: 2, registration: 0, other: 0 },
              company: { total: 47, compliance: 20, agreements: 15, licences: 5, renewals: 5, payments: 2, other: 0 }
            });
          }, 500);
        },
        getAllMatters: function() {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb([
              // Active Trademark Registrations
              {
                ID: '101', 'Matter Name': 'Royal Shield Logo', 'Application / Case No.': '5544332', 'Registration No.': 'TM-449120',
                'Class': 'Class 35', 'Proprietor / Owner': 'Royal Enterprises Pvt Ltd', 'Client / Company': 'Royal Enterprises Pvt Ltd',
                'Registration Date': '2021-04-12', 'Renewal Due Date': '2031-04-12', 'Mark Type': 'Device',
                Category: 'Trademark', Type: 'Registration', Status: 'Registered', Priority: 'Medium',
                'Next Action': 'Renewal in 2031', 'Next Date': '2031-04-12', _displayStatus: 'Registered'
              },
              {
                ID: '102', 'Matter Name': 'Astra Global Tech', 'Application / Case No.': '4918234', 'Registration No.': 'TM-382910',
                'Class': 'Class 9, 42', 'Proprietor / Owner': 'Astra Technologies Inc.', 'Client / Company': 'Astra Technologies Inc.',
                'Registration Date': '2019-11-20', 'Renewal Due Date': '2029-11-20', 'Mark Type': 'Word Mark',
                Category: 'Trademark', Type: 'Registration', Status: 'Active', Priority: 'High',
                'Next Action': 'Maintain Status', 'Next Date': '2029-11-20', _displayStatus: 'Active'
              },
              // Inactive Trademark Registrations (Must be excluded from Total TM Registration!)
              {
                ID: '103', 'Matter Name': 'Old Brandmark Expired', 'Application / Case No.': '2211445', 'Registration No.': 'TM-112233',
                'Class': 'Class 25', 'Proprietor / Owner': 'Heritage Mills', 'Client / Company': 'Heritage Mills',
                'Registration Date': '2010-01-15', 'Renewal Due Date': '2020-01-15',
                Category: 'Trademark', Type: 'Registration', Status: 'Expired', Priority: 'Low',
                'Next Action': 'None', 'Next Date': '', _displayStatus: 'Expired'
              },
              {
                ID: '104', 'Matter Name': 'Vintage Motors Abandoned', 'Application / Case No.': '3344556', 'Registration No.': 'TM-998877',
                'Class': 'Class 12', 'Proprietor / Owner': 'Vintage Corp', 'Client / Company': 'Vintage Corp',
                Category: 'Trademark', Type: 'Registration', Status: 'Abandoned', Priority: 'Low',
                'Next Action': 'Closed File', 'Next Date': '', _displayStatus: 'Abandoned'
              },

              // Trademark other sub-modules
              {
                ID: '1', 'Matter Name': 'Powerjeet Bidi', 'Application / Case No.': '6611916', Category: 'Trademark', Type: 'Opposition', 
                'Next Action': 'File Opposition', 'Next Date': '2026-09-20', Status: 'Pending', Priority: 'High', 
                'Calendar Event ID': '123', _displayStatus: 'Pending', _daysLeft: 15
              },
              {
                ID: '2', 'Matter Name': 'Sunrise', 'Application / Case No.': '7894561', Category: 'Trademark', Type: 'New Application', 
                'Next Action': 'Send Documents', 'Next Date': '2026-09-08', Status: 'Under Process', Priority: 'High', 
                'Calendar Event ID': null, _displayStatus: 'Under Process', _daysLeft: 3
              },
              {
                ID: '6', 'Matter Name': 'Falcon Motors', 'Application / Case No.': '8877665', Category: 'Trademark', Type: 'Rectification', 
                'Next Action': 'Submit Evidence', 'Next Date': '2026-09-25', Status: 'Under Process', Priority: 'Medium', 
                _displayStatus: 'Under Process', _daysLeft: 20
              },
              {
                ID: '7', 'Matter Name': 'Zenith Care', 'Application / Case No.': '3322114', Category: 'Trademark', Type: 'Renewal', 
                'Next Action': 'Pay Renewal Fees', 'Next Date': '2026-09-12', Status: 'Pending', Priority: 'High', 
                _displayStatus: 'Pending', _daysLeft: 7
              },

              // Active Copyright Registrations
              {
                ID: '201', 'Matter Name': 'Royal Codebase & Software Suite', 'Application / Case No.': 'CR-77123', 'Registration No.': 'SW-9812/2022',
                'Proprietor / Owner': 'Royal Momin', 'Client / Company': 'Royal Momin',
                'Registration Date': '2022-08-15', Category: 'Copyright', Type: 'Registration', Status: 'Registered', Priority: 'Medium',
                'Next Action': 'Certificate in Locker', 'Next Date': '2028-08-15', _displayStatus: 'Registered'
              },
              {
                ID: '202', 'Matter Name': 'Golden Harvest Artwork', 'Application / Case No.': 'CR-88910', 'Registration No.': 'A-54321/2023',
                'Proprietor / Owner': 'Creative Arts Studio', 'Client / Company': 'Creative Arts Studio',
                'Registration Date': '2023-01-10', Category: 'Copyright', Type: 'Registration', Status: 'Active', Priority: 'Low',
                'Next Action': 'Archived Copy Filed', 'Next Date': '2029-01-10', _displayStatus: 'Active'
              },
              // Inactive Copyright Registration (Must be excluded from Total Copyright Registration!)
              {
                ID: '203', 'Matter Name': 'Archived Novel Draft Closed', 'Application / Case No.': 'CR-12345', 'Registration No.': 'L-11223/2010',
                'Proprietor / Owner': 'Literary Press', 'Client / Company': 'Literary Press',
                Category: 'Copyright', Type: 'Registration', Status: 'Closed', Priority: 'Low',
                'Next Action': 'File Closed', 'Next Date': '', _displayStatus: 'Closed'
              },

              // Copyright other sub-modules
              {
                ID: '4', 'Matter Name': 'Creative Arts', 'Application / Case No.': '1456789', Category: 'Copyright', Type: 'Objection / Reply', 
                'Next Action': 'Reply to Objection', 'Next Date': '2026-09-03', Status: 'Pending', Priority: 'Medium', 
                'Calendar Event ID': null, _displayStatus: 'Overdue', _daysLeft: -2
              },
              {
                ID: '5', 'Matter Name': 'Music Album Artwork', 'Application / Case No.': '2233441', Category: 'Copyright', Type: 'New Application', 
                'Next Action': 'Awaiting Diary No.', 'Next Date': '2026-09-15', Status: 'Under Process', Priority: 'Low', 
                'Calendar Event ID': null, _displayStatus: 'Under Process', _daysLeft: 10
              },

              // Company Tasks sub-modules
              {
                ID: '301', 'Matter Name': 'ROC Annual Return Filing 2026', 'Application / Case No.': 'ROC-9901', Category: 'Company Tasks', Type: 'Compliance / ROC',
                'Next Action': 'File MGT-7', 'Next Date': '2026-10-30', Status: 'Under Process', Priority: 'High', _displayStatus: 'Under Process'
              },
              {
                ID: '302', 'Matter Name': 'Vendor Master Service Agreement', 'Application / Case No.': 'AGR-442', Category: 'Company Tasks', Type: 'Agreements',
                'Next Action': 'Sign Contract', 'Next Date': '2026-09-18', Status: 'Pending', Priority: 'Medium', _displayStatus: 'Pending'
              }
            ]);
          }, 500);
        },
        getMatterById: function(id) {
          var self = this;
          this.getAllMatters();
          setTimeout(function() {
            if(self.successCb) {
              // Read from the matters mock
              var found = {
                ID: id, 'Matter Name': 'Sample Matter #' + id, 'Application / Case No.': '6611916', 'Registration No.': 'TM-449120',
                'Class': 'Class 35', 'Proprietor / Owner': 'Royal Enterprises', 'Client / Company': 'Royal Enterprises',
                'Registration Date': '2021-04-12', 'Renewal Due Date': '2031-04-12',
                Category: 'Trademark', Type: 'Registration', Status: 'Registered', Priority: 'High', 'Reminder Enabled': 'Yes', 'Reminder Days': '7,3,1'
              };
              self.successCb(found);
            }
          }, 500);
        },
        saveMatter: function(data) {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb(data);
          }, 500);
        },
        getAllTasks: function() {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb([
              { 'Task ID': '1', 'Task Name': 'Review Documents', 'Due Date': '2026-09-10', 'Priority': 'High', 'Assigned To': 'Royal', Status: 'Pending', _displayStatus: 'Pending' }
            ]);
          }, 500);
        },
        getMatterActivity: function(id) {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb([
              { 'Date': new Date().toISOString(), 'User': 'Royal', 'Action': 'Created', 'Description': 'Matter imported.' }
            ]);
          }, 500);
        },
        saveTask: function(data) {
          var self = this;
          setTimeout(function() { if(self.successCb) self.successCb(); }, 500);
        },
        sendEmail: function(data) {
          var self = this;
          setTimeout(function() { if(self.successCb) self.successCb(); }, 500);
        },
        getSettings: function() {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb({
              default_calendar: 'Primary Calendar',
              default_remdays: '7,3,1',
              gcal_client_id: '',
              gcal_client_secret: '',
              gcal_calendar_id: '',
              gcal_connected: 'false',
              gcal_auto_sync: 'true',
              gcal_sync_interval: 'realtime',
              gcal_sync_deadlines: 'true',
              gcal_sync_hearings: 'true',
              gcal_sync_renewals: 'true',
              gcal_sync_tasks: 'false',
              gcal_last_sync: '',
              gcal_sync_count: '0'
            });
          }, 300);
        },
        saveSettings: function(data) {
          var self = this;
          setTimeout(function() { if(self.successCb) self.successCb(data); }, 300);
        },
        saveCalendarSettings: function(data) {
          var self = this;
          setTimeout(function() { if(self.successCb) self.successCb(data); }, 300);
        },
        testCalendarApiConnection: function(clientId, clientSecret) {
          var self = this;
          setTimeout(function() {
            if (clientId && clientSecret) {
              if(self.successCb) self.successCb({ success: true, calendarName: 'Primary Calendar' });
            } else {
              if(self.successCb) self.successCb({ success: false, error: 'Missing credentials' });
            }
          }, 1000);
        },
        syncAllCalendarEvents: function() {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb({ synced: 3, timestamp: new Date().toISOString() });
          }, 1500);
        },
        _mockMasterData: {
          companies: [
            { id: 'comp_1', value: 'Royal Enterprises Pvt Ltd' },
            { id: 'comp_2', value: 'Astra Technologies Inc.' },
            { id: 'comp_3', value: 'Heritage Mills' },
            { id: 'comp_4', value: 'Vintage Corp' }
          ],
          brands: [
            { id: 'brand_1', value: 'Royal Shield Logo' },
            { id: 'brand_2', value: 'Sunrise' },
            { id: 'brand_3', value: 'Astra Global Tech' },
            { id: 'brand_4', value: 'Powerjeet Bidi' },
            { id: 'brand_5', value: 'Falcon Motors' },
            { id: 'brand_6', value: 'Creative Arts' },
            { id: 'brand_7', value: 'Heritage Cotton' },
            { id: 'brand_8', value: 'Blue Diamond' }
          ],
          agents: [
            { id: 'agent_1', value: 'S. Majumdar' },
            { id: 'agent_2', value: 'Royal' },
            { id: 'agent_3', value: 'Admin' }
          ]
        },
        getMasterData: function() {
          var self = this;
          setTimeout(function() {
            if(self.successCb) self.successCb(JSON.parse(JSON.stringify(self._mockMasterData)));
          }, 300);
        },
        addMasterDataItem: function(type, value) {
          var self = this;
          setTimeout(function() {
            var normType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            var listKey = (normType === 'Company') ? 'companies' : ((normType === 'Brand') ? 'brands' : 'agents');
            var id = normType.toLowerCase() + '_' + Date.now();
            var item = { id: id, value: value.trim() };
            if (!self._mockMasterData[listKey]) self._mockMasterData[listKey] = [];
            self._mockMasterData[listKey].push(item);
            if(self.successCb) self.successCb({ success: true, item: item });
          }, 300);
        },
        updateMasterDataItem: function(id, value) {
          var self = this;
          setTimeout(function() {
            ['companies', 'brands', 'agents'].forEach(function(k) {
              var it = (self._mockMasterData[k] || []).find(function(x) { return x.id === id; });
              if (it) it.value = value.trim();
            });
            if(self.successCb) self.successCb({ success: true, id: id, value: value.trim() });
          }, 300);
        },
        deleteMasterDataItem: function(id) {
          var self = this;
          setTimeout(function() {
            ['companies', 'brands', 'agents'].forEach(function(k) {
              self._mockMasterData[k] = (self._mockMasterData[k] || []).filter(function(x) { return x.id !== id; });
            });
            if(self.successCb) self.successCb({ success: true, id: id });
          }, 300);
        }
      }
    }
  };
</script>
`;

// Inject the mock script right before the closing body tag or right after the CSS
indexHtml = indexHtml.replace('</head>', mockScript + '</head>');

fs.writeFileSync(path.join(dir, 'Local_Preview.html'), indexHtml);
console.log('Local_Preview.html generated successfully.');
