<script lang="ts">
	import { UserData } from "$lib/UserData";

	let playerData: UserData[] = $state();
	UserData.subscribe(value => { playerData = value; });

	let input: HTMLInputElement;
	let newUserInput: HTMLInputElement;
	let invalidMessage = $state("");
	let invalidColor = $state("red");
	let invalidMessage2 = $state("");
	let invalidColor2 = $state("red");

	// AI generated function
	// '_' is also excused
	function isAlphanumeric(str: string): boolean {
		return /^[a-z0-9_]+$/i.test(str);
	}

	// Throws error if the username is invalid - idk if this is the most optimal solution but if it ain't broke don't fix it
	function checkValidUsername(value: string) {
		if (value.length < 5) throw new Error("must be at least 5 characters");
		if (value.length > 20) throw new Error("must be less than 20 characters");
		if (value.indexOf(' ') != -1) throw new Error("cannot contain spaces");
		if (!isAlphanumeric(value)) throw new Error("must only contain a-z, A-Z, 0-9, and '_'");
		for (const users of UserData.value) if (users.username == value) throw new Error("username is already taken")
	}

	function changeUsername() {
		try {
			checkValidUsername(input.value);
			UserData.setUsername(input.value);
			invalidMessage = "Username successfully changed!";
			invalidColor = "green";
		} catch (e) {
			invalidMessage = "Invalid username: " + e.message;
			invalidColor = "red";
		}
	}

	function createUser() {
		try {
			checkValidUsername(newUserInput.value);
			UserData.value.unshift({username: newUserInput.value, coins: 0});
			UserData.sync();
			invalidMessage2 = "Username successfully changed!";
			invalidColor2 = "green";
		} catch (e) {
			invalidMessage2 = "Invalid username: " + e.message;
			invalidColor2 = "red";
		}
	}

	function deleteUser(index: number) {
		const confirmed = confirm(`Are you sure you want to delete user '${UserData.value[index].username}'?\nYou can't undo this operation.`);
		if (!confirmed) return;
		UserData.removeUser(index);
	}
</script>

<h1>Home</h1>
<div id="username">
	<h2>Welcome, <span style="background-image: linear-gradient(45deg, rgb(5, 39, 103) 0%, rgb(6, 71, 18) 80%);">{playerData[0].username}</span>!</h2>
	<h2>You have {playerData[0].coins} coins</h2><br/>
	<p>Made by <span style="font-weight: bold; background-image: linear-gradient(75deg, #08c 0%, #093 80%);">Brandon Thames</span> & <span style="font-weight: bold; background-image: linear-gradient(75deg, red 0%, #900 80%);">Aryan Rajpal</span></p>
	<p>Play <a href="highcard">High Card</a> to earn coins for gambling</p>
	<p>Please check out <a href="crazy8">Crazy Eights</a>, our best game to offer! (ChatGPT could never cook this one up)</p>
	<p>In <a href="crazy8">Crazy Eights</a> and <a href="uno">Uno</a>, the users listed below are the players.</p>
	<p>The rest of the games are just single player with the currently selected user.</p>
	<br/><br/>

	<h2>Change Username:</h2>
	<input bind:this={input} type="text" value="{playerData[0].username}" maxlength="20" />
	<button onclick={changeUsername}>Save</button>
	<p style="font-size: 18px; color: {invalidColor};">{invalidMessage}</p>
	<br/><br/>

	<h2>Switch User:</h2>
	{#each playerData as user, index}
	    {#if user.username != playerData[0].username}
			<div class="user">
				<p style="display: inline; font-size: 24px;">{user.coins} Coins</p>
				<button onclick={() => UserData.switchUser(index)}>{user.username}</button>
				<button onclick={() => deleteUser(index)}>X</button>
			</div>
		{/if}
	{/each}
	<input bind:this={newUserInput} type="text" placeholder="New User" maxlength="20" />
	<button onclick={createUser}>Create</button>
	<p style="font-size: 18px; color: {invalidColor2};">{invalidMessage2}</p>
</div>

<style>
	p {
		font-size: 18px;
		margin: 10px;
	}

	h2 {
		font-size: 24px;
		margin: 10px;
	}

	input {
		font-size: 24px;
	}

	button {
		font-size: 24px;
	}

	.user {
		margin: 10px;
	}

	span {
		color: transparent;
		background-clip: text;
	}
</style>