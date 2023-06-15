import { PlaitElement } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { MindNodeComponent } from '../../node.component';

export function editTopic(element: MindElement) {
    const component = PlaitElement.getComponent(element) as MindNodeComponent;
    component.editTopic();
}
