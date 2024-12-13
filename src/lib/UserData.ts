import { browser } from "$app/environment";
import { writable } from "svelte/store";

export interface UserData { // To keep the ts compiler happy
	username: string,
	coins: number
}

// Quick access variables so we don't have to access users
export let userdata: UserData[] = (() => browser ? (JSON.parse(localStorage.getItem("userdata") || '[{"username":"Guest","coins":0}]' )) : [{username: "Server", coins: 0}])();
let index = 0;

export let userdataWritable = writable(userdata[index]); // Allows userdata to be reactive

export function setUsername(value: string) {
	userdata[index].username = value;
	localStorage.setItem("userdata", JSON.stringify(userdata));
	userdataWritable.set(userdata[index]);
}

export function setCoins(value: number) {
	userdata[index].coins = value;
	localStorage.setItem("userdata", JSON.stringify(userdata));
	userdataWritable.set(userdata[index]);
}
export function addCoins(value: number) {
	userdata[index].coins += value;
	localStorage.setItem("userdata", JSON.stringify(userdata));
	userdataWritable.set(userdata[index]);
}