<script>
	import {
		Button,
		Column,
		Form,
		FormGroup,
		InlineNotification,
		NotificationActionButton,
		NumberInput
	} from 'carbon-components-svelte';
	import { selectedAccount, web3 } from 'svelte-web3';
	import { GARANT_ABI, GARANT_ADDRESS } from '../contracts/Garant.ts';
	import { NULL_ADDRESS } from '../constants/blockchain.ts';
	import { ERC20_ABI } from '../contracts/ERC20.ts';
	import TokenSelector from '../components/TokenSelector.svelte';

	let tokenAddress;
	let tokenAmount;

	let dealId;

	let joinedDealId;

	const join = () => {
		const garant = new $web3.eth.Contract(GARANT_ABI, GARANT_ADDRESS);

		if (tokenAddress === NULL_ADDRESS) {
			garant.methods
				.joinDeal(dealId, 0, tokenAddress)
				.send({ from: $selectedAccount, value: tokenAmount })
				.then(({ events: { Joined } }) => (joinedDealId = Joined.returnValues._id));
		} else {
			const tokenContract = new $web3.eth.Contract(ERC20_ABI, tokenAddress);

			tokenContract.methods
				.approve(GARANT_ADDRESS, tokenAmount)
				.send({ from: $selectedAccount })
				.then(() =>
					garant.methods
						.joinDeal(dealId, tokenAmount, tokenAddress)
						.send({ from: $selectedAccount })
				)
				.then(({ events: { Joined } }) => (joinedDealId = Joined.returnValues._id));
		}
	};
</script>

<Form>
	{#if joinedDealId != null}
		<InlineNotification
			lowContrast
			hideCloseButton
			kind="success"
			title="Deal joined: "
			subtitle={'deal id - ' + joinedDealId}
		>
			<svelte:fragment slot="actions">
				<NotificationActionButton href={'/details?id=' + joinedDealId}>
					Go to deal
				</NotificationActionButton>
			</svelte:fragment>
		</InlineNotification>
	{/if}

	<Column noGutter>
		<NumberInput label={`Deal ID`} bind:value={dealId} step="1" min={0} />
	</Column>

	<TokenSelector bind:tokenAddress bind:tokenAmount />

	{#if tokenAmount > 0 && dealId != null}
		<FormGroup>
			<Button on:click={join}>Join Deal</Button>
		</FormGroup>
	{/if}
</Form>
