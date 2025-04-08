/**
 * Insert this 'Mutliline Editing' add-on into the 'Extensions' menu in Google Docs.
 */
function onOpen() {
  const ui = DocumentApp.getUi();
  ui.createAddonMenu()
    .addItem("Start", 'openEditingSidebar')
    .addSeparator()
    .addItem("Help", 'openHelpModal')
    .addToUi();
} 


/**
 * Helper function for modularizing HTML code.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


/**
 * Open sidebar that:
 *  1) Activates key listeners for line switching functionality, and 
 *  2) Provides a UI for basic input/delete multiline editing.
 */
function openEditingSidebar() {
  const html = HtmlService.createTemplateFromFile("ui/sidebar")
    .evaluate()
    .setTitle("Multiline Editing");
  DocumentApp.getUi().showSidebar(html);
}


/**
 * Open help modal which links to documentation.
 */
function openHelpModal() {
  const html = HtmlService.createHtmlOutputFromFile("ui/help_modal")
    .setWidth(350)
    .setHeight(75);
  DocumentApp.getUi().showModalDialog(html, "Help for Multiline Editing");
}