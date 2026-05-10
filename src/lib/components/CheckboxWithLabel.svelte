<script lang="ts">
	import "./checkbox.css";

    let { name, label, className = "", value = $bindable()} = $props();
</script>

<div class="control">
    <label class={"b-checkbox checkbox " + className}>
        <input
            type="checkbox"
            {name}
            bind:checked={value}
            />
        <span class="check is-warning"></span>
        <span class="control-label">{label}</span>
    </label>
</div>
