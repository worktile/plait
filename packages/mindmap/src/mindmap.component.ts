import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BASE, STROKE_WIDTH } from './constants/default';
import {
    CHILD_NODE_TEXT_HORIZONTAL_GAP,
    CHILD_NODE_TEXT_VERTICAL_GAP,
    ROOT_NODE_TEXT_HORIZONTAL_GAP,
    ROOT_NODE_TEXT_VERTICAL_GAP,
    MindmapNodeShape
} from './constants/node';
import { MindElement, PlaitMind } from './interfaces/element';
import { MindmapNode } from './interfaces/node';
import { BeforeContextChange, PlaitPluginElementContext, depthFirstRecursion, createG } from '@plait/core';
import {
    LayoutOptions,
    GlobalLayout,
    OriginNode,
    LayoutNode,
    isIndentedLayout,
    isHorizontalLayout,
    ConnectingPosition,
    isHorizontalLogicLayout
} from '@plait/layouts';
import { ELEMENT_TO_NODE } from './utils/weak-maps';
import { MindmapQueries } from './queries';
import { getRootLayout } from './utils/layout';
import { MindmapNodeComponent } from './node.component';
import { getLayoutOptions } from './layout-option';

@Component({
    selector: 'plait-mindmap',
    template: `
        <plait-children [board]="board" [parent]="element" [effect]="effect" [parentG]="rootG"></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitMindmapComponent extends MindmapNodeComponent<PlaitMind> implements OnInit, BeforeContextChange<PlaitMind> {
    root!: MindmapNode;

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
        const mindmapLayoutType = MindmapQueries.getLayoutByElement((element as unknown) as MindElement);
        this.root = (GlobalLayout.layout(
            (element as unknown) as OriginNode,
            getLayoutOptions(),
            mindmapLayoutType
        ) as unknown) as MindmapNode;
        this.updateMindmapLocation(element);
    }

    updateMindmapLocation(element: PlaitMind) {
        const { x, y, hGap, vGap } = this.root;
        const offsetX = x + hGap;
        const offsetY = y + vGap;
        depthFirstRecursion<MindmapNode>(this.root, node => {
            node.x = node.x - offsetX + element.points[0][0];
            node.y = node.y - offsetY + element.points[0][1];
            ELEMENT_TO_NODE.set(node.origin, node);
        });
    }
}
