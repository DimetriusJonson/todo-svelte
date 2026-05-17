import { browser } from "$app/environment";
import { error, redirect } from "@sveltejs/kit";
import { apiUser } from "../ApiUser";
import type { ApiResponse } from "../apiTypes";

export async function makeRequest<T>(path: string, method: string, requestData: object | null, cookies: any): Promise<ApiResponse<T>> {
    let authData = apiUser.parseToken({ cookies: cookies });
    try {
        const response = await fetch(getHostUrl() + path, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authData?.token,
            },
            body: requestData ? JSON.stringify(requestData) : null,
            keepalive: true,
        });

        return await processResponse(response);
    } catch (error: any) {
        return { status: -1, success: false, responseData: null, error: { message: error.message as string } };
    }
}

async function processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.ok) {
        const responseData = await response.json();
        return { status: response.status, success: true, responseData: responseData, error: null };
    } else {
        switch (response.status) {
            case 401: {
                const responseData = await response.json();
                return { status: response.status, success: false, responseData: null, error: { message: responseData.error, unAuthorized: true } };
            }
            case 422: {
                const responseData = await response.json();

                let errorsMap = new Map();
                responseData.error.split('\n').forEach((field_error: string, index: number) => {
                    let sepIndex = field_error.indexOf(':');
                    if (sepIndex >= 0) {
                        errorsMap.set(
                            field_error.substring(0, sepIndex).trim(),
                            field_error.substring(sepIndex + 1).trim(),
                        );
                    }
                });
                return { status: response.status, success: false, responseData: null, error: { message: responseData.error, validateErrors: errorsMap } };
                break;
            }
            default: {
                const responseData = await response.json();
                return { status: response.status, success: false, responseData: null, error: { message: responseData.error } };
            }
        }
    }
}

export function getHostUrl() {
    if (browser) {
        let location = window.location;
        return location.protocol + '//' + location.hostname + '/api/v1';
    }
    return 'http://reverse-proxy/api/v1';
}

export async function fetchData<T>(parent: any, fetch: any, path: string): Promise<ApiResponse<T>> {
    let { authData } = await parent();

    const response = await fetch(getHostUrl() + path, { method: "GET", headers: { 'Authorization': 'Bearer ' + authData?.token } });
    if (response.ok) {
        const responseData = await response.json();
        return { status: response.status, success: true, responseData: responseData, error: null };
    } else {
        switch (response.status) {
            case 401: {
                redirect(302, '/login');
            }
            default: {
                const responseData = await response.json();
                error(response.status, responseData.error);
            }
        }
    }
}