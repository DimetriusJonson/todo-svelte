import { command, form, getRequestEvent, prerender, query } from "$app/server";
import { apiTask } from "$lib/api/ApiTask";
import { MIN_COMPLETED_AT, taskFromJson, type Task } from "$lib/model/Task.svelte";
import { TaskServerSchema } from "$lib/model/TaskServerSchema";
import { buildTaskCompletedAt, filterTask, priorityName, sortTask } from "$lib/TaskHelper.svelte";
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';

const DeleteTaskSchema = v.objectAsync({
    id: v.pipe(v.string()),
    redirectTo: v.pipe(v.string()),
});

export const createTask = form(TaskServerSchema, async ({ title, priority, completed, oldCompleted_at, description }) => {
    const event = getRequestEvent();

    let completed_at = buildTaskCompletedAt(completed ? true : false, oldCompleted_at);

    let result = await apiTask.create({ user: event.locals.user }, {
        title, priority, completed_at, description
    } as Task);
    if (result.success) {
        let task = result.responseData as Task;
        redirect(302, '/task/' + task.id);
    } else {
        return { error: result.error };
    }
});

export const getTask = query(v.string(), async (id) => {
    const event = getRequestEvent();

    let resp = await apiTask.get({ user: event.locals.user }, parseInt(id));
    if (resp.success) {
        return taskFromJson(resp.responseData);
    }
    return resp;
});

export const deleteTask = form(DeleteTaskSchema, async ({ id, redirectTo }) => {
    const event = getRequestEvent();

    let result = await apiTask.delete({ user: event.locals.user }, parseInt(id));
    if (result.success) {
        if (redirectTo) {
            redirect(302, redirectTo);
        } else {
            return { success: true };
        }
    } else {
        return { error: result.error };
    }
});

export const updateTask = form(TaskServerSchema, async ({ id, title, priority, completed, oldCompleted_at, description }) => {
    const event = getRequestEvent();

    let completed_at = buildTaskCompletedAt(completed ? true : false, oldCompleted_at);

    let result = await apiTask.update({ user: event.locals.user }, {
        id: parseInt(id), title, priority, completed_at, description
    } as Task);

    if (result.success) {
        let task = result.responseData as Task;
        redirect(302, '/task/' + task.id);
    } else {
        return { error: result.error };
    }
});

export const changeCompletedTask = command(v.object({
    id: v.number(),
    completed: v.boolean()
}), async ({ id, completed }) => {
    const event = getRequestEvent();

    let patch: Task = {
        id: id,
        completed_at: completed ? new Date().toISOString() : MIN_COMPLETED_AT,
    };

    let result = await apiTask.update({ user: event.locals.user }, patch);
    if (!result.success) {
        return { task: { completed: completed }, error: result.error };
    }

    return { task: result.responseData };
});


export const getPriorities = prerender(async () => {
    return [
        priorityToOption("C"),
        priorityToOption("H"),
        priorityToOption("N"),
        priorityToOption("L"),
    ];
});

export const getFilterOptions = prerender(async () => {
    return [
        filterToOption("Completed"),
        filterToOption("Uncompleted"),
    ];
});

export const getSortOptions = prerender(async () => {
    return [sortToOption("Title"), sortToOption("Priority")];
});

export const getTasks = query(
    v.object({
        filter: v.pipe(v.nullable(v.string())),
        sortKind: v.pipe(v.nullable(v.string()))
    }
    ), async ({ filter, sortKind }) => {
        const event = getRequestEvent();

        let resp = await apiTask.getList({ user: event.locals.user });
        if (resp.success && resp.responseData) {
            return buildTasks(resp.responseData.data, filter, sortKind);
        } else {
            error(resp.status, resp.error?.message);
        }
    });

function buildTasks(tasks: Task[], filter: string | null, sortKind: string | null): Task[] {
    let result: Task[] = [];
    tasks.forEach(task => result.push(taskFromJson(task)));

    return result
        .filter((t: Task) =>
            filterTask(t, filter ?? ""),
        )
        .sort((task1: Task, task2: Task) =>
            sortTask(task1, task2, sortKind ?? ""),
        );
}


function priorityToOption(priority: string) {
    return { value: priority, text: priorityName(priority) };
}

function filterToOption(filter: string) {
    switch (filter) {
        case "Completed":
            return { value: filter, text: "Завершенные" };
        case "Uncompleted":
            return { value: filter, text: "Незавершенные" };
        default:
            return { value: null, text: "Не выбран" };
    }
}

function sortToOption(sortKind: string) {
    switch (sortKind) {
        case "Title":
            return { value: sortKind, text: "Название" };
        case "Priority":
            return { value: sortKind, text: "Приоритет" };
        default:
            return { value: null, text: "Не выбран" };
    }
}