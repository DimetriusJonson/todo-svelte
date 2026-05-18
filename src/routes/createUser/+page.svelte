<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import MainTitle from "$lib/components/MainTitle.svelte";
    import { showError, showInfo } from "$lib/store/messages.svelte";
    import { createUser } from "$lib/remote/user.remote";
    import TextWithError from "$lib/components/TextWithError.svelte";
</script>

<div class="container p-4">
    <MainTitle title="Создать пользователя" />

    <form
        {...createUser
            .enhance(async ({ form, data, submit }) => {
                console.log('enhance');
                try {
                    if (await submit()) {
                        form.reset();
                        showInfo(data.userName + " успешно создан.");
                    }
                } catch (error: any) {
                    showError(error);
                }
            })}
        oninput={() => createUser.validate()}
    >
        <fieldset disabled={createUser.pending > 0}>
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
                    inputType="password"
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
