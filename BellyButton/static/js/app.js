function buildMetadata(sample) {
  var metaPanel = d3.select("#sample-metadata");
  metaPanel.html("");
  d3.json(`/metadata/${sample}`).then(data => {
    Object.entries(data).forEach(([key, val]) => {
      console.log(key, val);
      if (key === "WFREQ") {
        buildGuage(parseInt(val));
      }
      metaPanel.append("p")
        .text(`${key}:  ${val}`);
    })});
}

function buildGuage(wfreq) {
  // Trig to calc meter point
  var degrees = 171 - (18 * wfreq);
  console.log(degrees);
  var radius = .5;
  var radians = (degrees * Math.PI) / 180;
  console.log(radians);
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);
  console.log(x, y);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
  pathX = String(x),
  space = ' ',
  pathY = String(y),
  pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
  x: [0], y:[0],
  marker: {size: 18, color:'850000'},
  showlegend: false,
  name: 'wfreq',
  text: wfreq,
  hoverinfo: 'text+name'},
  { values: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 50],
  rotation: 90,
  text: ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0'],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:["3B9750","5AA354","7AAF58","99BC5C","B9C860",
                    "D9D564","DDDA85","E1E0A7","E5E6C9","E9ECEB", "FFFFFF"]},
  labels: ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', ' '],
  hoverinfo: 'label',
  hole: .4,
  type: 'pie',
  showlegend: false
  }];

  var layout = {
  shapes:[{
  type: 'path',
  path: path,
  fillcolor: '#850000',
  line: {
    color: '#850000'
  }
  }],
  title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
  xaxis: {zeroline:false, showticklabels:false,
          showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
          showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot("gauge", data, layout);
}

function buildCharts(sample) {
  d3.json(`/samples/${sample}`).then(data => {
    var trace1 = {
      type: 'pie',
      labels: data.otu_ids.slice(0,10),
      values: data.sample_values.slice(0,10),
      hovertext: data.otu_labels.slice(0,10),
      hoverinfo: 'text'
    };
    Plotly.newPlot("pie", [trace1]);
  });
  
  d3.json(`/samples/${sample}`).then(data => {
    var trace1 = {
      type: 'scatter',
      mode: 'markers',
      x: data.otu_ids,
      y: data.sample_values,
      hovertext: data.otu_labels,
      hoverinfo: 'text',
      marker: {
        size: data.sample_values,
        color: data.otu_ids
      }
    };
    Plotly.newPlot("bubble", [trace1]);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();