# gDocs-multiline
Multiline editing add-on for Google Docs

Method (using the Google Apps Script API):
1. Detect multiple lines in selection
2. Insert cursors at the start of each selected line
3. Apply text changes simultaneously to all selected positions


/** 
 *  - IDEAS:
 *    - INPUT:
 *      - Add an option for parsing input as escape characters (e.g. convert \n to new lines via gDoc's \r line break format)
 *    - SWITCHING: 
 *      - Implement key-hold-down (via setInterval()), if lag can be reduced
 * 
 *  - TODO:
 *    1) Create README.md
 *    2) Implement HELP MODAL using README.md (https://www.alexwforsythe.com/code-blocks/)
 *    3) Submit as an ADD-ON > Enable > Chrome Extensions SHORTCUTS (chrome://extensions/shortcuts)
 *    4) Record video (<3 min) > YouTube
 *    5) SUBMIT!
 */