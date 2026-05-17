// See https://svelte.dev/docs/kit/types#app.d.ts

import type { AuthData } from "$lib/model/AuthData.svelte";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authData: AuthData | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
