# Google Docs Multiline Editing

TODO:
 
 1. Create README.md
 2. Implement HELP MODAL using README.md (https://www.alexwforsythe.com/code-blocks/)
 3. Submit as an ADD-ON > Enable > Chrome Extensions SHORTCUTS (chrome://extensions/shortcuts)
 4. Record video (<3 min) > YouTube
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

#### Multiline insert

< TODO >

#### Multiline delete

< TODO >

#### Move line(s)

< TODO >

## Details

### Method

< TODO >

Method (using the Google Apps Script API):

1. Detect multiple lines in selection
2. Insert cursors at the start of each selected line
3. Apply text changes simultaneously to all selected positions

Design choices (e.g. cursors), not allowing key holding down, enabling debouncing and queuing, only covering paragraph, text, and list item (no images, tables)

### Implementation

The following is an explanation of this add-on's various files and their parent folders.

#### backend/

Server-side scripts written using JavaScript-like Google Apps Script.

##### `controller.gs`

< TODO >

##### `input_deletion.gs`

< TODO >

##### `line_switching.gs`

< TODO >

#### javascript/

JavaScript code wrapped in HTML files to be loaded by `sidebar.html` (Google Apps Script projects do not support `.js` files).

##### `input_deletion.html`

< TODO >

##### `line_switching.html`

< TODO >

#### ui/

##### `sidebar.html`

< TODO >


### Limitations

< TODO >

- Keyboard issues could be fixed using additional plugins to control focus and other keyboard shortcuts, though this didn't seem worth it given the limitations of lag and single cursor
- Lines to be moved must be contiguous
- Google Docs doesn't allow the browser access to the DOM
- The script.run funciton is slow
- Google Docs doesn't support multiple cursors

### Possible next steps

*All features:*

1. Explore ways to reduce mouse usage by establishing keyboard shortcuts for:
    1. Opening the multiline editing sidebar
    2. Changing the browser's focus from the document to the sidebar and back (for moving lines)

*Multiline insert:*

1. Add an option for parsing escape characters (which are currently interpreted as literal text).

*Move line:*

1. If lag can be reduced, use intervals to allow continuously moving line(s) via holding down the relevant keys (rather than just repeatedly pressing them).
2. Enable moving noncontiguous selections by reworking how `anchorSwapIndex` is defined in `line_switching.gs`.