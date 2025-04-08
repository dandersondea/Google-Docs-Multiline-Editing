# Google Docs Multiline Editing

TODO:

 1. Figure out the best way to share the script (~Deploy?) > Check documentation ~Use
    1. Submit as an ADD-ON > Enable > Chrome Extensions SHORTCUTS (chrome://extensions/shortcuts)
 2. Make sure GitHub's README.md is public > Create new repository Confirm Help modal > Check documentation
 3. Record video (<3 min) > YouTube
 4. Create README.md
 5. SUBMIT!

## Introduction

A Google Docs add-on that enables multiline editing in the spirit of what's available in text editors like VS Code and Sublime.

The goal is to enable faster editing of Google Docs. However, while the add-on works, its practical usability is unfortunately limited by lag and clunky UX flows that require both keyboard and mouse (as opposed to just keyboard).

These limitations are due to restrictions within the Google Docs environment that are unlikely to be overcome with a non-native implementation.

While the usefulness of this add-on did not live up to hopes, it was nevertheless successful as an exploration of the potential for multiline editing functionality implemented using [Google Apps Script](https://developers.google.com/apps-script).

*Caveat: This is a final project for [CS50](https://cs50.harvard.edu/x/2025/project/) written by someone who is learning web programming. While I believe the limitations I encountered will beleaguer similar efforts, I'd love to be proven wrong (or for this functionality to get implemented natively).*

### Features

1. **Insert** text at the start or end of selected line(s).
2. **Delete** characters from the start or end of selected line(s).
3. **Move** a line or selection up or down in the document using your keyboard.

< INSERT IMAGE HERE >

< LINK TO YOUTUBE VIDEO DEMO HERE >

### Use

1. First include the add-on's files in your Google Apps Script:
    1. Open a Google Doc.
    2. Click on the 'Extensions' menu and then click 'Apps Script'.
    3. Copy the files into an Apps Script project.
2. Then start the add-on to open the Multiline Editing sidebar:
    1. Click on the 'Extensions' menu and then click 'Multiline Editing > Start'.
3. To navigate back to this page, click on the 'Extensions' menu, click 'Multiline Editing > Help' and then follow the `README.md` link.

#### Multiline insert

To insert text across multiple lines:

1. In your document, select any # of lines.
    1. Noncontiguous lines can be selected using the mouse by holding COMMAND, or using the keyboard by holding COMMAND + CONTROL + SHIFT in combination with the arrow keys ([Google Docs Editors Help](https://support.google.com/docs/thread/165128966/docs-new-feature-multiple-text-selection?hl=en)).
2. In the sidebar:
    1. Choose whether you want to insert text at the start or end of the lines, then click 'Next'.
    2. Input the text you want to insert, then click 'Insert'.

#### Multiline delete

To delete text across multiple lines:

1. Select any # of lines in your document, following the instructions under 'Multiline insert' above.
2. In the sidebar:
    1. Choose whether you want to delete text at the start or end of the lines, then click 'Next'.
    2. Select how many characters you want to delete, then click 'Delete'.

#### Move line(s)

To move lines up or down:

1. In your document, select any # of lines.
    1. Lines must be contiguous.
2. Click on the sidebar to focus it.
3. While focused on the sidebar, hold OPTION / ALT while pressing either the UP or DOWN arrow key.
    1. 1 press of the arrow key = 1 place moved.

## Details

### Design

#### Implemented

The add-on works by reading a selection (fallback to cursor) object from Google Docs and then:

1. *For multiline insert / delete:*

    1. Sending the user's insert / delete request to the server for processing.
    2. The text of the element(s) contained in the selection is then updated on the server.

2. *For move line:*

    1. Sending the user's move line request to the server for processing, at which point the server repeatedly swaps the element(s) in the selection with their neighbors in the desired direction.
        1. Currently only TEXT, PARAGRAPH, and LIST_ITEM elements are supported.
    2. In the case when multiple move line requests are entered while one is being processed, the requests are debounced and batched on the client and then sent to the server as a single request to move the element(s) multiple rows at once.
    3. After swapping, the document's selection is reset to the new position of the initially-selected elements (or in the case of a cursor, to the original position within the line).

#### Ideal

1. *For multiline insert / delete,* the ideal design would be to:

    1. Initialize multiple cursors that allow a user to dynamically edit multiple lines simultaneously, directly in the document. Multiple cursors however are not supported by Google Docs, leading to the design decision above.

2. *For move line,* the ideal design would be to:

    1. Have the client update the document and then sync the changes with the server, thereby enabling low-latency editing. For security and integrity reasons however, Google Docs does not expose its DOM to the browser, meaning all edits must be passed through the `google.script.run` function and processed on the server. This leads to meaningful lag between the time a user submits a move line request and when the document gets updated, potentially making copy/paste faster.
        1. As a result of this lag, holding down the arrow keys to continuously move lines was not implemented.
        2. Similarly, support for moving elements other than TEXT, PARAGRAPH, and LIST_ITEM was also not implemented (*e.g.* images and tables).
    2. Allow the move line procedure to trigger while the user is focused on the document, as opposed to the sidebar. However, Google Docs restricts JavaScript execution in the main document, meaning script-based keyboard listeners only work inside the sidebar or modal in which they're defined. Workarounds potentially exist but were deemed not meaningfully impactful to explore given the restriction on usability caused by the lag issue mentioned above. For reference the potential workarounds are:
        1. Place the move line function under a custom menu and then use Google's built-in menu shortcuts to connect them to the keyboard (Mac: OPTION + COMMAND + M, then assigned letter).
        2. Create a Chrome Extension and then register global keyboard shortcuts to call the Google Apps Script functions via `chrome.runtime.sendMessage()`.

### Implementation

The following is an explanation of this add-on's various files and their parent folders.

#### backend/

Server-side scripts written using JavaScript-like Google Apps Script.

##### `controller.gs`

1. Upon opening a Google Doc, adds the 'Multiline Editing' add-on to the document's 'Extensions' menu.
2. Defines functions for rendering the sidebar and help modal HTML in the Google Doc.

##### `input_deletion.gs`

1. Validates the user's multiline insert / delete input and selection.
2. Reads the selected line(s) in the document and inserts / deletes the requested text.

##### `line_switching.gs`

1. Validates the user's move line input and selection.
2. Reads the selected line(s) in the document and repeatedly swaps them with their neighbors until they have been shifted the requested # of lines.
3. After swapping elements, resets the document's selection (or cursor) to the new location of the original line(s).

#### javascript/

JavaScript code wrapped in HTML files to be loaded by `sidebar.html` (Google Apps Script projects do not support `.js` files).

##### `input_deletion.html`

1. Defines the dynamic logic behind the 'Insertion' and 'Deletion' sections of the Multiline Editing sidebar.
2. Validates and then passes input to `input_deletion.gs` upon click of the 'Insert' and 'Delete' buttons.

##### `line_switching.html`

1. Establishes keyboard listeners that trigger `line_switching.gs` when OPTION / ALT + UP / DOWN are clicked.
2. Debounces move line requests and, while a request is running, batches subsequent requests into a single call to be run upon successful completion of the running request.

#### ui/

HTML files that define the visual structure of the add-on's UI.

##### `sidebar.html`

1. Structures the Multiline Editing sidebar.

##### `help_modal.html`

1. Structures the help modal that links to this `README.md` on GitHub to provide users with more information.

### Limitations

As described in more detail in the 'Design > Ideal' section, the usability of this add-on is unfortunately by limited by restrictions within the Google Docs environment that lead to:

1. *Multiline insert / delete:*
    1. Editing can only be done at the start and end of lines, meaning one cannot dynamically access the middle a multiline selection.

2. *Move line:*
    1. Execution speed is dependent on the high-latency `google.script.run` function, meaning copy/paste might be a faster way to move lines.
    2. The keyboard shortcuts are only active when the add-on's sidebar is focused, meaning the feature cannot be activated by just the keyboard alone.
    3. Selected lines must be contiguous and of type TEXT, PARAGRAPH, or LIST_ITEM in order to be moved.

## Possible next steps

### All features

1. Explore ways to reduce mouse usage by establishing keyboard shortcuts for:
    1. Opening the multiline editing sidebar
    2. Changing the browser's focus from the document to the sidebar and back (for moving lines)

### Multiline insert

1. Add an option for parsing escape characters (which are currently interpreted as literal text).

### Move line(s)

*If lag can be reduced to make the feature more usable:*

1. Use intervals to allow continuously moving line(s) via holding down the relevant keys (rather than just repeatedly pressing them).
2. Support moving elements beyond TEXT, PARAGRAPH, and LIST_ITEM (*e.g.* images and tables).
3. Enable moving noncontiguous selections by reworking how `anchorSwapIndex` is defined in `line_switching.gs`.
