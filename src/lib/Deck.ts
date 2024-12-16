export interface CardData { rank: any, suit: string } // rank is any because string | number upsets the typechecker

// Mostly created by ChatGPT
class CardDeck {
	public cards: CardData[];
	private currentIndex: number;

	constructor(suits: string[], ranks: any[]) {
		this.cards = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				this.cards.push({ rank: rank, suit: rank == "wild" || rank == "plus4" ? "black" : suit });
			}
		}

		// Shuffle the deck and reset the current index
		this.shuffle();
		this.currentIndex = 0;
	}

	// Shuffle the cards using Fisher-Yates algorithm
	private shuffle(): void {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // Swap elements
		}
	}

	// Return the next card from the deck (without duplicates)
	public drawNextCard(): CardData {
		if (this.currentIndex >= this.cards.length) this.resetDeck(); // In case there are no cards left
		return this.cards[this.currentIndex++];
	}

	// Reset the deck to its original shuffled state
	public resetDeck(): void {
		this.shuffle();
		this.currentIndex = 0;
	}

	// Check if the deck has cards remaining
	public hasCards(): boolean {
		return this.currentIndex < this.cards.length;
	}
}

export class Deck extends CardDeck {
	constructor() {
		super(
			['hearts', 'diamonds', 'clubs', 'spades'],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
		);
	}
}

export class UnoDeck extends CardDeck {
	constructor() {
		super(
			['red', 'gold', 'green', 'blue'],
			[0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, "reverse", "reverse", "skip", "skip", "plus2", "plus2", "plus4", "wild"]
		);
	}
}