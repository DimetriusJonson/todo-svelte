import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { LoginRequest } from '$lib/model/User.svelte';
import { apiUser } from '$lib/api/ApiUser';

export const actions = {
    login: async ({ cookies, request }) => {
        let formData = Object.fromEntries(await request.formData());

        let result = await apiUser.login({ cookies: cookies }, { username: formData.userName, password: formData.password } as LoginRequest);
        if (result.success) {
            apiUser.saveAuthDataAsCookie(cookies, { userId: result.responseData?.id ?? 0, userName: result.responseData?.username ?? '', token: result.responseData?.token ?? '' });
            if (formData.redirectTo) {
                redirect(302, formData.redirectTo.toString());
            } else {
                return { success: true };
            }
        } else {
            return fail(result.status, {
                user: { userName: formData.userName, password: formData.password },
                error: result.error
            });
        }
    },
} satisfies Actions;

