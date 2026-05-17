import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad  = async ({ locals }) => {
    return { authData: locals.authData };
}

