// Check if d3 package is loaded
console.log(d3, d3.version);

// Global variables

// Add change handler to input area
// d3.select("#main_input").attr("oninput", "update_input()");
let input = document.getElementById('main_input');
input.onkeydown = handle_input;
function handle_input(e) {
    console.log(e.keyCode + ' is pressed.');
    function disable_the_input(e) {
        // Prevent the input event from bubbling
        e.keyCode = 0;
        e.returnValue = false;
    }

    // Useful keys and code
    // 32: space
    // 38: up
    // 40: down
    // 187: =
    // 189: -
    // 8: backspace
    // 13: enter
    // 48 - 57: 0 - 9

    // Handle number keys
    if (e.keyCode >= 48 && e.keyCode <= 57) {
        disable_the_input(e);
        var idx = e.keyCode - 48;
        if (idx < quickOption_count()) {
            // Can get option
            var option = option_getById(quick_page_idx * 10 + idx);
            select_option(option);
            update_options();
        }
    }

    // Handle backspace
    if (e.keyCode == 8) {
        if (stack_count() > 0) {
            // If stack ciZu has elements,
            // restore it back to the pinYins in the input area
            disable_the_input(e);
            var pair = stack_pop();
            var pinYin = pair[0];
            var ciZu = pair[1];
            var value = document.getElementById('main_input').value;
            document.getElementById('main_input').value =
                value.slice(0, stack_ciZu_length) + pinYin + value.slice(stack_ciZu_length + ciZu.length);
            update_options();
        }
        return;
    }

    // Enter is pressed,
    // enter the contents in input and stack into buffered_message area,
    // then clear the options
    if (e.keyCode == 13) {
        if (document.getElementById('main_input').value.length == 0) {
            // Update options
            update_options();
            disable_the_input(e);
            return;
        }
        // Move main_input value into buffered_message area
        let textarea = document.getElementById('buffered_message');
        textarea.innerHTML += document.getElementById('main_input').value;
        document.getElementById('main_input').value = '';

        // Tell backend to update the dict
        var pair = stack_popAll();
        var pinYin = pair[0];
        var ciZu = pair[1];
        if (pinYin.length > 0) {
            console.log('Record user dict: ' + pinYin + '=' + ciZu);
            d3.json('pinYinUpdate?pair=' + pinYin + ',' + ciZu).then(function (got) {
                console.log(got);
            });
        }

        // Update options
        update_options();
        disable_the_input(e);
        return;
    }

    // Down or - is pressed,
    // quick option page move backward
    if (e.keyCode == 40 || e.keyCode == 189) {
        quickOption_move(-1);
        refresh_suggestion_quick();
        disable_the_input(e);
        return;
    }

    // Up or = is pressed,
    // quick option page move forward
    if (e.keyCode == 38 || e.keyCode == 187) {
        quickOption_move(1);
        refresh_suggestion_quick();
        disable_the_input(e);
        return;
    }

    // Space is pressed,
    // try to checkout as input
    if (e.keyCode == 32) {
        update_options();
        disable_the_input(e);
        return;
    }

    // Handle all key pressed events other than a-z,
    // only valid if the input area is empty,
    // otherwise, it will only trigger the function of update_input
    if (e.keyCode > 90 || e.keyCode < 65) {
        if (document.getElementById('main_input').value.length > 0) {
            disable_the_input(e);
        }
        update_options();
    }
}

function select_option(option) {
    // Select [option]
    var ciZu = option['ciZu'][0];
    var split = option['full'].split("'");
    stack_push(split[0], ciZu);
    document.getElementById('main_input').value = stack_getAllCiZu() + split[1];
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

function update_options() {
    var value = document.getElementById('main_input').value;
    console.log(value);

    // Clear suggestion areas
    clearChildren(document.getElementById('suggestion_option'));
    clearChildren(document.getElementById('suggestion_group'));
    clearChildren(document.getElementById('suggestion_quick'));
    option_clear();

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
            .attr('class', 'suggestDom')
            .on('click', function (e, opt) {
                select_option(opt);
                update_options();
                document.getElementById('main_input').focus();
            });

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
