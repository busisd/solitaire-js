"use strict";

/***** Utility Functions *****/

const makeInverseMap = (forwardMap) => {
  let inverseMap = {};
  for (let key in forwardMap) {
    inverseMap[forwardMap[key]] = key;
  }
  return inverseMap;
};

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

const randBetween = (min, max) => min + Math.floor(Math.random() * (max - min));

const peek = (arr) => arr[arr.length - 1];

const positionInParent = (el) =>
  Array.from(el.parentElement.children).indexOf(el);

const addPath = (str) => "images/" + str;

const removeAllChildren = (el) => {
  while (el.children.length > 0) el.removeChild(el.firstChild);
};

const oppositeColors = (c1, c2) => c1 !== c2;

const makeChildCard = (filename, parent, draggable = false) => {
  let newCardImg = document.createElement("img");
  newCardImg.src = addPath(filename);
  newCardImg.className = "card";
  newCardImg.setAttribute("draggable", draggable.toString());
  parent.appendChild(newCardImg);
  return newCardImg;
};

const makeChildCardDiv = (
  filename,
  parent,
  pileNum,
  indexInPile,
  draggable = false
) => {
  let newCardDiv = document.createElement("div");
  newCardDiv.setAttribute("draggable", draggable.toString());
  let newCardImg = makeChildCard(filename, newCardDiv);
  parent.appendChild(newCardDiv);

  newCardImg.pileNum = pileNum;
  newCardImg.indexInPile = indexInPile;
  newCardDiv.pileNum = pileNum;
  newCardDiv.indexInPile = indexInPile;

  return newCardDiv;
};

/***** TwoWayMap *****/
class TwoWayMap {
  constructor(forwardMap) {
    this.forwardMap = forwardMap;
    this.inverseMap = makeInverseMap(forwardMap);
  }

  getValue(key) {
    return this.forwardMap[key];
  }

  getKey(value) {
    return this.inverseMap[value];
  }

  hasKey(key) {
    return key in this.forwardMap;
  }

  hasValue(value) {
    return value in this.inverseMap;
  }

  *[Symbol.iterator]() {
    for (let key in this.forwardMap) {
      yield key;
    }

    return this;
  }
}

/***** Constants *****/
const SuitList = ["diamonds", "clubs", "spades", "hearts"];
const ColorList = ["red", "black"];
const RankList = [
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "jack",
  "queen",
  "king",
];

const CardSuits = new TwoWayMap({
  none: 0,
  diamonds: 1,
  clubs: 2,
  spades: 3,
  hearts: 4,
});
const CardColors = new TwoWayMap({
  red: 0,
  black: 1,
});
const CardRanks = new TwoWayMap({
  joker: 0,
  ace: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  jack: 11,
  queen: 12,
  king: 13,
});

const PileIds = new TwoWayMap({
  pile0: 0,
  pile1: 1,
  pile2: 2,
  pile3: 3,
  pile4: 4,
  pile5: 5,
  pile6: 6,
  dealtPile: 7,
  diamondsPile: 8,
  clubsPile: 9,
  spadesPile: 10,
  heartsPile: 11,
});

const validateSourcePile = (id) => id >= 0 && id <= 11;
const validateDestPile = (id) =>
  id >= 0 && id <= 11 && id != PileIds.getValue("dealtPile");

/***** Card class *****/
class Card {
  constructor(rank, suit = CardSuits.getValue("none"), color = 0) {
    this.rank = rank;
    this.suit = suit;

    switch (this.suit) {
      case CardSuits.getValue("hearts"):
      case CardSuits.getValue("diamonds"):
        this.color = CardColors.getValue("red");
        break;
      case CardSuits.getValue("clubs"):
      case CardSuits.getValue("spades"):
        this.color = CardColors.getValue("black");
        break;
      default:
        this.color = color;
    }
  }

  get rankName() {
    return CardRanks.getKey(this.rank);
  }

  get suitName() {
    return CardSuits.getKey(this.suit);
  }

  get colorName() {
    return CardColors.getKey(this.color);
  }

  get name() {
    if (this.rank === CardRanks.getValue("joker")) {
      return capitalize(this.colorName) + " " + capitalize(this.rankName);
    }

    return capitalize(this.rankName) + " of " + capitalize(this.suitName);
  }

  get filename() {
    if (this.rank === CardRanks.getValue("joker")) {
      return this.colorName + "_" + this.rankName + ".png";
    }

    return this.rankName + "_" + this.suitName + ".png";
  }
}

