// File: stack_manager.js
// Aim: Stack manager methods

// ----------------------------------
// Variables
var stack_pinYin = [];
var stack_ciZu = [];
var stack_ciZu_length = 0;

// ----------------------------------
// Methods
function stack_count() {
    // Get counting of stack
    return stack_pinYin.length;
}

function stack_push(pinYin, ciZu) {
    // Push [pinYin] and [ciZu] pair into stack
    stack_pinYin[stack_pinYin.length] = pinYin;
    stack_ciZu[stack_ciZu.length] = ciZu;
    stack_ciZu_length += ciZu.length;
    return stack_count();
}

function stack_popAll() {
    // Pop all stacked pinYin and ciZu
    var pinYin = stack_pinYin.toString().replaceAll(",", "");
    var ciZu = stack_ciZu.toString().replaceAll(",", "");
    stack_pinYin = [];
    stack_ciZu = [];
    stack_ciZu_length = 0;
    return [pinYin, ciZu];
}

function stack_pop() {
    // Pop latest pinYin and ciZu
    var pinYin = stack_pinYin.pop();
    var ciZu = stack_ciZu.pop();
    stack_ciZu_length -= ciZu.length;
    return [pinYin, ciZu];
}

function stack_getAllCiZu() {
    // Get all stacked ciZu,
    // in joint string
    return stack_ciZu.toString().replaceAll(",", "");
}
