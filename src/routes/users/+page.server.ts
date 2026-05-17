import { apiUser } from '$lib/api/ApiUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
    let resp = await apiUser.getUsers({ parent: parent, fetch: fetch });
    if (resp.success && resp.responseData) {
        return { users: resp.responseData.data }
    }
    return resp;
}
