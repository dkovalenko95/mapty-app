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

// APPLICATION ARCHITECTURE
class App {
  // Private fields(private instance properties)
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    // Form submit
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Toggle 'input' type
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    // Get position(Geolocation API):
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
        alert('Could not get your position')
      });
  }

  _loadMap(position) {
    // Get coords
    const { latitude, longitude } = position.coords;
    console.log(`https://www.google.com.ua/maps/@${latitude},${longitude},13z`);

    const coords = [latitude, longitude];
    const staticCoords = [50.3671577, 30.4406045];

    console.log(this);

    this.#map = L.map('map').setView(coords, 13);
    console.log(this.#map);

    // Google Map tiles
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    // Handling Clicks on Map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // Show form
    form.classList.remove('hidden');
    // Make focus on 'input' field
    inputDistance.focus();
  }

  _toggleElevationField() {
    // Select 'parent elem' of type/toggle change
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    // Clear form's inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''; 
    // Display marker
    console.log(this.#mapEvent);
    const { lat, lng } = this.#mapEvent.latlng;

    // Create marker
    L.marker([lat, lng])
    .addTo(this.#map)
    .bindPopup(
      L.popup({
        maxWidth: 250, 
        maxWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup'
      })
    )
    .setPopupContent('Workout')
    .openPopup();
  }
}

const app = new App();