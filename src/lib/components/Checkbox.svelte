<script lang="ts">
	import "./checkbox.css";

    let { name, title, className, value, disabled, inputRef = $bindable(), onChange = () => {} } = $props();
    
    let checkOnChange = (event: Event& { currentTarget: HTMLInputElement }) => {
        event.preventDefault();
        onChange({
            name: name,
            value: event.currentTarget.checked,
            target: event.currentTarget
        });
    };

</script>

<label class={"b-checkbox checkbox " + className}>
    <input bind:this={inputRef}
        type="checkbox"
        id={name.toLowerCase().replaceAll(" ", "")}
        {name}
        checked={value}
        onchange={checkOnChange}
        {disabled}
    />
    <span class="check is-warning" {title}></span>
</label>
