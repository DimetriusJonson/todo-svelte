import type { AuthData } from "$lib/model/AuthData.svelte";
import jwt from "jsonwebtoken";
import { env } from '$env/dynamic/private';

export function createJwtToken(userId: number, userName: string): string {
    return jwt.sign({ user_id: userId, user_name: userName }, env.JWT_SECRET, { expiresIn: '24h' });
}

export function parseJwtToken(token: string | null | undefined): AuthData | null {
    if (!token) {
        return null;
    }

    try {
        let res: any = jwt.verify(token, env.JWT_SECRET);
        return res ? { userId: res.user_id, userName: res.user_name, token: token } : null;
    } catch (error: any) {
        console.log(error);
        return null;
    }
}