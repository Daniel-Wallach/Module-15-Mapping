// Store the earthquake GeoJSON URL
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(earthquakeURL).then(function(data) {
  console.log(data);  // Log the data to examine the structure
  
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            var geojsonMarkerOptions = {
                radius: feature.properties.mag * 4,  // Adjust the size of markers based on magnitude
                fillColor: getColor(feature.geometry.coordinates[2]),  // Color based on depth
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

// Function to determine marker color based on earthquake depth
function getColor(depth) {
    switch (true) {
        case depth > 90:
            return "#FF0000";
        case depth > 70:
            return "#FF6600";
        case depth > 50:
            return "#FFCC00";
        case depth > 30:
            return "#FFFF00";
        case depth > 10:
            return "#99CC00";
        default:
            return "#00FF00";
    }
}

function createMap(earthquakes) {

    // Define streetmap layer using OpenStreetMap tiles
    var streetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    });

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a legend to provide context for the map data
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
            depths = [-10, 10, 30, 50, 70, 90],
            labels = [],
            from, to, color;

        // Loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depths.length; i++) {
        from = depths[i];
        to = depths[i + 1];
        color = getColor(from + 1);

        labels.push(
            '<i style="background:' + color + '; width: 18px; height: 18px; float: left; margin-right: 8px;"></i> ' +
            from + (to ? '&ndash;' + to : '+')
        );
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(myMap);

}