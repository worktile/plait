import { PlaitElement } from '@plait/core';
import { FlowEdge, FlowEdgeType, FlowEdgeTypeMode } from '../../interfaces/edge';
import { FlowEdgeComponent } from '../../flow-edge.component';

export const addEdgeHovered = (element: FlowEdge, edgeType: FlowEdgeTypeMode = FlowEdgeType.hover) => {
    const component = PlaitElement.getComponent(element) as FlowEdgeComponent;
    if (component) {
        component.g.classList.add('hovered-edge');
        component.drawActiveElement(element, edgeType);
    }
};

export const removeEdgeHovered = (element: FlowEdge) => {
    const component = PlaitElement.getComponent(element) as FlowEdgeComponent;
    if (component) {
        component.g.classList.remove('hovered-edge');
        component.drawElement(element);
    }
};
