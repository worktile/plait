import { PlaitElement, PlaitOperation, PlaitTheme, Viewport, Selection, ComponentType } from '@plait/core';
import { RenderComponentRef } from '@plait/common';
import { ComponentRef } from '@angular/core';

export interface AngularBoard {
    renderComponent: <T, K extends { nativeElement: () => HTMLElement }>(
        type: ComponentType<K>,
        container: Element | DocumentFragment,
        props: T
    ) => { ref: RenderComponentRef<T>; componentRef: ComponentRef<K> };
}

export interface OnChangeData {
    children: PlaitElement[];
    operations: PlaitOperation[];
    viewport: Viewport;
    selection: Selection | null;
    theme: PlaitTheme;
}
