# Changelog

## v0.3.3

### CHANGED

- More user friendly 401 message with link to login page

### FIXED

- Require all fields in create new user form to prevent error 500s

## v0.3.2

### CHANGED

- Login cookies now expire after 90 days
- Restrict Hacker ID to non-hackers and confirmed hackers
- Confirmation dialog for confirming and declining admission

## v0.3.1

### FIXED

- 401 error message now includes more details

## v0.3.0

### ADDED

- Customizable acceptance email template
- Editable schedule
- Notice on front page when applications are closed
- Ability for admins to create users
- Basic Hacker ID implementation

### CHANGED

- Navbar is now mobile responsive and sticks to the top
- Login cookies now expire after 7 days

### FIXED

- Too much padding around no announcements available text for non-admins

## v0.2.0

### ADDED

- Info board with Markdown support
- Markdown support to announcements
- Hover and pressed effects on all buttons
- Email sending from SMTP service like AWS SES

### CHANGED

- Buttons in admissions page now stick to bottom of viewport

### FIXED

- Delete button on announcement rendered as an empty box
- Confirmation deadline in admin panel no longer assumes UTC timezone

## v0.1.2

### ADDED

- First generation and international student questions
- Pending acceptances statistics
- Hackers can confirm and decline attendance once accepted
- Admins can set deadline to confirm

### FIXED

- Allow registrations from all .\*utexas.edu subdomains
- Race and pronouns were missing from user info view

### CHANGED

- Colored status dot now reflects pending decisions if any exist

## v0.1.1

### FIXED

- Error 500 when answering dietary restriction question

## v0.1.0

### ADDED

- Magic link login
- Deletable announcements
- Hacker registration with autosave and submission
- Admin interface to for admissions and closing registration
