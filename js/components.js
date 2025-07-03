// Component loader utility
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath)
    const html = await response.text()
    document.getElementById(elementId).innerHTML = html
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error)
  }
}

// Navbar Component
class Navbar {
  constructor() {
    this.currentPage = this.getCurrentPage()
    this.render()
  }

  getCurrentPage() {
    const path = window.location.pathname
    if (path.includes("encyclopedia.html")) return "encyclopedia"
    return "dashboard"
  }

  render() {
    const navbarHTML = `
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-3">
              <i class="fas fa-seedling text-primary-500 text-xl"></i>
              <span class="hidden md:inline text-xl font-bold text-gray-800">Meu Cantinho Verde</span>
            </div>
            <div class="flex items-center space-x-4">
              <a 
                href="index.html"
                class="nav-link ${this.currentPage === "dashboard" ? "text-primary-500 font-semibold" : "text-gray-600 hover:text-primary-500"} transition-colors font-medium"
              >
                Dashboard
              </a>
              <a 
                href="encyclopedia.html"
                class="nav-link ${this.currentPage === "encyclopedia" ? "text-primary-500 font-semibold" : "text-gray-600 hover:text-primary-500"} transition-colors font-medium"
              >
                Enciclopédia
              </a>
              <button 
                id="achievements-btn"
                class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <i class="fas fa-trophy"></i>
                <span>Conquistas</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    `

    // Insert navbar at the beginning of body
    document.body.insertAdjacentHTML("afterbegin", navbarHTML)

    // Add event listener for achievements button
    document.getElementById("achievements-btn").addEventListener("click", () => {
      if (window.achievementsModal) {
        window.achievementsModal.show()
      }
    })
  }
}

// Achievements Modal Component
class AchievementsModal {
  constructor() {
    this.achievements = this.loadAchievements()
    this.render()
    this.bindEvents()

    // Make globally available
    window.achievementsModal = this
  }

  loadAchievements() {
    const stored = localStorage.getItem("achievements")
    return stored
      ? JSON.parse(stored)
      : {
          unlocked: [
            "primeiro-plantio",
            "regador-dedicado",
            "colecionador-verde",
            "organizador",
            "amante-plantas",
            "pontual",
          ],
          progress: {
            "jardineiro-expert": { current: 5, total: 10 },
            "sequencia-perfeita": { current: 7, total: 30 },
            "explorador-verde": { current: 3, total: 20 },
            veterano: { current: 12, total: 100 },
            "mao-verde": { current: 12, total: 180 },
          },
        }
  }

  saveAchievements() {
    localStorage.setItem("achievements", JSON.stringify(this.achievements))
  }

  unlockAchievement(achievementId) {
    if (!this.achievements.unlocked.includes(achievementId)) {
      this.achievements.unlocked.push(achievementId)
      this.saveAchievements()
      this.showUnlockNotification(achievementId)
      this.updateDisplay()
    }
  }

  updateProgress(achievementId, current) {
    if (this.achievements.progress[achievementId]) {
      this.achievements.progress[achievementId].current = current
      this.saveAchievements()

      // Check if achievement should be unlocked
      if (current >= this.achievements.progress[achievementId].total) {
        this.unlockAchievement(achievementId)
      }
    }
  }

