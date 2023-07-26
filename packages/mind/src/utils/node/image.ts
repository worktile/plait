import { PlaitElement } from '@plait/core';
import { MindNodeComponent } from '../../node.component';
import { MindElement } from '../../interfaces';

export const setImageFocus = (element: MindElement, isFocus: boolean) => {
    const elementComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    elementComponent.imageDrawer.componentRef!.instance.isFocus = isFocus;
    elementComponent.imageDrawer.componentRef!.instance.cdr.markForCheck();
};
