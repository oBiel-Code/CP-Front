// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
  ANIMATION_DURATION: 300,
  NOTIFICATION_DURATION: 3000,
  PARTICLES_COUNT: 25,
  LOADING_DELAY: 1000,
}

// ===== ESTADO DA APLICAÇÃO =====
let cart = []
let cartCount = 0
let isLoading = false
let bootstrap // Declared variable for bootstrap

// ===== DADOS DOS PRODUTOS =====
const products = {
  1: {
    name: "Smartphone Premium",
    price: 1299,
    description:
      "Smartphone de última geração com câmera de 108MP, processador octa-core, 256GB de armazenamento e tela AMOLED de 6.7 polegadas.",
    features: [
      "Câmera Tripla 108MP + 12MP + 5MP",
      "Processador Snapdragon 8 Gen 2",
      "256GB de Armazenamento",
      'Tela AMOLED 6.7" 120Hz',
      "Bateria 5000mAh com Carregamento Rápido",
      "5G Ready",
      "Resistente à Água IP68",
    ],
    category: "eletronicos",
    image: "/modern-smartphone-premium-design.jpg",
  },
  2: {
    name: "Notebook Gamer",
    price: 3499,
    description:
      "Notebook para jogos com RTX 4060, Intel i7, 16GB RAM DDR5, SSD 1TB NVMe e tela 144Hz para a melhor experiência gaming.",
    features: [
      "NVIDIA RTX 4060 8GB GDDR6",
      "Intel Core i7 13ª Geração",
      "16GB RAM DDR5 4800MHz",
      "SSD 1TB NVMe PCIe 4.0",
      'Tela 15.6" Full HD 144Hz',
      "Teclado RGB Mecânico",
      "Sistema de Refrigeração Avançado",
    ],
    category: "eletronicos",
    image: "/gaming-laptop-rgb-keyboard.jpg",
  },
  3: {
    name: "Fones Wireless Premium",
    price: 299,
    description:
      "Fones de ouvido premium com cancelamento ativo de ruído, 30h de bateria, qualidade Hi-Fi e design ergonômico.",
    features: [
      "Cancelamento Ativo de Ruído (ANC)",
      "30h de Bateria Total",
      "Qualidade de Áudio Hi-Fi",
      "Bluetooth 5.3 com Codec LDAC",
      "Resistente à Água IPX4",
      "Carregamento Rápido USB-C",
      "Controles Touch Inteligentes",
    ],
    category: "acessorios",
    image: "/wireless-headphones-premium-design.jpg",
  },
}

// ===== UTILITÁRIOS =====
const Utils = {
  formatPrice: (price) => {
    return `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
  },

  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  animateElement: (element, animationClass) => {
    element.classList.add(animationClass)
    setTimeout(() => {
      element.classList.remove(animationClass)
    }, CONFIG.ANIMATION_DURATION)
  },
}

// ===== SISTEMA DE PARTÍCULAS =====
const ParticleSystem = {
  init() {
    this.createParticles()
  },

  createParticles() {
    const particlesContainer = document.getElementById("particles")
    if (!particlesContainer) return

    for (let i = 0; i < CONFIG.PARTICLES_COUNT; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"

      // Propriedades aleatórias
      const size = Math.random() * 15 + 5
      particle.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${size}px;
                height: ${size}px;
                animation-delay: ${Math.random() * 6}s;
                animation-duration: ${Math.random() * 4 + 4}s;
            `

      particlesContainer.appendChild(particle)
    }
  },
}

