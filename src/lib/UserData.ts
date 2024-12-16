import { browser } from "$app/environment"; // Boolean to check that the code is running on the browser rather than the server
import { writable } from "svelte/store"; // Used to make variables reactive outside of components

export interface UserData {
	username: string;
	coins: number;
}

// Properties are public by default
export class UserData {
	static value: UserData[] = [{ username: "Server", coins: 0 }];
	private static valueWritable = writable(UserData.value);
	static subscribe = this.valueWritable.subscribe; // So we can say UserData.subscribe instead of UserData.userdataWritable.subscribe
	static initialize() {
		if (!browser) return;
		UserData.value = JSON.parse(localStorage.getItem("value") || '[{"username":"Player","coins":0}]');
		UserData.valueWritable.set(UserData.value);
	}
	static setUsername(value: string) {
		UserData.value[0].username = value;
		UserData.sync();
	}

	static removeUser(index: number) {
		UserData.value.splice(index, 1);
		UserData.sync();
	}

	// Removes the specified user from the list, then adds that user to the beginning
	// That way, the list of users is sorted from most recent to least recent
	static switchUser(index: number) {
		UserData.value.unshift(UserData.value.splice(index, 1)[0]);
		UserData.sync();
	}

	static setCoins(value: number) {
		UserData.value[0].coins = value;
		UserData.sync();
	}

	static addCoins(value: number) {
		UserData.value[0].coins += value;
		UserData.sync();
	}

	// Handles the reactive stuff
	static sync() {
		if (!browser) return;
		localStorage.setItem("value", JSON.stringify(UserData.value));
		UserData.valueWritable.set(UserData.value);
	}
}

// Initialize value when this module is loaded on the client
UserData.initialize();