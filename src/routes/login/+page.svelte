<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import MainTitle from "$lib/components/MainTitle.svelte";
    import TextWithError from "$lib/components/TextWithError.svelte";
    import { showInfo } from "$lib/store/messages.svelte";
    import {
        apiInProgressGlobal,
    } from "$lib/store/settings.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import ButtonLink from "$lib/components/ButtonLink.svelte";

    let { form } = $props();
    let defUserName = $derived(page.url.searchParams.get('defUserName'));
    let redirectTo = $derived(page.url.searchParams.get('redirectTo'));
    let onServerRedirectTo = $derived(redirectTo ?? '/');

    onMount(() => onServerRedirectTo = '');
</script>

<div class="container pt-5">
    <MainTitle title="Вход в систему" />
    <form
        class="box"
        method="POST"
        action="?/login"
        use:enhance={() => {
            apiInProgressGlobal.value = true;
            return async ({ result, update }) => {
                await update();
                apiInProgressGlobal.value = false;
                if (result.type === "success") {
                    showInfo("Вы вошли!");
                    goto(redirectTo ?? "/");
                }
            };
        }}
    >
        <fieldset disabled={apiInProgressGlobal.value}>
            {#if form?.error && !form.error.validateErrors}
                <div class="box">
                    <span class="message is-danger">
                        {form.error.message}
                    </span>
                </div>
            {/if}

            <input type="hidden" name="redirectTo" value="{onServerRedirectTo}"/>

            <div class="field">
                <TextWithError
                    name="userName"
                    placeholder="Имя пользователя"
                    value={form?.user?.userName?.toString() ?? defUserName ?? ''}
                    error={form?.error?.validateErrors?.get("username")}
                />
            </div>
            <div class="field">
                <TextWithError
                    name="password"
                    placeholder="Пароль"
                    inputType={"password"}
                    value={form?.user?.password?.toString() ?? ""}
                    error={form?.error?.validateErrors?.get("password")}
                />
            </div>
            <div class="buttons">
                    <Button
                        className="is-primary"
                        label="Войти"
                        loading={apiInProgressGlobal.value}
                    />
                    <ButtonLink
                        className="is-ghost"
                        href="/createUser"
                        label="Создать"
                    />
            </div>
        </fieldset>
    </form>
</div>
