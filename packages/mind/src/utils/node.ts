import { ELEMENT_TO_COMPONENT } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { MindNodeComponent } from '../node.component';

export function enterNodeEditing(element: MindElement) {
    const component = ELEMENT_TO_COMPONENT.get(element) as MindNodeComponent;
    component.startEditText(false, false);
}
