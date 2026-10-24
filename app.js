document.addEventListener("DOMContentLoaded", () => {
  fetchSongs();
  setupModalEvents();
});

async function fetchSongs() {
  try {
    const response = await fetch("songs.json");
    const songs = await response.json();
    renderSongs(songs);
  } catch (error) {
    console.error("Error loading song catalog:", error);
  }
}

function renderSongs(songs) {
  const container = document.getElementById("songs-grid");
  container.innerHTML = "";

  songs.forEach((song) => {
    const card = document.createElement("div");
    card.className = "song-card";

    // Build store availability buttons
    const storeButtonsHtml = Object.entries(song.links)
      .map(([store, url]) => {
        const capitalizedStore = store.charAt(0).toUpperCase() + store.slice(1);
        return `<button class="store-btn" onclick="handleStoreClick(event, '${store}', '${song.id}')">${capitalizedStore}</button>`;
      })
      .join("");

    card.innerHTML = `
      <div class="cover-container">
        <img src="${song.coverImage}" alt="${song.title} Cover Art" class="song-cover" loading="lazy">
        <div class="song-info">
            <h3 class="song-title">${song.title}</h3>
            <div class="store-links">${storeButtonsHtml}</div>
            
        </div>
      </div>
       
      <button class="lyrics-btn" onclick="openLyrics('${song.id}')">View Lyrics</button>
    `;

    // Attach full song object to DOM node for easy retrieval
    card.dataset.songData = JSON.stringify(song);
    container.appendChild(card);
  });
}

// Handle store click logic (Alert if unavailable, open link if available)
function handleStoreClick(event, storeName, songId) {
  const card = event.target.closest(".song-card");
  const song = JSON.parse(card.dataset.songData);
  const link = song.links[storeName];

  if (link) {
    window.open(link, "_blank", "noopener,noreferrer");
  } else {
    // Find active/available stores for this track
    const availableStores = Object.entries(song.links)
      .filter(([_, url]) => url !== null && url !== "")
      .map(([store]) => store.charAt(0).toUpperCase() + store.slice(1));

    if (availableStores.length > 0) {
      alert(`"${song.title}" is not available on ${storeName.toUpperCase()}.\n\nYou can listen to it on: ${availableStores.join(", ")}`);
    } else {
      alert(`"${song.title}" is currently unavailable on streaming platforms.`);
    }
  }
}

// Lyrics Modal Controls
function openLyrics(songId) {
  const cards = document.querySelectorAll(".song-card");
  let selectedSong = null;

  cards.forEach((card) => {
    const song = JSON.parse(card.dataset.songData);
    if (song.id === songId) selectedSong = song;
  });

  if (selectedSong) {
    document.getElementById("modal-song-title").innerText = `${selectedSong.title} - Lyrics`;
    document.getElementById("modal-lyrics-text").innerText = selectedSong.lyrics || "Lyrics coming soon.";
    const modal = document.getElementById("lyrics-modal");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
}

function setupModalEvents() {
  const modal = document.getElementById("lyrics-modal");
  const closeBtn = document.getElementById("close-modal");

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  });

  // Close when clicking outside modal box
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  });
}