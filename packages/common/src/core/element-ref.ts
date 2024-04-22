import { PlaitElementRef } from '@plait/core';
import { Generator } from '../generators';

export class PlaitCommonElementRef implements PlaitElementRef {
    private generatorMap = new Map<string, Generator | Object>();

    addGenerator<T extends Object = Generator>(key: string, generator: T) {
        this.generatorMap.set(key, generator);
    }

    getGenerator<T extends Object = Generator>(key: string) {
        return this.generatorMap.get(key) as T;
    }
}
