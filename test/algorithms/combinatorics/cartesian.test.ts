import {
  CartesianProduct,
  CartesianProductTuple,
  IndexedCartesianProduct,
} from '../../../src/algorithms/combinatorics'

describe('CartesianProduct Class', () => {
  test('should return correct combinations for a basic case', () => {
    const cart = new CartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    const result = Array.from(cart)
    expect(result).toEqual([
      [1, 'a'],
      [1, 'b'],
      [2, 'a'],
      [2, 'b'],
    ])
  })

  test('should handle single nested empty array (no combinations)', () => {
    expect(Array.from(new CartesianProduct([[]]))).toEqual([])
  })

  test('should handle single nested array (no combinations)', () => {
    expect(Array.from(new CartesianProduct([[1,2,3,4]]))).toEqual([[1],[2],[3],[4]])
  })

  test('should handle an empty array (no combinations)', () => {
    expect(Array.from(new CartesianProduct([[], ['a', 'b']]))).toEqual([])
  })

  test('should handle an empty second array (no combinations)', () => {
    expect(Array.from(new CartesianProduct([[1, 2], []]))).toEqual([])
  })

  test('should handle multiple empty arrays (no combinations)', () => {
    expect(Array.from(new CartesianProduct([[], [], []]))).toEqual([])
  })


  test('should return combinations for arrays of different lengths', () => {
    const cart = new CartesianProduct([
      [1, 2],
      ['a', 'b', 'c'],
    ])

    const result = Array.from(cart)
    expect(result).toEqual([
      [1, 'a'],
      [1, 'b'],
      [1, 'c'],
      [2, 'a'],
      [2, 'b'],
      [2, 'c'],
    ])
  })

  test('should get combination by index using get() method', () => {
    const cart = new CartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    expect(cart.get(0)).toEqual([1, 'a'])
    expect(cart.get(1)).toEqual([1, 'b'])
    expect(cart.get(2)).toEqual([2, 'a'])
    expect(cart.get(3)).toEqual([2, 'b'])
    expect(cart.get(4)).toBeNull()
  })

  test('should iterate over all combinations using forEach()', () => {
    const inputArrs = [
      [1, 2],
      ['a', 'b'],
    ]
    const cart = new CartesianProduct(inputArrs)

    const combinations: Array<{
      comb: CartesianProductTuple<typeof inputArrs>
      idx: number
    }> = []

    cart.forEach((comb, idx) => {
      combinations.push({ comb, idx })
    })

    expect(combinations).toEqual([
      { comb: [1, 'a'], idx: 0 },
      { comb: [1, 'b'], idx: 1 },
      { comb: [2, 'a'], idx: 2 },
      { comb: [2, 'b'], idx: 3 },
    ])
  })

  test('should iterate using iterator()', () => {
    const cart = new CartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    const iterator = cart.iterator()
    expect(iterator.next().value).toEqual([1, 'a'])
    expect(iterator.next().value).toEqual([1, 'b'])
    expect(iterator.next().value).toEqual([2, 'a'])
    expect(iterator.next().value).toEqual([2, 'b'])
    expect(iterator.next().done).toBe(true)
  })

  test('should work with Symbol.iterator', () => {
    const cart = new CartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    const result = Array.from(cart)
    expect(result).toEqual([
      [1, 'a'],
      [1, 'b'],
      [2, 'a'],
      [2, 'b'],
    ])

    expect(result.length).toBe(4)
  })

})

describe('IndexedCartesianProduct Class', () => {
  test('should allow index-based access via Proxy', () => {
    const cart = new IndexedCartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    expect(cart[0]).toEqual([1, 'a'])
    expect(cart[1]).toEqual([1, 'b'])
    expect(cart[2]).toEqual([2, 'a'])
    expect(cart[3]).toEqual([2, 'b'])
  })

  test('should return undefined for invalid index access', () => {
    const cart = new IndexedCartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    expect(cart[4]).toBeNull() // Out of bounds
  })

  test('should allow chained method calls with Proxy', () => {
    const cart = new IndexedCartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    expect(cart[0]).toEqual([1, 'a'])
    expect(cart[1]).toEqual([1, 'b'])
    expect(cart[2]).toEqual([2, 'a'])
    expect(cart[3]).toEqual([2, 'b'])
  })

  test('should return undefined for non-numeric access', () => {

    const cart = new IndexedCartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])
    expect(cart['a']).toBeUndefined()
  })

  test('should handle invalid index values gracefully', () => {
    const cart = new IndexedCartesianProduct([
      [1, 2],
      ['a', 'b'],
    ])

    // Testing a non-numeric string index
    expect(cart['invalid']).toBeUndefined()
  })

  test('should not break when accessing an empty array in IndexedCartesianProduct', () => {
    const cart = new IndexedCartesianProduct([[], ['a', 'b']])
    expect(cart[0]).toBeNull() // No combinations due to empty first array
  })
})
