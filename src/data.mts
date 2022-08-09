/**
 * trying to simultate a Clojure Atom
 */
export class Atom<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
  deref(): T {
    return this.value;
  }
  reset(value: T) {
    this.value = value;
  }
  swap(f: (value: T) => T) {
    this.value = f(this.value);
  }
}
