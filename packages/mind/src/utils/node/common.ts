import { PlaitElement } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { MindNodeComponent } from '../../node.component';

export function enterNodeEditing(element: MindElement) {
    const component = PlaitElement.getComponent(element) as MindNodeComponent;
    // component.startEditText(false, false);
    component.textDrawer.edit();
}
