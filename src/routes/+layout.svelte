<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import MessageBanner from "$lib/composite/MessageBanner.svelte";
	import Navbar from "$lib/composite/Navbar.svelte";
	import { navigating } from "$app/state";
	import { cubicOut } from "svelte/easing";
	import { Tween } from "svelte/motion";

	const progress = new Tween(1, {
		duration: 400,
		easing: cubicOut,
	});

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<style>
		.progress-container {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 3px;
			z-index: 9999;
		}
		.bar {
			height: 100%;
			background: #ff3e00; /* Svelte Orange */
			transition: width 0.2s ease;
		}
	</style>
</svelte:head>

{#if navigating.to}
	<div class="progress-container">
		<div class="bar" style="width: {progress.current * 100}%"></div>
	</div>
{/if}

<section class="section p-0">
	<div class="is-paddingless">
		<Navbar user={data.user} />
		{@render children()}
		<MessageBanner />
	</div>
</section>