// ===== SISTEMA DE NOTIFICAÇÕES =====
const NotificationSystem = {
  show(message, type = "success") {
    const notification = document.createElement("div")
    const iconMap = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      info: "fas fa-info-circle",
      warning: "fas fa-exclamation-triangle",
    }

    notification.className = `position-fixed top-0 end-0 m-3 alert alert-${type} alert-dismissible fade show bounce-in`
    notification.style.zIndex = "9999"
    notification.innerHTML = `
            <i class="${iconMap[type]} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, CONFIG.NOTIFICATION_DURATION)
  },
}

// ===== GERENCIADOR DE QUANTIDADE =====
const QuantityManager = {
  change(productId, delta) {
    const qtyElement = document.getElementById(`qty-${productId}`)
    if (!qtyElement) return

    const currentQty = Number.parseInt(qtyElement.textContent)
    const newQty = Math.max(1, Math.min(99, currentQty + delta))

    if (newQty !== currentQty) {
      qtyElement.textContent = newQty
      Utils.animateElement(qtyElement.parentElement, "bounce-in")
    }
  },
}

// ===== GERENCIADOR DO CARRINHO =====
const CartManager = {
  add(productId, productName, price) {
    if (isLoading) return

    const quantity = Number.parseInt(document.getElementById(`qty-${productId}`).textContent)
    const button = event.target.closest("button")
    const spinner = button.querySelector(".loading-spinner")

    this.showLoading(button, spinner, true)

    setTimeout(() => {
      const existingItem = cart.find((item) => item.id === productId)

      if (existingItem) {
        existingItem.quantity += quantity
        NotificationSystem.show(`Quantidade atualizada: ${productName}!`)
      } else {
        cart.push({
          id: productId,
          name: productName,
          price: price,
          quantity: quantity,
        })
        NotificationSystem.show(`${productName} adicionado ao carrinho! 🛒`)
      }

      this.updateUI()
      this.showLoading(button, spinner, false)
    }, CONFIG.LOADING_DELAY)
  },

  remove(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId)
    if (itemIndex > -1) {
      const removedItem = cart.splice(itemIndex, 1)[0]
      this.updateUI()
      NotificationSystem.show(`${removedItem.name} removido do carrinho!`, "info")
    }
  },

  clear() {
    cart = []
    this.updateUI()
    NotificationSystem.show("Carrinho limpo!", "info")
  },

  updateUI() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0)
    const cartCountElement = document.getElementById("cartCount")

    if (cartCountElement) {
      cartCountElement.textContent = cartCount
      if (cartCount > 0) {
        Utils.animateElement(cartCountElement, "bounce-in")
      }
    }

    this.updateCartModal()
  },

  updateCartModal() {
    const cartItems = document.getElementById("cartItems")
    const cartTotal = document.getElementById("cartTotal")
    const checkoutBtn = document.getElementById("checkoutBtn")

    if (!cartItems || !cartTotal || !checkoutBtn) return

    if (cart.length === 0) {
      cartItems.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-shopping-cart fa-4x mb-3 opacity-50"></i>
                    <h5>Seu carrinho está vazio</h5>
                    <p>Adicione alguns produtos incríveis!</p>
                </div>
            `
      cartTotal.textContent = Utils.formatPrice(0)
      checkoutBtn.disabled = true
    } else {
      let total = 0
      cartItems.innerHTML = cart
        .map((item) => {
          const itemTotal = item.price * item.quantity
          total += itemTotal
          return `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-3 fade-in-up">
                        <div class="flex-grow-1">
                            <h6 class="mb-1 fw-bold">${item.name}</h6>
                            <small class="text-muted">
                                <i class="fas fa-cube me-1"></i>Quantidade: ${item.quantity}
                            </small>
                            <div class="mt-1">
                                <small class="text-primary">${Utils.formatPrice(item.price)} cada</small>
                            </div>
                        </div>
                        <div class="text-end ms-3">
                            <div class="fw-bold text-success mb-2">${Utils.formatPrice(itemTotal)}</div>
                            <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="CartManager.remove(${item.id})" title="Remover item">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `
        })
        .join("")

      cartTotal.textContent = Utils.formatPrice(total)
      checkoutBtn.disabled = false
    }
  },

  showLoading(button, spinner, show) {
    isLoading = show
    if (spinner) {
      spinner.style.display = show ? "inline-block" : "none"
    }
    button.disabled = show
  },

  checkout() {
    if (cart.length === 0) return

    const checkoutBtn = document.getElementById("checkoutBtn")
    const originalText = checkoutBtn.innerHTML

    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...'
    checkoutBtn.disabled = true

    NotificationSystem.show("Processando pagamento...", "info")

    setTimeout(() => {
      const totalItems = cartCount
      const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

      this.clear()
      bootstrap.Modal.getInstance(document.getElementById("cartModal"))?.hide()

      NotificationSystem.show(`Compra finalizada! ${totalItems} itens - ${Utils.formatPrice(totalValue)} 🎉`, "success")

      checkoutBtn.innerHTML = originalText
      checkoutBtn.disabled = false
    }, 2000)
  },
}

