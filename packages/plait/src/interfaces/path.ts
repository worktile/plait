export type Path = number[];

export const Path = {
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
    }
};
