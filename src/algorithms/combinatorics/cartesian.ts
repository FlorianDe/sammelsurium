type InputArrays = ReadonlyArray<ArrayLike<unknown>>

/**
 * Represents a tuple of cartesian product elements for a set of input arrays.
 *
 * The tuple type corresponds to an element from each of the input arrays
 * in the cartesian product.
 *
 * @template T The type of the input arrays.
 */
export type CartesianProductTuple<T extends InputArrays> = {
  -readonly [K in keyof T]: T[K] extends ArrayLike<infer U> ? U : never
}

/**
 * Lazily computes the Cartesian product of multiple arrays or array-like objects.
 *
 * The Cartesian product consists of all possible ordered combinations of the input arrays' elements whose type is infered automatically.
 * This class implements the `Iterable` interface, allowing iteration with `for...of` and other iterable operations.
 *
 * @template T - A tuple type representing an array of array-like objects.
 *
 * @example
 * ```
 * const arrays = [
 *   [1, 2],     // Array of numbers
 *   ['a', 'b'], // Array of strings
 * ];
 *
 * const product = new CartesianProduct(arrays);
 *
 * // Get specific combination by index
 * console.log(product.get(0)); // [1, 'a']
 * console.log(product.get(1)); // [1, 'b']
 * console.log(product.get(2)); // [2, 'a']
 * console.log(product.get(3)); // [2, 'b']
 *
 * // Iterate with for...of
 * for (const combination of product) {
 *   console.log(combination); // [1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']
 * }
 *
 * // Convert to array with Array.from()
 * const combinations = Array.from(product);
 * console.log(combinations); // [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 *
 * // Use iterator() directly
 * const iterator = product.iterator();
 * console.log(iterator.next().value); // [1, 'a']
 * ```
 */
export class CartesianProduct<T extends InputArrays>
  implements Iterable<CartesianProductTuple<T>>
{
  private readonly sizes: number[]
  private readonly total: number

  /**
   * Constructs an instance of the CartesianProduct class.
   *
   * @param arrays The input arrays for which the cartesian product will be computed.
   */
  constructor(private readonly arrays: readonly [...T]) {
    this.sizes = this.arrays.map((arr) => arr.length)
    this.total = this.sizes.reduce((acc, size) => acc * size, 1)
  }

  /**
   * Retrieves the combination (tuple) at a specific index in the Cartesian product.
   *
   * The index is computed based on the total number of possible combinations (the product of the sizes of the input arrays).
   * If the provided index is outside the valid range (from 0 to total - 1), `null` is returned.
   *
   * **Mathematical Calculation**:
   * The total number of combinations is calculated as the product of the lengths of all input arrays:
   * ```
   * total = size_1 * size_2 * ... * size_n
   * ```
   * @param index - The index of the combination to retrieve, between `0` and `total - 1`.
   * @returns The combination at the specified index, or `null` if the index is out of bounds.
   *
   */
  get(index: number): CartesianProductTuple<T> | null {
    if (index < 0 || index >= this.total) return null

    const combination = [] as CartesianProductTuple<T>
    for (let i = this.arrays.length - 1, remainder = index; i >= 0; i--) {
      combination[i] = this.arrays[i][remainder % this.sizes[i]]
      remainder = Math.floor(remainder / this.sizes[i])
    }
    return combination
  }

  private createNextCombinationFn = () => {
    const indices = new Uint32Array(this.arrays.length)
    let idx = 0
    return {
      count: () => idx,
      hasNext: () => idx < this.total,
      next: () => {
        const combination = new Array(
          this.arrays.length,
        ) as CartesianProductTuple<T>
        for (let i = 0; i < this.arrays.length; i++) {
          combination[i] = this.arrays[i][indices[i]]
        }
        for (let i = this.arrays.length - 1; i >= 0; i--) {
          if (++indices[i] < this.sizes[i]) {
            break
          }
          indices[i] = 0
        }
        idx++
        return combination
      },
    }
  }

  /**
   * Iterates over all combinations of the cartesian product and invokes the provided callback for each combination.
   *
   * @param callback The function to be called for each combination, with the combination and its index as arguments.
   */
  forEach(
    callback: (combination: CartesianProductTuple<T>, index: number) => void,
  ): void {
    const combinationFn = this.createNextCombinationFn()
    while (combinationFn.hasNext()) {
      callback(combinationFn.next(), combinationFn.count() - 1)
    }
  }

  /**
   * Returns an iterator for iterating over the combinations in the cartesian product.
   *
   * @returns An iterator for the cartesian product.
   */
  iterator(): Iterator<CartesianProductTuple<T>> {
    const combinationFn = this.createNextCombinationFn()
    return {
      next: (): IteratorResult<CartesianProductTuple<T>> => {
        if (!combinationFn.hasNext()) {
          return { done: true, value: undefined }
        }
        return { done: false, value: [...combinationFn.next()] }
      },
    }
  }

  [Symbol.iterator](): Iterator<CartesianProductTuple<T>> {
    return this.iterator()
  }
}

/**
 * A class that extends `CartesianProduct` and allows access to combinations via an array index.
 *
 * This class supports retrieving combinations using numeric indices, and provides a proxy
 * to enable access via an array-like index as well as string keys.
 *
 * @template T The type of the input arrays.
 */
export class IndexedCartesianProduct<
  T extends InputArrays,
> extends CartesianProduct<T> {
  [index: number]: CartesianProductTuple<T> | undefined
  [key: string]: unknown

  private validArrayIndexAccessor = (
    prop: string | symbol,
  ): { isValid: false } | { isValid: true; value: number } => {
    if (typeof prop === 'string') {
      const num = Number(prop)
      if (Number.isSafeInteger(num) && num >= 0) {
        return { isValid: true, value: num }
      }
    }
    return { isValid: false }
  }

  constructor(arrays: readonly [...T]) {
    super(arrays)
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        const checkedProp = this.validArrayIndexAccessor(prop)
        if (checkedProp.isValid) {
          return target.get(checkedProp.value)
        }
        return Reflect.get(target, prop, receiver)
      },
    })
  }
}