// ===== SISTEMA DE FILTROS =====
const FilterSystem = {
  init() {
    this.setupCategoryFilters()
    this.setupSearch()
  },

  setupCategoryFilters() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleCategoryFilter(e.target)
      })
    })
  },

  handleCategoryFilter(button) {
    // Atualizar botões ativos
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
    button.classList.add("active")

    const category = button.dataset.category
    this.filterProducts(category)
  },

  filterProducts(category, searchTerm = "") {
    const products = document.querySelectorAll(".product-item")
    let visibleCount = 0

    products.forEach((product, index) => {
      const productCategory = product.dataset.category
      const productName = product.querySelector(".card-title").textContent.toLowerCase()
      const productDesc = product.querySelector(".card-text").textContent.toLowerCase()

      const matchesCategory = category === "all" || productCategory === category
      const matchesSearch =
        !searchTerm || productName.includes(searchTerm.toLowerCase()) || productDesc.includes(searchTerm.toLowerCase())

      if (matchesCategory && matchesSearch) {
        product.style.display = "block"
        setTimeout(() => {
          product.style.animation = "fadeInUp 0.5s ease-out"
        }, index * 100)
        visibleCount++
      } else {
        product.style.display = "none"
      }
    })

    this.updateResultsCount(visibleCount)
  },

  setupSearch() {
    const searchInput = document.getElementById("searchInput")
    if (!searchInput) return

    const debouncedSearch = Utils.debounce((searchTerm) => {
      const activeCategory = document.querySelector(".filter-btn.active")?.dataset.category || "all"
      this.filterProducts(activeCategory, searchTerm)
    }, 300)

    searchInput.addEventListener("input", (e) => {
      debouncedSearch(e.target.value)
    })
  },

  updateResultsCount(count) {
    let resultsElement = document.getElementById("resultsCount")
    if (!resultsElement) {
      resultsElement = document.createElement("div")
      resultsElement.id = "resultsCount"
      resultsElement.className = "text-center text-white mt-3"
      document.querySelector(".container h1").after(resultsElement)
    }

    if (count === 0) {
      resultsElement.innerHTML = '<i class="fas fa-search me-2"></i>Nenhum produto encontrado'
    } else {
      resultsElement.innerHTML = `<i class="fas fa-box me-2"></i>${count} produto${count !== 1 ? "s" : ""} encontrado${count !== 1 ? "s" : ""}`
    }
  },
}

// ===== SISTEMA DE MODAIS =====
const ModalSystem = {
  showProductDetails(productId) {
    const product = products[productId]
    if (!product) return

    const modal = new bootstrap.Modal(document.getElementById("productModal"))

    document.getElementById("productModalTitle").innerHTML = `
            <i class="fas fa-star text-warning me-2"></i>${product.name}
        `

    document.getElementById("productModalBody").innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <img src="${product.image}" class="img-fluid rounded-3 shadow" alt="${product.name}">
                </div>
                <div class="col-md-6">
                    <div class="mb-4">
                        <h3 class="text-primary fw-bold">${Utils.formatPrice(product.price)}</h3>
                        <span class="badge bg-success mb-3">
                            <i class="fas fa-tag me-1"></i>${product.category === "eletronicos" ? "Eletrônicos" : "Acessórios"}
                        </span>
                    </div>
                    
                    <p class="mb-4 text-muted">${product.description}</p>
                    
                    <h6 class="fw-bold mb-3">
                        <i class="fas fa-list-check me-2 text-primary"></i>Características:
                    </h6>
                    <ul class="list-unstyled">
                        ${product.features
                          .map(
                            (feature) => `
                            <li class="mb-2">
                                <i class="fas fa-check-circle text-success me-2"></i>${feature}
                            </li>
                        `,
                          )
                          .join("")}
                    </ul>
                    
                    <div class="mt-4 p-3 bg-light rounded-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-bold">Adicionar ao carrinho:</span>
                            <button class="btn btn-primary btn-animated" onclick="CartManager.add(${productId}, '${product.name}', ${product.price})">
                                <i class="fas fa-cart-plus me-2"></i>Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `

    modal.show()
  },
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Inicializando catálogo interativo...")

  // Inicializar sistemas
  ParticleSystem.init()
  FilterSystem.init()
  CartManager.updateUI()

  // Configurar eventos globais
  setupGlobalEvents()

  console.log("[v0] Catálogo inicializado com sucesso!")
})

// ===== EVENTOS GLOBAIS =====
function setupGlobalEvents() {
  // Checkout
  const checkoutBtn = document.getElementById("checkoutBtn")
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => CartManager.checkout())
  }

  // Limpar carrinho
  const clearCartBtn = document.getElementById("clearCartBtn")
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => CartManager.clear())
  }
}

// ===== FUNÇÕES GLOBAIS (para compatibilidade com HTML) =====
window.changeQuantity = (productId, change) => QuantityManager.change(productId, change)
window.addToCart = (productId, productName, price) => CartManager.add(productId, productName, price)
window.removeFromCart = (productId) => CartManager.remove(productId)
window.showProductDetails = (productId) => ModalSystem.showProductDetails(productId)
