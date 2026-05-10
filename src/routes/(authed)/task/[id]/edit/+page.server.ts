import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { type Task } from '$lib/model/Task.svelte';
import { buildTaskCompletedAt } from '$lib/TaskHelper.svelte';
import { apiTask } from '$lib/api/ApiTask';

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
    let resp = await apiTask.get({parent: parent, fetch: fetch}, parseInt(params.id));
    if (resp.success) {
        return { task: resp.responseData };
    }
    return resp;
}

export const actions = {
    update: async ({ cookies, request }) => {
        let formData = Object.fromEntries(await request.formData());

        let task: Task = {
            ...formData,
            id: parseInt(formData.id.toString() ?? '0'),
            completed_at: buildTaskCompletedAt(formData.completed ? true : false, formData.oldCompleted_at?.toString())
        };

        let result = await apiTask.update({cookies: cookies}, task);
        if (result.success) {
            if (formData.redirectTo) {
                let task = result.responseData as Task;
                redirect(302, formData.redirectTo.toString() + task.id);
            } else {
                return { task: result.responseData };
            }
        } else {
            return fail(result.status, {
                task: task,
                error: result.error
            });
        }
    },
} satisfies Actions;

