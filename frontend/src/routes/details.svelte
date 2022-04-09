<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { selectedAccount, web3 } from 'svelte-web3';
	import { GARANT_ABI, GARANT_ADDRESS } from '../contracts/Garant.ts';
	import {
		Button,
		Column,
		InlineNotification,
		Loading,
		Row,
		Search,
		Tile
	} from 'carbon-components-svelte';
	import Dealer from '../components/Dealer.svelte';
	import { NULL_ADDRESS } from '../constants/blockchain.ts';

	let dealId = $page.url.searchParams.get('id');
	let deal;
	let dealLoading = false;

	let dealAccepted;

	const garant = new $web3.eth.Contract(GARANT_ABI, GARANT_ADDRESS);

	$: dealAccepted =
		(deal?.creator.sender.toLowerCase() === $selectedAccount && deal?.creator.confirmed) ||
		(deal?.acceptor.sender.toLowerCase() === $selectedAccount && deal?.acceptor.confirmed);

	onMount(() => getDeal());

	const getDeal = () => {
		if (dealId) {
			if (dealId !== $page.url.searchParams.get('id')) {
				goto('/details?id=' + dealId);
			}

			dealLoading = true;

			garant.methods
				.deals(dealId)
				.call()
				.then((data) => {
					deal = data;

					// Wait for creation
					if (deal.creator.sender === NULL_ADDRESS) {
						garant.events.Created({ _id: dealId }, () => getDeal());
						return;
					}

					// Wait for joining
					if (deal.acceptor.sender === NULL_ADDRESS) {
						garant.events.Joined({ _id: dealId }, () => getDeal());
						garant.events.Declined({ _id: dealId }, () => getDeal());
						return;
					}

					// Wait for accepting
					if (!deal.creator.confirmed && !deal.acceptor.confirmed) {
						garant.events.Confirmed({ _id: dealId }, () => getDeal());
						garant.events.Declined({ _id: dealId }, () => getDeal());
						return;
					}

					// Wait for closing
					if (deal.creator.confirmed !== deal.acceptor.confirmed) {
						garant.events.Closed({ _id: dealId }, () => getDeal());
						garant.events.Declined({ _id: dealId }, () => getDeal());
					}
				})
				.finally(() => (dealLoading = false));
		}
	};

	const acceptDeal = () => {
		if (dealId) {
			if (dealId !== $page.url.searchParams.get('id')) {
				goto('/details?id=' + dealId);
			}

			garant.methods.confirmDeal(dealId).send({ from: $selectedAccount });
		}
	};

	const declineDeal = () => {
		if (dealId) {
			if (dealId !== $page.url.searchParams.get('id')) {
				goto('/details?id=' + dealId);
			}

			garant.methods.declineDeal(dealId).send({ from: $selectedAccount });
		}
	};
</script>

<form on:submit|preventDefault={getDeal}>
	<div style="display: flex">
		<Search placeholder="Deal ID" bind:value={dealId} />
		<Button type="submit">
			{#if dealLoading}
				<Loading small withOverlay={false} />&nbsp;Loading deal...
			{:else}
				Load deal
			{/if}
		</Button>
	</div>
</form>

{#if deal}
	<Column noGutter>
		<Tile>
			<Dealer dealerName="Creator" bind:dealer={deal.creator} />
		</Tile>
	</Column>

	{#if deal.status !== '2' || deal.acceptor.sender !== NULL_ADDRESS}
		<Tile>
			<Dealer dealerName="Acceptor" bind:dealer={deal.acceptor} />
		</Tile>
	{/if}

	{#if deal.status === '1'}
		{#if deal.acceptor?.sender.toLowerCase() === $selectedAccount || deal.creator?.sender.toLowerCase() === $selectedAccount}
			<Row>
				<Column>
					<Button size="field" kind="danger" on:click={declineDeal}>Cancel Deal</Button>
				</Column>

				{#if deal.status === '1' && !dealAccepted && deal.acceptor?.sender !== NULL_ADDRESS}
					<Column>
						<Button size="field" on:click={acceptDeal}>Accept Deal</Button>
					</Column>
				{/if}
			</Row>
		{/if}
	{:else if deal.status === '2'}
		<InlineNotification hideCloseButton lowContrast kind="error" title="Deal declined!" />
	{:else if deal.status === '3'}
		<InlineNotification hideCloseButton lowContrast kind="success" title="Deal done!" />
	{/if}
{/if}
