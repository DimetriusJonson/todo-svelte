<script lang="ts">
    import type { Task } from "$lib/model/Task.svelte.js";
    import { localStore } from "$lib/store/localStore.svelte";
    import { filterTask, sortTask } from "$lib/TaskHelper.svelte.js";
    import SelectInput from "$lib/components/SelectInput.svelte";
    import TasksPanel from "$lib/composite/TasksPanel.svelte";
    import type { TasksSettings } from "$lib/model/TasksSettings.svelte.js";
    import Button from "$lib/components/Button.svelte";
    import { page } from "$app/state";
    import ButtonLink from "$lib/components/ButtonLink.svelte";
    import {
        getFilterOptions,
        getSortOptions,
        getTasks,
    } from "$lib/remote/task.remote.js";

    let { data } = $props();

    let filterSelect = $derived(page.url.searchParams.get("filterSelect"));
    let sortSelect = $derived(page.url.searchParams.get("sortSelect"));

    let showFilterSubmit = $state(true);
    $effect.pre(() => {
        showFilterSubmit = false;
    });

    let tasksSettings = localStore<TasksSettings>(
        "tasksSettings",
        {} as TasksSettings,
    );

    let filteredTasks = $derived(
        (await getTasks({ filter: filterSelect, sortKind: sortSelect }))
            .filter((t: Task) =>
                filterTask(t, tasksSettings.value.filter ?? ""),
            )
            .sort((task1: Task, task2: Task) =>
                sortTask(task1, task2, tasksSettings.value.sortKind ?? ""),
            ),
    );
</script>

<div class="container is-size-7-mobile pt-5">
    <form method="GET" action="?/">
        <div class="buttons is-justify-content-space-between px-2 pb-5">
            <span>
                <SelectInput
                    className="is-size-7-mobile"
                    name="filterSelect"
                    label="Фильтр"
                    notSelectedText="Фильтр"
                    value={filterSelect ?? tasksSettings.value.filter}
                    options={await getFilterOptions()}
                    onChange={(value: string) => {
                        tasksSettings.value.filter = value;
                        tasksSettings.saveValue();
                    }}
                />
                <SelectInput
                    className="is-size-7-mobile pl-2"
                    name="sortSelect"
                    label="Сортировка"
                    notSelectedText="Сортировка"
                    value={sortSelect ?? tasksSettings.value.sortKind}
                    options={await getSortOptions()}
                    onChange={(value: string) => {
                        tasksSettings.value.sortKind = value;
                        tasksSettings.saveValue();
                    }}
                />
                {#if showFilterSubmit}
                    <Button className="is-light is-size-7-mobile" label="Ok" />
                {/if}
            </span>
            {#if data.user}
                <ButtonLink
                    className="level-item is-light is-size-7-mobile"
                    href="/task/create"
                    id="create_button"
                    label="+"
                />
            {/if}
        </div>
    </form>

    <TasksPanel tasks={filteredTasks} />
</div>
