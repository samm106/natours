/* eslint-disable */


export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic2FtZWVyc2F4ZW5hIiwiYSI6ImNrYWg0MHBncTBhNXkycWxzcXM1a2Y1bHYifQ.ollebxASc6Enwkfas74GsQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/sameersaxena/ckah56i6i0tob1iltyl6xp1ov',
    scrollZoom: false,
    // center: [34.111745, -118.113491],
    // zoom: 10,
    // interactive: false
  });
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p> </p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 150,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
