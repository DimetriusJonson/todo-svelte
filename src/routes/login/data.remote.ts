import { form, getRequestEvent } from "$app/server";
import { apiUser } from '$lib/api/ApiUser';
import { LoginSchema, type LoginRequest } from '$lib/model/User.svelte';
import { redirect } from '@sveltejs/kit';

export const login = form(LoginSchema, async ({userName, password, redirectTo}) => {
    const event = getRequestEvent();

    let result = await apiUser.login(null, { username: userName, password: password } as LoginRequest);
    if (result.success) {
        apiUser.saveAuthDataAsCookie(event.cookies, { userId: result.responseData?.id ?? 0, userName: result.responseData?.username ?? '', token: result.responseData?.token ?? '' });
        redirect(303, redirectTo );
    } else {
        return { error: result.error };
    }
});