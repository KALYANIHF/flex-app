const global = {
  routerPath: window.location.pathname,
  params: new URLSearchParams(window.location.search).get("id"),
  search: {
    type: new URLSearchParams(window.location.search).get("type"),
    searchTerm: new URLSearchParams(window.location.search).get("search-term"),
    page: 1,
    total_pages: "",
    total_results: "",
  },
  api: {
    apiKey: "38788e7c76a97d879d704e7b875585d3",
    baseUrl: "https://api.themoviedb.org/3",
  },
};

function init() {
  switch (global.routerPath.split(".")[0]) {
    case "/":
    case "/index":
      displaySlider();
      showSpinner();
      movies();
      removeSpinner();
      break;
    case "/shows":
      showSpinner();
      shows();
      removeSpinner();
      break;
    case "/tv-details":
      showSpinner();
      tvDetails(global.params);
      removeSpinner();
      break;
    case "/movie-details":
      showSpinner();
      movieDetails(global.params);
      removeSpinner();
      break;
    case "/search":
      showSpinner();
      search();
      removeSpinner();
      break;
    case "default":
      // implementation here
      console.log("your path is not valid");
      break;
  }
  highLightActiveLink(global.routerPath.split(".")[0]);
  // console.log(global.search.type);
  // console.log(global.search.searchTerm);
}

document.addEventListener("DOMContentLoaded", init);

