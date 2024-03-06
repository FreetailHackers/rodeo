# Changelog

## v0.9.0

[ADDED]

- Brand new Rodeo UI
- Rodeo is single page application

## v0.8.6

[ADDED]

- MLH Banner
- NLP Tokenizer for word frequency statistics
- RSVP Confirmation Waves

## v0.8.5

[FIXED]

- Dropdowns now display all options when blank

## v0.8.4

[ADDED]

- Fuzzy searching for dropdowns

[FIXED]

- Downloading files while filtering by a dropdown question now works

## v0.8.3

[FIXED]

- Download files 100 at a time to reduce server load

## v0.8.2

[ADDED]

- Confirmation dialog for deleting questions/events, releasing decisions
- Progress notification for downloading files

[CHANGED]

- Dropdowns for multiselect questions now stay open after selection

[FIXED]

- Enlargened hitbox for navbar tabs on desktop to match hover area
- Preselecting current day on schedule no longer breaks after noon

[REMOVED]

- Replaced the VERIFIED status with an email verified attribute

## v0.8.1

[FIXED]

- Prevent favicon requests on schedule from triggering 500 errors

## v0.8.0

[ADDED]

- Timestamps for scans
- Ability to close applications based on deadline or application limit

[CHANGED]

- Redesigned navbar and hacker ID page
- Statistics in user page are now lazily loaded to improve TTI

## v0.7.3

[ADDED]

- PWA support
- Statistics for all question types
- Download data/files button now ignore display limit
- Markdown support in schedule

[FIXED]

- Required checkboxes in application not checked after withdraw and edit
- Sponsors can no longer search by status/role/decision/scan actions
- Sponsors can view files that they have access to
- Logging in with Google/GitHub OAuth now normalizes emails to lowercase

[REMOVED]

- Ability for sponsors to export data

## v0.7.2

[ADDED]

- Textareas can now be vertically resized

[CHANGED]

- Optimized database queries and email sending for releasing decisions

[FIXED]

- Users list not showing in navbar for sponsor accounts
- Users list display limit not remembering filters
- Users list pagination buttons not disabled when at first/last page

[REMOVED]

- Show all users option in user list

## v0.7.1

[FIXED]

- Password resets expire in 10 minutes instead of 10 seconds now
- Sponsor accounts can actually see the sponsor portal

## v0.7.0

[ADDED]

- Ability to filter users by decisions, questions, and scan actions
- Sponsor portal

## v0.6.3

[ADDED]

- Admin panel setting for event timezone

[FIXED]

- Schedule now always displays times in timezone of event
- Admissions page not updating correctly after accept/waitlist/reject

## v0.6.2

[ADDED]

- Graph for tracking user and status count over time
- Pie charts for DROPDOWN and RADIO question response counts
- QR code scan options can be customized by admins
- More descriptive page `<title>`s

[FIXED]

- Not all users appearing in search results

## v0.6.1

[FIXED]

- Errors when submitting a blank optional non-custom-entry multiselect
- User table showing out-of-order/mismatched data after searching

## v0.6.0

[ADDED]

- Custom file upload questions
- Pagination in user table

[FIXED]

- Searching by email, status, role

[REMOVED]

- Searching by SENTENCE or PARAGRAPH questions

## v0.5.1

[ADDED]

- Support for custom responses in dropdowns
- Custom radio questions
- Page transitions

## v0.5.0

[ADDED]

- Registration questions can now be reordered
- Ability for admins to export hacker applications to a CSV
- Question labels support Markdown
- Multiselect questions
- Typeahead filtering for dropdowns
- Users can have multiple roles

[FIXED]

- Non-hackers showing up on admissions widget

## v0.4.2

[FIXED]

- No show password button on reset page
- Password resets not working for users who used Google/GitHub login
- Refreshing a password reset prompt would invalidate the reset token
- Schedule page scrolling to bottom after deleting an event
- CSS issues on application page

## v0.4.1

[ADDED]

- A default Select... option for dropdowns
- Checkbox questions

[FIXED]

- Creating an account would not automatically send a verification email
- /unverified route did not actually check if user was unverified

## v0.4.0

[ADDED]

- Global toast notification system for form action results
- Custom registration questions for short/long text, dropdown, numbers
- Customizable homepage text
- Automatic email receipts for submitting/confirming/declining
- Export schedule to .ics
- Dedicated page for each event
- Ability for admins to set/release decisions, status, role for any user

[CHANGED]

- Editing events no longer requires client side JavaScript
- Schedule only shows one day at a time and no longer hardcodes days
- More user friendly message for 401 and 403 errors
- Login system now uses email-password/OAuth instead of magic links

[FIXED]

- Rare race where an edited event would appear to be duplicated
- Edit event form didn't fill properly in some cases
- Error 500 on spam deleting announcements

[REMOVED]

- The MENTOR role

## v0.3.5

[SECURITY]

- Unauthenticated users can no longer create admin accounts

## v0.3.4

[ADDED]

- Admins can now instant-confirm walk-ins from the user list
- More descriptive and color-coded QR code error messages
- Counter of total number of hackers that have scanned an action

[CHANGED]

- Keep track of how many times ID has been scanned per action

[FIXED]

- Image overflowing containers

## v0.3.3

[CHANGED]

- More user friendly 401 message with link to login page

[FIXED]

- Require all fields in create new user form to prevent error 500s

## v0.3.2

[CHANGED]

- Login cookies now expire after 90 days
- Restrict Hacker ID to non-hackers and confirmed hackers
- Confirmation dialog for confirming and declining admission

## v0.3.1

[FIXED]

- 401 error message now includes more details

## v0.3.0

[ADDED]

- Customizable acceptance email template
- Editable schedule
- Notice on front page when applications are closed
- Ability for admins to create users
- Basic Hacker ID implementation

[CHANGED]

- Navbar is now mobile responsive and sticks to the top
- Login cookies now expire after 7 days

[FIXED]

- Too much padding around no announcements available text for non-admins

## v0.2.0

[ADDED]

- Info board with Markdown support
- Markdown support to announcements
- Hover and pressed effects on all buttons
- Email sending from SMTP service like AWS SES

[CHANGED]

- Buttons in admissions page now stick to bottom of viewport

[FIXED]

- Delete button on announcement rendered as an empty box
- Confirmation deadline in admin panel no longer assumes UTC timezone

## v0.1.2

[ADDED]

- First generation and international student questions
- Pending acceptances statistics
- Hackers can confirm and decline attendance once accepted
- Admins can set deadline to confirm

[FIXED]

- Allow registrations from all .\*utexas.edu subdomains
- Race and pronouns were missing from user info view

[CHANGED]

- Colored status dot now reflects pending decisions if any exist

## v0.1.1

[FIXED]

- Error 500 when answering dietary restriction question

## v0.1.0

[ADDED]

- Magic link login
- Deletable announcements
- Hacker registration with autosave and submission
- Admin interface to for admissions and closing registration
