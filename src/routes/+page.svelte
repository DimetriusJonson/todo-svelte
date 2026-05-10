<script lang="ts">
    import type { Task } from "$lib/model/Task.svelte.js";
    import { localStore } from "$lib/store/localStore.svelte";
    import { filterTask, sortTask } from "$lib/TaskHelper.svelte.js";
    import SelectInput from "$lib/components/SelectInput.svelte";
    import TasksPanel from "$lib/composite/TasksPanel.svelte";
    import type { TasksSettings } from "$lib/model/TasksSettings.svelte.js";
    import Button from "$lib/components/Button.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import ButtonLink from "$lib/components/ButtonLink.svelte";

    let { data } = $props();

    let filterSelect = $derived(page.url.searchParams.get("filterSelect"));
    let sortSelect = $derived(page.url.searchParams.get("sortSelect"));

    let showFilterSubmit = $state(true);
    onMount(() => (showFilterSubmit = false));

    let tasksSettings = localStore<TasksSettings>(
        "tasksSettings",
        {} as TasksSettings,
    );

    let filteredTasks = $derived(
        (data.tasks ?? [])
            .filter((t: Task) =>
                filterTask(t, tasksSettings.value.filter ?? ""),
            )
            .sort((task1: Task, task2: Task) =>
                sortTask(task1, task2, tasksSettings.value.sortKind ?? ""),
            ),
    );
</script>

<section class="section is-paddingless is-size-7-mobile">
    <div class="container">
        <nav class="level">
            <div class="level-left">
                <div class="level-item">
                    <form method="GET" action="?/">
                        <div class="buttons is-centered">
                        <SelectInput
                            name="filterSelect"
                            notSelectedText="Фильтр"
                            value={filterSelect ?? tasksSettings.value.filter}
                            options={data.filterOptions}
                            onChange={(value: string) => {
                                tasksSettings.value.filter = value;
                                tasksSettings.saveValue();
                            }}
                        />
                        <SelectInput
                            className="ml-3"
                            name="sortSelect"
                            notSelectedText="Сортировка"
                            value={sortSelect ?? tasksSettings.value.sortKind}
                            options={data.sortOptions}
                            onChange={(value: string) => {
                                tasksSettings.value.sortKind = value;
                                tasksSettings.saveValue();
                            }}
                        />
                        {#if showFilterSubmit}
                            <Button
                                className="is-warning is-light"
                                label="Применить"
                            />
                        {/if}
                        </div>
                    </form>
                </div>
            </div>
            <div class="level-right">
                {#if data.authData}
                    <ButtonLink
                        className="level-item is-light is-size-7-mobile"
                        href="/task/create"
                        id="create_button"
                        label="Создать"
                    />
                {/if}
            </div>
        </nav>

        <TasksPanel tasks={filteredTasks} />
    </div>
</section>
