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
  constructor(pileNum, pileDiv) {
    this.cards = [];
    this.numRevealed = 0;
    this.pileNum = pileNum;
    this.pileDiv = pileDiv;
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
      makeChildCardDiv("placeholder.png", this.pileDiv, this.pileNum, -1);
      return;
    }

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

const deckColumn = document.getElementById("deck-column");
makeChildCard("red_back.png", deckColumn);
let dealtPile = [];
makeChildCard("placeholder.png", deckColumn);

deckColumn.children[0].onclick = () => {
  if (myDeck.size === 0) {
    if (dealtPile.length > 0) {
      dealtPile.reverse();
      myDeck.addCards(...dealtPile);
      dealtPile = [];
      deckColumn.children[0].src = addPath("red_back.png");
      deckColumn.children[1].src = addPath("placeholder.png");
    }
  } else {
    dealtPile.push(myDeck.dealOne());
    deckColumn.children[1].src = addPath(peek(dealtPile).filename);
  }

  if (myDeck.size === 0) {
    deckColumn.children[0].src = addPath("redo.png");
  }
};

const pilesDiv = document.getElementById("piles");
for (let i = 0; i < 7; i++) {
  let curPile = new SolitairePile(i, pilesDiv.children[i]);
  for (let j = 0; j < i; j++) {
    curPile.addCard(myDeck.dealOne(), false);
  }
  curPile.addCard(myDeck.dealOne());

  piles.push(curPile);
  curPile.updateDiv();
}

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

    let sourceCardIndex = dragged.indexInPile;
    // console.log(`moving from pile ${sourcePileIndex} at index ${sourceCardIndex} to pile ${destPileIndex}`);

    piles[destPileIndex].addCards(
      piles[sourcePileIndex].removeCards(
        piles[sourcePileIndex].size - sourceCardIndex
      )
    );

    piles[sourcePileIndex].updateDiv();
    piles[destPileIndex].updateDiv();
  }
});
