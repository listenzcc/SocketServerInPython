// Check if d3 package is loaded
console.log(d3, d3.version);

// Global variables
var all_option = [];
var quick_option = [];
var quick_idx = 0;

// Add change handler to input area
// d3.select("#main_input").attr("oninput", "update_input()");
let input = document.getElementById("main_input");
input.onkeydown = handle_input;
function handle_input(e) {
  // 32: space
  // 38: up
  // 40: down
  var hook_keys = [];
  hook_keys[32] = "space";
  hook_keys[38] = "up";
  hook_keys[40] = "down";

  if (e.keyCode in hook_keys) {
    if (hook_keys[e.keyCode] != undefined) {
      console.log("Ignoring input of", hook_keys[e.keyCode], e.keyCode);
      e.keyCode = 0;
      e.returnValue = false;
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

function split(inp) {
  // Split string of option as [inp]
  var parts = inp.split(",");
  var ciZu = parts[1];
  var remain_pinYin = parts[0].split("'")[1];
  return [ciZu, remain_pinYin];
}

function clear(dom) {
  // Clear all the children of the [dom]
  while (dom.childElementCount > 0) {
    dom.firstElementChild.remove();
  }
}

function refresh_suggestion_quick(direction) {
  var num = all_option.length;
  var max = parseInt(num / 10);
  if (direction == 1) {
    // Move forward of suggestions
    if (quick_idx < max) {
      quick_idx += 1;
    }
  } else {
    // Move forward of suggestions
    if (quick_idx > 0) {
      quick_idx -= 1;
    }
  }
  quick_option = all_option.slice(quick_idx * 10, quick_idx * 10 + 10);
  for (var i in quick_option) {
    quick_option[i] = [i, quick_option[i]];
  }

  clear(document.getElementById("suggestion_quick"));

  d3.select("#suggestion_quick")
    .selectAll("p")
    .data(quick_option)
    .enter()
    .append("p")
    .text((d) => {
      return d[0] + ":" + d[1]["candidate"][0] + "(" + d[1]["full"] + ")";
    });
}

function update_input() {
  var value = document.getElementById("main_input").value;
  console.log(value);

  // Check out pinYin input and fill "suggestion area"
  d3.json("pinYinCheckOut?query=" + value).then(function (rawdata) {
    // Show what we got
    // console.log(rawdata);

    all_option = [];
    for (var i in rawdata.Candidates) {
      for (var j in rawdata.Candidates[i]) {
        var _option = [];
        _option["candidate"] = rawdata.Candidates[i][j];
        _option["prefix"] = rawdata.Prefix[i];
        _option["remain"] = rawdata.Remain[i];
        _option["full"] = rawdata.Full[i];

        all_option[all_option.length] = _option;
      }
    }

    // Clear suggestion area
    clear(document.getElementById("suggestion_option"));
    clear(document.getElementById("suggestion_group"));

    // Init group list
    var _group = [];

    d3.select("#suggestion_option")
      .selectAll("p")
      .data(all_option)
      .enter()
      .append("p")
      .text((d) => {
        name = d["prefix"] + "'" + d["remain"];
        if (name in _group) {
          _group[name] += 1;
        } else {
          _group[name] = 1;
        }
        return name + ", " + d["full"] + ", " + d["candidate"];
      })
      .attr("class", "suggestDom");

    var group = [];
    for (var name in _group) {
      group[group.length] = [name, _group[name]];
    }

    d3.select("#suggestion_group")
      .selectAll("p")
      .data(group)
      .enter()
      .append("p")
      .text((d) => {
        return d;
      })
      .attr("class", "suggestDom");

    quick_idx = 0;
    refresh_suggestion_quick(-1);
    return;

    // Fill suggestion area
    // Fill suggestion option
    var candidates = rawdata.Candidates;
    d3.select("#suggestion_option").append("div");
    for (var group in candidates) {
      // if (value != group.replace("'", "")) {
      //   return;
      // }
      d3.select("#suggestion_option")
        .append("div")
        .selectAll("p")
        .data(candidates[group])
        .enter()
        .append("p")
        .text((d) => {
          return group + "," + d;
        })
        .attr("class", "suggestDom")
        .attr("onclick", "select_option(this)");
    }
    return 0;

    d3.select("#suggestion_option")
      .selectAll("p")
      .data(data)
      .enter()
      .append("p")
      .text((d) => {
        return d;
      })
      .attr("class", function (d) {
        if (group_dict[d[1]] == undefined) {
          group_dict[d[1]] = 0;
          group[group.length] = d[1];
        }
        group_dict[d[1]] += 1;
        return "suggestDom suggestOption suggestOption_" + d[1];
      })
      .attr("onclick", "select_option(this)");

    // Fill suggestion group
    d3.select("#suggestion_group")
      .selectAll("p")
      .data(group)
      .enter()
      .append("p")
      .text((d) => {
        return d + ", " + group_dict[d];
      })
      .attr("class", function (d) {
        return "suggestDom";
      })
      .attr("onclick", "select_group(this)");

    d3.select("#suggestion_group")
      .append("p")
      .text("----")
      .attr("class", function (d) {
        return "suggestDom";
      })
      .attr("onclick", "select_group(this)");
    console.log(group);
  });
}

function select_option(option) {
  // Handler of clicking an option
  var text = option.textContent;
  console.log(text);

  var tmp = split(text);
  document.getElementById("buffered_message").value += tmp[0];
  document.getElementById("main_input").value = tmp[1];
  update_input();
}

function select_group(group) {
  // Handler of clicking an group
  var text = group.textContent;
  var class_name = "suggestOption_" + text.split(",")[0];

  // Hide all options
  var doms = document.getElementsByClassName("suggestOption");
  for (var i = 0; i < doms.length; i++) {
    doms[i].style.display = "none";
    if (text == "----") {
      doms[i].style.display = "";
    }
  }

  // Display options of clicked group name
  if (text != "----") {
    doms = document.getElementsByClassName(class_name);
    for (var i = 0; i < doms.length; i++) {
      doms[i].style.display = "";
    }
  }
}
