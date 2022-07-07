'use strict';

// ELEMENTS:
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// WORKOUT CLASSES
class Workout {
  date = new Date();
  id = uuid.v4();

  constructor(coords, distance, duration) {
    // Same as fields above:
    // this.date = ...
    // this.id = ...

    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // im min
  }

  _setDescription() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running'

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    // this.type = 'running' -> same as 'type = 'running'' as a public field above

    this.calcPace(); // returns actual pace
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling'

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed
  }
}

// APPLICATION ARCHITECTURE
class App {
  // Private fields(private instance properties)
  #map;
  #mapEvent;
  #workouts = [];

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
    // Helper funcs:
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    //////////////////////////////

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    // Get lat, lng coords
    const { lat, lng } = this.#mapEvent.latlng;

    // Create 'let workout' to be available from inner scopes
    let workout;

    // If workout running, create 'running obj'
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid -> Guard clause
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) 
        return alert('Inputs have to be positive numbers');

      // Create actual workout
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create 'cycling obj'
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration) 
      ) 
        return alert('Inputs have to be positive numbers');

      // Create actual workout
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new obj to workout arr
    this.#workouts.push(workout);
    console.log(workout);

    // Render workouts on a map as marker -> display marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear form's inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''; 
  }

  _renderWorkoutMarker(workout) {
    console.log(this.#mapEvent);

    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(
      L.popup({
        maxWidth: 250, 
        maxWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`
      })
    )
    .setPopupContent('Workout')
    .openPopup();
  }

  _renderWorkout(workout) {
    let htmlWorkout = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      htmlWorkout += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      htmlWorkout += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

      form.insertAdjacentHTML('afterend', htmlWorkout);
  }
}

const app = new App();