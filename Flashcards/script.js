const cardFrontInput = document.querySelector("#card-front")
const cardBackInput = document.querySelector("#card-back")
const addBtn = document.querySelector("#add-btn")
const cancelEditBtn = document.querySelector("#cancel-edit-btn")
const tableBody = document.querySelector("#table-body")
const currentCardDisplay = document.querySelector("#current-card-display")
const deckSelector = document.querySelector(".deck-selector")
const onlyUnlearnedCheckbox = document.querySelector("#only-unlearned")

let decks = JSON.parse(localStorage.getItem("flashcards-decks")) || {
  Основная: [],
}
let currentDeckName = "Основная"
let editingIndex = null
let studyIndex = 0
let isFlipped = false

const saveData = () => {
  localStorage.setItem("flashcards-decks", JSON.stringify(decks))
}

const getCurrentDeck = () => decks[currentDeckName] || []

const renderDeckSelector = () => {
  deckSelector.innerHTML = ""
  Object.keys(decks).map((name) => {
    const tab = document.createElement("div")
    tab.className = `deck-tab ${name === currentDeckName ? "active" : ""}`
    tab.textContent = name
    tab.addEventListener("click", () => {
      currentDeckName = name
      editingIndex = null
      resetEditForm()
      renderAll()
    })
    deckSelector.appendChild(tab)
  })

  const addDeckBtn = document.createElement("button")
  addDeckBtn.textContent = "+ Колода"
  addDeckBtn.className = "btn-secondary"
  addDeckBtn.addEventListener("click", () => {
    const name = prompt("Название новой колоды:")
    if (name && name.trim()) {
      decks[name.trim()] = []
      currentDeckName = name.trim()
      renderAll()
    }
  })
  deckSelector.appendChild(addDeckBtn)
}

const renderTable = () => {
  tableBody.innerHTML = getCurrentDeck()
    .map(
      (card, index) => `
    <tr>
      <td>${card.front}</td>
      <td>${card.back}</td>
      <td>
        <input type="checkbox" ${card.isLearned ? "checked" : ""} data-index="${index}" class="learned-toggle">
        ${card.isLearned ? "Выучено" : "Учить"}
      </td>
      <td>
        <button class="btn-secondary edit-card-btn" data-index="${index}">Редакт.</button>
        <button class="btn-danger delete-card-btn" data-index="${index}">Удалить</button>
      </td>
    </tr>
  `,
    )
    .join("")

  document
    .querySelectorAll(".learned-toggle")
    .forEach((el) =>
      el.addEventListener("change", (e) =>
        toggleLearned(e.target.dataset.index),
      ),
    )
  document
    .querySelectorAll(".edit-card-btn")
    .forEach((el) =>
      el.addEventListener("click", (e) => editCard(e.target.dataset.index)),
    )
  document
    .querySelectorAll(".delete-card-btn")
    .forEach((el) =>
      el.addEventListener("click", (e) => deleteCard(e.target.dataset.index)),
    )
}

const getStudyCards = () =>
  onlyUnlearnedCheckbox.checked
    ? getCurrentDeck().filter((c) => !c.isLearned)
    : getCurrentDeck()

const renderStudyCard = () => {
  const studyCards = getStudyCards()
  const positionEl = document.querySelector("#card-position")

  if (studyCards.length === 0) {
    currentCardDisplay.textContent = "Нет карточек"
    positionEl.textContent = "0 / 0"
    return
  }

  if (studyIndex >= studyCards.length) studyIndex = 0
  const card = studyCards[studyIndex]
  currentCardDisplay.textContent = isFlipped ? card.back : card.front
  currentCardDisplay.classList.toggle("flipped", isFlipped)
  positionEl.textContent = `${studyIndex + 1} / ${studyCards.length}`
}

const addOrUpdateCard = () => {
  const front = cardFrontInput.value.trim()
  const back = cardBackInput.value.trim()
  if (!front || !back) return

  const deck = getCurrentDeck()
  if (editingIndex !== null) {
    deck[editingIndex] = { ...deck[editingIndex], front, back }
  } else {
    deck.push({ id: Date.now(), front, back, isLearned: false })
  }

  saveData()
  resetEditForm()
  renderAll()
}

const resetEditForm = () => {
  editingIndex = null
  cardFrontInput.value = ""
  cardBackInput.value = ""
  addBtn.textContent = "Создать карточку"
  cancelEditBtn.style.display = "none"
}

const editCard = (index) => {
  const card = getCurrentDeck()[index]
  cardFrontInput.value = card.front
  cardBackInput.value = card.back
  editingIndex = parseInt(index)
  addBtn.textContent = "Сохранить"
  cancelEditBtn.style.display = "inline-block"
}

const deleteCard = (index) => {
  decks[currentDeckName].splice(index, 1)
  saveData()
  renderAll()
}

const toggleLearned = (index) => {
  decks[currentDeckName][index].isLearned =
    !decks[currentDeckName][index].isLearned
  saveData()
  renderAll()
}

const shuffleArray = (arr) =>
  arr
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)

const handleShuffle = () => {
  decks[currentDeckName] = shuffleArray(getCurrentDeck())
  saveData()
  renderAll()
}

const renderAll = () => {
  renderDeckSelector()
  renderTable()
  renderStudyCard()
}

document.querySelector("#add-btn").addEventListener("click", addOrUpdateCard)
document
  .querySelector("#cancel-edit-btn")
  .addEventListener("click", resetEditForm)
document.querySelector("#shuffle-btn").addEventListener("click", handleShuffle)
document.querySelector("#study-shuffle-btn").addEventListener("click", () => {
  handleShuffle()
  studyIndex = 0
})
document.querySelector("#prev-btn").addEventListener("click", () => {
  studyIndex =
    (studyIndex - 1 + getStudyCards().length) % getStudyCards().length
  isFlipped = false
  renderStudyCard()
})
document.querySelector("#next-btn").addEventListener("click", () => {
  studyIndex = (studyIndex + 1) % getStudyCards().length
  isFlipped = false
  renderStudyCard()
})
document.querySelector("#flip-btn").addEventListener("click", () => {
  isFlipped = !isFlipped
  renderStudyCard()
})
document
  .querySelector("#current-card-display")
  .addEventListener("click", () => {
    isFlipped = !isFlipped
    renderStudyCard()
  })
onlyUnlearnedCheckbox.addEventListener("change", () => {
  studyIndex = 0
  renderStudyCard()
})

renderAll()
setInterval(saveData, 3000)
