import { form, getRequestEvent, query } from '$app/server';
import { apiTask } from '$lib/api/ApiTask';
import { taskFromJson } from '$lib/model/Task.svelte';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';

const DeleteTaskSchema = v.objectAsync({
    id: v.pipe(v.string()),
    redirectTo: v.pipe(v.string()),
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