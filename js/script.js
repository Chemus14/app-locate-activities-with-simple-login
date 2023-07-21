'use strict';

// Select components
const addPlaceBtn = document.querySelector('.add-fav-box');
const favBox = document.querySelector('.favs-box');
const activitiesBox = document.querySelector('.activities');
const map = L.map('map').setView([51.541816, -2.563626], 20);

// // Use the EPSG:3395 projection for more accurate distance measurements
// map.options.crs = L.CRS.EPSG3857;

// L.gridLayer
//   .googleMutant({
//     type: 'roadmap', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
//   })
//   .addTo(map);

let selectPlaces;
let html = '';
let myPlaces = [];
let arrActivity = [];
let coords = '';
let option = '';
const options = [
  ['home', 'house'],
  ['work', 'briefcase'],
  ['gym', 'dumbbell'],
  ['pub', 'champagne-glasses'],
  ['restaurant', 'utensils'],
  ['library', 'book'],
];
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Event for adding new places
addPlaceBtn.addEventListener('click', () => {
  addPlaceBtn.disabled = true;
  addPlaceBtn.style.display = 'none';
  activitiesBox.style.display = 'none';
  renderSelectPlaces();
});

const renderSelectPlaces = function () {
  html = `<select id="select-places">
    <option value="hide">-- Places --</option>
    <option value="home" data-icon="house">Home</option>
    <option value="work" data-icon="briefcase">Work</option>
    <option value="gym" data-icon="dumbbell">Gym</option>
    <option value="pub" data-icon="champagne-glasses">Pub</option>
    <option value="restaurant" data-icon="utensils">Restaurant</option>
    <option value="library" data-icon="book">Library</option>
  </select>
  
  <button type="button" class="add-place disabled">
    Add <i class="fa-sharp fa-solid fa-plus"></i>
  </button>
  <div class="text-add-btn">Click on the map to save the location</div>`;

  favBox.innerHTML = html;
  const addBtn = document.querySelector('.add-place');
  selectPlaces = document.querySelector('#select-places');
  getDataIcon(selectPlaces);

  selectPlaces.disabled = true;
  addBtn.disabled = true;
  map.on('click', e => {
    selectPlaces.disabled = false;
    addBtn.disabled = false;
    addBtn.classList.remove('disabled');
    coords = getCoords(e);
    const textWarning = document.querySelector('.text-add-btn');
    textWarning.innerHTML = '';
  });

  addBtn.addEventListener('click', () => {
    const place = selectPlaces.value;

    if (place === 'hide') {
      textWarning.innerHTML = 'You should choose one of the places';
      return;
    }

    if (myPlaces === null) myPlaces = [];
    // Store the new info in the variable

    const myCurrentPlace = [place, JSON.stringify(coords)];
    myPlaces.push(myCurrentPlace);

    //Add marker

    addMarkerMap(coords);
    option = 'places';
    // Store the info in the local storage
    setLocalStorage(myPlaces, option);

    html = '';
    activitiesBox.style.display = 'flex';
    renderFavPlaces(myPlaces);
  });
};

const popup = L.popup();

const getCoords = function (e) {
  popup.setLatLng(e.latlng);
  coords = e.latlng;
  return coords;
};

const addMarkerMap = function (coords) {
  // const myIcon = L.divIcon({ className: 'fa-sharp fa-solid fa-plus' });
  // const { lat, lng } = coords;
  // L.marker([lat, lng], { icon: myIcon }).addTo(map);

  var greenIcon = L.icon({
    iconUrl: '../../imgs/marker.png',
    shadowUrl: '',
    iconSize: [60, 100], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  });
  const { lat, lng } = coords;
  L.marker([lat, lng], { icon: greenIcon }).addTo(map);
};

const setLocalStorage = function (info, option) {
  // Store data in localStorage
  if (option === 'places') localStorage.setItem('places', JSON.stringify(info));
  if (option === 'activity')
    localStorage.setItem('activities', JSON.stringify(info));
};

const getLocalStorage = function () {
  myPlaces = JSON.parse(localStorage.getItem('places')) || [];
  arrActivity = JSON.parse(localStorage.getItem('activities')) || [];
};

const renderFavPlaces = function (myPlaces) {
  myPlaces.forEach(element => {
    const icon = getIcon(element[0]);
    addMarkerMap(JSON.parse(element[1]));
    html += `<button type="button" data-loc=${element[1]} class="item-fav-box">
      ${element[0]} <i class="fa-solid fa-${icon}"></i>
    </button>`;
  });

  addPlaceBtn.style.display = 'block';
  addPlaceBtn.disabled = false;
  favBox.innerHTML = html;
};

const getDataIcon = function (place) {
  const opt = selectPlaces.options;
  for (let i = 1; i < opt.length; i++) {
    const optCurr = [opt[i].value, opt[i].dataset.icon];
    options.push(optCurr);
  }
};

const getIcon = function (value) {
  const [, result] = options.find(([opt]) => opt === value) || [];
  return result;
};

