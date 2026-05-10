import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { Task } from '$lib/model/Task.svelte';
import { buildTaskCompletedAt } from '$lib/TaskHelper.svelte';
import { apiTask } from '$lib/api/ApiTask';

export const actions = {
    create: async ({ cookies, request }) => {
        let formData = Object.fromEntries(await request.formData());

        let task: Task = { ...formData, completed_at: buildTaskCompletedAt(formData.completed ? true : false, formData.oldCompleted_at?.toString()) };

        let result = await apiTask.create({ cookies: cookies }, task);
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
