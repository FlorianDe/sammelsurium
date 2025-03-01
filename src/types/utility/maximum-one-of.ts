/**
 * A utility type that enforces at most one property from `T` to be set.
 *
 * This ensures that:
 * - Zero or one property can be provided.
 * - If multiple properties are set, TypeScript will produce an error.
 * - If no properties are set, it remains valid.
 *
 * @template T - The object type from which at most one property can be set.
 * @template K - The keys of `T` that are considered for exclusivity. Defaults to all keys in `T`.
 *
 * @example
 * type UserDescriptor = MaximumOneOf<{
 *   id: string;
 *   email: string;
 *   username: string;
 * }>;
 *
 * // Valid usage
 * const user1: UserDescriptor = { id: "123" };
 * const user2: UserDescriptor = { email: "test@example.com" };
 * const user3: UserDescriptor = {}; // Allowed (zero properties)
 *
 * // Invalid usage
 * const user4: UserDescriptor = { id: "123", email: "test@example.com" }; // Error: Only one property allowed
 */
export type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T
  ? {
      [P in K]?: T[K]
    } & Partial<Record<Exclude<keyof T, K>, never>>
  : never
