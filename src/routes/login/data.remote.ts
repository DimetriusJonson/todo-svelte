import * as v from 'valibot';
import { form, getRequestEvent } from "$app/server";
import { apiUser } from '$lib/api/ApiUser';
import type { LoginRequest } from '$lib/model/User.svelte';
import { redirect } from '@sveltejs/kit';

const LoginSchema = v.object({
    userName: v.pipe(v.string(), v.minLength(3, 'Минимальное число символов 3')),
    password: v.pipe(v.string(), v.minLength(4, 'Минимальное число символов 4')),
    redirectTo: v.pipe(v.string()),
});

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