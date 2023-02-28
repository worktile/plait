import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges
} from '@angular/core';
import { BASE, MindmapNodeShape, MINDMAP_KEY, STROKE_WIDTH } from './constants/index';
import { MindmapNodeElement, PlaitMindmap } from './interfaces/element';
import { MindmapNode } from './interfaces/node';
import { createG, PlaitPluginElementComponent, BeforeContextChange, PlaitElement, PlaitPluginElementContext } from '@plait/core';
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
import { getRootLayout } from './utils';
import { MindmapQueries } from './queries';

@Component({
    selector: 'plait-mindmap',
    template: `
        <plait-mindmap-node [mindmapG]="g" [host]="host" [node]="root" [selection]="selection" [board]="board"></plait-mindmap-node>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitMindmapComponent extends PlaitPluginElementComponent<PlaitMindmap> implements OnInit, BeforeContextChange<PlaitMindmap> {
    root!: MindmapNode;

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.updateMindmap();
    }

    beforeContextChange(value: PlaitPluginElementContext<PlaitMindmap>) {
        if (value.element !== this.element && this.initialized) {
            this.updateMindmap(true, value.element);
        }
    }

    getOptions() {
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
                if (element.isRoot) {
                    return element.height + BASE * 4;
                }
                return element.height + BASE * 2;
            },
            getWidth(element: MindmapNodeElement) {
                if (element.isRoot) {
                    return element.width + BASE * 6;
                }
                return element.width + BASE * 4;
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

    updateMindmap(doCheck = false, element: PlaitMindmap = this.element) {
        const options = this.getOptions() as LayoutOptions;
        const mindmapLayoutType = MindmapQueries.getLayoutByElement((element as unknown) as MindmapNodeElement);
        this.root = GlobalLayout.layout((element as unknown) as OriginNode, options, mindmapLayoutType) as any;
        this.updateMindmapLocation(element);
        if (doCheck) {
            this.cdr.detectChanges();
        }
    }

    updateMindmapLocation(element: PlaitMindmap) {
        const { x, y, hGap, vGap } = this.root;
        const offsetX = x + hGap;
        const offsetY = y + vGap;
        (this.root as any).eachNode((node: MindmapNode) => {
            node.x = node.x - offsetX + this.element.points[0][0];
            node.y = node.y - offsetY + this.element.points[0][1];
        });
    }
}
