let player = { name: "", chips: 0 }
let bot = { name: "Bot", chips: 200 }

let playerCards = []
let botCards = []
let playerSum = 0
let botSum = 0
let playerHasBlackjack = false
let gamePhase = "setup" // "setup" | "betting" | "playing" | "result"
let currentBet = 0

let setupEl = document.getElementById("setup-el")
let gameEl = document.getElementById("game-el")
let betSectionEl = document.getElementById("bet-section")
let actionButtonsEl = document.getElementById("action-buttons")
let resultSectionEl = document.getElementById("result-section")
let messageEl = document.getElementById("message-el")
let playerNameEl = document.getElementById("player-name-el")
let playerInfoEl = document.getElementById("player-info-el")
let playerCardsEl = document.getElementById("player-cards-el")
let playerSumEl = document.getElementById("player-sum-el")
let botInfoEl = document.getElementById("bot-info-el")
let botCardsEl = document.getElementById("bot-cards-el")
let botSumEl = document.getElementById("bot-sum-el")

function setupPlayer() {
    let nameVal = document.getElementById("name-input").value.trim()
    let chipsVal = parseInt(document.getElementById("chips-input").value)

    player.name = nameVal || "Player"
    player.chips = (chipsVal > 0) ? chipsVal : 200

    setupEl.style.display = "none"
    gameEl.style.display = "block"
    playerNameEl.textContent = player.name
    updateInfoDisplays()
    gamePhase = "betting"
}

function getRandomCard() {
    let n = Math.floor(Math.random() * 13) + 1
    if (n > 10) return 10
    if (n === 1) return 11
    return n
}

function startGame() {
    if (gamePhase !== "betting") return

    let betVal = parseInt(document.getElementById("bet-input").value)
    if (!betVal || betVal < 1 || betVal > player.chips) {
        messageEl.textContent = "Please enter a valid bet (1 – $" + player.chips + ")."
        return
    }

    currentBet = betVal
    playerCards = [getRandomCard(), getRandomCard()]
    botCards = [getRandomCard(), getRandomCard()]
    playerSum = playerCards[0] + playerCards[1]
    botSum = botCards[0] + botCards[1]
    playerHasBlackjack = false
    gamePhase = "playing"

    betSectionEl.style.display = "none"
    actionButtonsEl.style.display = "block"

    renderPlayerCards()
    renderBotCards(true)

    if (playerSum === 21) {
        playerHasBlackjack = true
        messageEl.textContent = "Blackjack! Standing automatically..."
        setTimeout(stand, 800)
    } else {
        messageEl.textContent = "Draw a new card or stand?"
    }
}

function renderPlayerCards() {
    playerCardsEl.textContent = "Cards: " + playerCards.join("  ")
    playerSumEl.textContent = "Sum: " + playerSum
}

function renderBotCards(hideSecond) {
    if (hideSecond) {
        botCardsEl.textContent = "Cards: " + botCards[0] + "  ?"
        botSumEl.textContent = "Sum: ?"
    } else {
        botCardsEl.textContent = "Cards: " + botCards.join("  ")
        botSumEl.textContent = "Sum: " + botSum
    }
}

function newCard() {
    if (gamePhase !== "playing" || playerHasBlackjack) return

    let card = getRandomCard()
    playerCards.push(card)
    playerSum += card
    renderPlayerCards()

    if (playerSum === 21) {
        playerHasBlackjack = true
        messageEl.textContent = "21! Standing automatically..."
        setTimeout(stand, 800)
    } else if (playerSum > 21) {
        messageEl.textContent = "Busted!"
        endGame()
    } else {
        messageEl.textContent = "Draw a new card or stand?"
    }
}

function stand() {
    if (gamePhase !== "playing") return
    gamePhase = "bot-turn"

    // Bot draws until sum >= 17 (standard dealer rules)
    while (botSum < 17) {
        let card = getRandomCard()
        botCards.push(card)
        botSum += card
    }

    endGame()
}

function determineWinner() {
    let playerBJ = playerSum === 21 && playerCards.length === 2
    let botBJ = botSum === 21 && botCards.length === 2

    if (playerSum > 21) return "bot"
    if (botSum > 21) return "player"
    if (playerBJ && !botBJ) return "player"
    if (botBJ && !playerBJ) return "bot"
    if (playerSum > botSum) return "player"
    if (botSum > playerSum) return "bot"
    return "tie"
}

function endGame() {
    gamePhase = "result"
    actionButtonsEl.style.display = "none"
    renderBotCards(false)

    let winner = determineWinner()

    if (winner === "player") {
        player.chips += currentBet
        bot.chips -= currentBet
        messageEl.textContent = "You win $" + currentBet + "!"
    } else if (winner === "bot") {
        player.chips -= currentBet
        bot.chips += currentBet
        messageEl.textContent = "Bot wins! You lose $" + currentBet + "."
    } else {
        messageEl.textContent = "It's a tie! Bet returned."
    }

    if (bot.chips <= 0) bot.chips = 200
    updateInfoDisplays()

    let playAgainBtn = document.getElementById("play-again-btn")
    if (player.chips <= 0) {
        messageEl.textContent += " You're out of chips! Game over."
        playAgainBtn.disabled = true
    } else {
        playAgainBtn.disabled = false
    }

    resultSectionEl.style.display = "block"
}

function playAgain() {
    playerCards = []
    botCards = []
    playerSum = 0
    botSum = 0
    playerHasBlackjack = false
    currentBet = 0
    gamePhase = "betting"

    playerCardsEl.textContent = "Cards: —"
    playerSumEl.textContent = "Sum: —"
    botCardsEl.textContent = "Cards: —"
    botSumEl.textContent = "Sum: —"
    messageEl.textContent = "Place your bet to start a round!"
    document.getElementById("bet-input").value = ""

    actionButtonsEl.style.display = "none"
    resultSectionEl.style.display = "none"
    betSectionEl.style.display = "block"
}

function updateInfoDisplays() {
    playerInfoEl.textContent = player.name + ": $" + player.chips
    botInfoEl.textContent = "Bot: $" + bot.chips
}
