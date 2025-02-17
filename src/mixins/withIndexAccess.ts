type Constructor<T = {}> = new (...args: any[]) => T

export function withIndexAccessor<
  Base extends Constructor,
  K extends {
    [P in keyof InstanceType<Base>]: InstanceType<Base>[P] extends (
      idx: number,
    ) => any
      ? P
      : never
  }[keyof InstanceType<Base>],
>(
  BaseClass: Base,
  methodName: K extends keyof InstanceType<Base>
    ? InstanceType<Base>[K] extends (idx: number) => infer R
      ? [idx: number] extends Parameters<InstanceType<Base>[K]>
        ? K
        : never
      : never
    : never,
) {
  type MethodType = InstanceType<Base>[K] extends (index: number) => infer R
    ? (index: number) => R
    : never
  type ItemType = ReturnType<MethodType>

  const validArrayIndexAccessor = (
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

  return class extends BaseClass {
    [index: number]: ItemType | undefined;
    [key: string]: unknown;

    constructor(...args: any[]) {
      super(...args)
      return new Proxy(this as InstanceType<Base>, {
        get: (target, prop, receiver) => {
          const checkedProp = validArrayIndexAccessor(prop)
          if (checkedProp.isValid) {
            const method: InstanceType<Base>[K] = target[methodName]
            if (typeof method === 'function') {
              return method.call(target, checkedProp.value)
            }
          }
          return Reflect.get(target, prop, receiver)
        },
      }) as this;
    }
  }
}
