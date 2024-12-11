const api = 'https://api.themoviedb.org/3';
const apiKey = '06ac932ac0d2f566714e74f87bd668ff';
const state = {
    movieList: [],
    likedMovies: [],
    currentPage: 1,
    totalPages: 1,
    selectedCategory: 'popular',
};

// Fetch movie data 
const fetchData = async (category = state.selectedCategory, page = state.currentPage) => {
    try {
        const response = await fetch(`${api}/movie/${category}?api_key=${apiKey}&page=${page}`);
        const data = await response.json();
        state.movieList = data.results;
        state.totalPages = data.total_pages;
        renderMovies();
        updatePagination();
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
};

// Fetch movie details
const fetchSingleMovie = async (id) => {
    try {
        const response = await fetch(`${api}/movie/${id}?api_key=${apiKey}`);
        const data = await response.json();
        renderMovieDetail(data);
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
};

// Create movie card
const createMovieCard = (title, img, rating, id) => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${img}" alt="${title}">
        <h3 class="movie-title">${title}</h3>
        <p>Rating: <span class="rating">${rating}</span> <i class="ion-ios-star"></i></p>
        <button class="like-btn" data-id="${id}"><i class="ion-ios-heart"></i></button>
    `;

    const likeBtn = movieCard.querySelector('.like-btn');
    if (state.likedMovies.includes(id)) {
        likeBtn.classList.add('liked');
    }

    movieCard.querySelector('.movie-title').addEventListener('click', () => fetchSingleMovie(id));
    likeBtn.addEventListener('click', () => toggleLike(id));

    return movieCard;
};

// Render movies
const renderMovies = () => {
    const movieListContainer = document.getElementById('movieList');
    movieListContainer.innerHTML = '';
    state.movieList.forEach((movie) => {
        const movieCard = createMovieCard(movie.title, movie.poster_path, movie.vote_average, movie.id);
        movieListContainer.appendChild(movieCard);
    });
};

// Toggle liked button
const toggleLike = (id) => {
    const likeBtn = document.querySelector(`.like-btn[data-id="${id}"]`);
    if (state.likedMovies.includes(id)) {
        state.likedMovies = state.likedMovies.filter((movieId) => movieId !== id);
        likeBtn.classList.remove('liked');
    } else {
        state.likedMovies.push(id);
        likeBtn.classList.add('liked');
    }
    renderLikedMovies(); 
};

// Render liked movies
const renderLikedMovies = () => {
    const likedMoviesContainer = document.getElementById('likedMoviesList');
    likedMoviesContainer.innerHTML = ''; 

    if (state.likedMovies.length === 0) {
        likedMoviesContainer.innerHTML = '<p>No liked movies.</p>';
    } else {
        state.likedMovies.forEach((movieId) => {
            const movie = state.movieList.find((m) => m.id === movieId);
            if (movie) {
                const movieCard = createMovieCard(movie.title, movie.poster_path, movie.vote_average, movie.id);
                likedMoviesContainer.appendChild(movieCard);
            }
        });
    }
};

// Render Movie Details
const renderMovieDetail = (movie) => {
    const modal = document.getElementById('modal');
    const movieDetailPoster = document.getElementById('movieDetailPoster');
    const movieDetailTitle = document.getElementById('movieDetailTitle');
    const movieDetailOverview = document.getElementById('movieDetailOverview');
    const movieDetailGenres = document.getElementById('movieDetailGenres');
    const movieDetailRating = document.getElementById('movieDetailRating');
    const movieDetailCompanies = document.getElementById('movieDetailCompanies');
  
    // Set movie details
    movieDetailPoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    movieDetailTitle.textContent = movie.title;
    movieDetailOverview.textContent = movie.overview;
    movieDetailRating.textContent = movie.vote_average;
  
    // Render genres
    movieDetailGenres.innerHTML = `
        <div class="genre-container">
            ${movie.genres.map((genre) => {
            return `<div class="genre-item">${genre.name}</div>`;
            }).join('')} <!-- Join the array to render it properly -->
        </div>
    `;
  
    // Render production companies
    movieDetailCompanies.innerHTML = `
        <div class="production-container">
            ${movie.production_companies.map((company) => {
            return company.logo_path ? `
                <div class="production-item">
                <img src="https://image.tmdb.org/t/p/w500${company.logo_path}" alt="${company.name}" />
                </div>` : ''; // Check if logo exists before rendering
            }).join('')} <!-- Join the array to render it properly -->
        </div>
    `;
  
    modal.style.display = 'flex';
  };
  
const closeModal = () => {
  document.getElementById('modal').style.display = 'none';
};

// Update Pagination
const updatePagination = () => {
    const currentPageElement = document.getElementById('currentPage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    currentPageElement.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === state.totalPages;
};

document.getElementById('categorySelect').addEventListener('change', (e) => {
    state.selectedCategory = e.target.value;
    state.currentPage = 1;
    fetchData();
});

document.getElementById('prevButton').addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        fetchData();
    }
});

document.getElementById('nextButton').addEventListener('click', () => {
    if (state.currentPage < state.totalPages) {
        state.currentPage++;
        fetchData();
    }
});

document.getElementById('homeTab').addEventListener('click', () => {
    document.getElementById('likedMoviesSection').style.display = 'none';
    document.getElementById('movieSection').style.display = 'block';
    document.getElementById('homeTab').classList.add('active');
    document.getElementById('likedTab').classList.remove('active');
    fetchData();
});

document.getElementById('likedTab').addEventListener('click', () => {
    document.getElementById('movieSection').style.display = 'none';
    document.getElementById('likedMoviesSection').style.display = 'block';
    document.getElementById('likedTab').classList.add('active');
    document.getElementById('homeTab').classList.remove('active');
    renderLikedMovies();
});

document.getElementById('closeModal').addEventListener('click', closeModal);

fetchData();
