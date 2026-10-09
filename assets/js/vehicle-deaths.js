// vehicle-deaths: the original map code from the Dorik page, unchanged except for these wrappers.
// site.js loads its libraries, then this file, when the map scrolls near the viewport.
// one <script> on the Dorik page; an error here does not stop the next block, as before
try {
    // Set up the SVG container
const svg = d3.select("#state-map")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 500 200");

// Set up the tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load the data
Promise.all([
  d3.json("https://raw.githubusercontent.com/evanapplegate/evanapplegate.github.io/main/state_vehicle_deaths_per_miles_traveled/states-10m.json"),
  d3.csv("https://raw.githubusercontent.com/evanapplegate/evanapplegate.github.io/main/state_vehicle_deaths_per_miles_traveled/vehicle_deaths_per_miles.csv")
]).then(function ([topology, data]) {
  // Prepare the data
  const stateData = {};
  data.forEach(function (d) {
    stateData[d.state] = {
      change: +d.change,
      rate2010: +d["2010_rate_per_100m_vehicle_miles_traveled"],
      rate2020: +d["2020_rate_per_100m_vehicle_miles_traveled"]
    };
  });

  // Convert the TopoJSON to GeoJSON
  const geojson = topojson.feature(topology, topology.objects.states);

  // Set up the projection
  const projection = d3.geoAlbersUsa()
    .fitSize([500, 200], geojson);

  // Set up the path generator
  const path = d3.geoPath().projection(projection);

  // Join the data
  geojson.features.forEach(function (feature) {
    const state = feature.properties.name;
    feature.properties.change = stateData[state]?.change || 0;
    feature.properties.rate2010 = stateData[state]?.rate2010 || 0;
    feature.properties.rate2020 = stateData[state]?.rate2020 || 0;
  });

  // Set up the color scale
  const colorScale = d3.scaleThreshold()
    .domain([0, 0.24, 0.49, 0.51])
    .range(["#ccd7dc", "#f1decf", "#d39a71", "#a55a26"]);

  // Draw the map
  svg.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function (d) { return colorScale(d.properties.change); })
    .style("stroke", "#fdfaf5")
    .style("stroke-width", "0.5px")
    .on("mouseover", function (event, d) {
      const percentage = Math.round(d.properties.change * 100);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(
        "<strong>" + d.properties.name + "</strong><br/>" +
        "Change: " + (percentage >= 0 ? "+" : "") + percentage + "%<br/>" +
        "2010 Rate: " + d.properties.rate2010.toFixed(2) + " deaths per 100m vehicle miles<br/>" +
        "2020 Rate: " + d.properties.rate2020.toFixed(2) + " deaths per 100m vehicle miles"
      )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

}).catch(function (error) {
  console.log(error);
});
} catch (e) {
  console.error(e);
}

// one <script> on the Dorik page; an error here does not stop the next block, as before
try {
// Changed from Dorik: the map stays on its data (no endless world to drag sideways), and on phones one finger
// scrolls the page while two fingers pinch and move the map.
    let map = L.map('accident_cities', {maxBounds: [[15, -170], [72, -50]], maxBoundsViscosity: 1, minZoom: 3,
      dragging: !L.Browser.mobile}).setView([38.5, -98.0], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/evandapplegate/ckljyc21f1de617qmasjc1ybf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZXZhbmRhcHBsZWdhdGUiLCJhIjoiY2tmbzA1cWM1MWozeTM4cXV4eHUwMzFhdiJ9.Z5f9p8jJD_N1MQwycF2NEw', {
    maxZoom: 19,
    noWrap: true
}).addTo(map);

let panes = ['pane1', 'pane2', 'pane3'];

panes.forEach(function(pane) {
    map.createPane(pane);
});

let boxMapping = {
    'box1': 'pane1',
    'box2': 'pane2',
    'box3': 'pane3'
};

for (let box in boxMapping) {
    document.getElementById(box).addEventListener('change', function() {
        map.getPane(boxMapping[box]).style.display = this.checked ? 'block' : 'none';
    });
}

Papa.parse("https://raw.githubusercontent.com/evanapplegate/evanapplegate.github.io/main/accidents_by_city/table_124_NHTSA.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
        let paneData = [[], [], []];

        // Separate the data into their respective pane groups
        results.data.forEach(function(row) {
            let index;
            if (row.city_pop_2020 < 500000) {
                index = 0;
            } else if (row.city_pop_2020 <= 1000000) {
                index = 1;
            } else {
                index = 2;
            }
            paneData[index].push(row);
        });

        // Sort the data in each pane group in descending order
        paneData.forEach(function(data, i) {
            data.sort((a, b) => Math.abs(b.change_total_dead_per_100k) - Math.abs(a.change_total_dead_per_100k));

            // Add circles to the map
            data.forEach(function(row) {
                let fillColor;
                if (row.change_total_dead_per_100k >= 0.51) {
                    fillColor = '#ce572b';
                } else if (row.change_total_dead_per_100k >= 0.26) {
                    fillColor = '#e9865b';
                } else if (row.change_total_dead_per_100k >= 0.01) {
                    fillColor = '#f5d0bf';
                } else {
                    fillColor = '#6c88ce';
                }

                let radius = Math.sqrt(Math.abs(row.change_total_dead_per_100k) * 10000000000);

                let changePercent = (row.change_total_dead_per_100k >= 0) ? '+' : '';
                changePercent += Math.round(row.change_total_dead_per_100k * 100) + '%';


                L.circle([row.latitude, row.longitude], {
                    color: fillColor,
                    fillColor: fillColor,
                    fillOpacity: 0.25,
                    weight: 0.5,
                    opacity: 0.5,
                    radius: radius,
                    pane: panes[i]
                }).addTo(map)
                .bindTooltip(
                    `<strong>${row.city}</strong> <br>` +
                    `2020 vehicle accident deaths:<strong> ${row.total_deaths_2020}</strong> <br>` +
                    `Change in accident death rate, 2010-2020: <strong>${changePercent}</strong>`
                );
            });
        });
    }
});

  
} catch (e) {
  console.error(e);
}
