/**
 * Move a selection (with fallback to a cursor's line) a # of elements up/down in the document body based on direction.
 *  1) 'direction' > 0 moves the line DOWN; < 0 " " UP.
 *  2) abs(direction) determines the # of lines to move in the specified direction.
 */
function moveLine(direction) {

    // Validate input
    if (!Number.isInteger(direction) || direction === 0) {
        DocumentApp.getUi().alert("Invalid direction. Please specify a non-zero integer.");
        return;
    }

    const doc = DocumentApp.getActiveDocument();

    for (let i = 0; i < Math.abs(direction); i++) {

        let selection = doc.getSelection();
        if (!selection) selection = doc.getCursor(); // Use cursor
        
        // Read target lines into an array of elements
        elementArray = readTargetElements(selection);
        if (!elementArray) return;
        
        const body = doc.getBody();
        let index, anchorSwapIndex;

        // Before swapping, store cursor offset or selection length
        let cursorOffset, selectionLength;
        if (selection.getOffset) cursorOffset = selection.getOffset(); // Cursor
        if (selection.getRangeElements) selectionLength = selection.getRangeElements().length; // Selection

        /* Algorithm for moving selections:
        * If moving the line UP (direction = -1):
            * For each element in the array:
            * Swap it with the element above it
        * If moving the line DOWN (direction = 1):
            * Reverse the array of elements
            * For each element in the reversed array:
            * Swap it with the element below it
        */
        if (direction > 0) elementArray.reverse();
        elementArray.forEach((element, j) => {

        element = targetCorrectElement(element);
        if (!element) return;

        // Perform swap
        index = body.getChildIndex(element);
        if (!shiftElement(body, index, direction / Math.abs(direction))) return;

        // Save relevant swapIndex for selection placement
        if (direction < 0) { // UP
            if (j == 0) anchorSwapIndex = index - 1; // First swapIndex
        }
        else { // DOWN
            if (j == elementArray.length - 1) anchorSwapIndex = index + 1; // Last swapIndex
        }

        });

        // Set selection/cursor back to input line
        if (!setCursorSelection(doc, body, selection, anchorSwapIndex, cursorOffset, selectionLength)) return;

    }

    }


/**
 * From a selection (with fallback to cursor), read the target elements into an array.
 */
function readTargetElements(selection) {

if (selection.getOffset) { // Use cursor
    if (!selection) {
    DocumentApp.getUi().alert("Invalid cursor placement");
    return;
    }

    return [selection.getElement()];
}
else {
    elementArray = selection.getRangeElements();
    if (!elementArray.length) {
    DocumentApp.getUi().alert("Invalid selection");
    return;
    }

    return elementArray.map((el) => {
    return el.getElement();
    })
}

}


/**
 * If given a TEXT element, find the parent PARAGRAPH or LIST_ITEM element.
 * (Only PARAGRAPH and LIST_ITEM elements can be moved.)
 */
function targetCorrectElement(element) {

// If just text selected, focus on the whole line
if (element.getType() == DocumentApp.ElementType.TEXT) {
    element = element.getParent();
}  

if (![DocumentApp.ElementType.PARAGRAPH, DocumentApp.ElementType.LIST_ITEM].includes(element.getType())) {
    DocumentApp.getUi().alert("Only paragraphs and list items can be moved.");
    return;
}

return element;

}


/**
 * Given a PARAGRAPH or LIST_ITEM element, insert it into the document body at the specified index.
 */
function insertElement(body, element, index) {

if (element.getType() == DocumentApp.ElementType.PARAGRAPH) {
    body.insertParagraph(index, element);
    return true;
}
else if (element.getType() == DocumentApp.ElementType.LIST_ITEM) {
    body.insertListItem(index, element);
    return true;
}
else {
    DocumentApp.getUi().alert("Invalid element type passed to insertElement()");
    return false;
}
}


/**
 * Shift element +/-1 element in the document body based on index and direction.
 */
function shiftElement(body, index, direction) {

const swapIndex = index + direction;

// Validate input
if (index < 0 || index >= body.getNumChildren()) {
    DocumentApp.getUi().alert("Index out-of-bounds.");
    return false;
}  
if (swapIndex < 0 || swapIndex >= body.getNumChildren()) {
    DocumentApp.getUi().alert("Swap index out-of-bounds.");
    return false;
}

// Get the top element
const element = body.getChild(Math.min(index, swapIndex));

// Save a copy of the element
const elementCopy = element.copy(); // Deep copy > Properties preserved

// Remove the element
body.removeChild(element);

// Reinsert the copy, one index lower
if (!insertElement(body, elementCopy, Math.max(index, swapIndex))) return false;

return true

}


/**
 * Reset the cursor or selection based on where the line(s) was moved to.
 */