// to fetch the data form api endpoint
async function fetchData(endpoint) {
  const API_KEY = global.api.apiKey;
  const BASE_URL = global.api.baseUrl;
  const res_promise = await fetch(
    `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
  );
  const data = await res_promise.json(); // convert the response to json
  return data; // return the data
}

// fetch search resut according to the search inbox value
async function fetchSearchData(type, searchTerms) {
  const API_KEY = global.api.apiKey;
  const BASE_URL = global.api.baseUrl;
  const res_promise = await fetch(
    `${BASE_URL}/search/${type}?api_key=${API_KEY}&language=en-US&query=${searchTerms}&page=${global.search.page}&include_adult=true`
  );
  const data = await res_promise.json();
  return data;
}
// defination of movies() function
async function movies() {
  const movies = await fetchData("/movie/popular");
  displayMovies(movies.results);
}

// defination of shows() function
async function shows() {
  const shows = await fetchData("/tv/popular");
  displayTvShows(shows.results);
}

// defination of tvDetails() function
async function tvDetails(id) {
  const tvDetails = await fetchData(`/tv/${id}`);
  // console.log(tvDetails);
  displayTvDetails(tvDetails);
}

// defination of movieDetails() function
async function movieDetails(id) {
  const movieDetails = await fetchData(`/movie/${id}`);
  displaymovieDeatils(movieDetails);
}

// search feature
async function search() {
  const searchBox = document.querySelector("#search-term");
  if (global.search.searchTerm !== "" && global.search.searchTerm !== null) {
    const { page, results, total_pages, total_results } = await fetchSearchData(
      global.search.type,
      global.search.searchTerm
    );
    // console.log(results);
    global.search.page = page;
    global.search.total_pages = total_pages;
    global.search.total_results = total_results;
    showSearchResult(results, page, total_pages, total_results);
  } else {
    // alert("Please enter search term");
    showAlert("Please enter a search term", "danger");
    showSearchResult([], 0, 0, 0);
  }
}

// alert function
function showAlert(message, className) {
  const alert = document.getElementById("alert");
  const div = document.createElement("div");
  div.classList.add(`alert`, `alert-${className}`);
  div.appendChild(document.createTextNode(message));
  alert.appendChild(div);
  alert.style.display = "block";
  setTimeout(() => {
    alert.style.display = "none";
  }, 5000);
}
// handle the current and previous button in the pagination

// define the showSearchResult
function showSearchResult(results, page, total_pages, total_results) {
  const searchContainer = document.querySelector("#search-results");
  const searchResutHeading = document.querySelector("#search-results-heading");
  const searchContainerRapper = document.querySelector(
    "#search-results-wrapper"
  );
  searchContainer.innerHTML = "";
  results.forEach((result) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `<a href="${
      global.search.type === "movie" ? "movie" : "tv"
    }-details.html?id=${result.id}">
            <img src="${
              result.poster_path !== null
                ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
                : "../images/no-image.jpg"
            }" class="card-img-top" alt="Deadpool &amp; Wolverine">
          </a>
          <div class="card-body">
            <h5 class="card-title">${
              global.search.type === "movie" ? result.title : result.name
            }</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${
                global.search.type === "movie"
                  ? result.release_date
                  : result.first_air_date
              }</small>
            </p>
          </div>`;

    searchContainer.appendChild(card);
  });
  const heading = document.createElement("h2");
  // console.log(results.length);
  if (results.length === 0) {
    heading.innerHTML = `No results found`;
  } else {
    heading.innerHTML = `Displaying page-${page} of ${results.length} results out Of ${total_results} results`;
  }

  searchResutHeading.innerHTML = "";
  searchResutHeading.appendChild(heading);
  displayPagination(page, total_pages);
}

// define pagination for the search result
function displayPagination(page, total_pages) {
  // implementation here
  document.querySelector("#pagination").innerHTML = "";
  const pageDiv = document.createElement("div");
  pagination.classList.add(".pagination");
  pageDiv.innerHTML = `<button class="btn btn-primary" id="prev">Prev</button>
          <button class="btn btn-primary" id="next">Next</button>
          <div class="page-counter">Page ${page} of ${total_pages}</div>`;
  document.querySelector("#pagination").appendChild(pageDiv);
  if (global.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }
  if (global.search.page === global.search.total_pages) {
    document.querySelector("#next").disabled = true;
  }
  document.querySelector("#next").addEventListener("click", () => {
    // implementation here
    global.search.page++;
    search();
  });
  document.querySelector("#prev").addEventListener("click", () => {
    global.search.page--;
    search();
  });
}

async function displaySlider() {
  const { results: movies } = await fetchData("/movie/now_playing");
  // console.log(movies);
  movies.forEach((movie) => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    slide.innerHTML = `<a href="movie-details.html?id=${movie.id}">
              <img src="https://image.tmdb.org/t/p/w500${
                movie.poster_path
              }" alt="${movie.title}" />
            </a>
            <h4 class="swiper-rating">
              <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toPrecision(
                2
              )} / 10
            </h4>`;
    document.querySelector(".swiper-wrapper").appendChild(slide);
    initSwiper();
  });
}
// defination of initSwiper() function
function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    freeMode: true,
    // to make the slider infinite
    autoplay: {
      // implementation here
      delay: 3000,
      disableOnInteraction: true, // to disable the autoplay when the user interacts with the slider
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 10, // to reduce the space between the slides
      },
      768: {
        // implementation here
        slidesPerView: 2,
        spaceBetween: 10,
      },
      1024: {
        // implementation here
        slidesPerView: 3,
        spaceBetween: 10,
      },
    },
  });
}
// function to hightlight the active link
function highLightActiveLink(path) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    // link.classList.remove("active");
    if (link.pathname.split(".")[0] === path) {
      link.classList.add("active");
    }
  });
}

function displayMovies(movies) {
  const popular_movies = document.getElementById("popular-movies");
  movies.forEach((movie) => {
    // implementation here
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
          <a href="movie-details.html?id=${movie.id}">
            <img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title}"
            />
          </a>
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
          </div>
    `;
    popular_movies.appendChild(card); // append the card to the popular movies
  });
}

function displayTvShows(shows) {
  const popular_tv_shows = document.getElementById("popular-shows");
  shows.forEach((show) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `<a href="tv-details.html?id=${show.id}">
            <img
              src="https://image.tmdb.org/t/p/w500${show.poster_path}"
              class="card-img-top"
              alt="${show.name}"
            />
          </a>
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <small class="text-muted">Aired: ${show.first_air_date}</small>
            </p>
          </div>`;
    popular_tv_shows.appendChild(card);
  });
}

