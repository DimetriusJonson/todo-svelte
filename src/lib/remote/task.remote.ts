import { form, getRequestEvent, query } from "$app/server";
import { apiTask } from "$lib/api/ApiTask";
import { taskFromJson, type Task } from "$lib/model/Task.svelte";
import { TaskServerSchema } from "$lib/model/TaskServerSchema";
import { buildTaskCompletedAt } from "$lib/TaskHelper.svelte";
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';

const DeleteTaskSchema = v.objectAsync({
    id: v.pipe(v.string()),
    redirectTo: v.pipe(v.string()),
});

export const createTask = form(TaskServerSchema, async ({ title, priority, completed, oldCompleted_at, description }) => {
    const event = getRequestEvent();

    let completed_at = buildTaskCompletedAt(completed ? true : false, oldCompleted_at);

    let result = await apiTask.create({ cookies: event.cookies }, {
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

    let resp = await apiTask.get({ cookies: event.cookies }, parseInt(id));
    if (resp.success) {
        return taskFromJson(resp.responseData);
    }
    return resp;
});

export const deleteTask = form(DeleteTaskSchema, async ({ id, redirectTo }) => {
    const event = getRequestEvent();

    let result = await apiTask.delete({ cookies: event.cookies }, parseInt(id));
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

    let result = await apiTask.update({ cookies: event.cookies }, {
        id: parseInt(id), title, priority, completed_at, description
    } as Task);

    if (result.success) {
        let task = result.responseData as Task;
        redirect(302, '/task/' + task.id);
    } else {
        return { error: result.error };
    }
});