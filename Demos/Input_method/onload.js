// Check if d3 package is loaded
console.log(d3, d3.version);

// Add change handler to input area
d3.select("#main_input").attr("oninput", "update_input()");

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
    let area = document.getElementById("suggestion_area");
    while (area.childElementCount > 0) {
      area.firstElementChild.remove();
    }

    // Fill suggestion area
    d3.select("#suggestion_area")
      .selectAll("p")
      .data(data)
      .enter()
      .append("p")
      .text((d) => {
        return d;
      })
      .attr("class", "suggestOption")
      .attr("onclick", "select_option(this)");
  });
}

function select_option(option) {
  var text = option.textContent;
  console.log(text);

  function split(inp) {
    // Split text
    // 1st split, fetch ciZu
    var ciZu = text.split(",")[0];
    // 2nd split, fetch remained pinYin
    var remain_pinYin = text.split("'")[1];
    if (remain_pinYin == undefined) {
      remain_pinYin = "";
    }
    // Return
    return [ciZu, remain_pinYin];
  }

  var tmp = split(text);
  document.getElementById("buffered_message").innerHTML += tmp[0];
  document.getElementById("main_input").value = tmp[1];
  update_input();
}
