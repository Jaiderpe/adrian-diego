document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0)

  const heroSection = document.getElementById("hero")
  if (heroSection) {
    heroSection.scrollIntoView({ behavior: "instant", block: "start" })
  }

  // =====================================================
  // Funciona en todas las pantallas desde servicios hacia abajo
  // =====================================================
  function initCardStacking() {
    const container = document.getElementById("cardsStackContainer")
    if (!container) {
      return
    }

    const cards = container.querySelectorAll(".service-card")
    const isMobile = window.innerWidth < 768

    // Configurar valores de top según el tamaño de pantalla
    let topValues
    if (window.innerWidth < 480) {
      topValues = [70, 85, 100, 115, 130, 145]
    } else if (window.innerWidth < 768) {
      topValues = [80, 100, 120, 140, 160, 180]
    } else {
      // En PC también aplicamos sticky pero con más separación
      topValues = [90, 115, 140, 165, 190, 215]
    }

    // Aplicar estilos sticky a todas las tarjetas en TODAS las pantallas
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

          // Cuando la siguiente card llega cerca de la actual
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
  // PARALLAX EFFECT FOR FLOATING CHARTS
  // =====================================================
  const floatingCharts = document.querySelectorAll(".floating-chart")

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY

    floatingCharts.forEach((chart, index) => {
      const speed = 0.05 + index * 0.01
      const yPos = scrollY * speed
      chart.style.transform = `translateY(${-yPos}px) rotate(${scrollY * 0.01}deg)`
    })
  })

  // =====================================================
  // HEADER SCROLL EFFECT
  // =====================================================
  const header = document.querySelector(".header")
  let lastScroll = 0

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY

    if (currentScroll > 100) {
      header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)"
    } else {
      header.style.boxShadow = "none"
    }

    lastScroll = currentScroll
  })

  // =====================================================
  // SERVICE CARDS HOVER EFFECT (Desktop only)
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

    // Valores fijos para cada estadística
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

    // Pequeña variación periódica (controlada, sin valores negativos)
    setInterval(() => {
      stats.forEach((stat, index) => {
        const baseTarget = targetValues[index] || 90
        const variation = Math.floor(Math.random() * 5) - 2 // -2 a +2
        const newValue = Math.max(baseTarget - 3, Math.min(baseTarget + 3, baseTarget + variation))

        const currentValue = Number.parseInt(stat.textContent) || baseTarget

        // Animar suavemente al nuevo valor
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
  // ANIMACIÓN DE ONDA PARA BARRAS DE ESTADÍSTICAS
  // =====================================================
  function initChartWaveAnimation() {
    const bars = document.querySelectorAll(".chart-bar")
    const trendLine = document.querySelector(".trend-line")
    const trendDots = document.querySelectorAll(".trend-dot")

    if (bars.length === 0) return

    const barConfig = [
      { originalHeight: 70, originalY: 130, minScale: 0.09, maxScale: 1.0 }, // Baja casi al 0%
      { originalHeight: 100, originalY: 100, minScale: 0.03, maxScale: 1.0 }, // Baja casi al 0%
      { originalHeight: 130, originalY: 70, minScale: 0.11, maxScale: 1.0 }, // Baja casi al 0%
      { originalHeight: 155, originalY: 45, minScale: 0.13, maxScale: 1.0 }, // Baja casi al 0%
      { originalHeight: 175, originalY: 25, minScale: 0.15, maxScale: 1.0 }, // Baja casi al 0%
    ]

    // Puntos originales de la línea de tendencia
    const originalPoints = [
      { x: 42, y: 120 },
      { x: 102, y: 90 },
      { x: 162, y: 60 },
      { x: 222, y: 35 },
      { x: 282, y: 15 },
    ]

    let startTime = null
    const duration = 4000 // 4 segundos para un ciclo completo

    function animateWave(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // Calcular fase de la onda (0 a 2*PI)
      const phase = (elapsed / duration) * Math.PI * 2

      bars.forEach((bar, index) => {
        const config = barConfig[index]
        if (!config) return

        const barPhase = phase - index * 0.7

        // Calcular escala usando seno para movimiento suave
        const scaleRange = config.maxScale - config.minScale
        const scale = config.minScale + scaleRange * (0.5 + 0.5 * Math.sin(barPhase))

        // Calcular nueva altura y posición Y
        const newHeight = config.originalHeight * scale
        const newY = config.originalY + (config.originalHeight - newHeight)

        // Aplicar transformación
        bar.setAttribute("height", newHeight.toFixed(2))
        bar.setAttribute("y", newY.toFixed(2))
      })

      if (trendLine && trendDots.length > 0) {
        const newPoints = originalPoints.map((point, index) => {
          const config = barConfig[index]
          if (!config) return point

          const barPhase = phase - index * 0.7
          const scaleRange = config.maxScale - config.minScale
          const scale = config.minScale + scaleRange * (0.5 + 0.5 * Math.sin(barPhase))

          // Ajustar Y del punto según la escala de la barra - movimiento más amplio
          const heightDiff = config.originalHeight * (1 - scale)
          const newY = point.y + heightDiff * 0.8

          return { x: point.x, y: newY }
        })

        // Actualizar polyline
        const pointsString = newPoints.map((p) => `${p.x},${p.y.toFixed(2)}`).join(" ")
        trendLine.setAttribute("points", pointsString)

        // Actualizar puntos
        trendDots.forEach((dot, index) => {
          if (newPoints[index]) {
            dot.setAttribute("cy", newPoints[index].y.toFixed(2))

            // Efecto de pulso en los puntos
            const dotPhase = phase - index * 0.7
            const dotScale = 0.6 + 0.6 * (0.5 + 0.5 * Math.sin(dotPhase * 2))
            dot.setAttribute("r", (5 * dotScale).toFixed(2))
          }
        })
      }

      // Continuar la animación
      requestAnimationFrame(animateWave)
    }

    // Iniciar la animación
    requestAnimationFrame(animateWave)
  }

  // Iniciar animación del gráfico
  initChartWaveAnimation()
})
