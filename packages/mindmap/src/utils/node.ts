import { ELEMENT_TO_PLUGIN_COMPONENT } from '@plait/core';
import { MindmapNodeElement } from '../interfaces/element';
import { MindmapNodeComponent } from '../node.component';

export function enterNodeEditing(element: MindmapNodeElement) {
    const component = ELEMENT_TO_PLUGIN_COMPONENT.get(element) as MindmapNodeComponent;
    component.startEditText(false, false);
}
