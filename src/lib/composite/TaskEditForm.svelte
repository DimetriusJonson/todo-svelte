<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import CheckboxWithLabel from "$lib/components/CheckboxWithLabel.svelte";
    import SelectWithLabel from "$lib/components/SelectWithLabel.svelte";
    import TextArea from "$lib/components/TextArea.svelte";
    import TextWithError from "$lib/components/TextWithError.svelte";
    import { getPriorities } from "$lib/remote/task.remote";
    import { showInfo } from "$lib/store/messages.svelte";
        
    let { sourceForm, task } = $props();

    let priorities = await getPriorities();
</script>

<form
    {...sourceForm.enhance(async ({ form, submit }) => {
        if (await submit()) {
            if (sourceForm.result?.task) {
                form.reset();
                showInfo("Задача сохранена");
            }
        }
    })}
>
    <fieldset disabled={sourceForm.pending > 0}>
        <input type="hidden" name="id" value={task?.id} />
        
        <input
            type="hidden"
            name="oldCompleted_at"
            value={task?.completed_at}
        />

        {#if sourceForm.result?.error}
            <div class="box">
                <span class="message is-danger">
                    {sourceForm.result?.error.message}
                </span>
            </div>
        {/if}

        <div class="level">
            <div class="level-left">
                <div class="level-item">
                    <SelectWithLabel
                        {...sourceForm.fields.priority.as("text", task?.priority)}
                        label={"Приоритет:"}
                        options={priorities}
                        errors={sourceForm.fields.priority.issues()}
                    />
                </div>
            </div>

            <div class="level-right">
                <div class="level-item">
                    <CheckboxWithLabel
                        {...sourceForm.fields.completed.as("checkbox", task?.completed)}
                        label="Завершена"
                    />
                </div>
            </div>
        </div>
        <div class="field">
            <TextWithError
                {...sourceForm.fields.title.as("text", task?.title)}
                placeholder="Название"
                errors={sourceForm.fields.title.issues()}
            />
        </div>

        <div class="field">
            <TextArea
                {...sourceForm.fields.description.as("text", task?.description)}
                placeholder="Описание"
            />
        </div>

        <div class="field is-grouped">
            <div class="control">
                <Button
                    className="is-primary"
                    label="Сохранить"
                    loading={sourceForm.pending > 0}
                />
            </div>
            <div class="control">
                <Button
                    className="is-light"
                    label="Отмена"
                    onclick={(event: MouseEvent) => {
                        event.preventDefault();
                        if (task?.id) {
                            goto("/task/" + task?.id);
                        } else {
                            goto("/");
                        }
                    }}
                    loading={sourceForm.pending > 0}
                />
            </div>
        </div>
    </fieldset>
</form>
