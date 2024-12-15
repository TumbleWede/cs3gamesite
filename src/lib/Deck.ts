// Written by ChatGPT because I'm tired.
export interface CardData { rank: number, suit: string } // This part written by me though cause I actually understand what this code is doing
export class Deck {
	public cards: CardData[];
	private currentIndex: number;

	constructor() {
		// Define a standard deck of 52 cards
		const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
		const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

		// Create the deck of cards as strings like '2 of hearts', 'A of spades', etc.
		this.cards = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				this.cards.push({ rank, suit });
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