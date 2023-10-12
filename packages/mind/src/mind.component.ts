import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PlaitMind } from './interfaces/element';
import { MindNode } from './interfaces/node';
import { BeforeContextChange, PlaitChildrenElementComponent, PlaitPluginElementContext, depthFirstRecursion } from '@plait/core';
import { GlobalLayout, OriginNode } from '@plait/layouts';
import { ELEMENT_TO_NODE } from './utils/weak-maps';
import { MindNodeComponent } from './mind-node.component';
import { getLayoutOptions } from './utils/space/layout-options';
import { getDefaultLayout } from './utils/layout';

@Component({
    selector: 'plait-mind',
    template: `
        <plait-children [board]="board" [parent]="element" [effect]="effect" [parentG]="rootG"></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PlaitChildrenElementComponent, MindNodeComponent]
})
export class PlaitMindComponent extends MindNodeComponent implements OnInit, BeforeContextChange<PlaitMind> {
    root!: MindNode;

    rootG!: SVGGElement;

    ngOnInit(): void {
        this.updateMindLayout();
        super.ngOnInit();
        this.g.classList.add('root');
    }

    beforeContextChange(value: PlaitPluginElementContext<PlaitMind>) {
        if (value.element !== this.element && this.initialized) {
            this.updateMindLayout(value.element);
        }
    }

    updateMindLayout(element = this.element) {
        const mindLayoutType = element.layout || getDefaultLayout();
        this.root = (GlobalLayout.layout(
            (element as unknown) as OriginNode,
            getLayoutOptions(this.board),
            mindLayoutType
        ) as unknown) as MindNode;
        this.updateMindNodeLocation(element as PlaitMind);
    }

    updateMindNodeLocation(element: PlaitMind) {
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
