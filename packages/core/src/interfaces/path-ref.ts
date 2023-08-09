import { PlaitOperation } from './operation';
import { Path } from './path';

export interface PathRef {
    current: Path | null;
    affinity: 'forward' | 'backward' | null;
    unref(): Path | null;
}

export interface PathRefOptions {
    affinity?: 'forward' | 'backward' | null;
}

export const PathRef = {
    transform(ref: PathRef, op: PlaitOperation): void {
        const { current } = ref;

        if (current == null) {
            return;
        }

        const path = Path.transform(current, op);
        ref.current = path;

        if (path == null) {
            ref.unref();
        }
    }
};
