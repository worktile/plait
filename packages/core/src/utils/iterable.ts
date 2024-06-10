/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function isListLikeIterable(obj: any): boolean {
    if (!isJsObject(obj)) return false;
    return (
        Array.isArray(obj) ||
        (!(obj instanceof Map) && // JS Map are iterables but return entries as [k, v]
            Symbol.iterator in obj)
    ); // JS Iterable have a Symbol.iterator prop
}

export function isJsObject(o: any): boolean {
    return o !== null && (typeof o === 'function' || typeof o === 'object');
}

export function iterateListLike<T>(obj: Iterable<T>, fn: (p: T) => void) {
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            fn(obj[i]);
        }
    } else {
        const iterator = obj[Symbol.iterator]();
        let item: IteratorResult<T, any>;
        while (!(item = iterator.next()).done) {
            fn(item.value);
        }
    }
}
