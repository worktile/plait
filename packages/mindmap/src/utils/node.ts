import { ELEMENT_TO_COMPONENT } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { MindmapNodeComponent } from '../node.component';

export function enterNodeEditing(element: MindElement) {
    const component = ELEMENT_TO_COMPONENT.get(element) as MindmapNodeComponent;
    component.startEditText(false, false);
}
