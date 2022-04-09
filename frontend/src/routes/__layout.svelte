<script>
	import 'carbon-components-svelte/css/white.css';
	import { Button, Column, ContentSwitcher, Grid, Row, Switch } from 'carbon-components-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { connected, defaultEvmStores } from 'svelte-web3';
	import { onMount } from 'svelte';

	const activeRoute = ['/', '/join', '/details'].findIndex((link) => link === $page.url.pathname);

	onMount(() => {
		defaultEvmStores.setProvider();
	});
</script>

<main>
	<Grid>
		<Row padding>
			<Column sm={{ offset: 0 }} md={{ offset: 1 }} lg={{ offset: 4 }} xlg={{ offset: 5 }} />
			<Column>
				{#if $connected}
					<ContentSwitcher selectedIndex={activeRoute}>
						<Switch text="Create" on:click={() => goto('/')} />
						<Switch text="Join" on:click={() => goto('/join')} />
						<Switch text="Deal Details" on:click={() => goto('/details')} />
					</ContentSwitcher>

					<Column noGutter padding>
						<slot />
					</Column>
				{:else}
					<Button on:click={() => defaultEvmStores.setProvider()}>Connect Wallet</Button>
				{/if}
			</Column>
			<Column sm={{ offset: 0 }} md={{ offset: 1 }} lg={{ offset: 4 }} xlg={{ offset: 5 }} />
		</Row>
	</Grid>
</main>
