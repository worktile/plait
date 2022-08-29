import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Renderer2,
    SimpleChanges,
    ViewContainerRef
} from '@angular/core';
import {
    createG,
    createText,
    toPoint,
    Selection,
    HOST_TO_ROUGH_SVG,
    IS_TEXT_EDITABLE,
    PlaitBoard,
    Transforms,
    transformPoint
} from '@plait/core';
import { PlaitRichtextComponent, setFullSelectionAndFocus } from '@plait/richtext';
import { drawRectangleNode } from './draw/shape';
import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNode } from './interfaces/node';
import { drawDownward, drawLink } from './draw/link';
import { drawRoundRectangle, getRectangleByNode, hitMindmapNode } from './utils/graph';
import { MINDMAP_NODE_KEY, PRIMARY_COLOR, ROOT_TOPIC_FONT_SIZE, STROKE_WIDTH, TOPIC_COLOR, TOPIC_FONT_SIZE } from './constants';
import { HAS_SELECTED_MINDMAP_ELEMENT, ELEMENT_GROUP_TO_COMPONENT, MINDMAP_ELEMENT_TO_COMPONENT } from './utils/weak-maps';
import { debounceTime, take } from 'rxjs/operators';
import { drawMindmapNodeRichtext, updateMindmapNodeRichtextLocation } from './draw/richtext';
import { MindmapElement } from './interfaces/element';
import { fromEvent } from 'rxjs';
import { findPath, getChildrenCount } from './utils/mindmap';
import { getLinkLineColorByMindmapElement } from './utils/colors';
import { drawIndentedLink } from './draw/indented-link';
import { MindmapLayout } from './interfaces';

