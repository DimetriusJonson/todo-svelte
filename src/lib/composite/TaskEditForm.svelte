<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import ButtonLink from "$lib/components/ButtonLink.svelte";
    import CheckboxWithLabel from "$lib/components/CheckboxWithLabel.svelte";
    import SelectWithLabel from "$lib/components/SelectWithLabel.svelte";
    import TextArea from "$lib/components/TextArea.svelte";
    import TextWithError from "$lib/components/TextWithError.svelte";
    import { getPriorities } from "$lib/remote/task.remote";
    import { TaskSchema } from "$lib/remote/task.schema";
    import { showInfo } from "$lib/store/messages.svelte";

    let { sourceForm, task } = $props();

    let priorities = await getPriorities();
</script>

<form
    {...sourceForm
        .preflight(TaskSchema)
        .enhance(async ({ submit }: { form: HTMLFormElement; submit: any }) => {
            if (await submit()) {
                if (sourceForm.result?.task) {
                    showInfo("Задача сохранена");
                }
                sourceForm.fields.priority.set(null);
                sourceForm.fields.completed.set(null);
                sourceForm.fields.title.set(null);
                sourceForm.fields.description.set(null);
            }
        })}
        oninput={() => sourceForm.validate()}
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
                        {...sourceForm.fields.priority.as(
                            "text",
                            task?.priority,
                        )}
                        label={"Приоритет:"}
                        options={priorities}
                        errors={sourceForm.fields.priority.issues()}
                    />
                </div>
            </div>

            <div class="level-right">
                <div class="level-item">
                    <CheckboxWithLabel
                        {...sourceForm.fields.completed.as(
                            "checkbox",
                            task?.completed,
                        )}
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
                <ButtonLink
                    className="is-light"
                    label="Отмена"
                    href={task?.id ? "/task/" + task?.id : "/"}
                />
            </div>
        </div>
    </fieldset>
</form>
