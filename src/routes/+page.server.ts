import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MIN_COMPLETED_AT, taskFromJson, type Task } from '$lib/model/Task.svelte';
import { deleteOnServerSecurityCookie } from '$lib/store/settings.svelte';
import { filterTask, sortTask } from '$lib/TaskHelper.svelte';
import { apiTask } from '$lib/api/ApiTask';
import { apiUser } from '$lib/api/ApiUser';

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
    const filterSelect = url.searchParams.get('filterSelect');
    const sortSelect = url.searchParams.get('sortSelect');

    let sortOptions = [sortToOption("Title"), sortToOption("Priority")];

    let filterOptions = [
        filterToOption("Completed"),
        filterToOption("Uncompleted"),
    ];

    let resp = await apiTask.getList({ parent: parent, fetch: fetch });
    if (resp.success && resp.responseData) {
        return { tasks: buildTasks(resp.responseData.data, filterSelect, sortSelect), sortOptions: sortOptions, filterOptions: filterOptions };
    }

    return resp;
}

export const actions = {
    changeCompleted: async ({ cookies, request }) => {
        let formData = Object.fromEntries(await request.formData());

        let patch: Task = {
            id: parseInt(formData.id.toString() ?? '0'),
            completed_at: formData.completed ? new Date().toISOString() : MIN_COMPLETED_AT,
        };

        let result = await apiTask.update({cookies: cookies}, patch);
        if (!result.success) {
            return fail(result.status, {
                task: { completed: formData.completed },
                error: result.error
            });
        }

        return { task: result.responseData };
    },

    logout: async ({ cookies, request }) => {
        let formData = Object.fromEntries(await request.formData());

        let result = await apiUser.logout({cookies: cookies});
        if (!result.success && !result.error?.unAuthorized) {
            return fail(result.status, {
                error: result.error
            });
        }

        deleteOnServerSecurityCookie(cookies);

        if (formData.redirectTo) {
            redirect(302, formData.redirectTo.toString());
        } else {
            return { success: true };
        }
    },
} satisfies Actions;

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