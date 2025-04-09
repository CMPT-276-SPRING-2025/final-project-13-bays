# 📌 CMPT 276: Final Project

## 📂 Group Information
- **Group Number:** 13
- **Group Name:** Bays

## 📝 Project Title
**TabMark**

## 📖 Project Description
Tabmark organizes and saves the tabs of the user's choice. The user can get back on track of their project with ease. The website also reminds of the upcoming deadlines, preventing procrastination. Further, there is also a calender view for user to plan their projects ahead more easier.

## Features
1. Users are able to do native account creation, as well as, authentication with third-party providers
2. Users are asked to verify email for account creation and the users will also have the ability to reset password.
3. Sends daily email to remind user of any upcoming urgent projects
4. Sends weekly email to congrat user on any completed projects of the week
5. Query current browser window for all active tabs and save their URLs+Titles as tab objects in our database when users decide to create or edit a project
6. Users are able to open the tabs when they clicked on a project

## Sub-features
- User Categories: Projects can be broken down into user own custom categories such as 'Studies', 'Works', and 'Hobbies'.
- Calendar View: allow the users to view all projects in calendar form to help users have an easier time visualizing and planning all their projects.

__**Goal:**__ Help the user organize projects on a web browsers more conveniently. The website will have constant daily alerts for urgent projects and weekly congratulation for completed projects, which are implemented to help prevent procrastination and encourage completing projects.

## 🛠️ Technologies & Tools
- [Programming Languages] HTML, CSS, Javascript
- [Frameworks] Vite, React.JS, Tailwind CSS, Express
- [API's] Firebase, Sendgrid, Chrome Tabs

## 📆 Timeline
| Phase            | Task Description                   | Deadline              |
|------------------|------------------------------------|-----------------------|
| M0 - Proposal    | Report                             | Friday, Feb 7th       |
| M1 - Planning    | Report + Video                     | Friday, Mar 7th       |
| M1.5 - Check-in  | Report + Mtg w/ TA                 | Week of Mar 17-21st   |
| M2 - Delivery    | Report + Presentation + Code       | Tuesday, Apr 8th      |

## 🚀 Expected Outcome
-A website helping users to be successful in their academic endeavour, as well as other facets of life.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# LOCAL DEPLOY GUIDE:

1. Go to chrome://extensions
2. Enable developer mode by toggling button in the top right
3. Click on the ‘Load unpacked’ option in the top left
4. Navigate to our repository and find the ‘chrome-extension’ folder and select it
5. Click on the Details under the ‘TabMark Helper’ extension and copy the ID
6. Open repository/frontend/src/components/home-paje.jsx
7. Replace the ID number value for EXTENSION_ID that is placed before all the imports at the top of the file.
8. Make sure extension is enabled on their Chrome
9. Run both frontend and backend server by doing “npm start” in the root directory, and then go “ http://localhost:5173/”

## Local Testing for Email 
1. Create Projects that are "Urgent" when on the localhost created above
2. Go to Github Actions
3. Manually trigger Daily and Weekly Email Jobs

