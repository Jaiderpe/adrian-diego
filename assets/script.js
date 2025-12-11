document.addEventListener("DOMContentLoaded", () => {
  // Scroll al inicio
  window.scrollTo(0, 0)

  // =====================================================
  // CARD STACKING - Funciona en todas las pantallas
  // =====================================================
  function initCardStacking() {
    const container = document.getElementById("cardsStackContainer")
    if (!container) return

    const cards = container.querySelectorAll(".service-card")

    let topValues
    if (window.innerWidth < 480) {
      topValues = [70, 85, 100, 115, 130, 145]
    } else if (window.innerWidth < 768) {
      topValues = [80, 100, 120, 140, 160, 180]
    } else {
      topValues = [90, 115, 140, 165, 190, 215]
    }

    cards.forEach((card, index) => {
      card.style.position = "sticky"
      card.style.top = topValues[index] + "px"
      card.style.zIndex = (100 + index).toString()
    })

    function handleScroll() {
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect()

        if (index < cards.length - 1) {
          const nextCard = cards[index + 1]
          const nextRect = nextCard.getBoundingClientRect()

          if (nextRect.top <= rect.top + 50) {
            card.classList.add("is-stacked")
          } else {
            card.classList.remove("is-stacked")
          }
        }
      })
    }

    let ticking = false
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    handleScroll()
  }

  initCardStacking()

  let resizeTimeout
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(initCardStacking, 150)
  })

  // =====================================================
  // STICKY BUTTON - Improved for mobile with smoother tracking
  // =====================================================
  const stickyButton = document.querySelector("[data-sticky-button]")
  const heroSection = document.getElementById("inicio")

  if (stickyButton && heroSection) {
    let isSticky = false
    let rafId = null

    function updateStickyButton() {
      const heroRect = heroSection.getBoundingClientRect()
      const heroBottom = heroRect.bottom
      const scrollY = window.scrollY || window.pageYOffset

      const isMobile = window.innerWidth < 768
      const threshold = isMobile ? 150 : 300
      const shouldBeSticky = heroBottom <= 50 || scrollY > threshold

      if (shouldBeSticky !== isSticky) {
        isSticky = shouldBeSticky
        if (isSticky) {
          stickyButton.classList.add("sticky-active")
        } else {
          stickyButton.classList.remove("sticky-active")
        }
      }
    }

    function onScroll() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        updateStickyButton()
        rafId = null
      })
    }

    // Listen to multiple scroll events for better mobile support
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("touchmove", onScroll, { passive: true })
    window.addEventListener("resize", updateStickyButton, { passive: true })

    // Initial check
    updateStickyButton()

    // Delayed check for mobile browsers
    setTimeout(updateStickyButton, 50)
    setTimeout(updateStickyButton, 200)
  }

  // =====================================================
  // SERVICE VIDEOS - Funciona en todas las pantallas
  // =====================================================
  function initServiceVideos() {
    const videoCards = document.querySelectorAll(".service-card-video")

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector(".service-video")
          if (video) {
            if (entry.isIntersecting) {
              video.play().catch((e) => console.log("Error playing video:", e))
            } else {
              video.pause()
            }
          }
        })
      },
      {
        threshold: 0.5, // El video debe estar 50% visible
      },
    )

    videoCards.forEach((card) => {
      videoObserver.observe(card)
    })
  }

  initServiceVideos()

  // =====================================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // =====================================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible")
      }
    })
  }, observerOptions)

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el)
  })

  // =====================================================
  // SMOOTH SCROLL FOR NAVIGATION LINKS
  // =====================================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // =====================================================
  // PARALLAX EFFECT FOR FLOATING CHARTS - Más movimiento
  // =====================================================
  const floatingCharts = document.querySelectorAll(".floating-chart")

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY

    floatingCharts.forEach((chart, index) => {
      const speed = 0.08 + index * 0.02
      const yPos = scrollY * speed
      const rotation = Math.sin(scrollY * 0.002 + index) * 10
      chart.style.transform = `translateY(${-yPos}px) rotate(${rotation}deg)`
    })
  })

  // =====================================================
  // HEADER SCROLL EFFECT
  // =====================================================
  const header = document.querySelector(".header")

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY

    if (currentScroll > 100) {
      header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)"
    } else {
      header.style.boxShadow = "none"
    }
  })

  // =====================================================
  // SERVICE CARDS HOVER EFFECT
  // =====================================================
  const serviceCards = document.querySelectorAll(".service-card")

  serviceCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px)"
      card.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.1)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.transform = ""
      card.style.boxShadow = ""
    })
  })

  // =====================================================
  // ANIMACIÓN DE VALORES DE ESTADÍSTICAS
  // =====================================================
  function animateStats() {
    const stats = document.querySelectorAll(".stat-value")
    const targetValues = [96, 88, 71, 95]

    stats.forEach((stat, index) => {
      const target = targetValues[index] || 90
      stat.setAttribute("data-target", target)
      let current = 0

      const interval = setInterval(() => {
        current += 2
        if (current >= target) {
          current = target
          clearInterval(interval)
        }
        stat.textContent = current + "%"
      }, 30)
    })

    setInterval(() => {
      stats.forEach((stat, index) => {
        const baseTarget = targetValues[index] || 90
        const variation = Math.floor(Math.random() * 5) - 2
        const newValue = Math.max(baseTarget - 3, Math.min(baseTarget + 3, baseTarget + variation))
        const currentValue = Number.parseInt(stat.textContent) || baseTarget

        const diff = newValue - currentValue
        if (diff !== 0) {
          const step = diff > 0 ? 1 : -1
          let tempValue = currentValue

          const updateInterval = setInterval(() => {
            tempValue += step
            stat.textContent = tempValue + "%"

            if (tempValue === newValue) {
              clearInterval(updateInterval)
            }
          }, 100)
        }
      })
    }, 4000)
  }

  animateStats()

  // =====================================================
  // ANIMACIÓN ROBUSTA DE BARRAS DE ESTADÍSTICAS
  // Con movimiento fluido y escala completa
  // =====================================================
  function initRobustChartAnimation() {
    const bars = [
      document.getElementById("bar1"),
      document.getElementById("bar2"),
      document.getElementById("bar3"),
      document.getElementById("bar4"),
      document.getElementById("bar5"),
    ]

    const trendLine = document.getElementById("trendLine")
    const dots = [
      document.getElementById("dot1"),
      document.getElementById("dot2"),
      document.getElementById("dot3"),
      document.getElementById("dot4"),
      document.getElementById("dot5"),
    ]

    if (!bars[0]) return

    // Configuración de cada barra: altura original, Y original, posición base del punto
    const barConfig = [
      { height: 70, baseY: 130, minScale: 0, maxScale: 1, dotBaseY: 120 },
      { height: 100, baseY: 100, minScale: 0, maxScale: 1, dotBaseY: 90 },
      { height: 130, baseY: 70, minScale: 0, maxScale: 1, dotBaseY: 60 },
      { height: 155, baseY: 45, minScale: 0, maxScale: 1, dotBaseY: 35 },
      { height: 175, baseY: 25, minScale: 0, maxScale: 1, dotBaseY: 15 },
    ]

    const baseY = 200 // Línea base del gráfico
    let animationFrame
    let startTime = null

    function animate(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // Ciclo de 5 segundos para animación suave
      const cycleDuration = 5000
      const progress = (elapsed % cycleDuration) / cycleDuration

      // Usar función seno para movimiento suave
      // Va de 0 (completamente abajo) a 1 (completamente arriba)
      const basePhase = progress * Math.PI * 2

      const newPoints = []

      bars.forEach((bar, index) => {
        if (!bar) return

        const config = barConfig[index]
        // Desfase entre barras para efecto de ola
        const phaseOffset = index * 0.5
        const phase = basePhase - phaseOffset

        // Calcular escala (0 a 1) con movimiento sinusoidal
        // Va de 0 (completamente abajo) a 1 (completamente arriba)
        const scale = 0.5 + 0.5 * Math.sin(phase)

        // Calcular nueva altura y posición Y
        const newHeight = config.height * scale
        const newY = baseY - newHeight

        // Aplicar a la barra
        bar.setAttribute("height", Math.max(1, newHeight).toFixed(2))
        bar.setAttribute("y", newY.toFixed(2))

        // Calcular posición del punto de la línea de tendencia
        // El punto está en la parte superior de la barra
        const dotY = newY

        if (dots[index]) {
          dots[index].setAttribute("cy", dotY.toFixed(2))
          // Efecto de pulso en los puntos
          const pulseScale = 0.7 + 0.5 * Math.abs(Math.sin(phase * 1.5))
          dots[index].setAttribute("r", (5 * pulseScale).toFixed(2))
        }

        // Guardar punto para la línea
        const dotX = 42 + index * 60 // Posición X de cada punto
        newPoints.push(`${dotX},${dotY.toFixed(2)}`)
      })

      // Actualizar línea de tendencia
      if (trendLine && newPoints.length === 5) {
        trendLine.setAttribute("points", newPoints.join(" "))
      }

      animationFrame = requestAnimationFrame(animate)
    }

    // Iniciar animación
    animationFrame = requestAnimationFrame(animate)

    // Limpiar al salir
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }

  // Iniciar animación del gráfico
  initRobustChartAnimation()

  // =====================================================
  // DUPLICAR TARJETAS DEL CARRUSEL PARA LOOP INFINITO
  // =====================================================
  const carouselTrack = document.getElementById("carouselTrack")
  if (carouselTrack) {
    const cards = carouselTrack.innerHTML
    carouselTrack.innerHTML = cards + cards // Duplicar para loop infinito
  }

  // =====================================================
  // DUPLICAR FILAS DE EDUCACIÓN PARA LOOP INFINITO
  // =====================================================
  function initEducationRows() {
    const rows = ["educationRow1", "educationRow2", "educationRow3"]

    rows.forEach((rowId) => {
      const track = document.getElementById(rowId)
      if (track) {
        // Duplicar el contenido para crear loop infinito
        const content = track.innerHTML
        track.innerHTML = content + content
      }
    })
  }

  initEducationRows()

  // =====================================================
  // FUNCIÓN DE CALIFICACIÓN DE ESTRELLAS
  // =====================================================

  // Star rating functionality
  const starRating = document.getElementById("starRating")
  let selectedRating = 0

  if (starRating) {
    const stars = starRating.querySelectorAll(".star")

    stars.forEach((star) => {
      star.addEventListener("mouseenter", function () {
        const value = Number.parseInt(this.getAttribute("data-value"))
        highlightStars(value)
      })

      star.addEventListener("mouseleave", () => {
        highlightStars(selectedRating)
      })

      star.addEventListener("click", function () {
        selectedRating = Number.parseInt(this.getAttribute("data-value"))
        highlightStars(selectedRating)
      })
    })

    function highlightStars(count) {
      stars.forEach((star, index) => {
        if (index < count) {
          star.classList.add("active")
        } else {
          star.classList.remove("active")
        }
      })
    }
  }

  // =====================================================
  // FORMULARIO DE RESEÑAS - Envío y limitación de reseñas
  // =====================================================
  const reviewForm = document.getElementById("reviewForm")
  const reviewsGrid = document.querySelector(".reviews-grid")

  function limitReviewsToThree() {
    if (!reviewsGrid) return
    const allReviews = reviewsGrid.querySelectorAll(".review-card")
    allReviews.forEach((review, index) => {
      if (index < 3) {
        review.style.display = ""
      } else {
        review.style.display = "none"
      }
    })
  }

  // Aplicar límite al cargar
  limitReviewsToThree()

  if (reviewForm && reviewsGrid) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("reviewName").value.trim()
      const position = document.getElementById("reviewPosition").value.trim()
      const text = document.getElementById("reviewText").value.trim()

      if (!name || !text || selectedRating === 0) {
        alert("Por favor completa todos los campos y selecciona una calificación")
        return
      }

      // Generate initials
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

      // Generate stars HTML
      let starsHTML = ""
      for (let i = 0; i < 5; i++) {
        starsHTML += `<svg viewBox="0 0 24 24" fill="${i < selectedRating ? "currentColor" : "none"}" stroke="currentColor" stroke-width="${i < selectedRating ? "0" : "2"}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
      }

      // Create new review card
      const newReview = document.createElement("div")
      newReview.className = "review-card new-review"
      newReview.innerHTML = `
        <div class="review-stars">
          ${starsHTML}
        </div>
        <p class="review-text">"${text}"</p>
        <div class="review-author">
          <div class="author-avatar">
            <span>${initials}</span>
          </div>
          <div class="author-info">
            <h4>${name}</h4>
            <p>${position || "Cliente"}</p>
          </div>
        </div>
      `

      // Add to grid at the beginning
      reviewsGrid.insertBefore(newReview, reviewsGrid.firstChild)

      limitReviewsToThree()

      // Reset form
      reviewForm.reset()
      selectedRating = 0
      if (starRating) {
        const stars = starRating.querySelectorAll(".star")
        stars.forEach((star) => star.classList.remove("active"))
      }

      // Scroll to show new review
      newReview.scrollIntoView({ behavior: "smooth", block: "center" })

      // Show confirmation
      setTimeout(() => {
        alert("¡Gracias por tu reseña!")
      }, 500)
    })
  }
})

document.addEventListener("DOMContentLoaded", () => {
  // Scroll al inicio
  window.scrollTo(0, 0)

  // =====================================================
  // DARK MODE TOGGLE
  // =====================================================
  const darkModeToggle = document.getElementById("dark-mode-toggle")
  const htmlElement = document.documentElement

  // Detectar preferencia del sistema
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const savedTheme = localStorage.getItem("theme")
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light")

  // Aplicar tema inicial
  if (initialTheme === "dark") {
    htmlElement.classList.add("dark-mode")
  }

  // Toggle dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      htmlElement.classList.toggle("dark-mode")
      const isDark = htmlElement.classList.contains("dark-mode")
      localStorage.setItem("theme", isDark ? "dark" : "light")
      console.log("[v0] Dark mode toggled:", isDark ? "ON" : "OFF")
    })
  }

  // =====================================================
  // STICKY BUTTON - Improved for mobile with smoother tracking
  // =====================================================
  const stickyButton = document.querySelector("[data-sticky-button]")
  const heroSection = document.getElementById("inicio")

  if (stickyButton && heroSection) {
    let isSticky = false
    let rafId = null

    function updateStickyButton() {
      const heroRect = heroSection.getBoundingClientRect()
      const heroBottom = heroRect.bottom
      const scrollY = window.scrollY || window.pageYOffset

      const isMobile = window.innerWidth < 768
      const threshold = isMobile ? 150 : 300
      const shouldBeSticky = heroBottom <= 50 || scrollY > threshold

      if (shouldBeSticky !== isSticky) {
        isSticky = shouldBeSticky
        if (isSticky) {
          stickyButton.classList.add("sticky-active")
        } else {
          stickyButton.classList.remove("sticky-active")
        }
      }
    }

    function onScroll() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        updateStickyButton()
        rafId = null
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("touchmove", onScroll, { passive: true })
    window.addEventListener("resize", updateStickyButton, { passive: true })

    updateStickyButton()
    setTimeout(updateStickyButton, 50)
    setTimeout(updateStickyButton, 200)
  }

  // =====================================================
  // STACKED CARDS ANIMATION - PROFESSIONAL & ROBUST
  // =====================================================
  function initStackedCards() {
    const container = document.querySelector(".cards-stack-container")
    if (!container) {
      console.log("[v0] cards-stack-container not found")
      return
    }

    const cards = Array.from(container.querySelectorAll(".service-card"))
    if (cards.length === 0) {
      console.log("[v0] No service-card elements found")
      return
    }

    console.log("[v0] Initializing stacked cards with", cards.length, "cards")

    // Get responsive top values based on viewport width
    function getTopValues() {
      const width = window.innerWidth
      if (width < 480) return [70, 85, 100, 115, 130, 145]
      if (width < 768) return [70, 85, 100, 115, 130, 145]
      if (width < 1024) return [90, 115, 140, 165, 190, 215]
      return [80, 110, 140, 170, 200, 230]
    }

    let topValues = getTopValues()

    // Initialize card positions
    cards.forEach((card, index) => {
      card.setAttribute("data-card-index", index)
      card.style.position = "sticky"
      card.style.top = topValues[index] + "px"
      card.style.zIndex = (100 + index).toString()
      card.style.willChange = "transform, opacity"
    })

    let scrollRafId = null
    let isAnimating = false

    function updateStackAnimation() {
      isAnimating = true

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect()
        const cardTop = cardRect.top
        const windowHeight = window.innerHeight

        // Count how many cards are below this one that are triggering stack effect
        let stackCount = 0
        let isCurrentStacking = false

        for (let i = index + 1; i < cards.length; i++) {
          const nextCard = cards[i]
          const nextCardRect = nextCard.getBoundingClientRect()
          const distance = nextCardRect.top - cardTop

          // If the next card is within 85px, it's pushing this card
          if (distance < 85 && distance > 0) {
            stackCount++
            isCurrentStacking = true
          }
        }

        // Apply stacking animation when cards are stacking
        if (isCurrentStacking && stackCount > 0) {
          // Calculate scale and opacity based on how many cards are on top
          const scale = Math.max(0.94 - stackCount * 0.025, 0.82)
          const opacity = Math.max(0.9 - stackCount * 0.1, 0.6)

          card.style.transform = `scale(${scale})`
          card.style.opacity = opacity.toString()
          card.classList.add("is-stacked")

          console.log(
            `[v0] Card ${index}: STACKING - scale=${scale.toFixed(3)}, opacity=${opacity.toFixed(2)}, stackCount=${stackCount}`,
          )
        } else {
          // Reset when not stacking
          card.style.transform = "scale(1)"
          card.style.opacity = "1"
          card.classList.remove("is-stacked")

          console.log(`[v0] Card ${index}: NORMAL - reset to scale(1) and opacity 1`)
        }
      })

      isAnimating = false
    }

    function onScrollOptimized() {
      if (scrollRafId) return
      scrollRafId = requestAnimationFrame(() => {
        updateStackAnimation()
        scrollRafId = null
      })
    }

    // Attach scroll listener
    window.addEventListener("scroll", onScrollOptimized, { passive: true })

    // Handle window resize
    window.addEventListener("resize", () => {
      topValues = getTopValues()
      cards.forEach((card, index) => {
        card.style.top = topValues[index] + "px"
      })
      updateStackAnimation()
    })

    // Initial call
    setTimeout(() => {
      updateStackAnimation()
      console.log("[v0] Stacked cards initialized successfully")
    }, 100)
  }

  // Call initialization
  initStackedCards()
})
