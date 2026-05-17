import { apiUser } from '$lib/api/ApiUser';
import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
    if (building) {
        return await resolve(event);
    }

    let authData = apiUser.parseToken({ cookies: event.cookies });
    let user = await apiUser.getCurrentUser({authData});

    if (!user?.id) {
        if (!event.url.pathname.startsWith('/login')) {
            throw redirect(303, '/login?redirectTo=' + event.url.pathname);
        }
    }

    event.locals.user = user;
    const response = await resolve(event);

    return response;
};
