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

const randBetween = (min, max) => min + Math.floor(Math.random() * (max-min)); 

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
    for (let card of this.deck) {
      yield card;
    }

    return this;
  }

  shuffle() {
    for (let i = this.deck.length; i > 1; i--) {
      let curSwapIndex = randBetween(0, i);

      if (curSwapIndex > 0) {
        let temp = this.deck[i-1];
        this.deck[i-1] = this.deck[curSwapIndex];
        this.deck[curSwapIndex] = temp;
      }
    }
  }
}

/***** Test code *****/
let myDeck = new Deck(true);
// for (let card of myDeck) {
//   console.log(card.name);
// }
myDeck.shuffle();
for (let card of myDeck) {
  console.log(card.name);
}

