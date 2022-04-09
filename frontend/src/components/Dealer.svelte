<script>
	import { InlineNotification, ProgressBar, Truncate } from 'carbon-components-svelte';
	import { NULL_ADDRESS } from '../constants/blockchain.ts';
	import { ERC20_ABI } from '../contracts/ERC20.ts';
	import { selectedAccount, web3 } from 'svelte-web3';
	import { OwnBigNumber } from '../utils/BN.ts';

	export let dealer;
	export let dealerName;

	let tokenAmount;
	let tokenName;

	$: {
		if (dealer.tokenAddress !== NULL_ADDRESS) {
			const token = new $web3.eth.Contract(ERC20_ABI, dealer.tokenAddress);

			token.methods
				.decimals()
				.call()
				.then((decimals) => (tokenAmount = OwnBigNumber.toStringDecimals(dealer.amount, decimals)));

			token.methods
				.name()
				.call()
				.then((name) => (tokenName = name));
		} else {
			tokenAmount = OwnBigNumber.toStringDecimals(dealer.amount, '18');
			tokenName = 'Ethereum';
		}
	}
</script>

<h5>
	{dealerName}

	{#if $selectedAccount === dealer.sender.toLowerCase()}
		(You)
	{/if}
</h5>

{#if dealer.sender !== NULL_ADDRESS && tokenName && tokenAmount}
	<Truncate>{dealer.sender}</Truncate>

	<h5>Amount</h5>
	<Truncate>{tokenAmount}</Truncate>

	<h5>Token</h5>
	<Truncate>
		{#if dealer.tokenAddress !== NULL_ADDRESS}
			<a target="_blank" href={'https://rinkeby.etherscan.io/address/' + dealer.tokenAddress}>
				{tokenName}
			</a>
		{:else}
			Ethereum
		{/if}
	</Truncate>

	{#if dealer.confirmed}
		<InlineNotification hideCloseButton lowContrast kind="success" title="Deal confirmed!" />
	{/if}
{:else}
	<ProgressBar helperText={`Waiting for ${dealerName}...`} />
{/if}
