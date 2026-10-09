// fl-nursing-homes: the original map code from the Dorik page, unchanged except for these wrappers.
// site.js loads its libraries, then this file, when the map scrolls near the viewport.
// one <script> on the Dorik page; an error here does not stop the next block, as before
try {
    // Initialize Leaflet maps
// Changed from Dorik: the map stays on its data (no endless world to drag sideways), and on phones one finger
// scrolls the page while two fingers pinch and move the map.
var map_nursing_homes = L.map('map_nursing_homes', {maxBounds: [[23.5, -88.5], [31.5, -79]], maxBoundsViscosity: 1,
  minZoom: 6, dragging: !L.Browser.mobile}).setView([27.994402, -81.760254], 7);

// Add tile layers
L.tileLayer('https://api.mapbox.com/styles/v1/evandapplegate/ckljyc21f1de617qmasjc1ybf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZXZhbmRhcHBsZWdhdGUiLCJhIjoiY2tmbzA1cWM1MWozeTM4cXV4eHUwMzFhdiJ9.Z5f9p8jJD_N1MQwycF2NEw', {
  maxZoom: 18,
  noWrap: true,
  attribution: '© OpenStreetMap contributors'
}).addTo(map_nursing_homes);


// Add layers to nursing home map
// Add all nursing homes layer
var nursingHomesLayer = L.geoJSON(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 4,
      fillColor: '#DAAEC4',
      fillOpacity: 0.3,
      stroke: false,
      //color: '#e8bf90',
      //weight: 0.5,
      //opacity: 1
    });
  },
    filter: function (feature) {
    return feature.properties.overall_inspection === '★★☆☆☆' || feature.properties.overall_inspection === '★★★☆☆' || feature.properties.overall_inspection === '★★★★☆' ;
  },
  onEachFeature: function (feature, layer) {
    var tooltipContent = `
      <strong>Nursing Home:</strong> ${feature.properties.nursing_home_label}<br>
      <strong>Overall Inspection:</strong> ${feature.properties.overall_inspection}<br>
      <strong>Quality of Care:</strong> ${feature.properties.quality_of_care}<br>
      <strong>Quality of Life:</strong> ${feature.properties.quality_of_life}<br>
      <strong>Administration:</strong> ${feature.properties.administration}<br>
      <strong>Nutrition and Hydration:</strong> ${feature.properties.nutrition_and_hydration}<br>
      <strong>Restraints and Abuse:</strong> ${feature.properties.restraints_and_abuse}<br>
      <strong>Pressure Ulcers:</strong> ${feature.properties.pressure_ulcers}<br>
      <strong>Decline:</strong> ${feature.properties.decline}<br>
      <strong>Dignity:</strong> ${feature.properties.dignity}
    `;
    layer.bindTooltip(tooltipContent, { direction: 'top', permanent: false, className: 'tooltip' });
  }
}).addTo(map_nursing_homes);

// Add nursing homes layers based on overall_inspection value
// add 5 star nursing homes
var nursingHomesLayer5Star = L.geoJSON(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: '#8ec0e5',
      fillOpacity: 0.3,
      stroke: true,
      color: '#8ec0e5',
      weight: 0.5,
      opacity: 1
    });
  },
  filter: function (feature) {
    return feature.properties.overall_inspection === '★★★★★';
  },
  onEachFeature: function (feature, layer) {
    var tooltipContent = `
      <strong>Nursing Home:</strong> ${feature.properties.nursing_home_label}<br>
      <strong>Overall Inspection:</strong> ${feature.properties.overall_inspection}<br>
      <strong>Quality of Care:</strong> ${feature.properties.quality_of_care}<br>
      <strong>Quality of Life:</strong> ${feature.properties.quality_of_life}<br>
      <strong>Administration:</strong> ${feature.properties.administration}<br>
      <strong>Nutrition and Hydration:</strong> ${feature.properties.nutrition_and_hydration}<br>
      <strong>Restraints and Abuse:</strong> ${feature.properties.restraints_and_abuse}<br>
      <strong>Pressure Ulcers:</strong> ${feature.properties.pressure_ulcers}<br>
      <strong>Decline:</strong> ${feature.properties.decline}<br>
      <strong>Dignity:</strong> ${feature.properties.dignity}
    `;
    layer.bindTooltip(tooltipContent, { direction: 'top', permanent: false, className: 'tooltip' });
  }
}).addTo(map_nursing_homes);

// add 1 star nursing homes
var nursingHomesLayer1Star = L.geoJSON(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: '#f3ad9b',
      fillOpacity: 0.3,
      stroke: true,
      color: '#f3ad9b',
      weight: 0.5,
      opacity: 1
    });
  },
  filter: function (feature) {
    return feature.properties.overall_inspection === '★☆☆☆☆';
  },
  onEachFeature: function (feature, layer) {
    var tooltipContent = `
      <strong>Nursing Home:</strong> ${feature.properties.nursing_home_label}<br>
      <strong>Overall Inspection:</strong> ${feature.properties.overall_inspection}<br>
      <strong>Quality of Care:</strong> ${feature.properties.quality_of_care}<br>
      <strong>Quality of Life:</strong> ${feature.properties.quality_of_life}<br>
      <strong>Administration:</strong> ${feature.properties.administration}<br>
      <strong>Nutrition and Hydration:</strong> ${feature.properties.nutrition_and_hydration}<br>
      <strong>Restraints and Abuse:</strong> ${feature.properties.restraints_and_abuse}<br>
      <strong>Pressure Ulcers:</strong> ${feature.properties.pressure_ulcers}<br>
      <strong>Decline:</strong> ${feature.properties.decline}<br>
      <strong>Dignity:</strong> ${feature.properties.dignity}
    `;
    layer.bindTooltip(tooltipContent, { direction: 'top', permanent: false, className: 'tooltip' });
  }
}).addTo(map_nursing_homes);

