<script>
	import { onMount } from 'svelte';
	import { ComboBox, Form, FormGroup, NumberInput } from 'carbon-components-svelte';
	import { selectedAccount, web3 } from 'svelte-web3';
	import { httpClient } from '../core/http';
	import { NULL_ADDRESS } from '../constants/blockchain.ts';
	import { OwnBigNumber } from '../utils/BN.ts';

	export let tokenAddress = '';
	export let tokenAmount = '';

	const minInput = 0.000001;

	let tokens = [];

	let selectedId;
	let amountInput = 0;

	$: tokenAddress = tokens[selectedId]?.tokenAddress;

	$: {
		if (amountInput) {
			if (amountInput < minInput) {
				amountInput = minInput;
			}

			tokenAmount = OwnBigNumber.fromDecimal(amountInput, tokens[selectedId].decimals).toString();
		} else {
			tokenAmount = '';
		}
	}

	onMount(async () => {
		const res = await httpClient.get(
			`https://deep-index.moralis.io/api/v2/${$selectedAccount}/erc20?chain=rinkeby`
		);

		tokens = [
			{
				tokenAddress: NULL_ADDRESS,
				text: 'Ethereum',
				id: 0,
				amount: $web3.utils.fromWei(await $web3.eth.getBalance($selectedAccount), 'ether'),
				decimals: '18'
			}
		];

		res.data.forEach(({ balance, decimals, name: text, token_address: tokenAddress }, idx) => {
			tokens.push({
				tokenAddress,
				decimals,
				text,
				id: idx + 1,
				amount: OwnBigNumber.toStringDecimals(balance, decimals)
			});
		});
	});
</script>

<Form>
	<FormGroup>
		<ComboBox titleText="Select Currency" items={tokens} bind:selectedId />
	</FormGroup>

	{#if selectedId != null}
		<FormGroup>
			<NumberInput
				label={`Amount (max ${tokens[selectedId].amount})`}
				hideSteppers
				bind:value={amountInput}
				step="0.001"
				min={minInput}
				max={tokens[selectedId].amount}
			/>
		</FormGroup>
	{/if}
</Form>
