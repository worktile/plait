import { Element } from 'slate';
import { PlaitElement, Point } from '@plait/core';

export const isWorkflowNode = (value: PlaitElement): value is WorkflowElement => {
    return ['todo', 'in_progess', 'done'].includes(value.type);
};

export const isWorkflowTransition = (value: PlaitElement): value is WorkflowElement => {
    return ['global', 'inital', 'directed'].includes(value.type);
};

export const isWorkflowOrigin = (value: PlaitElement): value is WorkflowElement => {
    return value.type === 'origin';
};

export interface WorkflowElement extends PlaitElement {
    id: string;
    type: WorkflowCategoryType | WorkflowTransitionType | WorkflowOriginType;
    value: Element;
    width?: number;
    height?: number;
    from?: WorkflowTransitionLinkType | null;
    to?: WorkflowTransitionLinkType;
    [key: string]: any;
}

export interface WorkflowPortsNode extends WorkflowElement {
    endPoint: Point;
    startPoint: Point | null;
}

export interface WorkflowTransitionLinkType {
    id: string;
    port: WorkflowPortType;
}

export type WorkflowCategoryType = 'todo' | 'in_progess' | 'done';

export type WorkflowTransitionType = 'global' | 'inital' | 'directed';

export type WorkflowOriginType = 'origin';

export type WorkflowPortType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
