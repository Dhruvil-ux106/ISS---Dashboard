console.log("JS CONNECTED");

// =====================================
// API KEYS
// =====================================
const HF_TOKEN =
  CONFIG.HF_TOKEN;

const NEWS_API_KEY =
  CONFIG.NEWS_API_KEY;

// =====================================
// DOM ELEMENTS
// =====================================

const latitude =
  document.getElementById("lat");

const longitude =
  document.getElementById("lon");

const speedText =
  document.getElementById("speed");

const placeText =
  document.getElementById("place");

const astronautCount =
  document.getElementById(
    "astronautCount"
  );

const astronautList =
  document.getElementById(
    "astronautList"
  );

const newsContainer =
  document.getElementById(
    "newsContainer"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );

const sortSelect =
  document.getElementById(
    "sortSelect"
  );

const themeToggle =
  document.getElementById(
    "themeToggle"
  );

const chatToggle =
  document.getElementById(
    "chatToggle"
  );

const chatWindow =
  document.getElementById(
    "chatWindow"
  );

const messages =
  document.getElementById(
    "messages"
  );

const userInput =
  document.getElementById(
    "userInput"
  );

const sendBtn =
  document.getElementById(
    "sendBtn"
  );

// =====================================
// THEME
// =====================================

themeToggle.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "dark"
    );
  }
);

// =====================================
// CHAT TOGGLE
// =====================================

chatToggle.addEventListener(
  "click",
  () => {

    if(
      chatWindow.style.display
      === "flex"
    ){

      chatWindow.style.display =
        "none";

    } else {

      chatWindow.style.display =
        "flex";
    }
  }
);

// =====================================
// MAP
// =====================================

const map =
  L.map("map").setView(
    [20,0],
    2
  );

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      "© OpenStreetMap"
  }
).addTo(map);

const marker =
  L.marker([20,0])
  .addTo(map);

const positions = [];

const polyline =
  L.polyline(
    positions,
    {
      color:"red"
    }
  ).addTo(map);

// =====================================
// CHART
// =====================================

const speedData = [];
const timeData = [];

const speedChart =
  new Chart(
    document.getElementById(
      "speedChart"
    ),
    {
      type:"line",

      data:{
        labels:timeData,

        datasets:[
          {
            label:"ISS Speed",

            data:speedData,

            borderColor:"cyan",

            backgroundColor:
              "rgba(0,255,255,0.2)",

            tension:0.4,

            fill:true
          }
        ]
      },

      options:{
        responsive:true
      }
    }
  );

function updateChart(speed){

  const time =
    new Date()
    .toLocaleTimeString();

  if(speedData.length > 20){

    speedData.shift();
    timeData.shift();
  }

  speedData.push(speed);

  timeData.push(time);

  speedChart.update();
}

// =====================================
// ISS LOCATION
// =====================================

async function getISSLocation(){

  try{

    // CACHE VALUES

    const cachedLat =
      localStorage.getItem(
        "iss-lat"
      );

    const cachedLon =
      localStorage.getItem(
        "iss-lon"
      );

    const cachedSpeed =
      localStorage.getItem(
        "iss-speed"
      );

    const response =
      await fetch(
        "https://api.wheretheiss.at/v1/satellites/25544"
      );

    // RATE LIMITED

    if(response.status === 429){

      console.log(
        "ISS API Rate Limited"
      );

      latitude.innerText =
        cachedLat ||
        "Unavailable";

      longitude.innerText =
        cachedLon ||
        "Unavailable";

      speedText.innerText =
        cachedSpeed ||
        "Unavailable";

      placeText.innerText =
        "Using Cached Data";

      return;
    }

    const data =
      await response.json();

    console.log(data);

    const lat =
      Number(data.latitude);

    const lon =
      Number(data.longitude);

    const speed =
      Number(data.velocity);

    if(
      isNaN(lat) ||
      isNaN(lon)
    ){
      return;
    }

    // SAVE CACHE

    localStorage.setItem(
      "iss-lat",
      lat.toFixed(4)
    );

    localStorage.setItem(
      "iss-lon",
      lon.toFixed(4)
    );

    localStorage.setItem(
      "iss-speed",
      speed.toFixed(2)
    );

    latitude.innerText =
      lat.toFixed(4);

    longitude.innerText =
      lon.toFixed(4);

    speedText.innerText =
      speed.toFixed(2)
      + " km/h";

    placeText.innerText =
      data.visibility ||
      "Orbit";

    marker.setLatLng([
      lat,
      lon
    ]);

    map.setView(
      [lat,lon],
      3
    );

    positions.push([
      lat,
      lon
    ]);

    if(
      positions.length > 15
    ){
      positions.shift();
    }

    polyline.setLatLngs(
      positions
    );

    updateChart(speed);

  } catch(error){

    console.log(error);

    latitude.innerText =
      "API Error";

    longitude.innerText =
      "API Error";
  }
}

