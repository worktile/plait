import { PlaitElement } from '@plait/core';
import { FlowNode, FlowNodeComponent } from '../../public-api';

export const addNodeActive = (element: FlowNode, active = true) => {
    const component = PlaitElement.getComponent(element) as FlowNodeComponent;
    if (component) {
        component.g.classList.add('active-node');
        component.drawElementHostActive(element, active);
    }
};

export const removeNodeActive = (element: FlowNode, active = false) => {
    const component = PlaitElement.getComponent(element) as FlowNodeComponent;
    if (component) {
        component.g.classList.remove('active-node');
        component.drawElementHost(element, active);
    }
};
