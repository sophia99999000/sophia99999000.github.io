// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken = "pk.eyJ1Ijoic29waWhhMTExMTEiLCJhIjoiY201d2h5NHczMDhuZTJrcjA3aHVoMGE2bCJ9.iJvC7Wf2RKz8d5hm485I3g";
const map = new mapboxgl.Map({ 
container: 'map', // container element id 
style: 'mapbox://styles/mapbox/light-v10', 
center: [-4.251433, 55.860916], 
zoom: 12 
}); 
const data_url = 
"https://api.mapbox.com/datasets/v1/sopiha11111/cm79cdovua71n1omx6hqm5ox8/features?access_token=pk.eyJ1Ijoic29waWhhMTExMTEiLCJhIjoiY201d2h5NHczMDhuZTJrcjA3aHVoMGE2bCJ9.iJvC7Wf2RKz8d5hm485I3g"; 
map.on('load', () => { 
map.addLayer({ 
id: 'accidents', 
type: 'circle', 
source: { 
type: 'geojson', 
data: data_url  
}, 
paint: { 
'circle-radius': 8, 
'circle-color': '#e9a3c9', 
'circle-opacity': 0.8 
} 
}); 
  
  map.addSource("hover", { 
type: "geojson", 
data: { type: "FeatureCollection", features: [] } 
});  

map.addLayer({ 
id: "dz-hover", 
type: "line", 
source: "hover", 
layout: {}, 
paint: { 
"line-color": "black", 
"line-width": 4 
} 
}); 
  
  map.on("mousemove", (event) => { 
const features = map.queryRenderedFeatures(event.point, { 
layers: ["accidents"] 
}); 
  
if (features.length > 0) {
    document.getElementById("pd").innerHTML = `
      <h3>Road Type: ${features[0].properties.ROAD_TYPE}</h3>
      <p>Surface Conditions: ${features[0].properties.ROAD_SURFACE_CONDITIONS}</p>
    `;
  } else {
    document.getElementById("pd").innerHTML = `<p>Hover over a data zone!</p>`;
  }
  
  map.getSource("hover").setData({ 
type: "FeatureCollection", 
features: features.map(feature => ({ 
  type: "Feature", 
  geometry: feature.geometry
}))
}); 
});
  
//Slider interaction code goes below

filterType = ["!=", ["get", "CASUALITY_TYPE"], "placeholder"];
filterMonth = ["!=", ["get", "Month"], "2021-01"];
document.getElementById('slider').addEventListener('input', (event) => { 
//Get the month value from the slider 
const month = parseInt(event.target.value); 
// get the correct format for the data 
formatted_month = '2021-' + ("0" + month).slice(-2) 
//Create a filter 
filterMonth = ['==', ['get', 'MONTH'], formatted_month] 
//set the map filter 
map.setFilter('accidents', ['all', filterMonth, filterType]); 
// update text in the UI 
document.getElementById('active-month').innerText = month; 
}); 
//Radio button interaction code goes below 

document.getElementById('filters').addEventListener('change', (event) => { 
const type = event.target.value; 
console.log(type); 
// update the map filter 
if (type == 'all') { 
filterType = ['!=', ['get', 'CASUALITY_TYPE'], 'placeholder']; 
} else if (type == 'Car occupant') { 
filterType = ['==', ['get', 'CASUALITY_TYPE'], 'Car occupant']; 
} else if (type == 'Pedestrian') { 
filterType = ['==', ['get', 'CASUALITY_TYPE'], 'Pedestrian']; 
} else { 
console.log('error'); 
} 
map.setFilter('accidents', ['all', filterMonth, filterType]); 
}); 
}); 

map.addControl(new mapboxgl.NavigationControl(), "top-right"); 
map.addControl( 
new mapboxgl.GeolocateControl({ 
positionOptions: { 
enableHighAccuracy: true 
}, 
trackUserLocation: true, 
showUserHeading: true 
}), 
"top-right" 
); 

const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken,
  // Set the access token

  mapboxgl: mapboxgl,
  // Set the mapbox-gl instance
  marker: false,
  // Do not use the default marker style
  placeholder: "Search for places in Glasgow",
  // Placeholder text for the search bar
  proximity: { longitude: 55.8642, latitude: 4.2518 }

  // Coordinates of Glasgow center
});

map.addControl(geocoder, "top-right");

// add scale
const scale = new mapboxgl.ScaleControl({
  maxWidth: 100,
  unit: 'metric'
});
map.addControl(scale, 'bottom-right');

/*  
Add an event listener that runs 
when a user clicks on the map element. 
*/ 
map.on('click', (event) => { 
  // If the user clicked on one of your markers, get its information. 
const features = map.queryRenderedFeatures(event.point, { 
layers: ['accidents'] // replace with your layer name 
}); 
if (!features.length) { 
return; 
} 
const feature = features[0]; 
/*  
Create a popup, specify its options  
and properties, and add it to the map. 
*/ 
const popup = new mapboxgl.Popup({ offset: [0, -15] }) 
.setLngLat(feature.geometry.coordinates) 
.setHTML( 
`<h3>${feature.properties.ACCIDENT_SEVERITY}</h3><p>${feature.properties.SPEED_LIMIT}</p>` 
) 
.addTo(map); 
});