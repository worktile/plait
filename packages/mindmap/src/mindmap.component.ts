import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { BASE, MINDMAP_KEY, STROKE_WIDTH } from './constants/index';
import { MindmapElement } from './interfaces/element';
import { MindmapNode } from './interfaces/node';
import { PlaitMindmap } from './interfaces/mindmap';
import { createG, Selection, PlaitBoard } from '@plait/core';
import { LayoutOptions, GlobalLayout, OriginNode, LayoutNode, isIndentedLayout, isHorizontalLayout, isFishBoneLayout } from '@plait/layouts';
import { MINDMAP_TO_COMPONENT } from './plugins/weak-maps';
import { getRootLayout } from './utils';
import { MindmapQueries } from './queries';


@Component({
    selector: 'plait-mindmap',
    template: `
        <plait-mindmap-node
            [mindmapGGroup]="mindmapGGroup"
            [host]="host"
            [node]="root"
            [selection]="selection"
            [board]="board"
        ></plait-mindmap-node>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitMindmapComponent implements OnInit, OnDestroy {
    @HostBinding('class') hostClass = `plait-mindmap`;

    root!: MindmapNode;

    mindmapGGroup!: SVGGElement;

    @Input() value!: PlaitMindmap;

    @Input() selection: Selection | null = null;

    @Input() host!: SVGElement;

    @Input() board!: PlaitBoard;

    constructor(private cdr: ChangeDetectorRef) {
        this.mindmapGGroup = createG();
        this.mindmapGGroup.setAttribute(MINDMAP_KEY, 'true');
    }

    ngOnInit(): void {
        this.updateMindmap(false);
    }

    getOptions() {
        function getMainAxle(element: MindmapElement, parent?: LayoutNode) {
            const strokeWidth = element.strokeWidth || STROKE_WIDTH;
            if (element.isRoot) {
                return BASE * 12;
            }
            if (parent && parent.isRoot()) {
                return BASE * 3 + strokeWidth / 2;
            }
            return BASE * 3 + strokeWidth / 2;
        }

        function getSecondAxle(element: MindmapElement, parent?: LayoutNode) {
            const strokeWidth = element.strokeWidth || STROKE_WIDTH;
            if (element.isRoot) {
                return BASE * 10 + strokeWidth / 2;
            }
            return BASE * 6 + strokeWidth / 2;
        }
        return {
            getHeight(element: MindmapElement) {
                if (element.isRoot) {
                    return element.height + BASE * 4;
                }
                return element.height + BASE * 2;
            },
            getWidth(element: MindmapElement) {
                if (element.isRoot) {
                    return element.width + BASE * 6;
                }
                return element.width + BASE * 4;
            },
            getHorizontalGap(element: MindmapElement, parent?: LayoutNode) {
                const _layout = (parent && parent.layout) || getRootLayout(element);
                if (isFishBoneLayout(_layout)) {
                    if (element.isRoot || element.layout) {
                        return 40;
                    }
                    return 0;
                }
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
            getVerticalGap(element: MindmapElement, parent?: LayoutNode) {
                const _layout = (parent && parent.layout) || getRootLayout(element);
                if (isFishBoneLayout(_layout)) {
                    const isRoot = element.isRoot || (parent && parent.isRoot());
                    if (isRoot) {
                        return 20;
                    }
                    return 12;
                }
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
            getExtendHeight(node: OriginNode) {
                return BASE * 6;
            },
            getIndentedCrossLevelGap() {
                return BASE * 2;
            }
        };
    }

    updateMindmap(doCheck = true) {
        MINDMAP_TO_COMPONENT.set(this.value, this);
        const options = this.getOptions() as LayoutOptions;
        const mindmapLayoutType = MindmapQueries.getLayoutByElement(this.value);
        this.root = GlobalLayout.layout(this.value as OriginNode, options, mindmapLayoutType) as any;
        this.updateMindmapLocation();
        if (doCheck) {
            this.cdr.detectChanges();
        }
    }

    doCheck() {
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        this.mindmapGGroup.remove();
        MINDMAP_TO_COMPONENT.delete(this.value);
    }

    updateMindmapLocation() {
        const { x, y, hGap, vGap } = this.root;
        const offsetX = x + hGap;
        const offsetY = y + vGap;
        (this.root as any).eachNode((node: MindmapNode) => {
            node.x = node.x - offsetX + this.value.points[0][0];
            node.y = node.y - offsetY + this.value.points[0][1];
        });
    }
}