function setCursorSelection(doc, body, selection, index, offset = 0, length = 0) {

if (selection.getOffset) { // Cursor

    let element = body.getChild(index);
    if (element.getType() != DocumentApp.ElementType.TEXT) { // newPosition() requires a TEXT element
    element = element.editAsText();
    }
    doc.setCursor(doc.newPosition(element, offset));
    return true;

}
else if (selection.getRangeElements) { // Selection

    const rangeBuilder = doc.newRange();
    for (let i = 0; i < length; i++) {
    rangeBuilder.addElement(body.getChild(index + i));
    }
    doc.setSelection(rangeBuilder.build());
    return true;

}
else {

    DocumentApp.getUi().alert("Error in setCursorSelection(). Invalid selection.")
    return false;

}
}


/** ~~~~~ DIAGNOSTIC FUNCTIONS ~~~~~ */

/**
 * FOR DIAGNOSTIC PURPOSES: Print out all of the properties of a given PARAGRAPH or LIST_ITEM element.
 */
function printElementProperties(element) {

Logger.log("*** printElementProperties(element) ***");

if (element.getType() == DocumentApp.ElementType.PARAGRAPH) {
    // Using all of the "get" methods from https://developers.google.com/apps-script/reference/document/paragraph
    Logger.log(`getAlignment: ${element.getAlignment()}`);
    Logger.log(`getAttributes: ${element.getAttributes()}`);
    for (const att in element.getAttributes()) Logger.log(`  Attribute ${att}: ${element.getAttributes()[att]}`);
    // Logger.log(`getChild: ${element.getChild()}`);
    // Logger.log(`getChildIndex: ${element.getChildIndex()}`);
    Logger.log(`getHeading: ${element.getHeading()}`);
    Logger.log(`getIndentEnd: ${element.getIndentEnd()}`);
    Logger.log(`getIndentFirstLine: ${element.getIndentFirstLine()}`);
    Logger.log(`getIndentStart: ${element.getIndentStart()}`);
    Logger.log(`getLineSpacing: ${element.getLineSpacing()}`);
    Logger.log(`getLinkUrl: ${element.getLinkUrl()}`);
    Logger.log(`getNextSibling: ${element.getNextSibling()}`);
    Logger.log(`getNumChildren: ${element.getNumChildren()}`);
    Logger.log(`getParent: ${element.getParent()}`);
    // Logger.log(`getPositionedImage: ${element.getPositionedImage()}`);
    Logger.log(`getPositionedImages: ${element.getPositionedImages()}`);
    Logger.log(`getPreviousSibling: ${element.getPreviousSibling()}`);
    Logger.log(`getSpacingAfter: ${element.getSpacingAfter()}`);
    Logger.log(`getSpacingBefore: ${element.getSpacingBefore()}`);
    Logger.log(`getText: ${element.getText()}`);
    Logger.log(`getTextAlignment: ${element.getTextAlignment()}`);
    Logger.log(`getType: ${element.getType()}`);
}
else if (element.getType() == DocumentApp.ElementType.LIST_ITEM) {
    // Using all of the "get" methods from https://developers.google.com/apps-script/reference/document/list-item
    Logger.log(`getAlignment: ${element.getAlignment()}`);
    Logger.log(`getAttributes: ${element.getAttributes()}`); // MAYBE?
    // Logger.log(`getChild: ${element.getChild()}`);
    // Logger.log(`getChildIndex: ${element.getChildIndex()}`);
    Logger.log(`getGlyphType: ${element.getGlyphType()}`);
    Logger.log(`getHeading: ${element.getHeading()}`);
    Logger.log(`getIndentEnd: ${element.getIndentEnd()}`); // MAYBE?
    Logger.log(`getIndentFirstLine: ${element.getIndentFirstLine()}`); // MAYBE?
    Logger.log(`getIndentStart: ${element.getIndentStart()}`);
    Logger.log(`getLineSpacing: ${element.getLineSpacing()}`);
    Logger.log(`getLinkUrl: ${element.getLinkUrl()}`);
    Logger.log(`getListId: ${element.getListId()}`);
    Logger.log(`getNestingLevel: ${element.getNestingLevel()}`); // MAYBE?
    Logger.log(`getNextSibling: ${element.getNextSibling()}`); // MAYBE?
    Logger.log(`getNumChildren: ${element.getNumChildren()}`);
    Logger.log(`getParent: ${element.getParent()}`);
    // Logger.log(`getPositionedImage: ${element.getPositionedImage()}`);
    Logger.log(`getPositionedImages: ${element.getPositionedImages()}`);
    Logger.log(`getPreviousSibling: ${element.getPreviousSibling()}`);
    Logger.log(`getSpacingAfter: ${element.getSpacingAfter()}`);
    Logger.log(`getSpacingBefore: ${element.getSpacingBefore()}`);
    Logger.log(`getText: ${element.getText()}`);
    Logger.log(`getTextAlignment: ${element.getTextAlignment()}`);
    Logger.log(`getType: ${element.getType()}`);
}
else {
    DocumentApp.getUi().alert("Invalid element type passed to printElementProperties()");
    return false;
}

return true;
}


