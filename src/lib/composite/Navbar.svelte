<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { type ApiError } from "$lib/api/ApiCommon.svelte";
    import Button from "$lib/components/Button.svelte";
    import ButtonLink from "$lib/components/ButtonLink.svelte";
    import { showError, showInfo } from "$lib/store/messages.svelte";
    import { apiInProgressGlobal } from "$lib/store/settings.svelte";
    import { onMount } from "svelte";

    let navLinksActive = $state(false);

    let { authData } = $props();

    let onServerRedirectTo = $derived("/");
    onMount(() => (onServerRedirectTo = ""));
</script>

<nav class="navbar is-primary" aria-label="main navigation">
    <div class="navbar-brand">
        <a
            class="navbar-item is-size-3 has-text-weight-extrabold is-family-code mx-1"
            href="/">TODO</a
        >

        <a
            role="button"
            class="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            onclick={() => (navLinksActive = !navLinksActive)}
            href="/"
        >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div
        class={`navbar-menu ${navLinksActive ? "is-active" : ""}`}
        id="nav-links"
    >
        <div class="navbar-start">
            <div class="navbar-item">
                <ButtonLink label="Пользователи" href="/users" />
            </div>
        </div>

        <div class="navbar-end">
            <div class="buttons">
                {#if authData?.userName}
                    <div class="navbar-item">
                        <form
                            method="POST"
                            action="/?/logout"
                            use:enhance={() => {
                                apiInProgressGlobal.value = true;
                                return async ({ result, update }) => {
                                    await update();
                                    apiInProgressGlobal.value = false;
                                    if (result.type === "success") {
                                        showInfo("Вы вышли!");
                                    } else if (result.type == "failure") {
                                        let error = result.data
                                            ?.error as ApiError;
                                        showError(error.message);
                                    }
                                    goto("/", {
                                        invalidateAll: true,
                                    });
                                };
                            }}
                        >
                            <input
                                type="hidden"
                                name="redirectTo"
                                value={onServerRedirectTo}
                            />
                            <Button
                                className="is-warning is-light"
                                label={"Выйти " + authData.userName}
                                loading={apiInProgressGlobal.value}
                            />
                        </form>
                    </div>
                {:else}
                    <div class="navbar-item">
                        <ButtonLink
                            className="button is-warning is-soft is-rounded"
                            label="Создать пользователя"
                            href="/createUser"
                        />
                    </div>
                    <div class="navbar-item">
                        <ButtonLink
                            className="is-light"
                            label="Войти"
                            href="/login"
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</nav>
