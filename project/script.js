mapboxgl.accessToken = 'pk.eyJ1Ijoic29waWhhMTExMTEiLCJhIjoiY201d2h5NHczMDhuZTJrcjA3aHVoMGE2bCJ9.iJvC7Wf2RKz8d5hm485I3g';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-4.251433, 55.860916],
  zoom: 12
});


const data_url = "https://api.mapbox.com/datasets/v1/sopiha11111/cm79r1koi5tqm1zpd2xa349uo/features?access_token=pk.eyJ1Ijoic29waWhhMTExMTEiLCJhIjoiY201d2h5NHczMDhuZTJrcjA3aHVoMGE2bCJ9.iJvC7Wf2RKz8d5hm485I3g";

map.on('load', () => {
  // add accident layer，use NUMBER_OF_CASUALTIES value to control the radius and color of points
  map.addLayer({
    id: 'accidents',
    type: 'circle',
    source: {
      type: 'geojson',
      data: data_url
    },
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['to-number', ['get', 'NUMBER_OF_CASUALTIES']],
        1, 9,
        6, 24
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['to-number', ['get', 'NUMBER_OF_CASUALTIES']],
        1, '#2DC4B2',
        2, '#3BB3C3',
        3, '#669EC4',
        4, '#8B88B6',
        5, '#A2719B',
        6, '#AA5E79'
      ],
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
  
  // Updates the highlight data and the display properties when the mouse moves
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
  
  // Slider interaction: Filter the data by month
  let filterType = ["!=", ["get", "CASUALITY_TYPE"], "placeholder"];
  let filterMonth = ["!=", ["get", "Month"], "2021-01"];
  document.getElementById('slider').addEventListener('input', (event) => {
    const month = parseInt(event.target.value);
    const formatted_month = '2021-' + ("0" + month).slice(-2);
    filterMonth = ['==', ['get', 'MONTH'], formatted_month];
    map.setFilter('accidents', ['all', filterMonth, filterType]);
    document.getElementById('active-month').innerText = month;
  });
  
  // Radio-button interaction: Filter the data by the Casuality type
  document.getElementById('filters').addEventListener('change', (event) => {
    const type = event.target.value;
    if (type === 'all') {
      filterType = ['!=', ['get', 'CASUALITY_TYPE'], 'placeholder'];
    } else if (type === 'Car occupant') {
      filterType = ['==', ['get', 'CASUALITY_TYPE'], 'Car occupant'];
    } else if (type === 'Pedestrian') {
      filterType = ['==', ['get', 'CASUALITY_TYPE'], 'Pedestrian'];
    }
    map.setFilter('accidents', ['all', filterMonth, filterType]);
  });
});

// Add a map control
map.addControl(new mapboxgl.NavigationControl(), "top-right");
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading: true
}), "top-right");

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  placeholder: "Search for places in Glasgow",
  proximity: { longitude: 55.8642, latitude: 4.251433 }
});
map.addControl(geocoder, "top-right");