import { browser } from "$app/environment";
import { writable } from "svelte/store";

export interface UserData { // To keep the ts compiler happy
	username: string,
	coins: number
}

// Quick access variables so we don't have to access users
export let playerIndex = 0
export let userdata: UserData[] = [{username: "Server", coins: 0}];
export let userdataWritable = writable(userdata); // Allows userdata to be reactive

if (browser) {
	userdata = JSON.parse(localStorage.getItem("userdata") || '[{"username":"Guest","coins":0}]');
	userdataWritable.set(userdata);
}

export function setUsername(value: string) {
	userdata[playerIndex].username = value;
	localStorage.setItem("userdata", JSON.stringify(userdata));
	userdataWritable.set(userdata);
}

export function setCoins(value: number) {
	userdata[playerIndex].coins = value;
	localStorage.setItem("userdata", JSON.stringify(userdata));
	userdataWritable.set(userdata);
}
export function addCoins(value: number) {
	userdata[playerIndex].coins += value;
	localStorage.setItem("userdata", JSON.stringify(userdata));
	userdataWritable.set(userdata);
}