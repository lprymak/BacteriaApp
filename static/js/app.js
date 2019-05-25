function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  var url = `/metadata/${sample}`;

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(url).then(function (data) {
    var data = data;

    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select('#sample-metadata');

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(data).forEach(item => {
      if (item[0] != 'WFREQ') {
        var line = PANEL.append('h5');
        line.text(`${item[0]}: ${item[1]}`);
      }
    })
  })

// ----------------------- Meter chart -----------------------

// BUilds gauge using washing metadata
  Plotly.d3.json(url, function (response) {

    // Use the washing per week metadata as the level
    var level = response.WFREQ;
    // Multiply the level by 180/number of sections to convert to degrees to use for the needle placement
    var levelD = (level) * (180/9);

    // Trig to calc meter point
    var degrees = 180 - levelD,
      radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path of needle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    var data = [{
      // Needle center
        type: 'scatter',
        x: [0], y: [0],
        marker: { size: 28, color: '#4d4d4d' },
        showlegend: false,
        name: 'scrubs',
        text: level,
        hoverinfo: 'text+name'
      },
      // Pie chart of equal divisions for guage 
      {
        values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6',
          '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition: 'inside',
        marker: {
          colors: ['#528F52', '#579B5C', '#61AC64', '#6BBA74', '#6EBF71',
            '#74C780', '#77CE82',
            '#90d59e', '#c8eace',
            '#FFFFFF']
        },
        labels: ['8-9', '7-8', '6-7', '5-6',
          '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];

    var layout = {
      shapes: [{
        type: 'path',
        path: path,
        fillcolor: '#4d4d4d',
        line: {
          color: '#4d4d4d'
        }
      }],
      title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
      height: 600,
      width: 600,
      xaxis: {
        zeroline: false, showticklabels: false,
        showgrid: false, range: [-1, 1]
      },
      yaxis: {
        zeroline: false, showticklabels: false,
        showgrid: false, range: [-1, 1]
      },
      margins: {
        l: -20
      }
    };

    // Plots gauge
    Plotly.newPlot('gauge', data, layout);

  })
}

// ----------------------- Bubble chart -----------------------

// Bubble plot function
function buildCharts(sample) {

  // Use sample selection as data
  var url = `samples/${sample}`;

  Plotly.d3.json(url, function (response) {

    var trace = {
      x: response.otu_ids,
      y: response.sample_values,
      marker: {
        color: response.otu_ids,
        opacity: .8,
        size: response.sample_values,
        colorscale: [
          ['0.0', '#8F038C'],
          ['0.111111111111', '#9C0196'],
          ['0.222222222222', '#AB09AA'],
          ['0.333333333333', '#BD1BBC'],
          ['0.444444444444', '#CF2DCE'],
          ['0.555555555556', '#D937D8'],
          ['0.666666666667', '#F767F9'],
          ['0.777777777778', '#FF70F9'],
          ['0.888888888889', '#FE98F3'],
          ['1.0', '#FFB5FB']
        ],
      },
      type: 'scatter',
      mode: 'markers',
      text: response.otu_labels
    };

    var data = [trace];

    var layout = {
      plot_bgcolor: "transparent",
      paper_bgcolor: "transparent",
      XAXIS: 'OTU ID',
      margins: {
        t: 0,
        b: 0,
      },
      height: 600,
      xaxis: {
        title: {
          text: 'OTU IDs'
        }
      }
      // yaxis: {
      //   title: {
      //     text: 'Sample Values'
      //   }
      // }
    };

    // Plots bubble chart
    Plotly.newPlot('bubble', data, layout);

    // ----------------------- Pie chart -----------------------

    // Create dictionary using sample values in order sort and have index numbers to
    // correlate with the other arrays
    var indexValues = [];
    response.sample_values.forEach((v, i) => {
      indexValues.push({ 'key': i, 'value': parseInt(v) })
    })

    // Use top ten values
    indexValues.sort(function (a, b) { return b.value - a.value; });
    var indices = indexValues.map(item => item.key).slice(0, 10);

    // Find correlating data for top ten samples
    var orderedSamples = [], orderedLabels = [], orderedIds = [];
    indices.forEach(index => {
      orderedSamples.push(response.sample_values[index]);
      orderedLabels.push(response.otu_labels[index]);
      orderedIds.push(response.otu_ids[index]);
    })

    var trace2 = {
      labels: orderedIds,
      values: orderedSamples,
      type: 'pie',
      hovertext: orderedLabels
    }

    var layout2 = {
      width: 450,
      height: 450,
      margin: {
        t: 0,
        b: 0,
        l: 0
      },
      colorway: [
        '#404040', '#90d59e', '#8F038C', '#50A9E0', '#F767F9', '#44C4A8', '#BD1BBC', '#077AC1', '#FFB5FB', '#C63364']
    }

    var data2 = [trace2];

    // Plots pie chart
    Plotly.newPlot('pie', data2, layout2);
  })
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
    console.log(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();