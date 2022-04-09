<script>
	import {
		Button,
		Form,
		FormGroup,
		InlineNotification,
		NotificationActionButton
	} from 'carbon-components-svelte';
	import { selectedAccount, web3 } from 'svelte-web3';
	import { GARANT_ABI, GARANT_ADDRESS } from '../contracts/Garant.ts';
	import { NULL_ADDRESS } from '../constants/blockchain.ts';
	import { ERC20_ABI } from '../contracts/ERC20.ts';
	import TokenSelector from '../components/TokenSelector.svelte';

	let tokenAddress;
	let tokenAmount;

	let createdDealId;

	const create = () => {
		const garant = new $web3.eth.Contract(GARANT_ABI, GARANT_ADDRESS);

		if (tokenAddress === NULL_ADDRESS) {
			garant.methods
				.createDeal(0, tokenAddress)
				.send({ from: $selectedAccount, value: tokenAmount })
				.then(({ events: { Created } }) => (createdDealId = Created.returnValues._id));
		} else {
			const tokenContract = new $web3.eth.Contract(ERC20_ABI, tokenAddress);

			tokenContract.methods
				.approve(GARANT_ADDRESS, tokenAmount)
				.send({ from: $selectedAccount })
				.then(() =>
					garant.methods.createDeal(tokenAmount, tokenAddress).send({ from: $selectedAccount })
				)
				.then(({ events: { Created } }) => (createdDealId = Created.returnValues._id));
		}
	};
</script>

<Form>
	{#if createdDealId != null}
		<InlineNotification
			lowContrast
			hideCloseButton
			kind="success"
			title="Deal created: "
			subtitle={'deal id - ' + createdDealId}
		>
			<svelte:fragment slot="actions">
				<NotificationActionButton href={'/details?id=' + createdDealId}>
					Go to deal
				</NotificationActionButton>
			</svelte:fragment>
		</InlineNotification>
	{/if}

	<TokenSelector bind:tokenAddress bind:tokenAmount />

	{#if tokenAmount > 0}
		<FormGroup>
			<Button on:click={create}>Create Deal</Button>
		</FormGroup>
	{/if}
</Form>
