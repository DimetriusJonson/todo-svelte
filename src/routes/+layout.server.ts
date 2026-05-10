import { apiUser } from "$lib/api/ApiUser";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad  = async ({ cookies }) => {
    let authData = apiUser.parseToken({ cookies: cookies });
    return { authData: authData };
}

