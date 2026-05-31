<script lang="ts">
	import "$lib/assets/checkbox.css";

    let { name, label, className = "", checked = $bindable()} = $props();
</script>

<div class="control">
    <label class={"b-checkbox checkbox " + className}>
        <input
            type="checkbox"
            {name}
            bind:checked={checked}
            />
        <span class="check is-warning"></span>
        <span class="control-label">{label}</span>
    </label>
</div>
