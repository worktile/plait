import { PlaitBoard } from '../../interfaces/board';
import { PlaitNode } from '../../interfaces/node';
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../../utils/weak-maps';

export const fakeNodeWeakMap = (object: PlaitNode | PlaitBoard, mappedNodes?: Set<PlaitNode>) => {
    const children = object.children || [];
    children.forEach((value, index: number) => {
        NODE_TO_PARENT.set(value, object);
        NODE_TO_INDEX.set(value, index);
        mappedNodes?.add(value);
        fakeNodeWeakMap(value, mappedNodes);
    });
};

export const clearNodeWeakMap = (object: PlaitNode | PlaitBoard) => {
    const children = object.children || [];
    clearNodeWeakMapByNodes(children);
};

export const clearNodeWeakMapByNodes = (nodes: PlaitNode[]) => {
    nodes.forEach((value) => {
        NODE_TO_PARENT.delete(value);
        NODE_TO_INDEX.delete(value);
        clearNodeWeakMap(value);
    });
};
