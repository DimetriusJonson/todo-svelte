<script>
	import { page } from "$app/state";
	import MainTitle from "../lib/components/MainTitle.svelte";
</script>

<section class="section">
	<div class="box has-text-centered">
		<div class="title is-size-1 has-text-danger">{page.status.toString()}</div>
		<div class="subtitle">{page.error?.message}</div>
	</div>
</section>
