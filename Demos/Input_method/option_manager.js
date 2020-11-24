// File: option_manager.js
// Aim: Option manager methods

// --------------------------------------
// Variables
var all_option = [];
var quick_option = [];
var quick_page_idx = 0;

// --------------------------------------
// Methods of options
function option_count() {
    // Get counting of option
    return all_option.length;
}

function option_add(option) {
    // Add new option
    // Example:
    // var _option = [];
    // _option['ciZu'] = ['中文', count];
    // _option['short'] = "zhong...'xxxx"
    // _option['full'] = "zhongwen'xxxx"

    all_option[all_option.length] = option;
    return option_count();
}

function option_getById(id, fmt) {
    // Get [id]-th option from all_option
    // fmt is optional controls output,
    // fmt == undefined means return the option
    // fmt == 'quick' means quick format: 'ciZu'('full')
    // fmt == 'normal' means normal format: 'quick', 'full', 'ciZu'
    var opt = all_option[id];
    switch (fmt) {
        case undefined:
            return opt;
        case "quick":
            return opt["ciZu"][0] + "(" + opt["full"] + ")";
        case "normal":
            return opt["short"] + ", " + opt["full"] + ", " + opt["ciZu"];
    }
    return undefined;
}

function option_clear() {
    // Clear the all_option
    all_option = [];
    // Clear the quick_option, either
    quickOption_move(-1);
    return option_count();
}

// --------------------------------------
// Methods of quick options
function quickOption_count() {
    // Get counting of quick_option
    return quick_option.length;
}

function quickOption_move(direction) {
    // Move the quick_option window
    var num = all_option.length;
    var max = parseInt(num / 10);

    // If all_option is empty,
    // set and return zeros
    if (num == 0) {
        quick_page_idx = 0;
        quick_option = [];
        return quickOption_count();
    }

    // Move quick suggestion page
    if (direction == 1) {
        // Move forward of suggestions
        if (quick_page_idx < max) {
            quick_page_idx += 1;
        }
    } else {
        // Move forward of suggestions
        if (quick_page_idx > 0) {
            quick_page_idx -= 1;
        }
    }

    // Refresh quick suggestions list
    quick_option = all_option.slice(
        quick_page_idx * 10,
        quick_page_idx * 10 + 10
    );
    return quickOption_count();
}
