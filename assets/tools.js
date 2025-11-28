// Tools JavaScript - Calculators and Simulators
// Complete implementation with all calculations

document.addEventListener("DOMContentLoaded", () => {
  // Detect which tool page we're on and initialize
  if (document.getElementById("btnCalcularCredito")) {
    initCreditCalculator()
  }
  if (document.getElementById("btnCalcularRiesgo")) {
    initRiskCalculator()
  }
  if (document.getElementById("btnSimular")) {
    initCreditSimulator()
  }
})

// ========== CALCULADORA DE CRÉDITO (AMORTIZACIÓN) ==========
function initCreditCalculator() {
  const btnCalcular = document.getElementById("btnCalcularCredito")
  const btnExport = document.getElementById("btnExportExcel")

  // Format input on blur
  const montoInput = document.getElementById("creditMonto")
  montoInput.addEventListener("blur", function () {
    if (this.value) {
      this.setAttribute("data-raw", this.value)
    }
  })

  btnCalcular.addEventListener("click", calculateAmortization)
  btnExport.addEventListener("click", exportToExcel)

  // Also calculate on Enter key
  document.querySelectorAll(".calc-form input").forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") calculateAmortization()
    })
  })
}

function calculateAmortization() {
  const monto = Number.parseFloat(document.getElementById("creditMonto").value)
  const tiempo = Number.parseInt(document.getElementById("creditTiempo").value)
  const interesAnual = Number.parseFloat(document.getElementById("creditInteres").value)

  // Validation
  if (isNaN(monto) || monto <= 0) {
    showAlert("Por favor ingresa un monto válido mayor a 0")
    return
  }
  if (isNaN(tiempo) || tiempo <= 0 || tiempo > 360) {
    showAlert("Por favor ingresa un plazo válido (1-360 meses)")
    return
  }
  if (isNaN(interesAnual) || interesAnual < 0 || interesAnual > 100) {
    showAlert("Por favor ingresa una tasa de interés válida (0-100%)")
    return
  }

  let cuota, totalIntereses, totalPagar

  // Handle 0% interest case
  if (interesAnual === 0) {
    cuota = monto / tiempo
    totalIntereses = 0
    totalPagar = monto
  } else {
    const interesMensual = interesAnual / 100 / 12
    cuota =
      (monto * (interesMensual * Math.pow(1 + interesMensual, tiempo))) / (Math.pow(1 + interesMensual, tiempo) - 1)
    totalPagar = cuota * tiempo
    totalIntereses = totalPagar - monto
  }

  // Update cuota mensual with animation
  const cuotaElement = document.getElementById("cuotaMensual")
  animateValue(cuotaElement, 0, cuota, 800, "", true)

  // Add pulse animation
  cuotaElement.parentElement.classList.add("pulse")
  setTimeout(() => cuotaElement.parentElement.classList.remove("pulse"), 1000)

  // Generate amortization table
  generateAmortizationTable(monto, tiempo, interesAnual)
}

function generateAmortizationTable(monto, tiempo, interesAnual) {
  const tbody = document.getElementById("amortizationBody")
  tbody.innerHTML = ""

  let saldo = monto
  const interesMensual = interesAnual / 100 / 12

  let cuota
  if (interesAnual === 0) {
    cuota = monto / tiempo
  } else {
    cuota =
      (monto * (interesMensual * Math.pow(1 + interesMensual, tiempo))) / (Math.pow(1 + interesMensual, tiempo) - 1)
  }

  let totalCapital = 0
  let totalInteres = 0

  for (let i = 1; i <= tiempo; i++) {
    let interesMes, capital

    if (interesAnual === 0) {
      interesMes = 0
      capital = cuota
    } else {
      interesMes = saldo * interesMensual
      capital = cuota - interesMes
    }

    saldo = Math.max(0, saldo - capital)
    totalCapital += capital
    totalInteres += interesMes

    const row = document.createElement("tr")
    row.style.animation = `fadeInUp 0.3s ease ${i * 0.02}s forwards`
    row.style.opacity = "0"
    row.innerHTML = `
      <td><span class="month-badge">${i}</span></td>
      <td class="currency">${formatCurrency(cuota)}</td>
      <td class="currency capital">${formatCurrency(capital)}</td>
      <td class="currency interest">${formatCurrency(interesMes)}</td>
      <td class="currency balance">${formatCurrency(saldo)}</td>
    `
    tbody.appendChild(row)
  }

  // Add totals row
  const totalsRow = document.createElement("tr")
  totalsRow.className = "totals-row"
  totalsRow.innerHTML = `
    <td><strong>TOTAL</strong></td>
    <td class="currency"><strong>${formatCurrency(cuota * tiempo)}</strong></td>
    <td class="currency capital"><strong>${formatCurrency(totalCapital)}</strong></td>
    <td class="currency interest"><strong>${formatCurrency(totalInteres)}</strong></td>
    <td class="currency balance"><strong>$0</strong></td>
  `
  tbody.appendChild(totalsRow)
}

