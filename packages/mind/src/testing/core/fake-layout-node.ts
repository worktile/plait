import { GlobalLayout, OriginNode } from '@plait/layouts';
import { MindNode, PlaitMind } from '../../interfaces';
import { getDefaultLayout } from '../../utils/layout';
import { getLayoutOptions } from '../../utils/space/layout-options';
import { PlaitMindBoard } from '../../plugins/with-extend-mind';
import { depthFirstRecursion } from '@plait/core';
import { ELEMENT_TO_NODE } from '../../utils/weak-maps';

export const fakeMindLayout = (board: PlaitMindBoard, mind: PlaitMind) => {
    const mindLayoutType = mind.layout || getDefaultLayout();
    const root = (GlobalLayout.layout((mind as unknown) as OriginNode, getLayoutOptions(board), mindLayoutType) as unknown) as MindNode;
    updateMindNodeLocation(mind, root);
    return root;
};

export const updateMindNodeLocation = (mind: PlaitMind, root: MindNode) => {
    const { x, y, hGap, vGap } = root;
    const offsetX = x + hGap;
    const offsetY = y + vGap;
    depthFirstRecursion<MindNode>(root, node => {
        node.x = node.x - offsetX + mind.points[0][0];
        node.y = node.y - offsetY + mind.points[0][1];
        ELEMENT_TO_NODE.set(node.origin, node);
    });
};

export const clearWeakMap = (root: MindNode) => {
    depthFirstRecursion<MindNode>(root, node => {
        ELEMENT_TO_NODE.delete(node.origin);
    });
};
