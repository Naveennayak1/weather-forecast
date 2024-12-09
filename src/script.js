const apiKey = "3debd7a16fc8e9a03bbc0ea7a2f2bcf4";
const greeting = document.getElementById("greeting");
const dateTime = document.getElementById("date-time");
const currentWeather = document.getElementById("current-weather");
const forecast = document.getElementById("forecast");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const recommendedLocations = document.getElementById("recommended-locations");
const cityDropdown = document.getElementById("city-dropdown");

const recentCitiesKey = "recentCities";

// Helper to update date and time
function formatDateTime() {
  const now = new Date();
  dateTime.textContent = now.toLocaleString();
}

// Greeting based on the time of day
function setGreeting() {
  const now = new Date();
  const hours = now.getHours();
  const name = localStorage.getItem("userName") || "User"; // Directly using "User" instead of asking
  localStorage.setItem("userName", name);

  let timeOfDay;
  if (hours < 12) timeOfDay = "Good Morning";
  else if (hours < 18) timeOfDay = "Good Afternoon";
  else timeOfDay = "Good Evening";

  greeting.textContent = `${timeOfDay}, ${name}!`;
}

// Fetch weather and forecast data by city
async function fetchWeatherData(city) {
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!weatherResponse.ok) throw new Error("City not found");
    const weatherData = await weatherResponse.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastResponse.json();

    return { weatherData, forecastData };
  } catch (error) {
    alert("Error fetching data. Please check the city name and try again.");
    throw error;
  }
}

// Fetch weather and forecast data by coordinates
async function fetchWeatherByCoords(lat, lon) {
  const weatherResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );
  const weatherData = await weatherResponse.json();

  const forecastResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );
  const forecastData = await forecastResponse.json();

  return { weatherData, forecastData };
}

// Display current weather data
function displayWeather(data) {
  const { name, main, weather, wind } = data;
  currentWeather.querySelector("h2").textContent = name;
  currentWeather.querySelector("#temperature").textContent = `${Math.round(
    main.temp
  )}°C`;
  currentWeather.querySelector("#weather-desc").textContent =
    weather[0].description;
  currentWeather.querySelector(
    "#weather-icon"
  ).src = `https://openweathermap.org/img/wn/${
    weather[0].icon || "01d"
  }@2x.png`;
  currentWeather.querySelector("#humidity").textContent = `${main.humidity}%`;
  currentWeather.querySelector("#wind-speed").textContent = `${wind.speed} m/s`;
}

// Display 5-day forecast data
function displayForecast(data) {
  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );
  forecast.innerHTML = dailyData
    .map(
      (item) => ` 
        <div class="bg-white bg-opacity-10 p-4 rounded-lg text-center">
            <p class="text-sm font-semibold">${new Date(
              item.dt * 1000
            ).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${
              item.weather[0].icon
            }@2x.png" alt="${
        item.weather[0].description
      }" class="w-12 h-12 mx-auto">
            <p class="text-lg font-bold">${Math.round(item.main.temp)}°C</p>
            <p class="text-sm">Humidity: ${item.main.humidity}%</p>
            <p class="text-sm">Wind: ${item.wind.speed} m/s</p>
        </div>
    `
    )
    .join("");
}

// Manage recent cities
function updateRecentCities(city) {
  let recentCities = JSON.parse(localStorage.getItem(recentCitiesKey)) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    if (recentCities.length > 5) recentCities.shift(); // Limit to 5 cities
    localStorage.setItem(recentCitiesKey, JSON.stringify(recentCities));
  }
  renderCityDropdown();
}

function renderCityDropdown() {
  const recentCities = JSON.parse(localStorage.getItem(recentCitiesKey)) || [];

  // Show or hide dropdown based on recent cities data
  if (recentCities.length > 0) {
    cityDropdown.style.display = "block"; // Show the dropdown
    cityDropdown.innerHTML = recentCities
      .map((city) => `<option value="${city}">${city}</option>`)
      .join("");
  } else {
    cityDropdown.style.display = "none"; // Hide the dropdown if no recent cities
  }

  cityDropdown.addEventListener("change", async () => {
    const selectedCity = cityDropdown.value;
    if (selectedCity) {
      const { weatherData, forecastData } = await fetchWeatherData(
        selectedCity
      );
      displayWeather(weatherData);
      displayForecast(forecastData);
    }
  });
}

// Fetch recommended locations (for example, a predefined list of cities)
function fetchRecommendedLocations() {
  const recommendedCities = [
    "New York",
    "Los Angeles",
    "London",
    "Paris",
    "Tokyo",
    "pune",
  ];
  recommendedLocations.innerHTML = ""; // Clear the existing content
  recommendedCities.forEach((city) => {
    const button = document.createElement("button");
    button.textContent = city;
    button.classList.add(
      "w-full",
      "py-2",
      "bg-blue-600",
      "rounded",
      "text-white",
      "mt-2",
      "hover:bg-blue-700"
    );
    button.addEventListener("click", async () => {
      try {
        const { weatherData, forecastData } = await fetchWeatherData(city);
        displayWeather(weatherData);
        displayForecast(forecastData);
        updateRecentCities(city); // Store the city in recent searches
      } catch (error) {
        console.error(error);
      }
    });
    recommendedLocations.appendChild(button);
  });
}

// Event listeners
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  try {
    const { weatherData, forecastData } = await fetchWeatherData(city);
    displayWeather(weatherData);
    displayForecast(forecastData);
    updateRecentCities(city);
    cityInput.value = ""; // Clear the input field after the search
  } catch (error) {
    console.error(error);
  }
});

currentLocationBtn.addEventListener("click", () => {
  function askPermissionAgain() {
    alert(
      "Please allow location access to fetch weather data based on your location."
    );
    // Call navigator.geolocation again after a delay
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const { weatherData, forecastData } = await fetchWeatherByCoords(
            latitude,
            longitude
          );
          displayWeather(weatherData);
          displayForecast(forecastData);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            askPermissionAgain(); // Keep asking for permission if denied
          } else {
            alert("Unable to retrieve your location. Please try again.");
          }
        }
      );
    }, 1000); // Delay after a denied permission to ask again
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const { weatherData, forecastData } = await fetchWeatherByCoords(
        latitude,
        longitude
      );
      displayWeather(weatherData);
      displayForecast(forecastData);
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        askPermissionAgain(); // Keep asking for permission if denied
      } else {
        alert("Unable to retrieve your location. Please try again.");
      }
    }
  );
});

// Initialize app
(async function initialize() {
  formatDateTime();
  setGreeting();
  renderCityDropdown(); // Ensure dropdown is rendered or hidden based on recent cities
  fetchRecommendedLocations(); // Add recommended locations to the UI

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const { weatherData, forecastData } = await fetchWeatherByCoords(
        latitude,
        longitude
      );
      displayWeather(weatherData);
      displayForecast(forecastData);
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        askPermissionAgain(); // Keep asking for permission if denied
      } else {
        alert("Unable to retrieve your location. Please try again.");
      }
    }
  );
})();
