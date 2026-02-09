/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Order = {
    id: number;
    user_id: number;
    material_id: number;
    collector_id?: (number | null);
    address: string;
    contact_phone?: (string | null);
    status?: (string | null);
    unit_price_snapshot?: (string | null) | null;
    weight_actual?: (string | null) | null;
    impurity_deduction_percent?: (string | null);
    applied_bonus_amount?: (string | null);
    amount_final?: (string | null) | null;
    appointment_time?: (string | null);
    remark?: (string | null);
    readonly date: string;
};
