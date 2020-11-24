// File: dom_operation.js
// Aim: Dom operations

function clearChildren(dom) {
    // Clear all the children of the [dom]
    while (dom.childElementCount > 0) {
        dom.firstElementChild.remove();
    }
}
