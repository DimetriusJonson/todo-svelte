<script lang="ts">
    import { receive, send } from "$lib/ui/transition";
    import {
        messages,
        removeMessage,
        type Message,
    } from "$lib/store/messages.svelte";

    function msg_style(msg: Message) {
        if (msg.kind === "INFO") {
            return "is-primary";
        }

        return "is-danger";
    }

    let onclick = (event: MouseEvent) => {
        const idStr = (event.currentTarget as HTMLElement).id;
        let id = idStr.substring(idStr.indexOf("_") + 1);
        removeMessage(id);
    };
</script>

<div
    class="has-text-centered py-3"
    style:position="fixed"
    style:left="0"
    style:bottom="1.5rem"
    style:width="100%"
    style:z-index="1000"
>
    {#each messages as message (message.id)}
        <p
            class="field"
            in:receive={{ key: message.id }}
            out:send={{ key: message.id }}
        >
            <span class={"tag is-medium " + msg_style(message)}>
                {message.msg}
                <button
                    aria-label="x"
                    class="delete is-small"
                    id={"m_" + message.id}
                    {onclick}
                ></button>
            </span>
        </p>
    {/each}
</div>
