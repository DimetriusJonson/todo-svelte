import { apiUser } from '$lib/api/ApiUser';
import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import type { User } from '$lib/model/User.svelte';
import { parseJwtToken } from '$lib/server/jwt';

export const handle: Handle = async ({ event, resolve }) => {
    if (building) {
        return await resolve(event);
    }

    const routeId = event.route.id;

    let sec_value = event.cookies.get('todo-token');
    let authData = sec_value ? parseJwtToken(sec_value) : null;

    if (!authData) {
        if (!event.url.pathname.startsWith('/login') && (routeId?.includes('(authed)'))) {
            throw redirect(303, '/login?redirectTo=' + event.url.pathname);
        }
    }

    event.locals.user = { id: authData?.userId, name: authData?.userName } as User;
    const response = await resolve(event);

    return response;
};
