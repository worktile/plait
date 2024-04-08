import { produce } from 'immer';
import { PlaitOperation } from './operation';

export interface PathLevelsOptions {
    reverse?: boolean;
}

export type Path = number[];

export const Path = {
    /**
     * Get a list of ancestor paths for a given path.
     *
     * The paths are sorted from shallowest to deepest ancestor. However, if the
     * `reverse: true` option is passed, they are reversed.
     */
    ancestors(path: Path, options: PathLevelsOptions = {}): Path[] {
        const { reverse = false } = options;
        let paths = Path.levels(path, options);

        if (reverse) {
            paths = paths.slice(1);
        } else {
            paths = paths.slice(0, -1);
        }

        return paths;
    },
    /**
     * Get a list of paths at every level down to a path. Note: this is the same
     * as `Path.ancestors`, but including the path itself.
     *
     * The paths are sorted from shallowest to deepest. However, if the `reverse:
     * true` option is passed, they are reversed.
     */
    levels(path: Path, options: PathLevelsOptions = {}): Path[] {
        const { reverse = false } = options;
        const list: Path[] = [];

        for (let i = 0; i <= path.length; i++) {
            list.push(path.slice(0, i));
        }

        if (reverse) {
            list.reverse();
        }

        return list;
    },
    parent(path: Path): Path {
        if (path.length === 0) {
            throw new Error(`Cannot get the parent path of the root path [${path}].`);
        }

        return path.slice(0, -1);
    },
    next(path: Path): Path {
        if (path.length === 0) {
            throw new Error(`Cannot get the next path of a root path [${path}], because it has no next index.`);
        }
        const last = path[path.length - 1];
        return path.slice(0, -1).concat(last + 1);
    },
    hasPrevious(path: Path): boolean {
        return path[path.length - 1] > 0;
    },
    previous(path: Path): Path {
        if (path.length === 0) {
            throw new Error(`Cannot get the next path of a root path [${path}], because it has no previous index.`);
        }
        const last = path[path.length - 1];
        return path.slice(0, -1).concat(last - 1);
    },
    /**
     * Check if a path is an ancestor of another.
     */

    isAncestor(path: Path, another: Path): boolean {
        return path.length < another.length && Path.compare(path, another) === 0;
    },
    /**
     * Compare a path to another, returning an integer indicating whether the path
     * was before, at, or after the other.
     *
     * Note: Two paths of unequal length can still receive a `0` result if one is
     * directly above or below the other. If you want exact matching, use
     * [[Path.equals]] instead.
     */
    compare(path: Path, another: Path): -1 | 0 | 1 {
        const min = Math.min(path.length, another.length);

        for (let i = 0; i < min; i++) {
            if (path[i] < another[i]) return -1;
            if (path[i] > another[i]) return 1;
        }

        return 0;
    },

    /**
     * Check if a path is exactly equal to another.
     */

    equals(path: Path, another: Path): boolean {
        return path.length === another.length && path.every((n, i) => n === another[i]);
    },
    /**
     * Check if a path ends before one of the indexes in another.
     */

    endsBefore(path: Path, another: Path): boolean {
        const i = path.length - 1;
        const as = path.slice(0, i);
        const bs = another.slice(0, i);
        const av = path[i];
        const bv = another[i];
        return Path.equals(as, bs) && av < bv;
    },
    /**
     * Check if a path is a sibling of another.
     */
    isSibling(path: Path, another: Path): boolean {
        if (path.length !== another.length) {
            return false;
        }

        const as = path.slice(0, -1);
        const bs = another.slice(0, -1);
        const al = path[path.length - 1];
        const bl = another[another.length - 1];
        return al !== bl && Path.equals(as, bs);
    },
    transform(path: Path | null, operation: PlaitOperation): Path | null {
        return produce(path, p => {
            // PERF: Exit early if the operation is guaranteed not to have an effect.
            if (!path || path?.length === 0) {
                return;
            }

            if (p === null) {
                return null;
            }

            switch (operation.type) {
                case 'insert_node': {
                    const { path: op } = operation;

                    if (Path.equals(op, p) || Path.endsBefore(op, p) || Path.isAncestor(op, p)) {
                        p[op.length - 1] += 1;
                    }

                    break;
                }

                case 'remove_node': {
                    const { path: op } = operation;

                    if (Path.equals(op, p) || Path.isAncestor(op, p)) {
                        return null;
                    } else if (Path.endsBefore(op, p)) {
                        p[op.length - 1] -= 1;
                    }

                    break;
                }

                case 'move_node': {
                    const { path: op, newPath: onp } = operation;

                    // If the old and new path are the same, it's a no-op.
                    if (Path.equals(op, onp)) {
                        return;
                    }

                    if (Path.isAncestor(op, p) || Path.equals(op, p)) {
                        const copy = onp.slice();
                        // op.length <= onp.length is different for slate
                        // resolve drag from [0, 0] to [0, 3] issue
                        if (Path.endsBefore(op, onp) && op.length <= onp.length) {
                            copy[op.length - 1] -= 1;
                        }

                        return copy.concat(p.slice(op.length));
                    } else if (Path.isSibling(op, onp) && (Path.isAncestor(onp, p) || Path.equals(onp, p))) {
                        if (Path.endsBefore(op, p)) {
                            p[op.length - 1] -= 1;
                        } else {
                            p[op.length - 1] += 1;
                        }
                    } else if (Path.endsBefore(onp, p) || Path.equals(onp, p) || Path.isAncestor(onp, p)) {
                        if (Path.endsBefore(op, p)) {
                            p[op.length - 1] -= 1;
                        }

                        p[onp.length - 1] += 1;
                    } else if (Path.endsBefore(op, p)) {
                        if (Path.equals(onp, p)) {
                            p[onp.length - 1] += 1;
                        }

                        p[op.length - 1] -= 1;
                    }

                    break;
                }
            }
            return p;
        });
    }
};
