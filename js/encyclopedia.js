// Encyclopedia data
const encyclopediaPlants = [
  {
    id: 1,
    name: "Costela de Adão",
    scientificName: "Monstera deliciosa",
    category: "folhagem",
    description:
      "Planta tropical conhecida por suas folhas grandes e perfuradas. Ideal para ambientes internos com boa luminosidade.",
    image: "assets/costela-de-adao.webp",
    isFavorite: false,
  },
  {
    id: 2,
    name: "Echeveria",
    scientificName: "Echeveria elegans",
    category: "suculentas",
    description: "Suculenta em formato de roseta com folhas carnudas. Muito resistente e fácil de cuidar.",
    image: "assets/echeveria.jpg",
    isFavorite: true,
  },
  {
    id: 3,
    name: "Samambaia",
    scientificName: "Nephrolepis exaltata",
    category: "samambaias",
    description: "Planta ornamental com folhas delicadas. Perfeita para ambientes úmidos e com sombra parcial.",
    image: "assets/samambaia.jpg",
    isFavorite: false,
  },
  {
    id: 4,
    name: "Cacto Barril",
    scientificName: "Echinocactus grusonii",
    category: "suculentas",
    description: "Cacto esférico com espinhos dourados. Extremamente resistente à seca e de crescimento lento.",
    image: "assets/cacto.jpg",
    isFavorite: false,
  },
]

class EncyclopediaManager {
  constructor() {
    this.plants = this.loadFavorites()
    this.currentFilter = "all"
    this.currentSearch = ""
    this.initializeEventListeners()
    this.renderPlants()
  }

  loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favoritePlants") || "[]")
    return encyclopediaPlants.map((plant) => ({
      ...plant,
      isFavorite: favorites.includes(plant.id),
    }))
  }

  showPlantDetails(plantId) {
    const plant = this.plants.find((p) => p.id === plantId);
    if (!plant) return;

    const modal = document.getElementById('details-modal');
    const modalImage = document.getElementById('details-modal-image');
    const modalName = document.getElementById('details-modal-name');
    const modalScientific = document.getElementById('details-modal-scientific');
    const modalDescription = document.getElementById('details-modal-description');
    const closeModalBtn = document.getElementById('details-modal-close');

    modalImage.style.backgroundImage = `url('${plant.image}')`;
    modalName.textContent = plant.name;
    modalScientific.textContent = plant.scientificName;
    modalDescription.textContent = plant.description;

    modal.classList.remove('hidden');

    const closeModal = () => modal.classList.add('hidden');

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'details-modal') {
        closeModal();
      }
    });

    // Lógica de conquista
    const viewedPlants = JSON.parse(localStorage.getItem("viewedPlants") || "[]");
    if (!viewedPlants.includes(plantId)) {
      viewedPlants.push(plantId);
      localStorage.setItem("viewedPlants", JSON.stringify(viewedPlants));

      if (window.achievementsModal) {
          window.achievementsModal.updateProgress("explorador-verde", viewedPlants.length);
      }
    }
  }

  saveFavorites() {
    const favorites = this.plants.filter((plant) => plant.isFavorite).map((plant) => plant.id)
    localStorage.setItem("favoritePlants", JSON.stringify(favorites))
  }

  initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search-input")
    searchInput.addEventListener("input", (e) => {
      this.currentSearch = e.target.value.toLowerCase()
      this.renderPlants()
    })

    // Filter buttons
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        // Update active state
        filterButtons.forEach((btn) => {
          btn.classList.remove("bg-green-500", "text-white", "active")
          btn.classList.add("bg-gray-100", "text-gray-700")
        })

        e.target.classList.remove("bg-gray-100", "text-gray-700")
        e.target.classList.add("bg-green-500", "text-white", "active")

        this.currentFilter = e.target.dataset.filter
        this.renderPlants()
      })
    })
  }

  toggleFavorite(plantId) {
    const plant = this.plants.find((p) => p.id === plantId)
    if (plant) {
      plant.isFavorite = !plant.isFavorite
      this.saveFavorites()
      this.renderPlants()

      // Check for achievement
      const favoriteCount = this.plants.filter((p) => p.isFavorite).length
      if (favoriteCount >= 3 && window.achievementsModal) {
        window.achievementsModal.unlockAchievement("amante-plantas")
      }
    }
  }

  getFilteredPlants() {
    let filtered = this.plants

    // Apply category filter
    if (this.currentFilter === "favorites") {
      filtered = filtered.filter((plant) => plant.isFavorite)
    } else if (this.currentFilter !== "all") {
      filtered = filtered.filter((plant) => plant.category === this.currentFilter)
    }

    // Apply search filter
    if (this.currentSearch) {
      filtered = filtered.filter(
        (plant) =>
          plant.name.toLowerCase().includes(this.currentSearch) ||
          plant.scientificName.toLowerCase().includes(this.currentSearch),
      )
    }

    return filtered
  }

  createPlantCard(plant) {
    const article = document.createElement("article")
    article.className =
      "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group"

    article.innerHTML = `
            <div class="relative">
                <img 
                    src="${plant.image}" 
                    alt="${plant.name}"
                    class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                >
                <button class="favorite-btn absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors" data-plant-id="${plant.id}">
                    <i class="${plant.isFavorite ? "fas fa-heart text-red-500" : "far fa-heart text-gray-400 group-hover:text-red-500"} transition-colors"></i>
                </button>
            </div>
            <div class="p-5">
                <h3 class="text-lg font-bold text-gray-800 mb-1">${plant.name}</h3>
                <p class="text-sm text-gray-500 italic mb-3">${plant.scientificName}</p>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${plant.description}</p>
                <button class="details-btn w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors" data-plant-id="${plant.id}">
                    Ver detalhes
                </button>
            </div>
        `

    // Add event listeners
    const favoriteBtn = article.querySelector(".favorite-btn")
    const detailsBtn = article.querySelector(".details-btn")

    favoriteBtn.addEventListener("click", () => this.toggleFavorite(plant.id))
    detailsBtn.addEventListener("click", () => this.showPlantDetails(plant.id))

    return article
  }
  
  renderPlants() {
    const grid = document.getElementById("plants-encyclopedia-grid")
    const filteredPlants = this.getFilteredPlants()

    grid.innerHTML = ""

    if (filteredPlants.length === 0) {
      grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Nenhuma planta encontrada</h3>
                    <p class="text-gray-600">Tente ajustar sua busca ou filtros.</p>
                </div>
            `
      return
    }

    filteredPlants.forEach((plant) => {
      const plantCard = this.createPlantCard(plant)
      grid.appendChild(plantCard)
    })
  }
}

// Initialize encyclopedia when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EncyclopediaManager()
})
