# DMX Zukunftswerk

Zukunftswerk is a platform for bilingual collaboration. Zukunftswerk provides shared workspaces for handling and commenting on various kinds of content objects (documents, notes, textblocks). Content objects are freely placed on a workspace "canvas", and can be further decorated by heading and arrow elements. Every user input is automatically translated on-the-fly by the means of the [DeepL](https://www.deepl.com) service.

The canvas is synchronized between collaborating users. There are 3 user roles: *administrators* (create workspaces and user accounts, manage menberships), *editors* (edit content objects and arrange the canvas), and *users* (browsing canvas content).

The Zukunftswerk application is developed by contract with the
[Deutsch-Französisches Zukunftswerk](https://df-zukunftswerk.eu).
The Zukunftswerk UI is fixed to German/French languages. A generalized version of this application, with configurable
languages, is available as project "[Linqa](https://github.com/dmx-systems/dmx-linqa)".

Zukunftswerk is an application for the [DMX platform](https://github.com/dmx-systems/dmx-platform). Both, Zukunftswerk and Linqa are Open Source software under the GNU AGPL license.

## Version History

**1.6** -- Jul 16, 2023

* Features:
    * **Text blocks**: a new type of content object that shows both languages at the same time, colorizable, commentable, used for collaborative bilingual text creation
    * **Canvas search**: user can search content on current canvas, search results are highlighted in-place, when browsing search results the canvas auto-pans to respective object (animated)
    * **Multi-selection**: users can select multiple objects at once, editors can multi-move and multi-delete
    * **Text highlighting**: editors can highlight text, 7 colors available, available for notes, text blocks, and comments
    * **Snap-to-grid**: when moving content objects they snap to a 20px grid, rotation takes place in 5° steps
    * **Object locking**: administrators can lock objects to prevent unintended changes by editors
    * Admin area: in the user list an **"Active" checkmark** indicates whether the respective user has logged in at least once
* Improvements:
    * Usability improvements:
        * All workspace lists are sorted alphabetically (in both, user area and admin area), and are resorted when the UI language is switched
        * All bilingual text forms: a "translation modified" indicator is shown when automatic translation was modified manually, to prevent unintended overriding when redoing an automatic translation
        * Canvas: the object commands ("Edit", "Delete", ...) have bigger click area
        * Canvas: zoom-1:1 button is removed, it was not needed
        * All automatic panning/zooming operations are *animated*, e.g. home button, zoom-to-fit button
        * All buttons show tool tips when hovered
        * More consistent wording in UI elements
    * Rich text editor:
        * Removed 3 formats from toolbar: code, blockquote, and code-block, these were not needed
        * All toolbar buttons are placed in a single row (instead of 2 rows)
    * Login page:
        * Username/email address is handled case-insensitively
        * Login page shows no "beta" label anymore
    * Admin area: a workspace can be deleted by *all* team members (not only by workspace owner)
    * The DeepL API URL is configurable, so it works with both, the free, as well as the payed DeepL plan (improved in DeepL plugin)
    * Smaller DB size (improved in DMX platform: transaction log files are purged on a regular basis)
    * In case of a server/network loss an alert box is shown and the application is relaunched (improved in DMX platform)
    * Legal information: imprint and privacy statement are updated to reflect the organizational change ("IASS" -> "GFZ")
* Fixes:
    * Text containing special characters (HTML's `>`, `&`, ...) is properly translated (fixed in DeepL plugin)
    * All bilingual text forms: after pressing "translate" the translation state switches back to "automatic"
    * New workspaces are available immediately, page reload is not required
    * The workspace menu is now scrollable, in case there are a lot of workspaces
    * When switching to another workspace the canvas search is cleared
    * Downloading files (documents, comment attachments) always works on 1st attempt
    * Discussion panel: long attachment names are line-wrapped
    * Deleting a workspace (admin area) does not corrupt other workspaces (fixed in DMX platform)
    * Various view inconsistencies and layout oddities are fixed, particularly in the admin area
* Compatible with DMX 5.3

**1.5** -- Sep 5, 2022

* Improvements:
    * Auto-translate document name
    * Manual-translate button is always visible (documents, notes, headings, and comments)
    * PDFs remember selected page when fullscreen is switched on/off
    * Note and heading forms have a gray background
    * Image data-URLs are not send to the DeepL service (improved in DeepL plugin)
    * Discussion panel shows a spinner while loading
    * Admin area:
        * The respective workspace owners are displayed
        * Only the owner can delete a workspace
    * Send email digests: only one mail per day and workspace (at 6am)
* Fixes:
    * Working with multiple forms at the same time works
        * The selected form appears before other forms
    * New canvas items are selected programmatically
    * New document name is shown if entered afterwards
    * New viewport zoom value is respected immediately (when pressing the Home button)
    * When switching UI language the document resize-frame adapts
    * Document discussion button appears yellow when doc-filter is set
    * Change no-workspace error text ("Du" -> "Sie")
* Compatible with DMX 5.3-SNAPSHOT

**1.4** -- Aug 6, 2022

* Features:
    * New user profile dialog:
        * The user can edit her Display Name
        * The user controls whether to show her email address to other users by the means of a checkbox
        * The user can initiate a password-reset
    * Chat panel: show email-address of other users, if allowed by respective user
    * Canvas: documents can be downloaded
    * The Privacy policy text is now in place
* Improvements:
    * ZW UI language:
        * At first launch the browser's language setting is respected
        * The UI language chosen by the user is remembered
    * Canvas:
        * Item rotation is restricted to steps of 5 degrees, so resetting to 0 is easy
        * New "reset zoom" button sets the zoom back to "normal" (1)
    * Chat panel: scroll comment's OK/Cancel buttons into view when clicking Edit
    * Imprint/privacy policy: clicking the ZW logo returns to home page
    * Updated texts for the password-reset workflow
* Fixes:
    * Canvas:
        * Zoom-to-fit button works as expected
        * Editing of notes/headings when created w/o translation
        * Item selection works for participants (selected item appears on-top)
    * Chat panel:
        * Break long words in comments
        * Comments are properly rendered when logged in using uppercase in username
    * Admin area: workspace names in membership list reflect UI language
    * Images survive the auto-translation
    * Special characters in sent emails are properly encoded (both, HTML and plain text parts)
    * Client-sync:
        * Client sync for update-comment and delete-comment
        * Control box is updated when item moves
    * Redirect if user is logged in but the requested workspace is not readable
    * Missing translations are added
* Compatible with DMX 5.3-SNAPSHOT

**1.3** -- Jul 7, 2022

* Features:
    * 4 new canvas buttons: "Home", "Zoom to fit", "Zoom in", "Zoom out"
    * Rotatable canvas items: Notes, Documents, Headlines
* Improvements:
    * Login:
        * User lands in recently used workspace (based on ws-cookie)
        * Workspace deep-links: request login if due
    * Canvas / PDF viewer:
        * Larger "fullscreen" toggle button
    * Chat panel:
        * Accept only images and PDFs as comment attachments
        * Use "paper plane" icon for submit
* Fixes:
    * Canvas: arrows properly follow when moving handles
    * Chat panel:
        * Editors can't edit posts (only her own)
        * Reset doc-filter on workspace change
        * New-comment placeholder text adapts to UI language
    * Header: workspace drop down is up-to-date after WS edit
    * Admin area: disable "Editor" checkbox if "Member" is unchecked
* Compatible with DMX 5.3-SNAPSHOT

**1.2** -- Jun 4, 2022

* Features:
    * Client-sync for canvas items:
        * Notes, Documents, Arrows, Headings, Viewport Topic
        * Operations: Create, Move, Edit, Delete
* Improvements:
    * Auto-translation:
        * Untranslatable notes and headings can be saved anyways
        * Notes, headings, and comments can be auto-translated after creation
    * Canvas:
        * Add Note colors "white" and "transparent"
        * Draggable items show hand cursor
        * Arrows:
            * Arrows appear before other items (except selected items and forms)
            * Different mouse cursors for move-arrow vs. move-arrow-handle
        * Slightly more prominent grid in the background. The grid now zooms along with canvas.
    * Discussion panel: strip "video" button from text editor toolbar
* Fixes:
    * Login of users which are not Team members
    * Set initial viewport in zoomed topicmaps. "Persistent Viewport" feature is now complete.
    * Header: show workspace names in dropdown bilingually
    * Admin area:
        * User list shows workspace names bilingually
        * User area is up-to-date once workspace edited
    * PDF viewer works with Chinese characters
* Compatible with DMX 5.3-SNAPSHOT

**1.1** -- May 6, 2022

* Features:
    * Freely editable arrows
    * Admin area: Edit/Delete of Users/Workspace
    * Editor role (selected users can create/edit canvas content of selected workspaces)
    * Colored notes
    * Persistent viewport
* Improvements:
    * Clicking on canvas deselects
* Fixes:
    * In comment-refs show Display Name (not email address)
* Compatible with DMX 5.3-SNAPSHOT

**1.0.3** -- Apr 6, 2022

* Improvements:
    * Login page has a "beta" stamp
* Fixes (admin area):
    * Also the 2nd level of workspaces/users lists is sorted
    * Workspaces and Users areas are consistent after updates
    * Disable create-user button when user input is missing

**1.0.2** -- *rejected*

**1.0.1** -- Apr 4, 2022

* Improvements:
    * Show notification once password reset mail is sent

**1.0** -- Apr 4, 2022

* Features:
    * Admin area (for ZW team members)
        * Create users and workspaces
        * Manage memberships
    * Notification mails (team members are notified via email about new comments)
    * PDF read mode (the entire canvas is used)
* Improvements:
    * Login page (no public access anymore)
        * Password reset dialog
    * Users are pseudonymized via "Display Name" (email addresses are never shown)
    * Comments which are not auto-translatable can be stored anyways (and manually translated later on)
    * Comment auto-translation status is shown: "automatic"/"edited"/"none"
    * Workspace selector (in case the user has more than one workspace memberships)
    * "Imprint" & "Privacy Policy" shown on to Login page (linkable)
* Design:
    * ZW corporate style guide is applied (not yet complete)
* Fixes:
    * Only team members can move canvas items
* Compatible with DMX 5.3-SNAPSHOT

**0.9.1** -- Mar 1, 2022

* Fixes:
    * PDF viewer and language switch
    * Edit/Delete and non-team members
* Compatible with DMX 5.3-SNAPSHOT

**0.9** -- Mar 1, 2022

* Improvements:
    * UI-less PDF viewer
    * Discussion panel: chat metaphor
    * Reply works also when doc-filter is set
    * Canvas zooms around mouse position
    * Edit and Delete functions for all types (Notes, Documents, Comments, Labels)
    * All forms have a Cancel button
* Design:
    * Redesigned discussion panel
    * Doc-filter is more visible
    * Header shows ZW logo
* Compatible with DMX 5.3-SNAPSHOT

**0.8** -- Jan 15, 2022

* Data model: Notes, Documents, Comments, Labels, Arrows
* Basic UI: header, canvas, discussion panel, doc-filter
* Actions: create, reply, set doc-filter, pan, zoom, move item, resize item
* User roles: team member (authoring), participant (commenting)
* Client-sync: comments
* Compatible with DMX 5.3-SNAPSHOT