/***** Decks *****/
class Deck {
  constructor(jokers = false) {
    this.deck = [];

    for (let suit of SuitList) {
      for (let rank of RankList) {
        this.deck.push(
          new Card(CardRanks.getValue(rank), CardSuits.getValue(suit))
        );
      }
    }
    if (jokers) {
      for (let color of ColorList) {
        this.deck.push(
          new Card(
            CardRanks.getValue("joker"),
            CardSuits.getValue("none"),
            CardColors.getValue(color)
          )
        );
      }
    }
  }

  *[Symbol.iterator]() {
    for (let i = this.deck.length - 1; i >= 0; i--) {
      yield this.deck[i];
    }

    return this;
  }

  shuffle() {
    for (let i = this.deck.length; i > 1; i--) {
      let curSwapIndex = randBetween(0, i);

      if (curSwapIndex < i - 1) {
        let temp = this.deck[i - 1];
        this.deck[i - 1] = this.deck[curSwapIndex];
        this.deck[curSwapIndex] = temp;
      }
    }
  }

  dealOne() {
    return this.deck.pop();
  }

  get size() {
    return this.deck.length;
  }

  addCards(...cards) {
    for (let card of cards) {
      this.deck.push(card);
    }
  }
}

class SolitairePile {
  constructor(pileNum, pileDiv, flat = false, acceptanceRule = () => true, placeholder = "placeholder.png") {
    this.cards = [];
    this.numRevealed = 0;
    this.pileNum = pileNum;
    this.pileDiv = pileDiv;
    this.flat = flat;
    this.acceptanceRule = acceptanceRule;
    this.placeholder = placeholder;
  }

  filenameAtIndex(index) {
    if (this.cards.length - index - 1 < this.numRevealed)
      return this.cards[index].filename;
    else return "red_back.png";
  }

  visibleAtIndex(index) {
    return this.cards.length - index - 1 < this.numRevealed;
  }

  *getFilenames() {
    for (let i = 0; i < this.cards.length; i++) {
      yield this.filenameAtIndex(i);
    }

    return this;
  }

  shouldAcceptCards(cardArr) {
    return this.acceptanceRule(cardArr, this.peekCard());
  }

  peekCard(index = this.cards.length - 1) {
    if (this.cards.length === 0) return null;

    return this.cards[index];
  }

  peekCards(index) {
    if (this.cards.length === 0) return null;

    return this.cards.slice(index);
  }

  addCard(card, revealed = true) {
    this.cards.push(card);

    if (revealed) this.numRevealed++;
  }

  addCards(cardArr, revealed = true) {
    for (let card of cardArr) this.cards.push(card);

    if (revealed) this.numRevealed += cardArr.length;
  }

  removeCard() {
    if (this.numRevealed > 1) this.numRevealed--;

    return this.cards.pop();
  }

  removeCards(numToRemove) {
    if (numToRemove >= this.cards.length) {
      let cardsToReturn = this.cards;
      this.cards = [];
      this.numRevealed = 0;
      return cardsToReturn;
    }

    let cardsToReturn = this.cards.slice(this.cards.length - numToRemove);
    this.cards = this.cards.slice(0, this.cards.length - numToRemove);
    this.numRevealed = Math.max(this.numRevealed - numToRemove, 1);
    return cardsToReturn;
  }

  updateDiv() {
    removeAllChildren(this.pileDiv);

    if (this.cards.length === 0) {
      makeChildCardDiv(this.placeholder, this.pileDiv, this.pileNum, -1);
      return;
    }

    if (!this.flat) {
      let curParent = this.pileDiv;
      for (let i = 0; i < this.cards.length; i++) {
        curParent = makeChildCardDiv(
          this.filenameAtIndex(i),
          curParent,
          this.pileNum,
          i,
          this.visibleAtIndex(i)
        );
      }
    } else {
      makeChildCardDiv(
        this.filenameAtIndex(this.cards.length - 1),
        this.pileDiv,
        this.pileNum,
        this.cards.length - 1,
        true
      );
    }
  }

  get size() {
    return this.cards.length;
  }
}

// let myDeck = new Deck();
// myDeck.shuffle();
// for (let card of myDeck) {
//   makeChildCard(card.filename);
// }

let myDeck = new Deck();
myDeck.shuffle();
let piles = [];

const pileValidate = (cards, topCard) =>
  (topCard === null && cards[0].rank === CardRanks.getValue("king")) ||
  (topCard !== null && cards[0].rank === topCard.rank - 1 && oppositeColors(cards[0].color, topCard.color));

