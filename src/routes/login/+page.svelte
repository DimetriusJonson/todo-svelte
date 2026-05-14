<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import MainTitle from "$lib/components/MainTitle.svelte";
    import { page } from "$app/state";
    import ButtonLink from "$lib/components/ButtonLink.svelte";
    import { login } from "./data.remote.js";
    import { showInfo } from "$lib/store/messages.svelte.js";
    import { goto } from "$app/navigation";
    import { LoginSchema } from "$lib/model/User.svelte.js";

    let redirectTo = $derived(page.url.searchParams.get("redirectTo"));
    login.fields.userName.set(page.url.searchParams.get("defUserName") ?? "");

</script>

<div class="container p-4">
    <MainTitle title="Вход в систему" />

    <form
        {...login
            .preflight(LoginSchema)
            .enhance(async ({ form, data, submit }) => {
                if (await submit()) {
                    if (!login.result?.error) {
                        form.reset();
                        goto(data.redirectTo);
                        showInfo("Вы вошли!");
                    }
                }
            })}
        oninput={() => login.validate()}
    >
        <fieldset disabled={login.pending > 0}>
            <input
                {...login.fields.redirectTo.as("hidden", redirectTo ?? "/")}
            />

            {#if login.result?.error}
                <div class="box">
                    <span class="message is-danger">
                        {login.result?.error.message}
                    </span>
                </div>
            {/if}

            <div class="field">
                <div class="control">
                    <input
                        {...login.fields.userName.as("text")}
                        class={"input " +
                            (login.fields.userName.issues() ? "is-danger" : "")}
                        placeholder="Имя пользователя"
                    />
                </div>
                {#each login.fields.userName.issues() as issue}
                    <p class="help is-danger">{issue.message}</p>
                {/each}
            </div>

            <div class="field">
                <div class="control">
                    <input
                        {...login.fields.password.as("password")}
                        class={"input " +
                            (login.fields.password.issues() ? "is-danger" : "")}
                        placeholder="Пароль"
                    />
                </div>
                {#each login.fields.password.issues() as issue}
                    <p class="help is-danger">{issue.message}</p>
                {/each}
            </div>

            <div class="buttons">
                <Button
                    className="is-primary"
                    label="Войти"
                    loading={login.pending > 0}
                    disabled={login.pending > 0}
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
