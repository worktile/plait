import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BASE, STROKE_WIDTH } from './constants/default';
import {
    CHILD_NODE_TEXT_HORIZONTAL_GAP,
    CHILD_NODE_TEXT_VERTICAL_GAP,
    ROOT_NODE_TEXT_HORIZONTAL_GAP,
    ROOT_NODE_TEXT_VERTICAL_GAP,
    MindmapNodeShape
} from './constants/node';
import { MindmapNodeElement, PlaitMindmap } from './interfaces/element';
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

@Component({
    selector: 'plait-mindmap',
    template: `
        <plait-children [board]="board" [parent]="element" [effect]="effect" [parentG]="g"></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitMindmapComponent extends MindmapNodeComponent<PlaitMindmap> implements OnInit, BeforeContextChange<PlaitMindmap> {
    root!: MindmapNode;

    _elementG = createG();

    get elementG() {
        return this._elementG;
    }

    ngOnInit(): void {
        this.g.append(this._elementG);
        this.updateMindmap();
        super.ngOnInit();
    }

    beforeContextChange(value: PlaitPluginElementContext<PlaitMindmap>) {
        if (value.element !== this.element && this.initialized) {
            this.updateMindmap(true, value.element);
        }
    }

    updateMindmap(detect = false, element = this.element) {
        const options = getOptions() as LayoutOptions;
        const mindmapLayoutType = MindmapQueries.getLayoutByElement((element as unknown) as MindmapNodeElement);
        this.root = (GlobalLayout.layout((element as unknown) as OriginNode, options, mindmapLayoutType) as unknown) as MindmapNode;
        this.updateMindmapLocation(element);
        // if (detect) {
        //     this.detect();
        // }
    }

    updateMindmapLocation(element: PlaitMindmap) {
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

function getOptions() {
    function getMainAxle(element: MindmapNodeElement, parent?: LayoutNode) {
        const strokeWidth = element.strokeWidth || STROKE_WIDTH;
        if (element.isRoot) {
            return BASE * 12;
        }
        if (parent && parent.isRoot()) {
            return BASE * 3 + strokeWidth / 2;
        }
        return BASE * 3 + strokeWidth / 2;
    }

    function getSecondAxle(element: MindmapNodeElement, parent?: LayoutNode) {
        const strokeWidth = element.strokeWidth || STROKE_WIDTH;
        if (element.isRoot) {
            return BASE * 10 + strokeWidth / 2;
        }
        return BASE * 6 + strokeWidth / 2;
    }
    return {
        getHeight(element: MindmapNodeElement) {
            const textGap = element.isRoot ? ROOT_NODE_TEXT_VERTICAL_GAP : CHILD_NODE_TEXT_VERTICAL_GAP;
            return element.height + textGap * 2;
        },
        getWidth(element: MindmapNodeElement) {
            const textGap = element.isRoot ? ROOT_NODE_TEXT_HORIZONTAL_GAP : CHILD_NODE_TEXT_HORIZONTAL_GAP;
            return element.width + textGap * 2;
        },
        getHorizontalGap(element: MindmapNodeElement, parent?: LayoutNode) {
            const _layout = (parent && parent.layout) || getRootLayout(element);
            const isHorizontal = isHorizontalLayout(_layout);
            const strokeWidth = element.strokeWidth || STROKE_WIDTH;
            if (isIndentedLayout(_layout)) {
                return BASE * 4 + strokeWidth;
            }
            if (!isHorizontal) {
                return getMainAxle(element, parent);
            } else {
                return getSecondAxle(element, parent);
            }
        },
        getVerticalGap(element: MindmapNodeElement, parent?: LayoutNode) {
            const _layout = (parent && parent.layout) || getRootLayout(element);
            if (isIndentedLayout(_layout)) {
                return BASE;
            }
            const isHorizontal = isHorizontalLayout(_layout);
            if (isHorizontal) {
                return getMainAxle(element, parent);
            } else {
                return getSecondAxle(element, parent);
            }
        },
        getVerticalConnectingPosition(element: MindmapNodeElement, parent?: LayoutNode) {
            if (element.shape === MindmapNodeShape.underline && parent && isHorizontalLogicLayout(parent.layout)) {
                return ConnectingPosition.bottom;
            }
            return undefined;
        },
        getExtendHeight(node: OriginNode) {
            return BASE * 6;
        },
        getIndentedCrossLevelGap() {
            return BASE * 2;
        }
    };
}
