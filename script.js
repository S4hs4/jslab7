// Глобальні змінні
let watchId = null;
let map = null;
let currentMarker = null;
const destinationMarkers = [];

// Координати Коледжу (Івано-Франківськ)
const ourCoords = {
  latitude: 48.94321,
  longitude: 24.7338,
};

document.addEventListener("DOMContentLoaded", getMyLocation);

function getMyLocation() {
  // Ініціалізація карти за замовчуванням
  initMap(ourCoords.latitude, ourCoords.longitude);

  if (navigator.geolocation) {
    // 1. Отримання поточних координат
    navigator.geolocation.getCurrentPosition(displayLocation, displayError);

    // Прив'язка кнопок відстеження
    const watchButton = document.getElementById("watch");
    watchButton.onclick = watchLocation;

    const clearWatchButton = document.getElementById("clearWatch");
    clearWatchButton.onclick = clearWatch;
  } else {
    alert("Oops, no geolocation support");
  }

  // Обробник для кнопки проскролювання до пункту призначення (Завдання 7)
  document.getElementById("btnGoToDest").onclick = scrollToDestination;
}

// -------------------------------------------------------------
// Відображення локації
// -------------------------------------------------------------
function displayLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  const div = document.getElementById("location");
  div.innerHTML = `You are at Latitude: ${latitude}, Longitude: ${longitude} (with ${accuracy} meters accuracy)`;

  // Обчислення відстані
  const km = computeDistance(position.coords, ourCoords);
  const distanceDiv = document.getElementById("distance");
  distanceDiv.innerHTML = `You are ${km.toFixed(2)} km from the College`;

  // Оновлення карти та додавання маркерів (Завдання 3, 4, 5)
  updateMapPosition(latitude, longitude, accuracy);
}

// -------------------------------------------------------------
// Ініціалізація та оновлення Leaflet карти
// -------------------------------------------------------------
function initMap(lat, lng) {
  if (!map) {
    map = L.map("map").setView([lat, lng], 13);

    // Додаємо шар точок OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Маркер Коледжу
    L.marker([ourCoords.latitude, ourCoords.longitude])
      .addTo(map)
      .bindPopup(
        "<b>Івано-Франківський фаховий коледж</b><br>Пункт призначення",
      )
      .openPopup();
  }
}

function updateMapPosition(lat, lng, accuracy) {
  if (!map) return;

  const timeString = new Date().toLocaleTimeString();

  // Центруємо карту за поточними координатами
  map.setView([lat, lng], 15);

  // Додаємо маркер для поточного положення
  const newMarker = L.marker([lat, lng]).addTo(map);
  const popupContent = `
    <b>Ваша геолокація</b><br>
    Широта: ${lat.toFixed(5)}<br>
    Довгота: ${lng.toFixed(5)}<br>
    Час: ${timeString}
  `;

  newMarker.bindPopup(popupContent).openPopup();
}

// -------------------------------------------------------------
// Розрахунок дистанції (Формула гаверсинуса)
// -------------------------------------------------------------
function computeDistance(startCoords, destCoords) {
  const startLatRads = degreesToRadians(startCoords.latitude);
  const startLongRads = degreesToRadians(startCoords.longitude);
  const destLatRads = degreesToRadians(destCoords.latitude);
  const destLongRads = degreesToRadians(destCoords.longitude);

  const Radius = 6371; // Радіус Землі у км

  const distance =
    Math.acos(
      Math.sin(startLatRads) * Math.sin(destLatRads) +
        Math.cos(startLatRads) *
          Math.cos(destLatRads) *
          Math.cos(startLongRads - destLongRads),
    ) * Radius;

  return distance;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// -------------------------------------------------------------
// Обробник помилок
// -------------------------------------------------------------
function displayError(error) {
  const errorTypes = {
    0: "Unknown error",
    1: "Permission denied by user",
    2: "Position is not available",
    3: "Request timed out",
  };
  let errorMessage = errorTypes[error.code];
  if (error.code === 0 || error.code === 2) {
    errorMessage = errorMessage + " " + error.message;
  }
  const div = document.getElementById("location");
  div.innerHTML = errorMessage;
}

// -------------------------------------------------------------
// Реальний час (Watch Location & Clear Watch)
// -------------------------------------------------------------
function watchLocation() {
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      displayLocation,
      displayError,
    );
    alert("Відстеження у реальному часі активовано!");
  }
}

function clearWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    alert("Відстеження зупинено.");
  }
}

// -------------------------------------------------------------
// Проскролити карту до заданого пункту призначення (Завдання 7)
// -------------------------------------------------------------
function scrollToDestination() {
  const latInput = parseFloat(document.getElementById("destLat").value);
  const lngInput = parseFloat(document.getElementById("destLng").value);

  if (isNaN(latInput) || isNaN(lngInput)) {
    alert("Будь ласка, введіть коректні числові координати!");
    return;
  }

  if (map) {
    // Плавний політ/скрол до координат
    map.flyTo([latInput, lngInput], 16, {
      duration: 1.5,
    });

    // Додаємо маркер призначення
    const destMarker = L.marker([latInput, lngInput]).addTo(map);
    destMarker
      .bindPopup(
        `<b>Обраний пункт призначення</b><br>Lat: ${latInput}, Lng: ${lngInput}`,
      )
      .openPopup();
  }
}