/**
 * FOR DIAGNOSTIC PURPOSES: Compare all of the properties of two given PARAGRAPH or LIST_ITEM elements.
 */
function compareElementProperties(element1, element2) {

Logger.log("*** compareElementProperties(element1, element2) ***");

if (element1.getType() === DocumentApp.ElementType.PARAGRAPH && element2.getType() === DocumentApp.ElementType.PARAGRAPH) {
    // Using all of the "get" methods from https://developers.google.com/apps-script/reference/document/paragraph
    Logger.log(`getAlignment: ${element1.getAlignment() === element2.getAlignment()} ${element1.getAlignment()} ${element2.getAlignment()}`);
    Logger.log(`getAttributes: ${element1.getAttributes() === element2.getAttributes()} ${element1.getAttributes()} ${element2.getAttributes()}`);
    for (const att in element1.getAttributes()) Logger.log(`  Attribute ${att}: ${element1.getAttributes()[att] === element2.getAttributes()[att]} ${element1.getAttributes()[att]} ${element2.getAttributes()[att]}`);
    // Logger.log(`getChild: ${element1.getChild() === element2.getChild()} ${element1.getChild()} ${element2.getChild()}`);
    // Logger.log(`getChildIndex: ${element1.getChildIndex() === element2.getChildIndex()} ${element1.getChildIndex()} ${element2.getChildIndex()}`);
    Logger.log(`getHeading: ${element1.getHeading() === element2.getHeading()} ${element1.getHeading()} ${element2.getHeading()}`);
    Logger.log(`getIndentEnd: ${element1.getIndentEnd() === element2.getIndentEnd()} ${element1.getIndentEnd()} ${element2.getIndentEnd()}`);
    Logger.log(`getIndentFirstLine: ${element1.getIndentFirstLine() === element2.getIndentFirstLine()} ${element1.getIndentFirstLine()} ${element2.getIndentFirstLine()}`);
    Logger.log(`getIndentStart: ${element1.getIndentStart() === element2.getIndentStart()} ${element1.getIndentStart()} ${element2.getIndentStart()}`);
    Logger.log(`getLineSpacing: ${element1.getLineSpacing() === element2.getLineSpacing()} ${element1.getLineSpacing()} ${element2.getLineSpacing()}`);
    Logger.log(`getLinkUrl: ${element1.getLinkUrl() === element2.getLinkUrl()} ${element1.getLinkUrl()} ${element2.getLinkUrl()}`);
    Logger.log(`getNextSibling: ${element1.getNextSibling() === element2.getNextSibling()} ${element1.getNextSibling()} ${element2.getNextSibling()}`);
    Logger.log(`getNumChildren: ${element1.getNumChildren() === element2.getNumChildren()} ${element1.getNumChildren()} ${element2.getNumChildren()}`);
    Logger.log(`getParent: ${element1.getParent() === element2.getParent()} ${element1.getParent()} ${element2.getParent()}`);
    // Logger.log(`getPositionedImage: ${element1.getPositionedImage() === element2.getPositionedImage()} ${element1.getPositionedImage()} ${element2.getPositionedImage()}`);
    Logger.log(`getPositionedImages: ${element1.getPositionedImages() === element2.getPositionedImages()} ${element1.getPositionedImages()} ${element2.getPositionedImages()}`);
    Logger.log(`getPreviousSibling: ${element1.getPreviousSibling() === element2.getPreviousSibling()} ${element1.getPreviousSibling()} ${element2.getPreviousSibling()}`);
    Logger.log(`getSpacingAfter: ${element1.getSpacingAfter() === element2.getSpacingAfter()} ${element1.getSpacingAfter()} ${element2.getSpacingAfter()}`);
    Logger.log(`getSpacingBefore: ${element1.getSpacingBefore() === element2.getSpacingBefore()} ${element1.getSpacingBefore()} ${element2.getSpacingBefore()}`);
    Logger.log(`getText: ${element1.getText() === element2.getText()} ${element1.getText()} ${element2.getText()}`);
    Logger.log(`getTextAlignment: ${element1.getTextAlignment() === element2.getTextAlignment()} ${element1.getTextAlignment()} ${element2.getTextAlignment()}`);
    Logger.log(`getType: ${element1.getType() === element2.getType()} ${element1.getType()} ${element2.getType()}`);
    }
    else if (element1.getType() === DocumentApp.ElementType.LIST_ITEM && element2.getType() === DocumentApp.ElementType.LIST_ITEM) {
    // Using all of the "get" methods from https://developers.google.com/apps-script/reference/document/list-item
    Logger.log(`getAlignment: ${element1.getAlignment() === element2.getAlignment()} ${element1.getAlignment()} ${element2.getAlignment()}`);
    Logger.log(`getAttributes: ${element1.getAttributes() === element2.getAttributes()} ${element1.getAttributes()} ${element2.getAttributes()}`); // MAYBE?
    for (const att in element1.getAttributes()) Logger.log(`  Attribute ${att}: ${element1.getAttributes()[att] === element2.getAttributes()[att]} ${element1.getAttributes()[att]} ${element2.getAttributes()[att]}`);
    // Logger.log(`getChild ${element1.element.ge === element2.element.ge}: ${element1.getChild()} ${element2.element.ge}`);
    // Logger.log(`getChildIndex ${element1.element.ge === element2.element.ge}: ${element1.getChildIndex()} ${element2.element.ge}`);
    Logger.log(`getGlyphType: ${element1.getGlyphType() === element2.getGlyphType()} ${element1.getGlyphType()} ${element2.getGlyphType()}`);
    Logger.log(`getHeading: ${element1.getHeading() === element2.getHeading()} ${element1.getHeading()} ${element2.getHeading()}`);
    Logger.log(`getIndentEnd: ${element1.getIndentEnd() === element2.getIndentEnd()} ${element1.getIndentEnd()} ${element2.getIndentEnd()}`); // MAYBE?
    Logger.log(`getIndentFirstLine: ${element1.getIndentFirstLine() === element2.getIndentFirstLine()} ${element1.getIndentFirstLine()} ${element2.getIndentFirstLine()}`); // MAYBE?
    Logger.log(`getIndentStart: ${element1.getIndentStart() === element2.getIndentStart()} ${element1.getIndentStart()} ${element2.getIndentStart()}`);
    Logger.log(`getLineSpacing: ${element1.getLineSpacing() === element2.getLineSpacing()} ${element1.getLineSpacing()} ${element2.getLineSpacing()}`);
    Logger.log(`getLinkUrl: ${element1.getLinkUrl() === element2.getLinkUrl()} ${element1.getLinkUrl()} ${element2.getLinkUrl()}`);
    Logger.log(`getListId: ${element1.getListId() === element2.getListId()} ${element1.getListId()} ${element2.getListId()}`);
    Logger.log(`getNestingLevel: ${element1.getNestingLevel() === element2.getNestingLevel()} ${element1.getNestingLevel()} ${element2.getNestingLevel()}`); // MAYBE?
    Logger.log(`getNextSibling: ${element1.getNextSibling() === element2.getNextSibling()} ${element1.getNextSibling()} ${element2.getNextSibling()}`); // MAYBE?
    Logger.log(`getNumChildren: ${element1.getNumChildren() === element2.getNumChildren()} ${element1.getNumChildren()} ${element2.getNumChildren()}`);
    Logger.log(`getParent: ${element1.getParent() === element2.getParent()} ${element1.getParent()} ${element2.getParent()}`);
    // Logger.log(`getPositionedImage ${element1.element.ge === element2.element.ge}: ${element1.getPositionedImage()} ${element2.element.ge}`);
    Logger.log(`getPositionedImages: ${element1.getPositionedImages() === element2.getPositionedImages()} ${element1.getPositionedImages()} ${element2.getPositionedImages()}`);
    Logger.log(`getPreviousSibling: ${element1.getPreviousSibling() === element2.getPreviousSibling()} ${element1.getPreviousSibling()} ${element2.getPreviousSibling()}`);
    Logger.log(`getSpacingAfter: ${element1.getSpacingAfter() === element2.getSpacingAfter()} ${element1.getSpacingAfter()} ${element2.getSpacingAfter()}`);
    Logger.log(`getSpacingBefore: ${element1.getSpacingBefore() === element2.getSpacingBefore()} ${element1.getSpacingBefore()} ${element2.getSpacingBefore()}`);
    Logger.log(`getText: ${element1.getText() === element2.getText()} ${element1.getText()} ${element2.getText()}`);
    Logger.log(`getTextAlignment: ${element1.getTextAlignment() === element2.getTextAlignment()} ${element1.getTextAlignment()} ${element2.getTextAlignment()}`);
    Logger.log(`getType: ${element1.getType() === element2.getType()} ${element1.getType()} ${element2.getType()}`);
    }
    else {
    DocumentApp.getUi().alert("Invalid element type passed to compareElementProperties()");
    return false;
    }

    return true;
}