  showUnlockNotification(achievementId) {
    const notification = document.createElement("div")
    notification.className =
      "fixed top-4 right-4 bg-primary-500 text-white p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300"
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="fas fa-trophy text-xl"></i>
        <div>
          <div class="font-bold">Conquista Desbloqueada!</div>
          <div class="text-sm opacity-90">Nova conquista adicionada</div>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.classList.remove("translate-x-full")
    }, 100)

    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.add("translate-x-full")
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }

  updateDisplay() {
    const unlockedCount = this.achievements.unlocked.length
    const totalCount = 12
    const progressPercent = (unlockedCount / totalCount) * 100

    const progressElement = document.getElementById("achievement-progress")
    const progressBar = document.getElementById("progress-bar")

    if (progressElement) {
      progressElement.textContent = `${unlockedCount}/${totalCount} Conquistas`
    }

    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`
    }
  }

  show() {
    document.getElementById("achievements-modal").classList.remove("hidden")
    this.updateDisplay()
  }

  hide() {
    document.getElementById("achievements-modal").classList.add("hidden")
  }

  render() {
    const modalHTML = `
      <div id="achievements-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 relative">
            <button 
              id="close-achievements"
              class="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <i class="fas fa-times text-white"></i>
            </button>
            <div class="flex items-center space-x-3">
              <i class="fas fa-trophy text-2xl"></i>
              <h2 class="text-2xl font-bold">Minhas Conquistas</h2>
            </div>
            <p class="text-primary-100 mt-2">Acompanhe seu progresso como jardineiro</p>
          </div>

          <!-- Modal Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <!-- Progress Summary -->
            <div class="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-primary-800 font-medium">Progresso Geral</span>
                <span class="text-primary-600 font-bold" id="achievement-progress">6/12 Conquistas</span>
              </div>
              <div class="w-full bg-primary-200 rounded-full h-3">
                <div class="bg-primary-500 h-3 rounded-full" id="progress-bar" style="width: 50%"></div>
              </div>
            </div>

            <!-- Achievements Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Unlocked Achievements -->
              <div class="bg-white border-2 border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-seedling text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">Primeiro Plantio</h3>
                    <p class="text-sm text-gray-600 mb-2">Adicione sua primeira planta ao jardim</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">Desbloqueada</span>
                      <span class="text-xs text-gray-500">há 2 dias</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white border-2 border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-tint text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">Regador Dedicado</h3>
                    <p class="text-sm text-gray-600 mb-2">Regue suas plantas por 7 dias consecutivos</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">Desbloqueada</span>
                      <span class="text-xs text-gray-500">há 1 dia</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white border-2 border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-leaf text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">Colecionador Verde</h3>
                    <p class="text-sm text-gray-600 mb-2">Tenha 5 plantas diferentes em seu jardim</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">Desbloqueada</span>
                      <span class="text-xs text-gray-500">há 3 horas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white border-2 border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-calendar-check text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">Organizador</h3>
                    <p class="text-sm text-gray-600 mb-2">Mantenha todas as plantas em dia por uma semana</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">Desbloqueada</span>
                      <span class="text-xs text-gray-500">há 5 horas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white border-2 border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-heart text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">Amante das Plantas</h3>
                    <p class="text-sm text-gray-600 mb-2">Favorite 3 plantas na enciclopédia</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">Desbloqueada</span>
                      <span class="text-xs text-gray-500">há 2 horas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white border-2 border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-clock text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">Pontual</h3>
                    <p class="text-sm text-gray-600 mb-2">Regue uma planta no dia exato recomendado</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">Desbloqueada</span>
                      <span class="text-xs text-gray-500">há 1 hora</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Locked Achievements -->
              <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-star text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-500 mb-1">Jardineiro Expert</h3>
                    <p class="text-sm text-gray-400 mb-2">Mantenha 10 plantas saudáveis simultaneamente</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">Bloqueada</span>
                      <span class="text-xs text-gray-400">5/10 plantas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-fire text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-500 mb-1">Sequência Perfeita</h3>
                    <p class="text-sm text-gray-400 mb-2">Regue suas plantas por 30 dias consecutivos</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">Bloqueada</span>
                      <span class="text-xs text-gray-400">7/30 dias</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-crown text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-500 mb-1">Mestre Jardineiro</h3>
                    <p class="text-sm text-gray-400 mb-2">Desbloqueie todas as outras conquistas</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">Bloqueada</span>
                      <span class="text-xs text-gray-400">6/11 conquistas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-globe text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-500 mb-1">Explorador Verde</h3>
                    <p class="text-sm text-gray-400 mb-2">Visualize detalhes de 20 plantas na enciclopédia</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">Bloqueada</span>
                      <span class="text-xs text-gray-400">3/20 plantas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-calendar-alt text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-500 mb-1">Veterano</h3>
                    <p class="text-sm text-gray-400 mb-2">Use o app por 100 dias consecutivos</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">Bloqueada</span>
                      <span class="text-xs text-gray-400">12/100 dias</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-seedling text-white text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-500 mb-1">Mão Verde</h3>
                    <p class="text-sm text-gray-400 mb-2">Regue suas plantas por 180 dias consecutivos</p>
                    <div class="flex items-center space-x-2">
                      <span class="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">Bloqueada</span>
                      <span class="text-xs text-gray-400">12/180 dias</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHTML)
  }

  bindEvents() {
    // Close modal when clicking close button
    document.getElementById("close-achievements").addEventListener("click", () => {
      this.hide()
    })

    // Close modal when clicking outside
    document.getElementById("achievements-modal").addEventListener("click", (e) => {
      if (e.target.id === "achievements-modal") {
        this.hide()
      }
    })

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !document.getElementById("achievements-modal").classList.contains("hidden")) {
        this.hide()
      }
    })
  }
}

// Initialize components when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Navbar()
  new AchievementsModal()
})
