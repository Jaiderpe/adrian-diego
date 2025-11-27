document.addEventListener("DOMContentLoaded", () => {
  // =====================================================
  // CARD STACKING SCROLL EFFECT
  // =====================================================
  function initCardStacking() {
    const container = document.getElementById("cardsStackContainer")
    if (!container) {
      console.log("[v0] Container not found")
      return
    }

    const cards = container.querySelectorAll(".service-card")
    const isMobileOrTablet = window.innerWidth < 1024

    console.log("[v0] Card stacking init - isMobile:", isMobileOrTablet, "cards:", cards.length)

    if (!isMobileOrTablet) {
      // Desktop: Remove all stacking styles
      cards.forEach((card) => {
        card.classList.remove("is-stacked")
        card.style.position = ""
        card.style.top = ""
        card.style.zIndex = ""
      })
      return
    }

    // Mobile/Tablet: Apply sticky positioning via inline styles for robustness
    const topValues = [80, 100, 120, 140, 160, 180]
    const smallTopValues = [70, 85, 100, 115, 130, 145]
    const isSmallScreen = window.innerWidth < 480
    const tops = isSmallScreen ? smallTopValues : topValues

    cards.forEach((card, index) => {
      // Force sticky positioning with inline styles
      card.style.position = "sticky"
      card.style.top = tops[index] + "px"
      card.style.zIndex = (100 + index).toString()
      console.log("[v0] Card", index, "- top:", tops[index], "z-index:", 100 + index)
    })

    // Handle scroll to add visual feedback
    function handleScroll() {
      const viewportHeight = window.innerHeight

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect()
        const cardTop = tops[index]

        // Card is "stacked" when it has reached its sticky position
        // and the next card is approaching
        if (index < cards.length - 1) {
          const nextCard = cards[index + 1]
          const nextRect = nextCard.getBoundingClientRect()

          // When next card is close to current card's bottom
          if (nextRect.top <= rect.top + 60) {
            card.classList.add("is-stacked")
          } else {
            card.classList.remove("is-stacked")
          }
        }
      })
    }

    // Throttled scroll listener
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
    handleScroll() // Initial check
  }

  // Initialize on load
  initCardStacking()

  // Re-initialize on resize
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
  if (window.innerWidth >= 1024) {
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
  }

  // =====================================================
  // ROI CARD 3D TILT EFFECT
  // =====================================================
  const roiCard = document.querySelector(".roi-card")

  if (roiCard && window.innerWidth >= 768) {
    roiCard.addEventListener("mousemove", (e) => {
      const rect = roiCard.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * 10
      const rotateY = ((x - centerX) / centerX) * 10

      roiCard.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`
    })

    roiCard.addEventListener("mouseleave", () => {
      roiCard.style.transform = ""
    })
  }

  // =====================================================
  // ANIMATE STATS NUMBERS
  // =====================================================
  function animateValue(element, start, end, duration) {
    const startTime = performance.now()
    const isPercentage = element.textContent.includes("%")
    const isMonetary = element.textContent.includes("$")
    const suffix = isPercentage ? "%" : isMonetary ? "" : "+"
    const prefix = isMonetary ? "$" : ""

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(start + (end - start) * easeOut)

      element.textContent = prefix + current + suffix

      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }

    requestAnimationFrame(update)
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statNumbers = entry.target.querySelectorAll(".stat-number")
          statNumbers.forEach((stat) => {
            const text = stat.textContent
            let endValue

            if (text.includes("500")) endValue = 500
            else if (text.includes("98")) endValue = 98
            else if (text.includes("2B")) endValue = 2

            if (endValue) {
              animateValue(stat, 0, endValue, 2000)
            }
          })
          statsObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 },
  )

  const statsGrid = document.querySelector(".stats-grid")
  if (statsGrid) {
    statsObserver.observe(statsGrid)
  }
})