const buttons = document.querySelectorAll('.item-fav-box');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    console.log(button);
    const coordsString = button.dataset.loc;
    let coords = JSON.parse(coordsString);
    console.log(typeof coordsString);
    map.setView(coords, 50); // Set the view of the map to the clicked button's coordinates
  });
});

// Activities

const containerActivities = document.querySelector('.activities-box');
const btnAddActivities = document.querySelector('.add-activities-box');

btnAddActivities.addEventListener('click', () => {
  btnAddActivities.style.display = 'none';
  containerActivities.innerHTML =
    '<p>Click the map to register your activity...';
  map.on('click', e => {
    coords = getCoords(e);

    inputsAddActivity();
    const location = document.querySelector('#location');
    //Setting the value of the location, and making the input disabled
    location.disabled = true;
    location.value = JSON.stringify(coords);
    const addActivities = document.querySelector('.add-activities-box');
    addActivities.addEventListener('click', () => {
      if (!validationInputs()) return;

      const currentActivity = getValuesActivity();
      option = 'activity';
      arrActivity.push(currentActivity);
      setLocalStorage(arrActivity, option);
      renderActivities(arrActivity);
      btnAddActivities.style.display = 'block';
    });
  });
});

const inputsAddActivity = function () {
  html = '';
  html += `<div class='add-activity'>
  <div class='input-group'>
  <select id="select-activity">
    <option value="hide">-- Activity --</option>
    <option value="running" data-icon="person-running">Running</option>
    <option value="biking" data-icon="person-biking">Cycling</option>
    <option value="swimming" data-icon="person-swimming">Swimming</option>
    <option value="walking" data-icon="person-walking">Walking</option>
  </select>
  </div>
  <div class='input-group'>
  <label for="location">Location:</label>
  <input type="text" id="location" name="location" disabled>
  </div>
  <div class='input-group'>
  <label for="distance">Distance:</label>
  <input type="number" id="distance" name="distance">
  </div>
  <div class='input-group'>
  <label for="time_start">Time Start:</label>
  <input type="time" id="time_start" name="time_start">
  </div>
  <div class='input-group'>
  <label for="time_end">Time End:</label>
  <input type="time" id="time_end" name="time_end">
  </div>

  <div class='input-group'>
  <label for="date">Date:</label>
  <input type="date" id="date" name="date">
  </div>
  </div> 
  <div class='warning-act'></div>
  <button type="button" class="add-activities-box">
            Add  <i class="fa-sharp fa-solid fa-plus"></i>
          </button>`;

  containerActivities.innerHTML = html;
  html = '';
};

const validationInputs = function () {
  const inputs = document.querySelectorAll(
    '.input-group input, .input-group select'
  );
  const warning = document.querySelector('.warning-act');
  let isValid = true; // Use a flag variable to track the validity

  inputs.forEach(input => {
    if (input.value === '' || input.value === 'hide') {
      warning.innerHTML = 'You should fill up all the inputs';
      isValid = false; // Set the flag to false if any input is empty or has value "hide"
    }
  });

  return isValid; // Return the flag after the loop has finished checking all inputs
};

const getValuesActivity = function () {
  const selectActivity = document.querySelector('#select-activity');
  const location = document.querySelector('#location');
  const distance = document.querySelector('#distance');
  const startTime = document.querySelector('#time_start');
  const endTime = document.querySelector('#time_end');
  const dateActivity = document.querySelector('#date');
  let arrTemp = [];
  // Store values in arrActivity
  if (selectActivity.value !== 'hide') arrTemp.push(selectActivity.value);
  arrTemp.push(location.value);
  arrTemp.push(distance.value);
  arrTemp.push(startTime.value);
  arrTemp.push(endTime.value);
  arrTemp.push(dateActivity.value);

  return arrTemp;
};

const renderActivities = function (currentAct) {
  currentAct.forEach(element => {
    addCircleActivity(JSON.parse(element[1]), element[2]);
    let { hours, minutes } = calculateTimeDifference(element[3], element[4]);
    html += `<div class="container-activity" data-coords='${element[1]}'>
  <p>
    <span><i class="fa-solid fa-person-${element[0]}"></i
    ></span><span>${element[2]} kms in a ${hours} hour and ${minutes} minutes on ${element[5]}</span>
  </p>
</div>`;
  });

  containerActivities.innerHTML = html;
};

function calculateTimeDifference(startTimeStr, endTimeStr) {
  // Parse the time strings into Date objects
  const startTime = new Date(`2000-01-01T${startTimeStr}`);
  const endTime = new Date(`2000-01-01T${endTimeStr}`);

  // Calculate the time difference in milliseconds
  const timeDifferenceMs = endTime - startTime;

  // Calculate hours and minutes from the time difference
  const hours = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
  const minutes = Math.floor(
    (timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  return { hours, minutes };
}

const addCircleActivity = function (coords, distance) {
  const { lat, lng } = coords;
  L.circle([lat, lng], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: distance * 100,
  }).addTo(map);
};

getLocalStorage();
if (myPlaces !== null) renderFavPlaces(myPlaces);
html = '';
console.log(arrActivity);
if (arrActivity !== null) renderActivities(arrActivity);
