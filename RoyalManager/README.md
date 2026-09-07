# ROYAL MANAGER

Legal • IP • Company • Task Management

A lightweight Google Apps Script Web Application to manage Trademark matters, Copyright matters, Company Tasks, and General Tasks, with an emphasis on seamless Google Calendar reminder synchronization.

## Setup Instructions

### 1. Create the Google Apps Script Project
1. Open Google Drive.
2. Create a new Google Sheet. Let's call it "Royal Manager Data".
3. In the Google Sheet, go to **Extensions > Apps Script**.
4. This will open the Apps Script Editor.

### 2. Copy the Files
You have two options for copying the code from this folder to your Apps Script Editor:

**Option A: Manual Copy/Paste**
1. Create identical `.gs` and `.html` files in the Apps Script Editor to match the files in this folder.
2. Carefully copy and paste the contents of each file from this folder into the corresponding file in the Editor.

**Option B: Using Clasp (Recommended for Developers)**
1. Install clasp: `npm install -g @google/clasp`
2. Login to clasp: `clasp login`
3. Get the Script ID from the Apps Script Editor (Project Settings > Script ID).
4. Run: `clasp clone [Script ID]`
5. Copy these generated files into that cloned directory.
6. Run: `clasp push`

### 3. Initialize the Database (Google Sheets)
1. Open `Code.gs` in the Apps Script Editor.
2. At the top of the editor, select the function `setupDatabase` from the dropdown menu.
3. Click the **Run** button.
4. **Authorization:** Google will ask you to review permissions. Click "Review permissions", select your account, click "Advanced", and then "Go to project (unsafe)". Allow the permissions.
5. This function will automatically create the 7 necessary sheets with the required headers and populate some demo data.

### 4. Enable Advanced Google Services (Optional but Recommended)
To fully utilize Gmail and Drive capabilities in the future (stubs exist in the code):
1. In the Apps Script Editor, click the `+` next to **Services**.
2. Add **Google Calendar API**, **Gmail API**, and **Google Drive API**.

### 5. Deploy the Web App
1. In the top right corner of the Apps Script Editor, click **Deploy > New deployment**.
2. **Select type:** Web app (click the gear icon to check it).
3. **Description:** e.g., "Initial Release"
4. **Execute as:** "Me" (your email).
5. **Who has access:** "Only myself" (or "Anyone within [Your Organization]" if sharing with a team).
6. Click **Deploy**.
7. You will be provided with a **Web app URL**. Click this URL to open Royal Manager!

## Testing the Application

### 1. Test Data Loading
- Open the Web App URL.
- The Dashboard should display the summary of the demo data created during `setupDatabase()`.
- Click the **All Matters** tab on the left to see the demo records in the table.

### 2. Test Calendar Creation
1. Go to **Matters > All Matters**.
2. Click **Add Matter**.
3. Fill in a Matter Name (e.g., "Test Trademark").
4. Select a future **Next Date** (e.g., tomorrow).
5. Ensure **Enable Google Calendar Reminder** is checked.
6. Click **Save Matter**.
7. **Verify:** Open your Google Calendar. You should see an All-Day event titled "DEADLINE — [Type] — Test Trademark" on the chosen date.

### 3. Test Calendar Update
1. In Royal Manager, find the matter you just created and click **Edit**.
2. Change the **Next Date** to a different future date.
3. Click **Save Matter**.
4. **Verify:** Check Google Calendar. The existing event should have moved to the new date. It should *not* have created a duplicate event.

### 4. Test Calendar Deletion
1. (Note: Currently the UI deletion requires custom implementation on the frontend list, but the backend `deleteMatter(id, true)` function is fully equipped to delete the Google Calendar event alongside the matter.)

## Project Structure
- `Code.gs`: Entry point (`doGet`) and backend API functions (`google.script.run`).
- `Database.gs`: Core CRUD logic directly interacting with Google Sheets.
- `MatterService.gs`: Business logic for Matter entities.
- `CalendarService.gs`: Core logic for creating, updating, and removing Calendar Events based on Matter deadlines.
- `Config.gs`: Constant variables like sheet names and column statuses.
- `Index.html`: The main Single Page Application wrapper.
- `JavaScript.html` & `CSS.html`: Frontend styling and routing logic.
