import { PlaitElementRef } from '@plait/core';
import { Generator } from '../generators';

export class PlaitCommonElementRef implements PlaitElementRef {
    private generatorMap = new Map<string, Generator>();

    addGenerator<T extends Generator = Generator>(key: string, generator: T) {
        this.generatorMap.set(key, generator);
    }

    getGenerator<T extends Generator = Generator>(key: string) {
        return this.generatorMap.get(key) as T;
    }
}