// =====================================
// ASTRONAUTS
// =====================================

function getAstronauts(){

  astronautCount.innerText =
    "5";

  astronautList.innerHTML =
    `
    <li>Sunita Williams</li>
    <li>Butch Wilmore</li>
    <li>Nick Hague</li>
    <li>Tracy Dyson</li>
    <li>Oleg Kononenko</li>
    `;
}

// =====================================
// NEWS
// =====================================

let allNews = [];

async function getNews(){

  try{

    newsContainer.innerHTML =
      "<h3>Loading...</h3>";

    const response =
      await fetch(
        `https://gnews.io/api/v4/search?q=space&lang=en&max=10&apikey=${NEWS_API_KEY}`
      );

    const data =
      await response.json();

    console.log(data);

    allNews =
      data.articles || [];

    displayNews(allNews);

  } catch(error){

    console.log(error);

    newsContainer.innerHTML =
      "Failed to load news";
  }
}

function displayNews(news){

  newsContainer.innerHTML =
    "";

  news.forEach(article=>{

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "news-card";

    card.innerHTML =
      `
      <img
        src="${article.image}"
        class="news-img"
      >

      <h3>
        ${article.title}
      </h3>

      <br>

      <p>
        ${article.description || ""}
      </p>

      <br>

      <a
        href="${article.url}"
        target="_blank"
      >
        Read More
      </a>
      `;

    newsContainer.appendChild(
      card
    );
  });
}

// =====================================
// SEARCH NEWS
// =====================================

searchInput.addEventListener(
  "input",
  ()=>{

    const value =
      searchInput.value
      .toLowerCase();

    const filtered =
      allNews.filter(article=>

        article.title
        .toLowerCase()
        .includes(value)
      );

    displayNews(filtered);
  }
);

// =====================================
// SORT NEWS
// =====================================

sortSelect.addEventListener(
  "change",
  ()=>{

    allNews.sort(
      (a,b)=>

      new Date(
        b.publishedAt
      )

      -

      new Date(
        a.publishedAt
      )
    );

    displayNews(allNews);
  }
);

// =====================================
// CHATBOT
// =====================================

sendBtn.addEventListener(
  "click",
  sendMessage
);

userInput.addEventListener(
  "keypress",
  (e)=>{

    if(e.key === "Enter"){
      sendMessage();
    }
  }
);

async function sendMessage(){

  const text =
    userInput.value.trim();

  if(!text) return;

  addMessage(
    "You",
    text
  );

  userInput.value = "";

  addMessage(
    "Bot",
    "Typing..."
  );

  const response =
    await generateAIResponse(
      text
    );

  messages.lastChild.remove();

  addMessage(
    "Bot",
    response
  );
}

// =====================================
// HUGGING FACE AI
// =====================================

async function generateAIResponse(
  prompt
){

  try{

    const response =
      await fetch(
        "https://api-inference.huggingface.co/models/google/flan-t5-large",
        {
          method:"POST",

          headers:{
            Authorization:
              `Bearer ${HF_TOKEN}`,

            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            inputs:prompt
          })
        }
      );

    const data =
      await response.json();

    console.log(data);

    if(
      Array.isArray(data) &&
      data[0]?.generated_text
    ){

      return data[0]
      .generated_text;
    }

    if(data.generated_text){

      return data.generated_text;
    }

    if(data.error){

      return `
Model loading...
Please wait.
`;
    }

    return `
No AI response
`;

  } catch(error){

    console.log(error);

    return `
AI Error
`;
  }
}

// =====================================
// ADD MESSAGE
// =====================================

function addMessage(
  sender,
  text
){

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "message";

  div.innerHTML =
    `
    <strong>
      ${sender}:
    </strong>

    ${text}
    `;

  messages.appendChild(div);

  messages.scrollTop =
    messages.scrollHeight;
}

// =====================================
// INITIAL LOAD
// =====================================

getISSLocation();

getAstronauts();

getNews();

// =====================================
// AUTO REFRESH
// =====================================

setInterval(()=>{

  getISSLocation();

},300000);