import { getRectangleByNode } from '../utils/graph';
import { Point } from '@plait/core';
import { WorkflowElement } from '../interfaces';

export const getNodePorts: (node: WorkflowElement) => Point[] = (node: WorkflowElement) => {
    /**
     *  ---- 0 ----- 1 ----- 2 ----
     * ｜                          ｜
     * 7                           3
     * ｜                          ｜
     *  ---- 6 ----- 5 ----- 4 ----
     */
    const { x, y, width, height } = getRectangleByNode(node);
    const port0 = [x + width / 4, y];
    const port1 = [x + width / 2, y];
    const port2 = [x + (width / 4) * 3, y];
    const port3 = [x + width, y + height / 2];
    const port4 = [x + (width / 4) * 3, y + height];
    const port5 = [x + width / 2, y + height];
    const port6 = [x + width / 4, y + height];
    const port7 = [x, y + height / 2];
    return [port0, port1, port2, port3, port4, port5, port6, port7] as Point[];
};