@Component({
    selector: 'plait-mindmap-node',
    template: `
        <plait-mindmap-node
            *ngFor="let childNode of node?.children; let i = index; trackBy: trackBy"
            [host]="host"
            [mindmapGGroup]="mindmapGGroup"
            [node]="childNode"
            [parent]="node"
            [selection]="selection"
            [board]="board"
            [index]="i"
        ></plait-mindmap-node>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindmapNodeComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    initialized = false;

    isEditable = false;

    roughSVG!: RoughSVG;

    gGroup!: SVGGElement;

    @Input() node!: MindmapNode;

    @Input() parent!: MindmapNode;

    @Input() index!: number;

    @Input() mindmapGGroup!: SVGGElement;

    @Input() selection: Selection | null = null;

    @Input() host!: SVGElement;

    @Input() board!: PlaitBoard;

    activeG: SVGGElement[] = [];

    shapeG: SVGGElement | null = null;

    linkG?: SVGGElement;

    richtextG?: SVGGElement;

    foreignObject?: SVGForeignObjectElement;

    extendG?: SVGGElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    constructor(private viewContainerRef: ViewContainerRef, private render2: Renderer2) {}

    ngOnInit(): void {
        MINDMAP_ELEMENT_TO_COMPONENT.set(this.node.origin, this);
        this.gGroup = createG();
        this.gGroup.setAttribute(MINDMAP_NODE_KEY, 'true');
        this.mindmapGGroup.prepend(this.gGroup);
        this.roughSVG = HOST_TO_ROUGH_SVG.get(this.host) as RoughSVG;
        this.drawShape();
        this.drawLink();
        this.drawRichtext();
        this.drawExtend();
        this.initialized = true;
        ELEMENT_GROUP_TO_COMPONENT.set(this.gGroup, this);
    }

    ngAfterViewInit(): void {
        this.applyRichtextAttribute();
    }

    drawShape() {
        this.destroyShape();
        if (MindmapElement.hasRoundRectangleShape(this.node.origin)) {
            this.shapeG = drawRectangleNode(this.roughSVG as RoughSVG, this.node as MindmapNode);
            this.gGroup.prepend(this.shapeG);
        }
    }

    destroyShape() {
        if (this.shapeG) {
            this.shapeG.remove();
            this.shapeG = null;
        }
    }

    drawLink() {
        if (!this.parent) {
            return;
        }

        if (this.linkG) {
            this.linkG.remove();
        }

        if (MindmapElement.hasLayout(this.parent.origin, MindmapLayout.indented)) {
            this.linkG = drawIndentedLink(this.roughSVG, this.parent, this.node);
        } else if (MindmapElement.hasLayout(this.parent.origin, MindmapLayout.downward)) {
            this.linkG = drawDownward(this.roughSVG, this.parent, this.node);
        } else {
            this.linkG = drawLink(this.roughSVG, this.parent, this.node);
        }

        this.gGroup.append(this.linkG);
    }

    destroyLine() {
        if (this.parent) {
            if (this.linkG) {
                this.linkG.remove();
            }
        }
    }

    drawSelectedState() {
        this.destroySelectedState();
        const selected = HAS_SELECTED_MINDMAP_ELEMENT.get(this.node.origin);
        if (selected) {
            let { x, y, width, height } = getRectangleByNode(this.node as MindmapNode);
            const selectedStrokeG = drawRoundRectangle(
                this.roughSVG as RoughSVG,
                x - 2,
                y - 2,
                x + width + 2,
                y + height + 2,
                { stroke: PRIMARY_COLOR, strokeWidth: 2, fill: '' },
                true
            );
            this.gGroup.appendChild(selectedStrokeG);
            this.activeG.push(selectedStrokeG);
            if (this.richtextComponentRef?.instance.plaitReadonly === true) {
                const selectedBackgroundG = drawRoundRectangle(
                    this.roughSVG as RoughSVG,
                    x - 2,
                    y - 2,
                    x + width + 2,
                    y + height + 2,
                    { stroke: PRIMARY_COLOR, fill: PRIMARY_COLOR, fillStyle: 'solid' },
                    true
                );
                selectedBackgroundG.style.opacity = '0.15';
                // 影响双击事件
                selectedBackgroundG.style.pointerEvents = 'none';
                this.gGroup.appendChild(selectedBackgroundG);
                this.activeG.push(selectedBackgroundG, selectedStrokeG);
            }
        }
    }

    destroySelectedState() {
        this.activeG.forEach(g => g.remove());
        this.activeG = [];
    }

    updateGGroupClass() {
        const selected = HAS_SELECTED_MINDMAP_ELEMENT.get(this.node.origin);
        if (selected) {
            this.render2.addClass(this.gGroup, 'active');
        } else {
            this.render2.removeClass(this.gGroup, 'active');
        }
    }

    drawRichtext() {
        const { richtextG, richtextComponentRef, foreignObject } = drawMindmapNodeRichtext(this.node as MindmapNode, this.viewContainerRef);
        this.richtextComponentRef = richtextComponentRef;
        this.richtextG = richtextG;
        this.foreignObject = foreignObject;
        this.render2.addClass(richtextG, 'richtext');
        this.gGroup.append(richtextG);
    }

    drawExtend() {
        if (this.node.origin.isRoot) {
            return;
        }

        // destroy
        if (this.extendG) {
            this.extendG.remove();
        }

        // create extend
        this.extendG = createG();
        this.extendG.classList.add('extend');
        this.gGroup.append(this.extendG);

        // inteactive
        fromEvent(this.extendG, 'mousedown')
            .pipe(take(1))
            .subscribe(() => {
                const isCollapsed = !this.node.origin.isCollapsed;
                const newElement: Partial<MindmapElement> = { isCollapsed };
                const path = findPath(this.board, this.node);
                Transforms.setNode(this.board, newElement, path);
            });

        const { x, y, width, height } = getRectangleByNode(this.node);
        const stroke = getLinkLineColorByMindmapElement(this.node.origin);
        const strokeWidth = this.node.origin.linkLineWidth ? this.node.origin.linkLineWidth : STROKE_WIDTH;
        const extendY = MindmapElement.hasRoundRectangleShape(this.node.origin) ? y + height / 2 : y + height;
        const extendLine = [
            [x + width, extendY],
            [x + width + 8, extendY]
        ];
        if (this.node.origin.isCollapsed) {
            this.gGroup.classList.add('collapsed');

            const extendLineG = this.roughSVG.line(extendLine[0][0], extendLine[0][1], extendLine[1][0], extendLine[1][1], {
                strokeWidth,
                stroke
            });
            this.extendG.appendChild(extendLineG);

            const badge = this.roughSVG.circle(extendLine[1][0] + 8, extendLine[1][1], 16, { fill: stroke, stroke, fillStyle: 'solid' });
            const badgeText = createText(extendLine[1][0] + 4, extendLine[1][1] + 4, '#fff', `${getChildrenCount(this.node.origin)}`);
            badgeText.setAttribute('style', 'font-size: 12px');
            this.extendG.appendChild(badge);
            this.extendG.appendChild(badgeText);
        } else {
            this.gGroup.classList.remove('collapsed');

            if (this.node.origin.children.length > 0) {
                const hideCircleG = this.roughSVG.circle(extendLine[1][0] + 8, extendLine[1][1], 16, {
                    fill: '#fff',
                    stroke,
                    strokeWidth,
                    fillStyle: 'solid'
                });
                const hideArrowG = this.roughSVG.linearPath(
                    [
                        [extendLine[1][0] + 10, extendLine[1][1] - 3],
                        [extendLine[1][0] + 4, extendLine[1][1]],
                        [extendLine[1][0] + 10, extendLine[1][1] + 3]
                    ],
                    {
                        stroke,
                        strokeWidth
                    }
                );
                this.extendG.appendChild(hideCircleG);
                this.extendG.appendChild(hideArrowG);
            }
        }
    }

    applyRichtextAttribute() {
        const richtextContainer = this.richtextG?.querySelector('.plait-richtext-container') as HTMLElement;
        const fontSize = this.node.origin.fontSize
            ? this.node.origin.fontSize
            : this.node.origin.isRoot
            ? ROOT_TOPIC_FONT_SIZE
            : TOPIC_FONT_SIZE;
        const color = this.node.origin.color ? this.node.origin.color : TOPIC_COLOR;
        richtextContainer.style.fontSize = `${fontSize}px`;
        richtextContainer.style.color = `${color}`;
    }

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
        }
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
    }

    updateRichtextLocation() {
        updateMindmapNodeRichtextLocation(this.node as MindmapNode, this.richtextG as SVGGElement);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.initialized) {
            const selection = changes['selection'];
            if (selection) {
                this.drawSelectedState();
                this.gGroup && this.updateGGroupClass();
            }
            const node = changes['node'];
            if (node) {
                MINDMAP_ELEMENT_TO_COMPONENT.set(this.node.origin, this);
                const selectedState = HAS_SELECTED_MINDMAP_ELEMENT.get(node.previousValue.origin);
                if (selectedState) {
                    HAS_SELECTED_MINDMAP_ELEMENT.set(this.node.origin, true);
                }
                this.drawShape();
                this.drawLink();
                this.updateRichtextLocation();
                // resolve move node richtext lose issue
                if (this.foreignObject && this.foreignObject.children.length <= 0) {
                    this.foreignObject?.appendChild(this.richtextComponentRef?.instance.editable as HTMLElement);
                }
                this.drawExtend();
                this.drawSelectedState();
            }
        }
    }

    startEditText() {
        this.isEditable = true;
        IS_TEXT_EDITABLE.set(this.board, true);
        if (!this.richtextComponentRef) {
            throw new Error('undefined richtextComponentRef');
        }
        const richtextInstance = this.richtextComponentRef.instance;
        if (richtextInstance.plaitReadonly) {
            richtextInstance.plaitReadonly = false;
            this.richtextComponentRef.changeDetectorRef.markForCheck();
            setTimeout(() => {
                this.drawSelectedState();
                setFullSelectionAndFocus(richtextInstance.editor);
            }, 0);
        }
        let richtext = richtextInstance.plaitValue;
        // 增加 debounceTime 等待 DOM 渲染完成后再去取文本宽高
        const valueChange$ = richtextInstance.plaitChange.pipe(debounceTime(0)).subscribe(event => {
            if (richtext === event.value) {
                return;
            }
            richtext = event.value;

            // 更新富文本、更新宽高
            const { width, height } = richtextInstance.editable.getBoundingClientRect();
            const newElement = { value: richtext, width, height } as MindmapElement;

            const path = findPath(this.board, this.node);
            Transforms.setNode(this.board, newElement, path);
        });
        const composition$ = richtextInstance.plaitComposition.subscribe(event => {
            const { width, height } = richtextInstance.editable.getBoundingClientRect();
            if (event.isComposing && (width !== this.node.origin.width || height !== this.node.origin.height)) {
                const newElement: Partial<MindmapElement> = { width, height };

                const path = findPath(this.board, this.node);
                Transforms.setNode(this.board, newElement, path);
            }
        });
        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = transformPoint(this.board, toPoint(event.x, event.y, this.host));
            if (!hitMindmapNode(this.board, point, this.node as MindmapNode)) {
                exitHandle();
            }
        });
        const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                exitHandle();
                this.drawSelectedState();
            }
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                exitHandle();
                this.drawSelectedState();
            }
        });

        const exitHandle = () => {
            // unsubscribe
            valueChange$.unsubscribe();
            composition$.unsubscribe();
            mousedown$.unsubscribe();
            keydown$.unsubscribe();
            // editable status
            richtextInstance.plaitReadonly = true;
            this.richtextComponentRef?.changeDetectorRef.markForCheck();
            this.isEditable = false;
            IS_TEXT_EDITABLE.set(this.board, false);
        };
    }

    trackBy = (index: number, node: MindmapNode) => {
        return node.origin.id;
    };

    ngOnDestroy(): void {
        this.destroyRichtext();
        this.gGroup.remove();
    }
}
