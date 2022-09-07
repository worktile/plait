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
    HOST_TO_ROUGH_SVG,
    IS_TEXT_EDITABLE,
    MERGING,
    PlaitBoard,
    Selection,
    toPoint,
    transformPoint,
    Transforms
} from '@plait/core';
import { isHorizontalLayout, isTopLayout, MindmapLayoutType } from '@plait/layouts';
import { PlaitRichtextComponent, setFullSelectionAndFocus, updateRichText } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import {
    MindmapNodeShape,
    MINDMAP_NODE_KEY,
    PRIMARY_COLOR,
    ROOT_TOPIC_FONT_SIZE,
    STROKE_WIDTH,
    TOPIC_COLOR,
    TOPIC_FONT_SIZE
} from './constants';
import { drawIndentedLink } from './draw/indented-link';
import { drawLink } from './draw/link';
import { drawMindmapNodeRichtext, updateMindmapNodeRichtextLocation } from './draw/richtext';
import { drawRectangleNode } from './draw/shape';
import { MindmapElement } from './interfaces/element';
import { MindmapNode } from './interfaces/node';
import { getLinkLineColorByMindmapElement } from './utils/colors';
import { drawRoundRectangle, getRectangleByNode, hitMindmapNode } from './utils/graph';
import { getLayoutByElement } from './utils/layout';
import { findPath, getChildrenCount } from './utils/mindmap';
import { addSelectedMindmapElements, hasSelectedMindmapElement } from './utils/selected-elements';
import { getNodeShapeByElement } from './utils/shape';
import { ELEMENT_GROUP_TO_COMPONENT, MINDMAP_ELEMENT_TO_COMPONENT } from './utils/weak-maps';

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

    maskG!: SVGGElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    destroy$: Subject<any> = new Subject();

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
        this.drawActiveG();
        this.updateActiveClass();
        this.drawMaskG();
        this.drawExtend();
        this.initialized = true;
        ELEMENT_GROUP_TO_COMPONENT.set(this.gGroup, this);
    }

    ngAfterViewInit(): void {
        this.applyRichtextAttribute();
    }

    drawShape() {
        this.destroyShape();
        const shape = getNodeShapeByElement(this.node.origin) as MindmapNodeShape;
        switch (shape) {
            case MindmapNodeShape.roundRectangle:
                this.shapeG = drawRectangleNode(this.roughSVG as RoughSVG, this.node as MindmapNode);
                this.gGroup.prepend(this.shapeG);
                break;
            default:
                break;
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

        const layout = getLayoutByElement(this.parent.origin) as MindmapLayoutType;
        if (MindmapElement.isIndentedLayout(this.parent.origin)) {
            this.linkG = drawIndentedLink(this.roughSVG, this.parent, this.node);
        } else {
            this.linkG = drawLink(this.roughSVG, this.parent, this.node, null, isHorizontalLayout(layout));
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

    drawMaskG() {
        this.destroyMaskG();

        let { x, y, width, height } = getRectangleByNode(this.node as MindmapNode);
        this.maskG = drawRoundRectangle(
            this.roughSVG as RoughSVG,
            x - 2,
            y - 2,
            x + width + 20,
            y + height + 15,
            { stroke: 'none', fill: 'rgba(255,255,255,0)', fillStyle: 'solid' },
            true
        );
        this.gGroup.appendChild(this.maskG);

        fromEvent<MouseEvent>(this.maskG, 'mouseenter')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !this.node.origin.isCollapsed;
                })
            )
            .subscribe(() => {
                this.gGroup.classList.toggle('focused');
            });
        fromEvent<MouseEvent>(this.maskG, 'mouseleave')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !this.node.origin.isCollapsed;
                })
            )
            .subscribe(() => {
                this.gGroup.classList.toggle('focused');
            });
    }

    destroyMaskG() {
        if (this.maskG) {
            this.maskG.remove();
        }
    }

    drawActiveG() {
        this.destroyActiveG();
        const selected = hasSelectedMindmapElement(this.board, this.node.origin);
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

    destroyActiveG() {
        this.activeG.forEach(g => g.remove());
        this.activeG = [];
    }

    updateActiveClass() {
        if (!this.gGroup) {
            return;
        }
        const selected = hasSelectedMindmapElement(this.board, this.node.origin);
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
        this.destroyExtend();

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
                this.destroyExtend();
            });

        const { x, y, width, height } = getRectangleByNode(this.node);
        const stroke = getLinkLineColorByMindmapElement(this.node.origin);
        const strokeWidth = this.node.origin.linkLineWidth ? this.node.origin.linkLineWidth : STROKE_WIDTH;
        const extendY =
            (getNodeShapeByElement(this.node.origin) as MindmapNodeShape) === MindmapNodeShape.roundRectangle ? y + height / 2 : y + height;
        const nodeLayout = getLayoutByElement(this.node.origin) as MindmapLayoutType;

        let extendLine = [
            [x + width, extendY],
            [x + width + 8, extendY]
        ];

        let arrowYOffset = [-3, 0, 3];
        let arrowXOffset = [10, 4, 10];

        let extendLineXOffset = [width, width + 8];
        let extendLineYOffset = [0, 0];

        let extendLineGOffset = [0, 0, 0, 0];

        if (isHorizontalLayout(nodeLayout)) {
            if (this.parent.x > this.node.x) {
                extendLineXOffset = [0, -26];
                extendLineYOffset = [0, 0];
                arrowXOffset = [6, 12, 6];
            }
        } else {
            arrowXOffset = [4, 8, 12];
            arrowYOffset = isTopLayout(nodeLayout) ? [-3, 4, -3] : [3, -4, 3];
            extendLineGOffset = [0, 0, 8, -8];
            extendLineXOffset = [width / 2, width / 2 - 8];
            if ((getNodeShapeByElement(this.node.origin) as MindmapNodeShape) === MindmapNodeShape.roundRectangle) {
                if (isTopLayout(nodeLayout)) {
                    extendLineYOffset = [-height / 2, -height / 2 - 18];
                } else {
                    extendLineYOffset = [height / 2, height / 2 + 18];
                }
            } else {
                if (isTopLayout(nodeLayout)) {
                    extendLineYOffset = [-height, -height - 18];
                } else {
                    extendLineYOffset = [0, 18];
                }
            }
        }

        extendLine = [
            [x + extendLineXOffset[0], extendY + extendLineYOffset[0]],
            [x + extendLineXOffset[1], extendY + extendLineYOffset[1]]
        ];

        const extendLineG = this.roughSVG.line(
            extendLine[0][0] + extendLineGOffset[0],
            extendLine[0][1] + extendLineGOffset[1],
            extendLine[1][0] + extendLineGOffset[2],
            extendLine[1][1] + extendLineGOffset[3],
            {
                strokeWidth,
                stroke
            }
        );

        const hideArrowG = this.roughSVG.linearPath(
            [
                [extendLine[1][0] + arrowXOffset[0], extendLine[1][1] + arrowYOffset[0]],
                [extendLine[1][0] + arrowXOffset[1], extendLine[1][1] + arrowYOffset[1]],
                [extendLine[1][0] + arrowXOffset[2], extendLine[1][1] + arrowYOffset[2]]
            ],
            {
                stroke,
                strokeWidth
            }
        );

        if (this.node.origin.isCollapsed) {
            this.gGroup.classList.add('collapsed');

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
                this.extendG.appendChild(hideCircleG);
                this.extendG.appendChild(hideArrowG);
            }
        }
    }

    destroyExtend() {
        if (this.extendG) {
            this.extendG.remove();
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
        updateRichText(this.node.origin.value, this.richtextComponentRef!);
        updateMindmapNodeRichtextLocation(this.node as MindmapNode, this.richtextG as SVGGElement);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.initialized) {
            const selection = changes['selection'];
            if (selection) {
                this.drawActiveG();
                this.updateActiveClass();
            }
            const node = changes['node'];
            if (node) {
                MINDMAP_ELEMENT_TO_COMPONENT.set(this.node.origin, this);
                const selectedState = hasSelectedMindmapElement(this.board, node.previousValue.origin);
                if (selectedState) {
                    addSelectedMindmapElements(this.board, this.node.origin);
                }
                this.drawShape();
                this.drawLink();
                this.updateRichtextLocation();
                // resolve move node richtext lose issue
                if (this.foreignObject && this.foreignObject.children.length <= 0) {
                    this.foreignObject?.appendChild(this.richtextComponentRef?.instance.editable as HTMLElement);
                }
                this.drawActiveG();
                this.drawMaskG();
                this.drawExtend();
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
                this.drawActiveG();
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
            MERGING.set(this.board, true);
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
                this.drawActiveG();
            }
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                exitHandle();
                this.drawActiveG();
            }
        });

        const exitHandle = () => {
            // unsubscribe
            valueChange$.unsubscribe();
            composition$.unsubscribe();
            mousedown$.unsubscribe();
            keydown$.unsubscribe();
            // editable status
            MERGING.set(this.board, false);
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
        this.destroy$.next();
        this.destroy$.complete();
    }
}
