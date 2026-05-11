<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { type CreateUserResponse } from "$lib/model/User.svelte.js";
    import Button from "$lib/components/Button.svelte";
    import MainTitle from "$lib/components/MainTitle.svelte";
    import TextWithError from "$lib/components/TextWithError.svelte";
    import { showInfo } from "$lib/store/messages.svelte";
    import { apiInProgressGlobal } from "$lib/store/settings.svelte";
    import { onMount } from "svelte";

    let { form } = $props();

    let onServerRedirectTo = $derived('/login?defUserName=');
    onMount(() => onServerRedirectTo = '');

</script>

<div class="container pt-5">
    <MainTitle title="Создать пользователя" />
    <form
        class="box"
        method="POST"
        action="?/create"
        use:enhance={() => {
            apiInProgressGlobal.value = true;
            return async ({ result, update }) => {
                await update();
                apiInProgressGlobal.value = false;
                if (result.type === "success") {
                    let createdUser = result.data
                        ?.createdUser as CreateUserResponse;
                    showInfo(createdUser.username + " успешно создан.");
                    goto("/login?defUserName=" + createdUser.username);
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
                    value={form?.user?.userName?.toString() ?? ""}
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
            <div class="field">
                <div class="control">
                    <Button
                        className="is-primary"
                        label="Создать"
                        loading={apiInProgressGlobal.value}
                    />
                </div>
            </div>
        </fieldset>
    </form>
</div>
