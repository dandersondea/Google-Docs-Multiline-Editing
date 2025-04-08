/**
 * Edit a multiline selection of text.
 *  - Edit options: INSERT, DELETE
 *  - Edit locations: START, END of line
 */
function editMultilineText (action = "delete", location = "start", inputText = "", numCharactersDelete = 0) {

  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  // Validate input
  if (!selection) {
    DocumentApp.getUi().alert("No text selected.")
    return;
  }
  if (!["insert", "delete"].includes(action)) {
    DocumentApp.getUi().alert("Invalid action. Please specify 'insert' or 'delete'.");
    return;
  }
  if (!["start", "end"].includes(location)) {
    DocumentApp.getUi().alert("Invalid edit location. Please specify 'start' or 'end'.");
    return;
  }
  if (action == "insert" && inputText == "") {
    DocumentApp.getUi().alert("No input text specified.");
    return;
  }
  if (action == "delete" && (!Number.isInteger(numCharactersDelete) || numCharactersDelete <= 0)) {
      DocumentApp.getUi().alert("Invalid # of characters to delete. Please specify a positive integer.");
      return;
  }

  // Edit selected lines
  const elements = selection.getRangeElements();
  elements.forEach((el) => {
    if (el.getElement().editAsText) {
      const textRaw = el.getElement().getText();
      const textObject = el.getElement().editAsText();

      if (action == "insert") {
        if (location == "start") textObject.setText(inputText + textRaw);  
        if (location == "end") textObject.setText(textRaw + inputText);
      }
      if (action == "delete") {
        if (location == "start") textObject.deleteText(0, numCharactersDelete - 1);
        if (location == "end") textObject.deleteText(textRaw.length - numCharactersDelete, textRaw.length - 1);
      }
    }
  });

  // Reset selection after edit
  doc.setSelection(selection);
  
}