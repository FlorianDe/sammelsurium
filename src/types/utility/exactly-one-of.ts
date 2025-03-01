/**
 * A utility type that enforces exactly one property from `T` to be set.
 *
 * This ensures that:
 * - At least one property must be provided.
 * - No more than one property can be set at the same time.
 *
 * If multiple properties are specified, TypeScript will produce an error.
 * If no properties are specified, TypeScript will also produce an error.
 *
 * @template T - The object type from which exactly one property must be set.
 * @template K - The keys of `T` that are considered for exclusivity. Defaults to all keys in `T`.
 *
 * @example
 * type UserIdentifier = ExactlyOneOf<{
 *   id: string;
 *   email: string;
 *   username: string;
 * }>;
 *
 * // Valid usage
 * const user1: UserIdentifier = { id: "123" };
 * const user2: UserIdentifier = { email: "test@example.com" };
 * const user3: UserIdentifier = { username: "user123" };
 *
 * // Invalid usage
 * const user4: UserIdentifier = {}; // Error: At least one property is required
 * const user5: UserIdentifier = { id: "123", email: "test@example.com" }; // Error: Only one property allowed
 */
export type ExactlyOneOf<T, K extends keyof T = keyof T> = {
  [P in K]: Record<P, T[P]> & Partial<Record<Exclude<K, P>, never>>
}[K]
