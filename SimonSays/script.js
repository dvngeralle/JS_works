const startBtnEl    = document.querySelector('#start-btn')
const statusTextEl  = document.querySelector('#status-text')
const roundDisplayEl = document.querySelector('#round-display')
const bestScoreEl   = document.querySelector('#best-score')
const cardEls       = document.querySelectorAll('.card')

const CARDS_COUNT  = 4
const LIT_MS       = 500
const PAUSE_MS     = 300
const COUNTDOWN    = ['Ready', 'Set', 'Go!']
const COUNTDOWN_MS = 700
const CARD_FREQS   = [329.63, 261.63, 392.00, 523.25]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

const playTone = (freq, durationMs = 300) => {
  const oscillator = audioCtx.createOscillator()
  const gain       = audioCtx.createGain()

  oscillator.type            = 'sine'
  oscillator.frequency.value = freq
  gain.gain.value            = 0.25

  oscillator.connect(gain)
  gain.connect(audioCtx.destination)

  oscillator.start()
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000)
  oscillator.stop(audioCtx.currentTime + durationMs / 1000)
}

const playErrorTone = () => {
  const oscillator = audioCtx.createOscillator()
  const gain       = audioCtx.createGain()

  oscillator.type            = 'sawtooth'
  oscillator.frequency.value = 110
  gain.gain.value            = 0.3

  oscillator.connect(gain)
  gain.connect(audioCtx.destination)

  oscillator.start()
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6)
  oscillator.stop(audioCtx.currentTime + 0.6)
}

const state = {
  sequence:      [],
  userStep:      0,
  isPlaying:     false,
  bestScore:     Number(localStorage.getItem('simon-best') ?? 0),
}

const getCard = (index) => document.querySelector(`#card-${index}`)

const setStatus = (text, highlight = false) => {
  statusTextEl.textContent = text
  statusTextEl.classList.toggle('highlight', highlight)
}

const setInteractive = (enabled) => {
  cardEls.forEach((card) => card.classList.toggle('interactive', enabled))
}

const litCard = async (index) => {
  const card = getCard(index)
  card.classList.add('lit')
  playTone(CARD_FREQS[index], LIT_MS)
  await sleep(LIT_MS)
  card.classList.remove('lit')
}

const playWrongAnimation = async (index) => {
  const card = getCard(index)
  card.classList.add('wrong')
  playErrorTone()
  await sleep(500)
  card.classList.remove('wrong')
}

const saveBestScore = (score) => {
  if (score <= state.bestScore) return
  state.bestScore = score
  localStorage.setItem('simon-best', score)
  bestScoreEl.textContent = score
}

const runCountdown = async () => {
  await COUNTDOWN.reduce(async (prev, word) => {
    await prev
    setStatus(word, true)
    await sleep(COUNTDOWN_MS)
  }, Promise.resolve())
}

const playSequence = async () => {
  setStatus('Watch carefully…', false)
  setInteractive(false)

  await state.sequence.reduce(async (prev, index) => {
    await prev
    await sleep(PAUSE_MS)
    await litCard(index)
  }, Promise.resolve())
}

const appendToSequence = () => {
  const next = Math.floor(Math.random() * CARDS_COUNT)
  state.sequence = [...state.sequence, next]
}

const startRound = async () => {
  state.userStep = 0
  appendToSequence()

  const round = state.sequence.length
  roundDisplayEl.textContent = round

  await runCountdown()
  await playSequence()

  setStatus('Your turn!', true)
  setInteractive(true)
}

const endGame = async (wrongIndex) => {
  setInteractive(false)
  state.isPlaying = false

  await playWrongAnimation(wrongIndex)

  const reached = state.sequence.length
  saveBestScore(reached)

  setStatus(`Game over — you reached round ${reached}`, false)
  roundDisplayEl.textContent = '—'
  startBtnEl.textContent = 'Restart'
}

const handleCardClick = async (index) => {
  if (!state.isPlaying) return

  const expected = state.sequence[state.userStep]

  if (index !== expected) {
    await endGame(index)
    return
  }

  await litCard(index)
  state.userStep += 1

  if (state.userStep < state.sequence.length) return

  setInteractive(false)
  setStatus('Correct!', true)
  await sleep(700)
  await startRound()
}

const startGame = async () => {
  if (state.isPlaying) return

  state.sequence  = []
  state.userStep  = 0
  state.isPlaying = true
  startBtnEl.textContent = 'Playing…'

  await startRound()
}

const init = () => {
  bestScoreEl.textContent = state.bestScore

  cardEls.forEach((card) => {
    card.addEventListener('click', () => {
      if (!card.classList.contains('interactive')) return
      const index = Number(card.dataset.index)
      handleCardClick(index)
    })
  })

  startBtnEl.addEventListener('click', startGame)
}

init()
