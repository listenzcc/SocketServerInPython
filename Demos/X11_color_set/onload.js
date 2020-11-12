// Set up the color_table_area1 div property
d3.select("#color_table_area1").attr(
  "style",
  "height: 600px; overflow-y: scroll;"
);

// Display color table in color_table_area1
var a = 0;
d3.json("./color_summary.json").then(function (raw) {
  // Parse [raw] json
  var colors = [];
  var i = 0;
  for (var key in raw["Color Name"]) {
    colors[i] = [];
    colors[i]["Name"] = raw["Color Name"][i];
    colors[i]["Family"] = raw["Family"][i];
    colors[i]["HEX"] = raw["HEX"][i];
    colors[i]["HSV"] = raw["HSV"][i];
    colors[i]["RGB"] = raw["RGB"][i];
    i += 1;
  }
  console.log(colors);

  // Add into table
  let div = d3.select("#color_table_area1");

  // Add new table
  let table = div.append("table");
  table.append("caption").text("Color table");

  table
    .append("thead")
    .append("tr")
    .selectAll("td")
    .data(["Name", "Block", "HEX", "HSV", "RGB", "Family"])
    .enter()
    .append("td")
    .append("input");

  // .append("input");

  // Add head
  table
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(["Name", "Block", "HEX", "HSV", "RGB", "Family"])
    .enter()
    .append("th")
    .text((d) => d);

  // Add body
  table
    .append("tbody")
    .selectAll("tr")
    .data(colors)
    .enter()
    .append("tr")
    .selectAll("td")
    .data(function (d) {
      return [d.Name, "_block", d.HEX, d.HSV, d.RGB, d.Family];
    })
    .enter()
    .append("td")
    .text((d) => d)
    .attr("class", function (d) {
      if (d == "_block") {
        return d;
      } else {
        return undefined;
      }
    });

  // Paint Block column
  table
    .selectAll("._block")
    .data(colors)
    .text(undefined)
    .append("div")
    .attr("style", (d) => {
      return "height: 10px; border: 0px; background-color: " + d.HEX;
    });
});

// Set up the markdown_area1 div property
d3.select("#markdown_area1").attr(
  "style",
  "height: 600px; overflow-y: scroll;"
);

// Setup markdown display
d3.text("color_convert.py").then(function (raw) {
  var md_text = "# Python code of color convert\n";
  md_text += "Convert color between HSV and RGB space\n";
  md_text += "```python\n" + raw + "\n```";
  var converter = new showdown.Converter();
  var html = converter.makeHtml(md_text);
  document.getElementById("markdown_area1").innerHTML = html;
});