// Add regions layer
var regionsLayer_nursing_homes = L.geoJSON(null, {
  style: {
    fill: false,
    weight: 2,
    color: '#afa79f',
    opacity: 0.25
  }
}).addTo(map_nursing_homes);


// Load GeoJSON data and add to respective layers

fetch('https://raw.githubusercontent.com/evanapplegate/evanapplegate.github.io/main/FL_nursing_homes/nursing_homes.geojson')
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    nursingHomesLayer.addData(data);
    nursingHomesLayer5Star.addData(data);
    nursingHomesLayer1Star.addData(data);
    nursingHomesLayer.addTo(map_nursing_homes); // Add nursingHomesLayer to map by default
  });

fetch('https://raw.githubusercontent.com/evanapplegate/evanapplegate.github.io/main/FL_nursing_homes/FL_regions_WGS84.geojson')
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    regionsLayer_nursing_homes.addData(data);
  });

// Checkbox event listeners
var nursingHomesCheckbox = document.getElementById('nursingHomesCheckbox');
nursingHomesCheckbox.addEventListener('change', function () {
  if (this.checked) {
    map_nursing_homes.addLayer(nursingHomesLayer);
  } else {
    map_nursing_homes.removeLayer(nursingHomesLayer);
  }
});

var nursingHomes5StarCheckbox = document.getElementById('nursingHomes5StarCheckbox');
nursingHomes5StarCheckbox.addEventListener('change', function () {
  if (this.checked) {
    map_nursing_homes.addLayer(nursingHomesLayer5Star);
  } else {
    map_nursing_homes.removeLayer(nursingHomesLayer5Star);
  }
});

var nursingHomes1StarCheckbox = document.getElementById('nursingHomes1StarCheckbox');
nursingHomes1StarCheckbox.addEventListener('change', function () {
  if (this.checked) {
    map_nursing_homes.addLayer(nursingHomesLayer1Star);
  } else {
    map_nursing_homes.removeLayer(nursingHomesLayer1Star);
  }
});

var regionsCheckbox_nursing_homes = document.getElementById('regionsCheckbox_nursing_homes');
regionsCheckbox_nursing_homes.addEventListener('change', function () {
  if (this.checked) {
    map_nursing_homes.addLayer(regionsLayer_nursing_homes);
  } else {
    map_nursing_homes.removeLayer(regionsLayer_nursing_homes);
  }
});

var assistedLivingCheckbox = document.getElementById('assistedLivingCheckbox');
assistedLivingCheckbox.addEventListener('change', function () {
  if (this.checked) {
    map.addLayer(assistedLivingLayer);
    nursingHomesLayer.bringToBack();
  } else {
    map.removeLayer(assistedLivingLayer);
  }
});
} catch (e) {
  console.error(e);
}

// one <script> on the Dorik page; an error here does not stop the next block, as before
try {
     fetch('https://raw.githubusercontent.com/evanapplegate/evanapplegate.github.io/main/FL_nursing_homes/FL_US_pop.csv')
    .then(response => response.text())
    .then(csvData => {
        const rows = csvData.split('\n');
        const labels = [];
        const flShares = [];
        const usShares = [];
        const flCounts = [];
        const usCounts = [];

        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',');
            labels.push(columns[0]);
            flShares.push(parseFloat(columns[3]));
            usShares.push(parseFloat(columns[4]));
            flCounts.push(parseInt(columns[1]));
            usCounts.push(parseInt(columns[2]));
        }

        const barHeight = 15;
        const barGap = 30;
        const chartHeight = (barHeight + barGap) * 9;

        const chartCanvas = document.getElementById('chart');
        chartCanvas.style.height = chartHeight + 'px';

        const ctx = chartCanvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Florida',
                        backgroundColor: '#c2dbee', // Update FL Share color
                        data: flShares,
                        borderWidth: 0,
                        barThickness: barHeight
                    },
                    {
                        label: 'U.S.',
                        backgroundColor: '#f7d5cb', // Update US Share color
                        data: usShares,
                        borderWidth: 0,
                        barThickness: barHeight
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false, // Allow chart to resize without growing infinitely
                plugins: {
                    legend: {
                        position: 'top' // Show legend at the top
                    },
                    tooltip: {
                        backgroundColor: 'rgba(140, 128, 119, 0.9)', // Set tooltip background color
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const datasetIndex = context.datasetIndex;
                                const count = datasetIndex === 0 ? flCounts[index] : usCounts[index];
                                let label = '';
                                if (datasetIndex === 0) {
                                    label += 'Florida: ' + flShares[index].toFixed(1) + '%\n' + 'of population';
                                } else {
                                    label += 'U.S.: ' + usShares[index].toFixed(1) + '%\n' + 'of population' ;
                                }
                                label += ', ' + count.toLocaleString() + ' people';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 14, // Set the X-axis maximum to 14
                        ticks: {
                            callback: function (value) {
                                return value + '%'; // Add "%" to the X-axis labels
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        minBarLength: barHeight, // Set the minimum bar height to the desired barHeight
                        barPercentage: 0.8 // Adjust the bar thickness (default is 0.9)
                    }
                },
                layout: {
                    padding: {
                        left: 50 // Adjust the left padding to accommodate labels
                    }
                },
                elements: {
                    bar: {
                        borderWidth: 1,
                    }
                },
            }
        });
    });

 
} catch (e) {
  console.error(e);
}
