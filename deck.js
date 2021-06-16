/***** Utility Functions *****/

const makeInverseMap = (forwardMap) => {
  let inverseMap = {};
  for (key in forwardMap) {
    inverseMap[forwardMap[key]] = key;
  }
  return inverseMap;
};

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

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
    for (key in this.forwardMap) {
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
}

/***** Decks *****/
class Deck {
  constructor(jokers = false) {
    this.deck = [];

    for (suit of SuitList) {
      for (rank of RankList) {
        this.deck.push(
          new Card(CardRanks.getValue(rank), CardSuits.getValue(suit))
        );
      }
    }
    if (jokers) {
      for (color of ColorList) {
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

  shuffle() {}
}

/***** Test code *****/
