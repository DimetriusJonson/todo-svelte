import { apiUser } from '$lib/api/ApiUser';
import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import type { User } from '$lib/model/User.svelte';

export const handle: Handle = async ({ event, resolve }) => {
    if (building) {
        return await resolve(event);
    }

    let authData = apiUser.parseToken({ cookies: event.cookies });
    if (!authData) {
        if (!event.url.pathname.startsWith('/login')) {
            throw redirect(303, '/login?redirectTo=' + event.url.pathname);
        }
    }

    event.locals.user = {id: authData?.userId, name: authData?.userName} as User;
    const response = await resolve(event);

    return response;
};
