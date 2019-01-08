// Store API query variables
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";


// Grab the data with d3
d3.json(url, function(response) {

  //console.log(response)
  Data = response.features

  //OnEachFeature function used to bind pop up to the geojson layer
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: "+feature.properties.mag+"</p>");
  }

  //function to set color based on the magnitude of the earthequake
  function getColor(mag) {
    switch (true) {
      case mag < 1:
        return  'green';
      case mag < 2:
        return 'lightgreen';
      case mag < 3:
        return 'yellow';
      case mag < 4:
        return 'orange';
      case mag < 5:
        return 'red';
      default:
        return 'black';
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(Data, {
      onEachFeature: onEachFeature,
  //pointToLayer property used to add circle marker based on lat and lng of data 
      pointToLayer: function (feature, latlng) {
        //console.log(feature.properties.mag)

        let geojsonMarkerOptions = {
          radius: feature.properties.mag *5,
          fillColor: getColor(feature.properties.mag),
          //color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
      };

        return L.circleMarker(latlng, geojsonMarkerOptions)
      }
      
    });

  //function used to create map and layers
  function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });
    
    let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    let baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
  
    // Create overlay object to hold our overlay layer
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 4,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    //create legend, reference:https://stackoverflow.com/questions/21307647/leaflet-adding-a-legend-title
    let legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function (map) {
      let div = L.DomUtil.create('div', 'info legend'),
        magnitute = [0, 1, 2, 3, 4, 5],
        labels = ['<strong> Magnitude </strong>'],
        from, to;

    // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < magnitute.length; i++) {
          from = magnitute[i];
          to = magnitute[i+1];      
          labels.push('<i style="background:' + getColor(from) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
        }
            div.innerHTML = labels.join('<br>');
        
        return div;
    
    };

    legend.addTo(myMap);

  }

  createMap(earthquakes)

});