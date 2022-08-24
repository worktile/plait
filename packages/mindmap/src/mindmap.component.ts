import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { BASE, MINDMAP_KEY } from './constants/index';
import { MindmapElement } from './interfaces/element';
import { MindmapNode } from './interfaces/node';
import { MindmapLayout, PlaitMindmap } from './interfaces/mindmap';
import { createG, Selection, PlaitBoard } from '@plait/core';
import { RightLayout, LeftLayout, StandardLayout, DownwardLayout, LayoutOptions, IndentedLayout } from '@plait/layouts';
import { MINDMAP_TO_COMPONENT } from './plugins/weak-maps';

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
            getHorizontalGap(element: MindmapElement) {
                if (element.isRoot) {
                    return BASE * 12;
                }
                return BASE * 8;
            },
            getVerticalGap(element: MindmapElement) {
                if (element.isRoot) {
                    return BASE * 12;
                }
                return BASE * 3;
            }
        };
    }

    updateMindmap(doCheck = true) {
        MINDMAP_TO_COMPONENT.set(this.value, this);
        const options = this.getOptions() as LayoutOptions;
        switch (this.value.layout) {
            case MindmapLayout.left:
                this.root = (new LeftLayout().layout(this.value, options) as unknown) as MindmapNode;
                break;
            case MindmapLayout.right:
                this.root = (new RightLayout().layout(this.value, options) as unknown) as MindmapNode;
                break;
            case MindmapLayout.standard:
                this.root = (new StandardLayout().layout(this.value, options) as unknown) as MindmapNode;
                break;
            case MindmapLayout.downward:
                this.root = (new DownwardLayout().layout(this.value, options) as unknown) as MindmapNode;
                break;
            case MindmapLayout.indented:
                this.root = (new IndentedLayout().layout(this.value, options) as unknown) as MindmapNode;
                break;
            default:
                this.root = (new StandardLayout().layout(this.value, options) as unknown) as MindmapNode;
                break;
        }
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
