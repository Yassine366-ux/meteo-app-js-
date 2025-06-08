let map;
let id = '9505fd1df737e20152fbd78cdb289b6a';
let url = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + id;
let forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + id;

let city, form, temperature, description, valueSearch, clouds, humidity, pressure, forecastDiv, main;

document.addEventListener("DOMContentLoaded", () => {
    city = document.querySelector('.name');
    form = document.querySelector("form");
    temperature = document.querySelector('.temperature');
    description = document.querySelector('.description');
    valueSearch = document.getElementById('name');
    clouds = document.getElementById('clouds');
    humidity = document.getElementById('humidity');
    pressure = document.getElementById('pressure');
    forecastDiv = document.getElementById('forecast');
    main = document.querySelector('main');

    preloadWeatherVideos();
    initApp();

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const cityName = valueSearch.value.trim();
        if (cityName !== '') {
            searchWeather(cityName);
        }
    });
});

const preloadWeatherVideos = () => {
    const videos = ["sunny.mp4", "rainy.mp4", "cloudy.mp4", "snow.mp4", "storm.mp4", "default.mp4"];
    videos.forEach(filename => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = `video/${filename}`;
        document.head.appendChild(link);
    });
};

const moveMap = (lat, lon) => {
    if (map) {
        map.setView([lat, lon], 10);
        L.marker([lat, lon]).addTo(map).bindPopup("Nouvelle ville").openPopup();
    }
};

const searchWeather = (cityName) => {
    fetch(url + '&q=' + cityName)
        .then(res => res.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeatherData(data);
                loadForecast(cityName);

                const lat = data.coord.lat;
                const lon = data.coord.lon;
                moveMap(lat, lon);
                loadSoilData(lat, lon);
            } else {
                alert("Ville non trouvée !");
            }
        });
};

const loadForecast = (city) => {
    fetch(forecastUrl + '&q=' + city)
        .then(res => res.json())
        .then(data => {
            forecastDiv.innerHTML = '';
            const filtered = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
            filtered.forEach(item => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <strong>${new Date(item.dt_txt).toLocaleDateString()}</strong><br>
                    ${item.weather[0].description}, ${item.main.temp}°C
                `;
                forecastDiv.appendChild(div);
            });
        });
};

const displayWeatherData = (data) => {
    city.querySelector('figcaption').innerText = data.name;
    city.querySelector('img').src = `https://flagsapi.com/${data.sys.country}/shiny/32.png`;
    temperature.querySelector('img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    temperature.querySelector('span').innerText = data.main.temp;
    description.innerText = data.weather[0].description;
    clouds.innerText = data.clouds.all + "%";
    humidity.innerText = data.main.humidity + "%";
    pressure.innerText = data.main.pressure + " hPa";
    setWeatherBackground(data.weather[0].main);

    fetch('save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            ville: data.name,
            description: data.weather[0].description,
            temperature: data.main.temp,
            pression: data.main.pressure,
            humidite: data.main.humidity
        })
    });
};

const getCityNameFromCoords = async (lat, lon) => {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${id}`);
    const data = await response.json();
    return data && data.length > 0 ? data[0].name : null;
};

const setWeatherBackground = (condition) => {
    const video = document.getElementById("bgVideo");
    let filename = "default.mp4";

    switch (condition.toLowerCase()) {
        case "clear": filename = "sunny.mp4"; break;
        case "rain":
        case "drizzle": filename = "rainy.mp4"; break;
        case "clouds":
        case "mist": filename = "cloudy.mp4"; break;
        case "snow": filename = "snow.mp4"; break;
        case "thunderstorm": filename = "storm.mp4"; break;
    }

    const newSource = `video/${filename}`;
    const sourceTag = video.querySelector("source");
    if (!sourceTag.src.includes(filename)) {
        sourceTag.src = newSource;
        video.load();
    }
};

const initMap = (lat, lon) => {
    map = L.map('map').setView([lat, lon], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup("Vous êtes ici").openPopup();

    const clouds = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${id}`, { opacity: 0.5 });
    const precipitation = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${id}`, { opacity: 0.5 });
    const temp = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${id}`, { opacity: 0.5 });

    L.control.layers(null, {
        "Nuages": clouds,
        "Précipitations": precipitation,
        "Température": temp
    }).addTo(map);
};

const initApp = async () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            initMap(latitude, longitude);
            const cityName = await getCityNameFromCoords(latitude, longitude);
            searchWeather(cityName || "Paris");
            valueSearch.value = cityName || "Paris";
        }, () => {
            initMap(48.8566, 2.3522);
            searchWeather("Paris");
            valueSearch.value = "Paris";
        });
    } else {
        initMap(48.8566, 2.3522);
        searchWeather("Paris");
        valueSearch.value = "Paris";
    }
};