function displaymovieDeatils(movie) {
  const movieDetails = document.querySelector("#movie-details");
  const detailsTop = document.createElement("div");
  const detailsButtom = document.createElement("div");
  detailsTop.classList.add("details-top");
  detailsButtom.classList.add("details-bottom");
  detailsTop.innerHTML = `<div>
            <img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title}"
            />
          </div>
          <div>
            <h2>${movie.title}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${movie.vote_average.toPrecision(2)} / 10
            </p>
            <p class="text-muted">Release Date: ${movie.release_date}</p>
            <p>
              ${movie.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${movie.genres.map((genre) => `<li>${genre.name}</li>`).join(" ")}
            </ul>
          </div>`;
  detailsButtom.innerHTML = `<h2>Movie Info</h2>
          <ul>
            <li><span class="text-secondary">Budget:</span> $${
              movie.budget
            }</li>
            <li><span class="text-secondary">Revenue:</span> $${
              movie.revenue
            }</li>
            <li><span class="text-secondary">Runtime:</span> ${
              movie.runtime
            } minutes</li>
            <li><span class="text-secondary">Status:</span> ${movie.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${movie.production_companies
            .map((company) => `${company.name}`)
            .join(",")}</div>`;
  displayOverlay("movie", `${movie.backdrop_path}`);
  movieDetails.appendChild(detailsTop);
  movieDetails.appendChild(detailsButtom);
}

function displayTvDetails(show) {
  const showDetails = document.getElementById("show-details");
  const detailsTop = document.createElement("div");
  const detailsButtom = document.createElement("div");
  detailsTop.classList.add("details-top");
  detailsButtom.classList.add("details-bottom");
  detailsTop.innerHTML = `
        <div>
            <img
              src="https://image.tmdb.org/t/p/w500${show.poster_path}"
              class="card-img-top"
              alt="${show.original_name}"
            />
          </div>
          <div>
            <h2>${show.original_name}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${show.vote_average.toPrecision(2)} / 10
            </p>
            <p class="text-muted">Release Date: ${show.last_air_date}</p>
            <p>
             ${show.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${show.genres.map((genre) => `<li>${genre.name}</li>`).join(" ")}
            </ul>
          </div>
  `;

  detailsButtom.innerHTML = `
  <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number Of Episodes:</span> ${
              show.number_of_episodes
            }</li>
            <li>
              <span class="text-secondary">Last Episode To Air:</span> ${
                show.last_episode_to_air.name
              }
            </li>
            <li><span class="text-secondary">Status:</span> ${show.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${show.production_companies
            .map((company) => `${company.name}`)
            .join(",")}</div>
  `;

  displayOverlay("tv", `${show.backdrop_path}`);
  showDetails.appendChild(detailsTop);
  showDetails.appendChild(detailsButtom);
}

function displayOverlay(type, imagePath) {
  const overlay = document.createElement("div");
  overlay.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${imagePath})`;
  overlay.style.backgroundSize = "cover";
  overlay.style.backgroundRepeat = "no-repeat";
  overlay.style.backgroundPosition = "center";
  overlay.style.backgroundAttachment = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.height = "100vh";
  overlay.style.width = "100vw";
  overlay.style.position = "absolute";
  overlay.style.zIndex = "-1";
  overlay.style.opacity = "0.1";
  if (type === "tv") {
    document.getElementById("show-details").appendChild(overlay);
  } else {
    document.getElementById("movie-details").appendChild(overlay);
  }
}

function showSpinner() {
  document.querySelector(".spinner").style.display = "block";
}

function removeSpinner() {
  setTimeout(() => {
    document.querySelector(".spinner").style.display = "none";
  }, 1000);
}
