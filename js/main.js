// Main Dashboard Logic
class PlantManager {
  constructor() {
    this.plants = this.loadPlantsFromStorage()
    this.currentFilter = "all"
    this.initializeEventListeners()
    this.renderPlants()
    this.updateStats()
  }

  loadPlantsFromStorage = () => {
    const storedPlants = localStorage.getItem("myPlants")
    return storedPlants ? JSON.parse(storedPlants) : []
  }

  savePlantsToStorage = () => {
    localStorage.setItem("myPlants", JSON.stringify(this.plants))
  }

  initializeEventListeners() {
    // Form submission
    const plantForm = document.querySelector("#plant-form")
    plantForm.addEventListener("submit", (event) => {
      event.preventDefault()
      this.addNewPlant()
    })

    // Filter buttons
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        this.setActiveFilter(event.target)
        this.currentFilter = event.target.dataset.filter
        this.renderPlants()
      })
    })
  }

  setActiveFilter(activeButton) {
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((button) => {
      button.classList.remove("bg-primary-500", "text-white", "active")
      button.classList.add("bg-gray-100", "text-gray-700")
    })
    activeButton.classList.remove("bg-gray-100", "text-gray-700")
    activeButton.classList.add("bg-primary-500", "text-white", "active")
  }

  addNewPlant() {
    const nameInput = document.querySelector("#plant-name")
    const speciesInput = document.querySelector("#plant-species")
    const frequencyInput = document.querySelector("#watering-frequency")
    const imageInput = document.querySelector("#plant-image")

    const newPlant = {
      id: Date.now().toString(),
      name: nameInput.value.trim(),
      species: speciesInput.value.trim() || "Não especificada",
      wateringFrequency: Number.parseInt(frequencyInput.value),
      imageUrl: imageInput.value.trim(),
      lastWatered: null,
      createdAt: new Date().toISOString(),
      wateringHistory: [],
    }

    this.plants.push(newPlant)
    this.savePlantsToStorage()
    this.renderPlants()
    this.updateStats()
    this.clearForm()

    // Trigger achievement
    if (this.plants.length === 1 && window.achievementsModal) {
      window.achievementsModal.unlockAchievement("primeiro-plantio")
    }
    if (this.plants.length >= 5 && window.achievementsModal) {
      window.achievementsModal.unlockAchievement("colecionador-verde")
    }

    this.showNotification("Planta adicionada com sucesso! 🌱", "success")
  }

  clearForm() {
    const form = document.querySelector("#plant-form")
    form.reset()
    document.querySelector("#watering-frequency").value = 7
  }

  waterPlant = (plantId) => {
    const plant = this.plants.find((p) => p.id === plantId)
    if (plant) {
      const now = new Date().toISOString()
      plant.lastWatered = now
      plant.wateringHistory.push({
        date: now,
        note: "Rega manual",
      })

      this.savePlantsToStorage()
      this.renderPlants()
      this.updateStats()
      this.showNotification(`${plant.name} foi regada! 💧`, "success")

      // Check for achievements
      if (window.achievementsModal) {
        window.achievementsModal.unlockAchievement("regador-dedicado")
        window.achievementsModal.unlockAchievement("pontual")
      }
    }
  }

  deletePlant = (plantId) => {
    const plant = this.plants.find((p) => p.id === plantId)
    if (plant && confirm(`Tem certeza que deseja remover "${plant.name}"?`)) {
      this.plants = this.plants.filter((p) => p.id !== plantId)
      this.savePlantsToStorage()
      this.renderPlants()
      this.updateStats()
      this.showNotification("Planta removida", "info")
    }
  }

  needsWater(plant) {
    if (!plant.lastWatered) return true

    const lastWateredDate = new Date(plant.lastWatered)
    const now = new Date()
    const daysSinceWatered = Math.floor((now - lastWateredDate) / (1000 * 60 * 60 * 24))

    return daysSinceWatered >= plant.wateringFrequency
  }

  getDaysSinceWatered(plant) {
    if (!plant.lastWatered) return null

    const lastWateredDate = new Date(plant.lastWatered)
    const now = new Date()
    return Math.floor((now - lastWateredDate) / (1000 * 60 * 60 * 24))
  }

  getNextWateringDate(plant) {
    if (!plant.lastWatered) return "Hoje"

    const lastWateredDate = new Date(plant.lastWatered)
    const nextWateringDate = new Date(lastWateredDate)
    nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequency)

    const now = new Date()
    const daysUntilWatering = Math.ceil((nextWateringDate - now) / (1000 * 60 * 60 * 24))

    if (daysUntilWatering <= 0) return "Hoje"
    if (daysUntilWatering === 1) return "Amanhã"
    return `Em ${daysUntilWatering} dias`
  }

  getFilteredPlants() {
    switch (this.currentFilter) {
      case "needs-water":
        return this.plants.filter((plant) => this.needsWater(plant))
      case "watered":
        return this.plants.filter((plant) => !this.needsWater(plant))
      default:
        return this.plants
    }
  }

  createPlantCard(plant) {
    const article = document.createElement("article")
    article.className = `bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${this.needsWater(plant) ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}`
    article.setAttribute("data-plant-id", plant.id)

    const daysSinceWatered = this.getDaysSinceWatered(plant)
    const needsWater = this.needsWater(plant)
    const nextWatering = this.getNextWateringDate(plant)

    const imageElement = plant.imageUrl
      ? `<img src="${plant.imageUrl}" alt="${plant.name}" class="w-full h-32 object-cover rounded-lg mb-4" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-4xl" style="display:none;">🌿</div>`
      : `<div class="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-4xl">🌿</div>`

    article.innerHTML = `
            ${imageElement}
            <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-800">${plant.name}</h3>
                <p class="text-sm text-gray-600 italic">${plant.species}</p>
                
                <div class="text-xs text-gray-500 space-y-1">
                    <p>${
                      plant.lastWatered
                        ? `Última rega: ${daysSinceWatered === 0 ? "Hoje" : daysSinceWatered === 1 ? "Ontem" : `${daysSinceWatered} dias atrás`}`
                        : "Nunca foi regada"
                    }</p>
                    <p>Próxima rega: ${nextWatering}</p>
                </div>
                
                <div class="text-xs font-medium px-2 py-1 rounded-full text-center ${needsWater ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}">
                    ${needsWater ? "Precisa de água" : "Bem hidratada"}
                </div>
                
                <div class="flex gap-2 pt-2">
                    <button class="flex-1 bg-primary-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors water-btn" data-plant-id="${plant.id}">
                        Regar
                    </button>
                    <button class="bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors delete-btn" data-plant-id="${plant.id}">
                        Deletar
                    </button>
                </div>
            </div>
        `

    // Add event listeners to buttons
    const waterBtn = article.querySelector(".water-btn")
    const deleteBtn = article.querySelector(".delete-btn")

    waterBtn.addEventListener("click", () => this.waterPlant(plant.id))
    deleteBtn.addEventListener("click", () => this.deletePlant(plant.id))

    return article
  }

  renderPlants() {
    const plantsGrid = document.querySelector("#plants-grid")
    const emptyState = document.querySelector("#empty-state")
    const filteredPlants = this.getFilteredPlants()

    plantsGrid.innerHTML = ""

    if (filteredPlants.length === 0) {
      emptyState.classList.remove("hidden")
    } else {
      emptyState.classList.add("hidden")

      filteredPlants.forEach((plant) => {
        const plantCard = this.createPlantCard(plant)
        plantsGrid.appendChild(plantCard)
      })
    }
  }

  updateStats() {
    const totalPlants = this.plants.length
    const plantsNeedWater = this.plants.filter((plant) => this.needsWater(plant)).length
    const plantsWateredToday = this.plants.filter((plant) => {
      if (!plant.lastWatered) return false
      const lastWateredDate = new Date(plant.lastWatered)
      const today = new Date()
      return lastWateredDate.toDateString() === today.toDateString()
    }).length

    document.querySelector("#total-plants").textContent = totalPlants
    document.querySelector("#plants-need-water").textContent = plantsNeedWater
    document.querySelector("#plants-watered-today").textContent = plantsWateredToday

    // Update achievements progress
    if (window.achievementsModal) {
      window.achievementsModal.updateProgress("jardineiro-expert", totalPlants)
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-40 transform translate-x-full transition-transform duration-300`

    const colors = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      info: "bg-blue-500 text-white",
    }

    notification.className += ` ${colors[type] || colors.info}`
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.remove("translate-x-full")
    }, 10)

    setTimeout(() => {
      notification.classList.add("translate-x-full")
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PlantManager()
})
