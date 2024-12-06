<script lang="ts">
	import { UserData } from "$lib/UserData";

	let playerData: UserData = $state();
	UserData.value.subscribe(value => { playerData = value; });

	let input: HTMLInputElement;
	let invalidMessage = $state("");
	let invalidColor = $state("red");

	// AI generated function
	// '_' is excused
	function isAlphanumeric(str: string): boolean {
		return /^[a-z0-9_]+$/i.test(str);
	}

	function changeUsername() {
		try {
			if (input.value.length < 5) throw new Error("must be at least 5 characters");
			if (input.value.length > 20) throw new Error("must be less than 20 characters");
			if (input.value.indexOf(' ') != -1) throw new Error("cannot contain spaces");
			if (!isAlphanumeric(input.value)) throw new Error("must only contain a-z, A-Z, 0-9, and '_'");
			UserData.username = input.value;
			invalidMessage = "Username successfully changed!";
			invalidColor = "green";
		} catch (e) {
			invalidMessage = "Invalid username: " + e.message;
			invalidColor = "red";
		}
	}
</script>

<h1>Home</h1>
<div id="username">
	<p>Welcome, {playerData.username}!</p>
	<p>You have {playerData.coins} coins</p><br/>
	<p>Play <a href="highcard">High Card</a> to earn coins</p>
	<p>Play other games to gamble!</p><br/><br/><br/><br/><br/>
	<p>Change Username:</p>
	<input bind:this={input} type="text" value="{playerData.username}" maxlength="20" />
	<button onclick={changeUsername}>Save</button>
	<p style="font-size: 18px; color: {invalidColor};">{invalidMessage}</p>
</div>

<style>
	p {
		font-size: 32px;
		margin: 10px;
	}

	input {
		font-size: 24px;
	}

	button {
		font-size: 24px;
	}
</style>