<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import MainTitle from "$lib/components/MainTitle.svelte";
    import { page } from "$app/state";
    import ButtonLink from "$lib/components/ButtonLink.svelte";
    import { showError, showInfo } from "$lib/store/messages.svelte.js";
    import { login } from "$lib/remote/user.remote";
    import TextWithError from "$lib/components/TextWithError.svelte";

    let redirectTo = $derived(page.url.searchParams.get("redirectTo"));
    login.fields.userName.set(page.url.searchParams.get("defUserName") ?? "");
</script>

<div class="container p-4">
    <MainTitle title="Вход в систему" />

    <form
        {...login.enhance(async ({ form, submit }) => {
            try {
                if (await submit()) {
                    form.reset();
                    showInfo("Вы вошли!");
                }
            } catch (error: any) {
                showError(error);
            }
        })}
        oninput={() => login.validate()}
    >
        <fieldset disabled={login.pending > 0}>
            <input
                {...login.fields.redirectTo.as("hidden", redirectTo ?? "/")}
            />

            <div class="field">
                <TextWithError
                    {...login.fields.userName.as("text")}
                    placeholder="Имя пользователя"
                    errors={login.fields.userName.issues()}
                />
            </div>

            <div class="field">
                <TextWithError
                    {...login.fields.password.as("password")}
                    placeholder="Пароль"
                    inputType="password"
                    errors={login.fields.password.issues()}
                />
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
