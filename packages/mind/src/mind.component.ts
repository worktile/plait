import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PlaitMind } from './interfaces/element';
import { MindNode } from './interfaces/node';
import { BeforeContextChange, PlaitPluginElementContext, depthFirstRecursion } from '@plait/core';
import { GlobalLayout, OriginNode } from '@plait/layouts';
import { ELEMENT_TO_NODE } from './utils/weak-maps';
import { MindNodeComponent } from './node.component';
import { getLayoutOptions } from './layout-option';
import { getDefaultMindmapLayout } from './utils/layout';

@Component({
    selector: 'plait-mind',
    template: `
        <plait-children [board]="board" [parent]="element" [effect]="effect" [parentG]="rootG"></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitMindComponent extends MindNodeComponent<PlaitMind> implements OnInit, BeforeContextChange<PlaitMind> {
    root!: MindNode;

    rootG!: SVGGElement;

    ngOnInit(): void {
        this.updateMindmap();
        super.ngOnInit();
    }

    beforeContextChange(value: PlaitPluginElementContext<PlaitMind>) {
        if (value.element !== this.element && this.initialized) {
            this.updateMindmap(value.element);
        }
    }

    updateMindmap(element = this.element) {
        const mindLayoutType = element.layout || getDefaultMindmapLayout();
        this.root = (GlobalLayout.layout((element as unknown) as OriginNode, getLayoutOptions(), mindLayoutType) as unknown) as MindNode;
        this.updateMindmapLocation(element);
    }

    updateMindmapLocation(element: PlaitMind) {
        const { x, y, hGap, vGap } = this.root;
        const offsetX = x + hGap;
        const offsetY = y + vGap;
        depthFirstRecursion<MindNode>(this.root, node => {
            node.x = node.x - offsetX + element.points[0][0];
            node.y = node.y - offsetY + element.points[0][1];
            ELEMENT_TO_NODE.set(node.origin, node);
        });
    }
}
