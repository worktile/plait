import { WorkflowElement } from '../interfaces';
import { PlaitBoard } from '@plait/core';
import { getRectangleByNode } from '../utils';
import { WORKFLOW_GLOBAL_LINK_LENGTH } from '../constants';

export function getRichtextRectByTranstion(board: PlaitBoard, transtion: WorkflowElement) {
    let richtext;
    switch (transtion.type) {
        case 'inital':
            richtext = getInitalRichtext(transtion);
            break;
        case 'global':
            richtext = getGlobalRichtext(board, transtion);
            break;
        default:
            richtext = getDirectedRichtext(transtion);
            break;
    }
    return richtext;
}

export function getInitalRichtext(transtion: WorkflowElement) {}

export function getGlobalRichtext(board: PlaitBoard, transtion: WorkflowElement) {
    const linkNode = board.children.find(item => item.id === transtion.to?.id);
    let { x, y, width, height } = getRectangleByNode(linkNode as WorkflowElement);
    const textX = x + width / 2 - 35;
    const textY = y + height + WORKFLOW_GLOBAL_LINK_LENGTH;
    return { width: 70, height: 20, textX, textY };
}

export function getDirectedRichtext(transtion: WorkflowElement) {}
