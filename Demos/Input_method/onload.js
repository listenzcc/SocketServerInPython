// Check if d3 package is loaded
console.log(d3, d3.version);

// Global variables
var all_option = [];
var quick_option = [];
var quick_page_idx = 0;
var stack_pinYin = [];
var stack_ciZu = [];
var stack_ciZu_length = 0;

// Add change handler to input area
// d3.select("#main_input").attr("oninput", "update_input()");
let input = document.getElementById('main_input');
input.onkeydown = handle_input;
function handle_input(e) {
    console.log(e.keyCode, 'is pressed.');
    function disable_the_input(e) {
        // e.keyCode = 0;
        e.returnValue = false;
    }
    // 32: space
    // 38: up
    // 40: down
    // 8: backspace
    // 13: enter
    // 48 - 57: 0 - 9
    var hook_keys = [];
    hook_keys[13] = 'enter';
    hook_keys[32] = 'space';
    hook_keys[38] = 'up';
    hook_keys[40] = 'down';

    // Handle number keys
    if (e.keyCode >= 48 && e.keyCode <= 57) {
        disable_the_input(e);
        var idx = e.keyCode - 48;
        if (idx < quick_option.length) {
            // Can get option
            var option = all_option[quick_page_idx * 10 + idx];
            console.log(option);
            var full = option['full'].split("'");
            stack_ciZu[stack_ciZu.length] = option['candidate'][0];
            stack_ciZu_length += option['candidate'][0].length;
            stack_pinYin[stack_pinYin.length] = full[0];
            document.getElementById('main_input').value = stack_ciZu.toString().replaceAll(',', '') + full[1];
            update_input();
        }
    }

    // Handle backspace
    if (e.keyCode == 8) {
        if (stack_ciZu.length > 0) {
            // If stack ciZu has elements,
            // restore it back to the pinYins in the input area
            disable_the_input(e);
            var ciZu = stack_ciZu.pop();
            stack_ciZu_length -= ciZu.length;
            var pinYin = stack_pinYin.pop();
            var value = document.getElementById('main_input').value;
            document.getElementById('main_input').value =
                value.slice(0, stack_ciZu_length) + pinYin + value.slice(stack_ciZu_length + ciZu.length);
            update_input();
        }
    }

    // Handle control keys
    if (e.keyCode in hook_keys) {
        if (hook_keys[e.keyCode] != undefined) {
            console.log('Ignoring input of', hook_keys[e.keyCode], e.keyCode);
            disable_the_input(e);
        }
        if (e.keyCode == 13) {
            let textarea = document.getElementById('buffered_message');
            textarea.innerHTML += document.getElementById('main_input').value;
            document.getElementById('main_input').value = '';
            var pinYin = stack_pinYin.toString().replaceAll(',', '');
            var ciZu = stack_ciZu.toString().replaceAll(',', '');
            console.log('Record user dict:', pinYin, '=', ciZu);

            d3.json('pinYinUpdate?pair=' + pinYin + ',' + ciZu).then(function (got) {
                console.log(got);
            });

            stack_pinYin = [];
            stack_ciZu = [];
            stack_ciZu_length = 0;
            update_input();
        }
        if (e.keyCode == 38) {
            refresh_suggestion_quick(-1);
        }
        if (e.keyCode == 40) {
            refresh_suggestion_quick(1);
        }
        if (e.keyCode == 32) {
            update_input();
        }
    }
}

function clear(dom) {
    // Clear all the children of the [dom]
    while (dom.childElementCount > 0) {
        dom.firstElementChild.remove();
    }
}

function refresh_suggestion_quick(direction) {
    // Refresh the quick suggestions
    // Settings
    var num = all_option.length;
    var max = parseInt(num / 10);

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
    quick_option = all_option.slice(quick_page_idx * 10, quick_page_idx * 10 + 10);
    for (var i in quick_option) {
        quick_option[i] = [i, quick_option[i]];
    }

    // Clear quick suggestions area
    clear(document.getElementById('suggestion_quick'));

    // Add quick suggestions
    d3.select('#suggestion_quick')
        .selectAll('p')
        .data(quick_option)
        .enter()
        .append('p')
        .text((d) => {
            return d[0] + ':' + d[1]['candidate'][0] + '(' + d[1]['full'] + ')';
        })
        .attr('class', 'suggestDom');
}

function update_input() {
    var value = document.getElementById('main_input').value;
    console.log(value);

    // Clear suggestion area
    clear(document.getElementById('suggestion_option'));
    clear(document.getElementById('suggestion_group'));
    all_option = [];

    value = value.slice(stack_ciZu_length);
    console.log(value);
    if (value.length == 0) {
        quick_page_idx = 0;
        refresh_suggestion_quick(-1);
        return;
    }

    // Check out pinYin input and fill "suggestion area"
    d3.json('pinYinCheckOut?query=' + value).then(function (rawdata) {
        // Show what we got
        // console.log(rawdata);

        // ----------------------------------------------------------
        // Makeup all_option
        all_option = [];
        for (var i in rawdata.Candidates) {
            for (var j in rawdata.Candidates[i]) {
                var _option = [];
                _option['candidate'] = rawdata.Candidates[i][j];
                _option['prefix'] = rawdata.Prefix[i];
                _option['remain'] = rawdata.Remain[i];
                _option['full'] = rawdata.Full[i];

                all_option[all_option.length] = _option;
            }
        }

        // ----------------------------------------------------------
        // Add options and makeup groups
        var _group = [];

        d3.select('#suggestion_option')
            .selectAll('p')
            .data(all_option)
            .enter()
            .append('p')
            .text((d) => {
                name = d['prefix'] + "'" + d['remain'];
                if (name in _group) {
                    _group[name] += 1;
                } else {
                    _group[name] = 1;
                }
                return name + ', ' + d['full'] + ', ' + d['candidate'];
            })
            .attr('class', 'suggestDom');

        var group = [];
        for (var name in _group) {
            group[group.length] = [name, _group[name]];
        }

        // ----------------------------------------------------------
        // Add group
        d3.select('#suggestion_group')
            .selectAll('p')
            .data(group)
            .enter()
            .append('p')
            .text((d) => {
                return d;
            })
            .attr('class', 'suggestDom');

        quick_page_idx = 0;
        refresh_suggestion_quick(-1);
    });
}
