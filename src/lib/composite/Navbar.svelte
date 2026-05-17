<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import ButtonLink from "$lib/components/ButtonLink.svelte";
    import { logout } from "$lib/remote/user.remote";
    import { showError, showInfo } from "$lib/store/messages.svelte";
    import { onMount } from "svelte";

    let navLinksActive = $state(true);

    let { user } = $props();

    let onServerRedirectTo = $derived("/");
    onMount(() => {
        onServerRedirectTo = "";
        navLinksActive = false;
    });
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
                {#if user?.name}
                    <div class="navbar-item">
                        <form
                            {...logout.enhance(async ({ submit }) => {
                                if (await submit()) {
                                    if (!logout.result?.error) {
                                        showInfo("Вы вышли!");
                                    } else {
                                        showError(logout.result?.error.message);
                                    }
                                }
                            })}
                        >
                            <input
                                type="hidden"
                                name="redirectTo"
                                value={onServerRedirectTo}
                            />
                            <Button
                                className="is-warning is-light"
                                label={"Выйти " + user.name}
                                loading={logout.pending > 0}
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
