import { PlaitElement } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { FlowEdgeComponent } from '../../public-api';

export const addEdgeHovered = (element: FlowEdge, active = false, hover = true) => {
    const component = PlaitElement.getComponent(element) as FlowEdgeComponent;
    if (component) {
        component.g.classList.add('hovered-edge');
        component.drawElementHostActive(element, active, hover);
    }
};

export const removeEdgeHovered = (element: FlowEdge) => {
    const component = PlaitElement.getComponent(element) as FlowEdgeComponent;
    if (component) {
        component.g.classList.remove('hovered-edge');
        component.drawElementHost(element);
    }
};
