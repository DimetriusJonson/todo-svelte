import type { AuthData } from "$lib/model/AuthData.svelte";
import type { Cookies } from "@sveltejs/kit";

export const apiInProgressGlobal = $state({ value: false });

export const SECURITY_COOKIE_NAME = 'todo-token';

export function deleteOnServerSecurityCookie(cookies: Cookies) {
    cookies.delete(SECURITY_COOKIE_NAME, { path: '/' });
}

