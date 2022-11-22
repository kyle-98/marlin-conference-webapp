# Marlin Business Conference WebApp
This web application was built as a concept design to replace the need for mulitple excel files being constantly changed and uploaded to sharepoint.  The web application uses MySQL as a database.  One table is for user information and the second table is for login information.  The web application uses Node.js to support the server.  This application allows for the creation of user accounts in which a user can input their times.  Those times are then saved to a database which only that user can see.  There are admin accounts which can see all times for the conference for every user in the system.  The admin can go in and edit any of the entries if they are incorrect or fake times.

## Login Page
<img src="https://i.imgur.com/swVQnlz.png" width=844 height=484>

## User Homepage
The user homepage allows users to add hours to their timesheet, change their password, and logout.
<img src="https://i.imgur.com/h3soKMP.png">

## User Adding Hours Page
This page allows the user to input the data for the timeslot that they worked on some aspect of the business conference.  The user inputs a date, time, task name, notes, start time, and end time.
<img src="https://i.imgur.com/WmCbukH.png">

## Change Password
The change password uses the tingle.js library to create a popup the where the user can change their password.  This verifies there is a password being input, doesn't allow the user to input nothing, and verifies the two password match.
<img src="https://i.imgur.com/5fNGLDx.png">

## Admin Login Page
<img src="https://i.imgur.com/WjA3rCj.png">

## Admin Homepage
On this page, the admin can view the total times from all users in the database, select a user to see their specific time sheet, and edit any entry in their timesheet.  This allows for the admin to correct mistakes or prevent someone from adding hours they did not actually have.
<img src="https://i.imgur.com/NeFKK6m.png">

## Admin Edit Popup
In this menu the admin can replace any values in the selected entry for a user.  This once again uses the tingle.js library for a popup.  The old information is already stored inside the editing boxes.  This prevents the admin from accidentally entering blank data, even though it rejects blank data.  The total time is automatically calculated based on the times that are set.
<img src="https://i.imgur.com/qkn8vq3.png">

## Admin Create User Page
This page allows the admin to create a new user.  This new user is then given a username, password, and the option to make the new user an admin.  This information gets sent and stored in the MySQL database on creation. 
<br>
<img src="https://i.imgur.com/rNkf8Od.png">

