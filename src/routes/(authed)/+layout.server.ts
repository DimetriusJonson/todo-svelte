import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad  = async ({ parent, url }) => {
	let parentData: any = await parent();
	if (!parentData.authData?.token) {
		redirect(303, `/login?redirectTo=${url.pathname}`);
	}
}

