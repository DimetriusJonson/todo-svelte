import { command, form, getRequestEvent, prerender, query } from "$app/server";
import { isTaskCompleted, MIN_COMPLETED_AT, type Task } from "$lib/model/Task.svelte";
import { TaskServerSchema } from "$lib/model/TaskServerSchema";
import { buildTaskCompletedAt, filterTask, priorityName, sortTask } from "$lib/TaskHelper.svelte";
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { taskDao } from "../server/dao/TaskDao";

export const createTask = form(TaskServerSchema, async ({ title, priority, completed, oldCompleted_at, description }) => {
    const event = getRequestEvent();

    let completed_at = buildTaskCompletedAt(completed ? true : false, oldCompleted_at);

    let task = await taskDao.create({ user: event.locals.user }, {
        title, priority, completed_at, description
    } as Task);

    redirect(302, '/task/' + task.id);
});

export const getTask = query(v.string(), async (id) => {
    const event = getRequestEvent();

    let task = await taskDao.get({ user: event.locals.user }, parseInt(id));
    if (task) {
        task.completed = isTaskCompleted(task.completed_at);
    }
    return task;
});

export const deleteTask = form(v.objectAsync({
    id: v.pipe(v.string()),
}), async ({ id }) => {
    const event = getRequestEvent();

    let result = await taskDao.delete({ user: event.locals.user }, parseInt(id));
    if (result) {
        redirect(302, '/');
    }
    error(500, 'Cant delete task!');
});

export const updateTask = form(TaskServerSchema, async ({ id, title, priority, completed, oldCompleted_at, description }) => {
    const event = getRequestEvent();

    let completed_at = buildTaskCompletedAt(completed ? true : false, oldCompleted_at);

    let task = await taskDao.update({ user: event.locals.user }, {
        id: parseInt(id), title, priority, completed_at, description
    } as Task);

    redirect(302, '/task/' + task.id);
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

    return await taskDao.update({ user: event.locals.user }, patch);
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

        let tasks = await taskDao.getList({ user: event.locals.user });
        return buildTasks(tasks, filter, sortKind);
    });

function buildTasks(tasks: Task[], filter: string | null, sortKind: string | null): Task[] {
    let result: Task[] = [];
    tasks.forEach(task => {
        task.completed = isTaskCompleted(task.completed_at);
        result.push(task);
    });

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