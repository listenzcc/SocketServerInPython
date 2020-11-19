// Check if d3 package is loaded
console.log(d3, d3.version);

// Add change handler to input area
d3.select("#main_input").attr("oninput", "update_input()");

function split(inp) {
  // Split string of option as [inp]
  // 1st split, fetch ciZu
  var ciZu = inp.split(",")[0];
  // 2nd split, fetch remained pinYin
  var remain_pinYin = inp.split("'")[1];
  if (remain_pinYin == undefined) {
    remain_pinYin = "";
  }
  // Return
  return [ciZu, remain_pinYin];
}

function clear(dom) {
  // Clear all the children of the [dom]
  while (dom.childElementCount > 0) {
    dom.firstElementChild.remove();
  }
}

function update_input() {
  var value = document.getElementById("main_input").value;
  console.log(value);

  // Check out pinYin input and fill "suggestion area"
  d3.json("pinYinCheckOut?query=" + value).then(function (rawdata) {
    // Show what we got
    // console.log(rawdata);

    // Makeup data
    var data = [];
    for (var i in rawdata.CiZu) {
      data[i] = [rawdata.CiZu[i], rawdata.PinYin[i]];
    }
    // console.log(data);

    // Clear suggestion area
    clear(document.getElementById("suggestion_option"));
    clear(document.getElementById("suggestion_group"));

    // Init group list
    var group_dict = [];
    var group = [];

    // Fill suggestion area
    // Fill suggestion option
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
