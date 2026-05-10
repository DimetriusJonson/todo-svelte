import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { taskFromJson } from '$lib/model/Task.svelte';
import { apiTask } from '$lib/api/ApiTask';

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
    let resp = await apiTask.get({ parent: parent, fetch: fetch }, parseInt(params.id));
    if (resp.success) {
        return { task: taskFromJson(resp.responseData) };
    }
    return resp;
}

export const actions = {
    delete: async ({ params, cookies, request }) => {
        let formData = Object.fromEntries(await request.formData());

        let result = await apiTask.delete({ cookies: cookies }, parseInt(params.id));
        if (result.success) {
            if (formData.redirectTo) {
                redirect(302, formData.redirectTo.toString());
            } else {
                return { success: true };
            }
        } else {
            return fail(result.status, {
                error: result.error
            });
        }
    },
} satisfies Actions;

