import { apiUser } from '$lib/api/ApiUser';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.authData = apiUser.parseToken({ cookies: event.cookies });

    const response = await resolve(event);
    
	return response;
};
