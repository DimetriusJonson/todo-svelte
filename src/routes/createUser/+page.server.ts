import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { apiUser } from '$lib/api/ApiUser';
import type { CreateUserRequest } from '$lib/model/User.svelte';

export const actions = {
    create: async ({ cookies, request }) => {
        let formData = Object.fromEntries(await request.formData());

        let result = await apiUser.create({ cookies: cookies }, { username: formData.userName, password: formData.password } as CreateUserRequest);
        if (result.success) {
            if (formData.redirectTo) {
                redirect(302, formData.redirectTo.toString() + formData.userName.toString());
            } else {
                return { createdUser: result.responseData };
            }
        } else {
            return fail(result.status, {
                user: { userName: formData.userName.toString(), password: formData.password.toString() },
                error: result.error
            });
        }
    },
} satisfies Actions;

