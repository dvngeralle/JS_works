let p1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
let p2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
let currentPlayer = 1

let rollBtn = document.querySelector("#roll-btn")
let diceRes = document.querySelector("#dice-res")

render()

rollBtn.addEventListener("click", function () {
  let d1 = Math.floor(Math.random() * 6) + 1
  let d2 = Math.floor(Math.random() * 6) + 1
  let sum = d1 + d2

  diceRes.innerHTML = "Выпало: " + d1 + " и " + d2 + " (Сумма: " + sum + ")"
  rollBtn.disabled = true

  if (currentPlayer === 1) {
    currentCards = p1
  } else {
    currentCards = p2
  }
  let actionBox = document.querySelector("#actions" + currentPlayer)
  actionBox.innerHTML = ""

  let canMove = false

  if (currentCards.includes(d1)) {
    if (currentCards.includes(d2)) {
      if (d1 !== d2) {
        createBtn(actionBox, "Закрыть " + d1 + " и " + d2, [d1, d2])
        canMove = true
      }
    }
  }

  if (currentCards.includes(sum)) {
    createBtn(actionBox, "Закрыть сумму " + sum, [sum])
    canMove = true
  }

  if (!canMove) {
    diceRes.innerHTML += " — Ходов нет! Переход хода..."
    setTimeout(nextTurn, 1200)
  }
})

function createBtn(box, text, nums) {
  let b = document.createElement("button")
  b.innerHTML = text
  b.onclick = function () {
    let currentCards = currentPlayer === 1 ? p1 : p2

    for (let n of nums) {
      let index = currentCards.indexOf(n)
      currentCards.splice(index, 1)
    }

    if (currentCards.length === 0) {
      alert("Игрок " + currentPlayer + " ПОБЕДИЛ!")
      location.reload()
    } else {
      nextTurn()
    }
  }
  box.appendChild(b)
}

function nextTurn() {
  document.querySelector("#actions1").innerHTML = ""
  document.querySelector("#actions2").innerHTML = ""

  currentPlayer = currentPlayer === 1 ? 2 : 1

  document
    .querySelector("#p1-box")
    .classList.toggle("active", currentPlayer === 1)
  document
    .querySelector("#p2-box")
    .classList.toggle("active", currentPlayer === 2)

  rollBtn.disabled = false
  render()
}

function render() {
  let h1 = ""
  for (let i = 1; i <= 12; i++) {
    let cls = p1.includes(i) ? "" : "closed"
    h1 += "<span class='" + cls + "'>" + i + "</span>"
  }
  document.querySelector("#cards1").innerHTML = h1

  let h2 = ""
  for (let i = 1; i <= 12; i++) {
    let cls = p2.includes(i) ? "" : "closed"
    h2 += "<span class='" + cls + "'>" + i + "</span>"
  }
  document.querySelector("#cards2").innerHTML = h2
}
