/**
 * @member deleted
 * @memberof module:SimpleSharedState
 * @const {number} deleted - A globally unique object to reference when you want to delete
 * things from state.
 *
 * @example
 * // `deleted` is essentially just a Symbol, but works in IE.
 * const deleted = new Number(0);
 * deleted === 0; // false
 * deleted === deleted; // true
 *
 * @example
 * import { Store, deleted } from "simple-shared-state";
 *
 * const actions = () => ({
 *   removeB: (prop) => ({
 *     [prop]: deleted,
 *   }),
 * });
 * const store = new Store({ a: 1, b: 2 }, actions);
 * console.log(store.getState()); // { a: 1, b: 2 }
 *
 * store.actions.removeB("b");
 *
 * // state: { a: 1 }
 */
export const deleted = Symbol("deleted");
export type Deleted = typeof deleted;

export type Selector<T> = (state: T) => any;
export type Handler = (value: Snapshot) => any;
export type BatchHandler = (value: Snapshot[]) => any;

export type BasicValue = string | number | boolean;
export type StateValue = StateRoot | Generic | List | BasicValue;
export interface List extends Array<StateValue> { };
export type Generic = { [k: string]: any };
export interface StateRoot { [x: string]: StateValue };

type KeyOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
type DeletedKeys<T> = KeyOfType<T, Deleted>;
type ArrayKeys<T> = KeyOfType<T, any[]>;

export type Merge<T, U> = Omit<T & U, DeletedKeys<U> | ArrayKeys<U>> & Pick<U, ArrayKeys<U>>;
export type Branch = StateRoot & { [k: string]: Deleted } & { [k: string]: StateRoot };
export type Snapshot = StateValue;

export type DevToolSubscriberMessage = {
    type: string,
    state: string,
    payload: {
        type: string,
    },
};

const objectPrototype = Object.getPrototypeOf({});
export const isObject = (obj: any): obj is Generic => (
	!!obj && Object.getPrototypeOf(obj) === objectPrototype
);
export const isObjectType = (obj: any): obj is Generic => (
	!!obj && typeof obj === "object"
);
export const isBranch = (obj: any): obj is Branch => (
	!!obj && Object.getPrototypeOf(obj) === objectPrototype
);
export const isPrimitive = (value: any): value is BasicValue => {
    switch (typeof value) {
        case "string": return true;
        case "number": return true;
        case "boolean": return true;
        default: return false;
    }
};
export const isNullOrUndefined = (value: any): value is null | undefined => (
	value === null || value === undefined
);