function exportToExcel() {
  const table = document.querySelector(".amortization-table")
  const rows = table.querySelectorAll("tr")

  if (rows.length <= 2) {
    showAlert("Primero calcula la amortización para poder exportar")
    return
  }

  // Create CSV content with BOM for Excel compatibility
  const BOM = "\uFEFF"
  const csv = []

  rows.forEach((row) => {
    const cols = row.querySelectorAll("td, th")
    const rowData = []
    cols.forEach((col) => {
      let text = col.textContent.trim()
      // Escape quotes and wrap in quotes if contains comma
      if (text.includes(",") || text.includes('"')) {
        text = '"' + text.replace(/"/g, '""') + '"'
      }
      rowData.push(text)
    })
    csv.push(rowData.join(","))
  })

  const csvContent = BOM + csv.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `amortizacion_${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showAlert("Archivo exportado exitosamente", "success")
}

// ========== CALCULADORA DE RIESGO FINANCIERO ==========
function initRiskCalculator() {
  const btnCalcular = document.getElementById("btnCalcularRiesgo")
  const ingresosSlider = document.getElementById("riesgoIngresos")
  const gastosSlider = document.getElementById("riesgoGastos")

  // Update slider values in real-time
  ingresosSlider.addEventListener("input", function () {
    document.getElementById("ingresosValue").textContent = formatCurrency(this.value)
    updateSliderBackground(this)
  })

  gastosSlider.addEventListener("input", function () {
    document.getElementById("gastosValue").textContent = formatCurrency(this.value)
    updateSliderBackground(this)
  })

  // Initialize slider backgrounds
  updateSliderBackground(ingresosSlider)
  updateSliderBackground(gastosSlider)

  btnCalcular.addEventListener("click", calculateRisk)
}

function updateSliderBackground(slider) {
  const min = Number.parseFloat(slider.min)
  const max = Number.parseFloat(slider.max)
  const val = Number.parseFloat(slider.value)
  const percentage = ((val - min) / (max - min)) * 100
  slider.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
}

function calculateRisk() {
  // Get all values
  const email = document.getElementById("riesgoEmail").value
  const telefono = document.getElementById("riesgoTelefono").value
  const nombre = document.getElementById("riesgoNombre").value
  const edad = Number.parseInt(document.getElementById("riesgoEdad").value) || 0
  const genero = document.getElementById("riesgoGenero").value
  const ciudad = document.getElementById("riesgoCiudad").value
  const estadoCivil = document.getElementById("riesgoEstadoCivil").value
  const escolaridad = document.getElementById("riesgoEscolaridad").value
  const deudas = document.getElementById("riesgoDeudas").value
  const activos = document.getElementById("riesgoActivos").value
  const ingresos = Number.parseFloat(document.getElementById("riesgoIngresos").value)
  const gastos = Number.parseFloat(document.getElementById("riesgoGastos").value)

  // Validate required fields
  const missingFields = []
  if (!email) missingFields.push("Correo electrónico")
  if (!nombre) missingFields.push("Nombre")
  if (!edad || edad < 18) missingFields.push("Edad (mínimo 18 años)")
  if (!escolaridad) missingFields.push("Escolaridad")
  if (!deudas) missingFields.push("Deudas")

  if (missingFields.length > 0) {
    showAlert(`Por favor completa los siguientes campos:\n- ${missingFields.join("\n- ")}`)
    return
  }

  // ===== CALCULATE RISK SCORE =====
  let score = 0
  let maxScore = 0

  // 1. Age factor (max 15 points)
  maxScore += 15
  if (edad >= 25 && edad <= 35) score += 15
  else if (edad >= 36 && edad <= 45) score += 14
  else if (edad >= 46 && edad <= 55) score += 12
  else if (edad >= 18 && edad <= 24) score += 8
  else if (edad > 55 && edad <= 65) score += 10
  else score += 5

  // 2. Education factor (max 15 points)
  maxScore += 15
  const eduScores = {
    posgrado: 15,
    universitario: 12,
    tecnico: 9,
    secundaria: 5,
    primaria: 2,
  }
  score += eduScores[escolaridad] || 0

  // 3. Debt factor (max 20 points)
  maxScore += 20
  const debtScores = {
    ninguna: 20,
    "1-2": 14,
    "3-5": 6,
    mas5: 0,
  }
  score += debtScores[deudas] || 0

  // 4. Assets factor (max 15 points)
  maxScore += 15
  const assetScores = {
    ambos: 15,
    inmueble: 13,
    vehiculo: 8,
    ninguno: 2,
  }
  score += assetScores[activos] || 0

  // 5. Income vs Expenses ratio (max 25 points)
  maxScore += 25
  const ratio = ingresos / gastos
  const disponible = ingresos - gastos

  if (ratio >= 3) score += 25
  else if (ratio >= 2.5) score += 22
  else if (ratio >= 2) score += 18
  else if (ratio >= 1.5) score += 14
  else if (ratio >= 1.3) score += 10
  else if (ratio >= 1.1) score += 5
  else score += 0

  // 6. Civil status bonus (max 5 points)
  maxScore += 5
  if (estadoCivil === "casado" || estadoCivil === "union") score += 5
  else if (estadoCivil === "soltero") score += 3
  else score += 2

  // 7. City factor (max 5 points)
  maxScore += 5
  if (ciudad === "bogota" || ciudad === "medellin") score += 5
  else if (ciudad === "cali" || ciudad === "barranquilla") score += 4
  else score += 3

  // Calculate final percentage
  const probability = Math.round((score / maxScore) * 100)

  // Determine risk level
  let riskLevel, riskClass, riskDescription
  if (probability >= 75) {
    riskLevel = "Riesgo Bajo"
    riskClass = "low"
    riskDescription = "Excelente perfil crediticio. Alta probabilidad de aprobación."
  } else if (probability >= 50) {
    riskLevel = "Riesgo Medio"
    riskClass = "medium"
    riskDescription = "Perfil moderado. Posibilidad de aprobación con algunas condiciones."
  } else if (probability >= 30) {
    riskLevel = "Riesgo Alto"
    riskClass = "high"
    riskDescription = "Perfil con riesgo elevado. Se recomienda mejorar indicadores."
  } else {
    riskLevel = "Riesgo Muy Alto"
    riskClass = "very-high"
    riskDescription = "Perfil crítico. Baja probabilidad de aprobación."
  }

  // ===== UPDATE UI WITH ANIMATIONS =====

  // Update risk badge
  const badge = document.getElementById("riskLevelBadge")
  badge.textContent = riskLevel
  badge.className = `diagnosis-badge ${riskClass}`
  badge.classList.add("animate-pop")
  setTimeout(() => badge.classList.remove("animate-pop"), 500)

  // Update probability
  const probValue = document.getElementById("probabilityValue")
  const probFill = document.getElementById("probabilityFill")

  animateValue(probValue, 0, probability, 1200, "%")

  // Animate probability bar
  probFill.style.transition = "none"
  probFill.style.width = "0%"
  setTimeout(() => {
    probFill.style.transition = "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
    probFill.style.width = probability + "%"
    probFill.className = `probability-fill ${riskClass}`
  }, 50)

  // Calculate individual factors
  const capacidadPago = Math.min(100, Math.round((ratio / 3) * 100))
  const estabilidad = Math.round(((eduScores[escolaridad] || 0) / 15) * 60 + (edad >= 25 && edad <= 55 ? 40 : 20))
  const historial = Math.round(((debtScores[deudas] || 0) / 20) * 100)

  // Update factor bars with animation
  const factors = document.querySelectorAll(".factor-fill")
  const factorValues = [capacidadPago, estabilidad, historial]

  factors.forEach((factor, index) => {
    factor.style.transition = "none"
    factor.style.width = "0%"
    setTimeout(() => {
      factor.style.transition = `width 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`
      factor.style.width = factorValues[index] + "%"
    }, 100)
  })

  // Show success message
  showAlert(`Análisis completado: ${riskLevel}\n${riskDescription}`, probability >= 50 ? "success" : "warning")
}

// ========== SIMULADOR DE CRÉDITO ==========
function initCreditSimulator() {
  const btnSimular = document.getElementById("btnSimular")
  btnSimular.addEventListener("click", simulateCredit)

  // Real-time calculation as user types
  const montoInput = document.getElementById("simMonto")
  const plazoSelect = document.getElementById("simPlazo")
  const purposeSelect = document.getElementById("simPurpose")
  ;[montoInput, plazoSelect, purposeSelect].forEach((el) => {
    el.addEventListener("change", () => {
      if (montoInput.value && plazoSelect.value && purposeSelect.value) {
        simulateCredit()
      }
    })
  })
}

function simulateCredit() {
  const purpose = document.getElementById("simPurpose").value
  const monto = Number.parseFloat(document.getElementById("simMonto").value)
  const plazo = Number.parseInt(document.getElementById("simPlazo").value)

  // Validation
  if (!purpose) {
    showAlert("Por favor selecciona el propósito del crédito")
    return
  }
  if (isNaN(monto) || monto < 100000) {
    showAlert("Por favor ingresa un monto válido (mínimo $100,000)")
    return
  }
  if (!plazo) {
    showAlert("Por favor selecciona el plazo de pago")
    return
  }

  // Interest rates by purpose (annual %)
  const rates = {
    vivienda: 10.5,
    vehiculo: 14.0,
    educacion: 8.5,
    negocio: 16.0,
    personal: 18.5,
    consolidacion: 15.0,
  }

  const interesAnual = rates[purpose] || 15
  const interesMensual = interesAnual / 100 / 12

  // Calculate monthly payment using PMT formula
  const cuota =
    (monto * (interesMensual * Math.pow(1 + interesMensual, plazo))) / (Math.pow(1 + interesMensual, plazo) - 1)

  const totalPagar = cuota * plazo
  const totalIntereses = totalPagar - monto

  // Calculate percentages
  const capitalPercent = (monto / totalPagar) * 100
  const interestPercent = (totalIntereses / totalPagar) * 100

  // ===== UPDATE UI WITH ANIMATIONS =====

  // Animate main values
  animateValue(document.getElementById("simCuotaMensual"), 0, cuota, 800, "", true)

  setTimeout(() => {
    animateValue(document.getElementById("simTotalPagar"), 0, totalPagar, 1000, "", true)
  }, 200)

  setTimeout(() => {
    animateValue(document.getElementById("simTotalIntereses"), 0, totalIntereses, 1000, "", true)
  }, 400)

  // Update percentages
  document.getElementById("simCapitalPercent").textContent = capitalPercent.toFixed(1) + "%"
  document.getElementById("simInterestPercent").textContent = interestPercent.toFixed(1) + "%"

  // Animate donut chart
  const donutFill = document.getElementById("simDonutFill")
  const circumference = 2 * Math.PI * 40 // radius = 40
  const dashArray = (capitalPercent / 100) * circumference

  // Reset and animate
  donutFill.style.transition = "none"
  donutFill.style.strokeDasharray = `0 ${circumference}`

  setTimeout(() => {
    donutFill.style.transition = "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)"
    donutFill.style.strokeDasharray = `${dashArray} ${circumference}`
  }, 100)

  // Add success class to result cards
  document.querySelectorAll(".sim-result-card").forEach((card, index) => {
    card.classList.remove("calculated")
    setTimeout(() => {
      card.classList.add("calculated")
    }, index * 150)
  })

  // Show info about the rate
  const purposeNames = {
    vivienda: "Vivienda",
    vehiculo: "Vehículo",
    educacion: "Educación",
    negocio: "Negocio",
    personal: "Libre Inversión",
    consolidacion: "Consolidación de Deudas",
  }

  showAlert(`Simulación para ${purposeNames[purpose]}\nTasa anual aplicada: ${interesAnual}%`, "info")
}

// ========== UTILITY FUNCTIONS ==========
function formatCurrency(value) {
  const num = Number.parseFloat(value)
  if (isNaN(num)) return "$0"
  return "$" + Math.round(num).toLocaleString("es-CO")
}

function animateValue(element, start, end, duration, suffix = "", isCurrency = false) {
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // easeOutExpo for smoother animation
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

    const current = start + (end - start) * easeProgress

    if (isCurrency) {
      element.textContent = formatCurrency(current)
    } else {
      element.textContent = Math.round(current) + suffix
    }

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

function showAlert(message, type = "error") {
  // Remove existing alerts
  const existing = document.querySelector(".custom-alert")
  if (existing) existing.remove()

  // Create alert element
  const alert = document.createElement("div")
  alert.className = `custom-alert ${type}`

  const icons = {
    error:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    success:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    warning:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  }

  alert.innerHTML = `
    <div class="alert-icon">${icons[type]}</div>
    <div class="alert-message">${message.replace(/\n/g, "<br>")}</div>
    <button class="alert-close" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `

  document.body.appendChild(alert)

  // Trigger animation
  setTimeout(() => alert.classList.add("show"), 10)

  // Auto remove after 5 seconds
  setTimeout(() => {
    alert.classList.remove("show")
    setTimeout(() => alert.remove(), 300)
  }, 5000)
}

// Add CSS for alerts dynamically
const alertStyles = document.createElement("style")
alertStyles.textContent = `
  .custom-alert {
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    padding: 16px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    z-index: 10000;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 4px solid;
  }
  .custom-alert.show { transform: translateX(0); }
  .custom-alert.error { border-color: #ef4444; }
  .custom-alert.success { border-color: #10b981; }
  .custom-alert.warning { border-color: #f59e0b; }
  .custom-alert.info { border-color: #3b82f6; }
  .custom-alert .alert-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  .custom-alert.error .alert-icon { color: #ef4444; }
  .custom-alert.success .alert-icon { color: #10b981; }
  .custom-alert.warning .alert-icon { color: #f59e0b; }
  .custom-alert.info .alert-icon { color: #3b82f6; }
  .custom-alert .alert-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
  }
  .custom-alert .alert-close {
    background: none;
    border: none;
    padding: 0;
    width: 20px;
    height: 20px;
    cursor: pointer;
    color: #9ca3af;
    transition: color 0.2s;
  }
  .custom-alert .alert-close:hover { color: #374151; }
  
  /* Additional animation classes */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-pop {
    animation: pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .result-card.pulse {
    animation: pulse-border 1s ease;
  }
  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 rgba(24, 79, 59, 0.4); }
    50% { box-shadow: 0 0 0 10px rgba(24, 79, 59, 0); }
  }
  
  .sim-result-card.calculated {
    animation: highlight 0.5s ease;
  }
  @keyframes highlight {
    0% { background: rgba(24, 79, 59, 0.1); }
    100% { background: white; }
  }
  
  /* Totals row styling */
  .totals-row {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    font-weight: 600;
  }
  .totals-row td {
    border-top: 2px solid var(--color-primary);
    padding-top: 12px !important;
    padding-bottom: 12px !important;
  }
  
  /* Month badge */
  .month-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
  }
  
  /* Currency styling in table */
  .currency.capital { color: var(--color-primary); }
  .currency.interest { color: #f59e0b; }
  .currency.balance { color: #6b7280; }
  
  /* Probability bar colors */
  .probability-fill.low { background: linear-gradient(90deg, #10b981, #34d399); }
  .probability-fill.medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .probability-fill.high { background: linear-gradient(90deg, #ef4444, #f87171); }
  .probability-fill.very-high { background: linear-gradient(90deg, #7f1d1d, #ef4444); }
  
  /* Risk badge colors */
  .diagnosis-badge.low { background: linear-gradient(135deg, #10b981, #059669); }
  .diagnosis-badge.medium { background: linear-gradient(135deg, #f59e0b, #d97706); }
  .diagnosis-badge.high { background: linear-gradient(135deg, #ef4444, #dc2626); }
  .diagnosis-badge.very-high { background: linear-gradient(135deg, #7f1d1d, #991b1b); }
`
document.head.appendChild(alertStyles)
