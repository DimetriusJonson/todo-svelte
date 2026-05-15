<script lang="ts">
    import { CreateUserSchema } from "$lib/model/User.svelte.js";
    import Button from "$lib/components/Button.svelte";
    import MainTitle from "$lib/components/MainTitle.svelte";
    import { showInfo } from "$lib/store/messages.svelte";
    import { createUser } from "$lib/remote/user.remote";
    import TextWithError from "$lib/components/TextWithError.svelte";
</script>

<div class="container p-4">
    <MainTitle title="Создать пользователя" />

<form
        {...createUser
            .preflight(CreateUserSchema)
            .enhance(async ({ form, data, submit }) => {
                if (await submit()) {
                    if (!createUser.result?.error) {
                        form.reset();
                        showInfo(data.userName + " успешно создан.");
                    }
                }
            })}
        oninput={() => createUser.validate()}
    >
        <fieldset disabled={createUser.pending > 0}>
            <input
                {...createUser.fields.redirectTo.as("hidden", '/login?defUserName=')}
            />

            {#if createUser.result?.error}
                <div class="box">
                    <span class="message is-danger">
                        {createUser.result?.error.message}
                    </span>
                </div>
            {/if}

            <div class="field">
                <TextWithError
                    {...createUser.fields.userName.as("text")}
                    placeholder="Имя пользователя"
                    errors={createUser.fields.userName.issues()}
                />
            </div>

            <div class="field">
                <TextWithError
                    {...createUser.fields.password.as("password")}
                    placeholder="Пароль"
                    errors={createUser.fields.password.issues()}
                />
            </div>

            <div class="field">
                <div class="control">
                    <Button
                        className="is-primary"
                        label="Создать"
                        loading={createUser.pending > 0}
                        disabled={createUser.pending > 0}
                    />
                </div>
            </div>
        </fieldset>
    </form>
</div>
