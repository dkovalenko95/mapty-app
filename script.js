'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ELEMENTS:
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

// FUNCTIONALITY:
// Get position(Geolocation API):
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    // Success
    function(position) {
      const { latitude, longitude } = position.coords;
      console.log(`https://www.google.com.ua/maps/@${latitude},${longitude},13z`);

      const coords = [latitude, longitude];
      const staticCoords = [50.3671577, 30.4406045];

      // Define 'mapE' as a Global variable
      map = L.map('map').setView(coords, 13);
      console.log(map);

      // Google Map tiles
      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      // Handling Clicks on Map
      map.on('click', function(mapE) {
        // Define 'mapE' as a Global variable
        mapEvent = mapE;

        // Show form
        form.classList.remove('hidden');

        // Make focus on 'input' field
        inputDistance.focus();
      });
    },
    // Error
    function() {
      alert('Could not get your position')
    }
  );

  // Form submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Clear form's inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''; 

    // Display marker
    console.log(mapEvent);
    const { lat, lng } = mapEvent.latlng;

    // Create marker
    L.marker([lat, lng])
    .addTo(map)
    .bindPopup(L.popup({
      maxWidth: 250, 
      maxWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: 'running-popup'
    }))
    .setPopupContent('Workout')
    .openPopup();
  });
};

inputType.addEventListener('change', function() {
  // Select 'parent elem' of type/toggle change
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});