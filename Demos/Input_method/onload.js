// Check if d3 package is loaded
console.log(d3, d3.version);

// Global variables

// Add change handler to input area
// d3.select("#main_input").attr("oninput", "update_input()");
let input = document.getElementById('main_input');
input.onkeydown = handle_input;
function handle_input(e) {
    console.log(e.keyCode + 'is pressed.');
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
    hook_keys[187] = '=';
    hook_keys[189] = '-';

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
        return;
    }

    // Handle control keys
    if (e.keyCode in hook_keys) {
        if (hook_keys[e.keyCode] != undefined) {
            console.log('Ignoring input of', hook_keys[e.keyCode], e.keyCode);
            disable_the_input(e);
        }

        // Enter is pressed,
        // enter the contents in input and stack into buffered_message area,
        // then clear the options
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
            return;
        }

        // Down or - is pressed,
        // quick option page move backward
        if (e.keyCode == 40 || e.keyCode == 189) {
            refresh_suggestion_quick(-1);
            return;
        }

        // Up or = is pressed,
        // quick option page move forward
        if (e.keyCode == 38 || e.keyCode == 187) {
            refresh_suggestion_quick(1);
            return;
        }

        // Space is pressed,
        // try to checkout as input
        if (e.keyCode == 32) {
            update_input();
            return;
        }
    }

    // Handle all key pressed events other than a-z,
    // only valid if the input area is empty,
    // otherwise, it will only trigger the function of update_input
    if (e.keyCode > 90 || e.keyCode < 65) {
        if (document.getElementById('main_input').value.length > 0) {
            disable_the_input(e);
            update_input();
        }
    }
}

function refresh_suggestion_quick() {
    // Refresh the quick suggestion area
    // Clear quick suggestions area
    clearChildren(document.getElementById('suggestion_quick'));

    // Add quick suggestions
    d3.select('#suggestion_quick')
        .selectAll('p')
        .data(quick_option)
        .enter()
        .append('p')
        .text(function (d, i) {
            return i + ',' + option_getById(quick_page_idx * 10 + i, 'quick');
        })
        .attr('class', 'suggestDom');
}

function update_input() {
    var value = document.getElementById('main_input').value;
    console.log(value);

    // Clear suggestion areas
    clearChildren(document.getElementById('suggestion_option'));
    clearChildren(document.getElementById('suggestion_group'));
    clearChildren(document.getElementById('suggestion_quick'));
    option_clear();
    quickOption_move(-1);

    // Parse valid pinYin input
    value = value.slice(stack_ciZu_length);
    console.log(value);
    // If parsed input is empty,
    // do nothing
    if (value.length == 0) {
        return;
    }

    // Check out pinYin input and fill "suggestion area"
    d3.json('pinYinCheckOut?query=' + value).then(function (rawdata) {
        // Show what we got
        console.log(rawdata);

        // ----------------------------------------------------------
        // Makeup all_option
        for (var i in rawdata.Candidates) {
            for (var j in rawdata.Candidates[i]) {
                var _option = [];
                _option['short'] = rawdata.Prefix[i] + "'" + rawdata.Remain[i];
                _option['full'] = rawdata.Full[i];
                _option['ciZu'] = rawdata.Candidates[i][j];
                option_add(_option);
            }
        }

        // ----------------------------------------------------------
        // Add options and makeup groups

        d3.select('#suggestion_option')
            .selectAll('p')
            .data(all_option)
            .enter()
            .append('p')
            .text(function (d, i) {
                return option_getById(i, 'normal');
            })
            .attr('class', 'suggestDom');

        quickOption_move(-1);
        refresh_suggestion_quick();

        // var group = [];
        // for (var name in _group) {
        //     group[group.length] = [name, _group[name]];
        // }

        // // ----------------------------------------------------------
        // // Add group
        // d3.select('#suggestion_group')
        //     .selectAll('p')
        //     .data(group)
        //     .enter()
        //     .append('p')
        //     .text((d) => {
        //         return d;
        //     })
        //     .attr('class', 'suggestDom');
    });
}
