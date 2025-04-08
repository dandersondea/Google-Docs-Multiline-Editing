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
    // const html = HtmlService.createHtmlOutputFromFile("ui/sidebar")
    const html = HtmlService.createTemplateFromFile("ui/sidebar")
      .evaluate()
      .setTitle("Multiline Editing");
    DocumentApp.getUi().showSidebar(html);
  }
  
  
  /**
   * TODO: Open help modal with instructions for how to get started with the add-on.
   */
  function openHelpModal() {
    const html = HtmlService.createHtmlOutputFromFile("ui/multiline_editing_help_modal")
      .setWidth(450)
      .setHeight(150);
    DocumentApp.getUi().showModalDialog(html, "Help for Multiline Editing");
    // Content:
      // Getting started
    // Buttons: (~Code Blocks example)
      // Learn more
      // View in store
      // Report an issue
  }