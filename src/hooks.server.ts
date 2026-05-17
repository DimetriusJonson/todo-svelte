import { apiUser } from '$lib/api/ApiUser';
import { getCurrentUser } from '$lib/api/postgres/ApiUserNeonDb';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    let authData = apiUser.parseToken({ cookies: event.cookies });
    let user = await getCurrentUser({authData});
    if (!user) {
        if (!event.url.pathname.startsWith('/login')) {
            throw redirect(303, '/login?redirectTo=' + event.url.pathname);
        }
    }

    event.locals.user = user;
    const response = await resolve(event);
    
	return response;
};
