import { writable } from "svelte/store";

export class UserData {
	// Throw error to prevent server from accessing this class; localStorage is only accessible to the client.
	constructor() {
		if (typeof window === "undefined") throw new Error("This class can only be used in the browser.");
	}
	
	private static _username: string = "Guest";
	private static _coins: number = 0;

	public static value = writable({
		username: UserData._username,
		coins: UserData._coins
	})

	private static updateWritable() {
		UserData.value.set({
			username: UserData._username,
			coins: UserData._coins
		})
	}

	public static get username(): string { return UserData._username; }
	public static get coins(): number { return UserData._coins; }

	public static set username(value: string) {
		UserData._username = value;
		localStorage.setItem("username", value);
		UserData.updateWritable();
	}

	public static set coins(value: number) {
		UserData._coins = value;
		localStorage.setItem("coins", value.toString());
		UserData.updateWritable();
	}
	public static addCoins(value: number) {
		UserData._coins += value;
		localStorage.setItem("coins", UserData._coins.toString());
		UserData.updateWritable();
	}
}

if (typeof window != "undefined") {
	UserData.username = localStorage.getItem("username") || "Guest";
	UserData.coins = parseInt(localStorage.getItem("coins")) || 0;
}