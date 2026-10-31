import "./style.css";

const API_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY"; // DEMO_KEY = rate-limited fallback
const app = document.querySelector("#app");
const picker = document.querySelector("#datepicker");

// APOD only has images up to today, and starts on 1995-06-16
const today = new Date().toISOString().split("T")[0];
picker.max = today;
picker.min = "1995-06-16";
picker.value = today;

function buildMedia(data) {
  if (data.media_type === "image") {
    return `<img src="${data.url}" alt="${data.title}" />`;
  } else if (data.url.includes("youtube")) {
    return `<iframe src="${data.url}" allowfullscreen></iframe>`;
  } else if (data.media_type === "video") {
    return `<video src="${data.url}" controls></video>`;
  }
  return `<p><a href="${data.url}" target="_blank">open media</a></p>`;
}

function loadApod(date) {
  app.innerHTML = "<p>loading...</p>";

  // 1. request  2. response  3. convert to data  4. display
  fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`)
    .then(response => {
      if (!response.ok) throw new Error(`NASA API returned ${response.status}`);
      return response.json();
    })
    .then(data => {
      app.innerHTML = `
        <h1>${data.title}</h1>
        <p class="date">${data.date}${data.copyright ? " · © " + data.copyright.trim() : ""}</p>
        ${buildMedia(data)}
        <p>${data.explanation}</p>
      `;
    })
    .catch(err => {
      app.innerHTML = `<p>Error: ${err.message}</p>`;
    });
}

picker.addEventListener("change", () => {
  if (picker.value) loadApod(picker.value);
});

loadApod(today);