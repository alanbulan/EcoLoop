/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LoginResponse = {
    user_id: number;
    openid: string;
    is_new: boolean;
    full_name?: (string | null);
    avatar_url?: (string | null);
    // B1修复: 后端登录时返回关联的回收员 ID
    collector_id?: (number | null);
};

