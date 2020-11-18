// Check if d3 package is loaded
console.log(d3, d3.version);

// Add change handler to input area
d3.select("#main_input").attr("oninput", "update_input()");

function update_input() {
  var value = document.getElementById("main_input").value;
  console.log(value);
}