const suitPileValidate = (suit) => (cards, topCard) =>
  cards.length === 1 &&
  cards[0].suit === CardSuits.getValue(suit) &&
  ((topCard === null && cards[0].rank === CardRanks.getValue("ace")) ||
    (topCard !== null && cards[0].rank === topCard.rank + 1));

const deckDiv = document.getElementById("deck");
const dealtPileDiv = document.getElementById("dealt-pile");
makeChildCard("red_back.png", deckDiv);
let dealtPile = new SolitairePile(
  PileIds.getValue("dealtPile"),
  dealtPileDiv,
  true,
  () => false
);
dealtPile.updateDiv();

let diamondsPile = new SolitairePile(
  PileIds.getValue("diamondsPile"),
  document.getElementById("diamonds-pile"),
  true,
  suitPileValidate("diamonds"),
  "placeholder_diamonds.png"
);
let clubsPile = new SolitairePile(
  PileIds.getValue("clubsPile"),
  document.getElementById("clubs-pile"),
  true,
  suitPileValidate("clubs"),
  "placeholder_clubs.png"
);
let spadesPile = new SolitairePile(
  PileIds.getValue("spadesPile"),
  document.getElementById("spades-pile"),
  true,
  suitPileValidate("spades"),
  "placeholder_spades.png"
);
let heartsPile = new SolitairePile(
  PileIds.getValue("heartsPile"),
  document.getElementById("hearts-pile"),
  true,
  suitPileValidate("hearts"),
  "placeholder_hearts.png"
);
diamondsPile.updateDiv();
clubsPile.updateDiv();
spadesPile.updateDiv();
heartsPile.updateDiv();

deckDiv.onclick = () => {
  if (myDeck.size === 0) {
    if (dealtPile.size > 0) {
      let dealtPileCards = dealtPile.removeCards(dealtPile.size);
      dealtPileCards.reverse();
      myDeck.addCards(...dealtPileCards);
      deckDiv.children[0].src = addPath("red_back.png");
      dealtPile.updateDiv();
    }
  } else {
    dealtPile.addCard(myDeck.dealOne());
    dealtPile.updateDiv();
  }

  if (myDeck.size === 0) {
    deckDiv.children[0].src = addPath("redo.png");
  }
};

const pilesDiv = document.getElementById("piles");
for (let i = 0; i < 7; i++) {
  let curPile = new SolitairePile(i, pilesDiv.children[i], false, pileValidate);
  for (let j = 0; j < i; j++) {
    curPile.addCard(myDeck.dealOne(), false);
  }
  curPile.addCard(myDeck.dealOne());

  piles.push(curPile);
  curPile.updateDiv();
}
piles.push(dealtPile);
piles.push(diamondsPile);
piles.push(clubsPile);
piles.push(spadesPile);
piles.push(heartsPile);

// for (let i = 0; i < piles.length; i++) {
//   for (let filename of piles[i].getFilenames()) {
//     makeChildCard(filename, pilesDiv.children[i]);
//   }

//   peek(pilesDiv.children[i].children).setAttribute("draggable", "true");
// }

/***** Drag and Drop *****/
let dragged = null;

document.addEventListener("dragstart", (e) => {
  dragged = e.target;
});

document.addEventListener("dragover", (e) => e.preventDefault());

document.addEventListener("drop", (e) => {
  e.preventDefault();

  // console.log("drop - dragged: ", dragged, "dropped: ", e.target);
  if ("pileNum" in e.target && "pileNum" in dragged) {
    let sourcePileIndex = dragged.pileNum;
    let destPileIndex = e.target.pileNum;

    if (sourcePileIndex === destPileIndex) return;
    // if (!validateSourcePile(sourcePileIndex)) return;
    // if (!validateDestPile(destPileIndex)) return;

    let sourceCardIndex = dragged.indexInPile;
    // console.log(`moving from pile ${sourcePileIndex} at index ${sourceCardIndex} to pile ${destPileIndex}`);

    let cardsToMove = piles[sourcePileIndex].peekCards(sourceCardIndex);
    if (!piles[destPileIndex].shouldAcceptCards(cardsToMove)) return;

    piles[destPileIndex].addCards(
      piles[sourcePileIndex].removeCards(
        piles[sourcePileIndex].size - sourceCardIndex
      )
    );

    piles[sourcePileIndex].updateDiv();
    piles[destPileIndex].updateDiv();
  }
});
