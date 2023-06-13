import { ViewContainerRef } from '@angular/core';
import { drawRichtext } from '@plait/richtext';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { PlaitBoard, RectangleClient } from '@plait/core';
import { MindElement } from '../../interfaces';

export function drawTopicByElement(
    board: PlaitMindBoard,
    rectangle: RectangleClient,
    element: MindElement,
    viewContainerRef?: ViewContainerRef
) {
    const containerRef = viewContainerRef || PlaitBoard.getComponent(board).viewContainerRef;
    const classList = [];
    if (element.isRoot) {
        classList.push('root-node');
        classList.push('font-size-18');
    } else {
        classList.push('child-node');
    }
    // COMPAT: last character can not show in safari browser
    return drawRichtext(rectangle.x, rectangle.y, rectangle.width, rectangle.height, element.data.topic, containerRef, classList);
}
