import "./style.css";

const app      = document.querySelector("#app");
const picker   = document.querySelector("#datepicker");
const clockEl  = document.querySelector("#clock");
const weatherEl = document.querySelector("#weather");
const cityInput = document.querySelector("#city-input");
const cityBtn   = document.querySelector("#city-btn");

const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;

function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, "0");
  const mm  = String(now.getMinutes()).padStart(2, "0");
  const ss  = String(now.getSeconds()).padStart(2, "0");
  const dateStr = now.toDateString();
  clockEl.innerHTML = `
    <div class="clock-time">${hh}:${mm}:${ss}</div>
    <div class="clock-date">${dateStr}</div>
  `;
}
updateClock();
setInterval(updateClock, 1000);

function loadWeather(city) {
  weatherEl.innerHTML = `<p>loading weather...</p>`;
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_KEY}&units=metric`
  )
    .then(res => {
      if (!res.ok) throw new Error(`City not found (${res.status})`);
      return res.json();
    })
    .then(data => {
      const temp    = Math.round(data.main.temp);
      const feels   = Math.round(data.main.feels_like);
      const desc    = data.weather[0].description;
      const icon    = data.weather[0].icon;
      const humidity = data.main.humidity;
      weatherEl.innerHTML = `
        <img
          src="https://openweathermap.org/img/wn/${icon}@2x.png"
          alt="${desc}"
          class="weather-icon"
        />
        <div class="weather-city">${data.name}, ${data.sys.country}</div>
        <div class="weather-temp">${temp}°C</div>
        <div class="weather-desc">${desc}</div>
        <div class="weather-feels">feels like ${feels}°C</div>
        <div class="weather-humidity">humidity ${humidity}%</div>
      `;
    })
    .catch(err => {
      weatherEl.innerHTML = `<p class="error">⚠ ${err.message}</p>`;
    });
}

cityBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) loadWeather(city);
});

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) loadWeather(city);
  }
});

function toYYMMDD(isoDate) {
  // isoDate is "YYYY-MM-DD"
  return isoDate.slice(2, 4) + isoDate.slice(5, 7) + isoDate.slice(8, 10);
}

function buildMedia(data) {
  const url = data.url || "";
  if (data.media_type === "image") {
    return `<img src="${url}" alt="${data.title}" />`;
  } else if (url.includes("youtube") || url.includes("youtu.be")) {
    return `<iframe src="${url}" allowfullscreen></iframe>`;
  } else if (data.media_type === "video") {
    return `<video src="${url}" controls></video>`;
  }
  return `<p><a href="${url}" target="_blank">open media</a></p>`;
}

function loadApod(date) {
  app.innerHTML = "<p>loading...</p>";
  const yymmdd = toYYMMDD(date);

  fetch(`https://science.nasa.gov/wp-json/wp/v2/apod-basic/${yymmdd}`)
    .then(res => {
      if (!res.ok) throw new Error(`NASA returned ${res.status} for ${date}`);
      return res.json();
    })
    .then(data => {
      const title      = data.title?.rendered ?? data.title ?? "No title";
      const copyright  = data.copyright ? ` · © ${data.copyright.trim()}` : "";

      // explanation comes back as HTML — put it in a div, not a <p>
      const explanation = data.explanation ?? "";

      // url is nested: data.url.url
      const mediaUrl = data.hdurl ?? data.url?.url ?? data.url ?? "";
      const mediaType  = data.media_type ?? "image";

      // rebuild data object with flat fields for buildMedia
      const flat = { url: mediaUrl, media_type: mediaType, title };

      app.innerHTML = `
        <h1>${title}</h1>
        <p class="date">${data.date}${copyright}</p>
        ${buildMedia(flat)}
        <div class="explanation">${explanation}</div>
      `;
    })
    .catch(err => {
      app.innerHTML = `<p class="error">⚠ ${err.message}</p>`;
    });
}

const today = new Date().toISOString().split("T")[0];
picker.max   = today;
picker.min   = "1995-06-16";
picker.value = today;

picker.addEventListener("change", () => {
  if (picker.value) loadApod(picker.value);
});

loadApod(today);
