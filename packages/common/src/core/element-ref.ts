import { PlaitElementRef } from '@plait/core';
import { Generator } from '../generators';
import { TextManage } from '../text';

export class PlaitCommonElementRef implements PlaitElementRef {
    private textManages: TextManage[] = [];

    private generatorMap = new Map<string, Generator | Object>();

    addGenerator<T extends Object = Generator>(key: string, generator: T) {
        this.generatorMap.set(key, generator);
    }

    getGenerator<T extends Object = Generator>(key: string) {
        return this.generatorMap.get(key) as T;
    }

    initializeTextManage(textManage: TextManage | TextManage[]) {
        this.textManages = [];
        if (Array.isArray(textManage)) {
            this.textManages.push(...textManage);
        } else {
            this.textManages.push(textManage);
        }
    }

    getTextManages() {
        return this.textManages;
    }

    updateActiveSection = () => {};

    destroyTextManage() {
        this.textManages.forEach((textManage) => {
            textManage.destroy();
        });
        this.textManages = [];
    }
}
