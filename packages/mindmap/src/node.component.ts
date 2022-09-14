import {
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
    PlaitHistoryBoard,
    PlaitNode,
    Selection,
    toPoint,
    transformPoint,
    Transforms
} from '@plait/core';
import { isHorizontalLayout, isLeftLayout, isTopLayout, MindmapLayoutType } from '@plait/layouts';
import { PlaitRichtextComponent, setFullSelectionAndFocus, updateRichText } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, skip, take, takeUntil } from 'rxjs/operators';
import { EXTEND_OFFSET, EXTEND_RADIUS, MindmapNodeShape, MINDMAP_NODE_KEY, PRIMARY_COLOR, STROKE_WIDTH } from './constants';
import { drawIndentedLink } from './draw/indented-link';
import { drawLink } from './draw/link';
import { drawMindmapNodeRichtext, updateMindmapNodeRichtextLocation } from './draw/richtext';
import { drawRectangleNode } from './draw/shape';
import { MindmapElement } from './interfaces/element';
import { MindmapNode } from './interfaces/node';
import { getLinkLineColorByMindmapElement } from './utils/colors';
import { drawRoundRectangle, getRectangleByNode, hitMindmapNode } from './utils/graph';
import { getCorrectLayoutByElement, getLayoutByElement } from './utils/layout';
import { findPath, getChildrenCount } from './utils/mindmap';
import { addSelectedMindmapElements, deleteSelectedMindmapElements, hasSelectedMindmapElement } from './utils/selected-elements';
import { getNodeShapeByElement } from './utils/shape';
import { ELEMENT_GROUP_TO_COMPONENT, MINDMAP_ELEMENT_TO_COMPONENT, SELECTED_MINDMAP_ELEMENTS } from './utils/weak-maps';

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
export class MindmapNodeComponent implements OnInit, OnChanges, OnDestroy {
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

        const nodeLayout = getLayoutByElement(this.node.origin) as MindmapLayoutType;
        const isHorizontal = isHorizontalLayout(nodeLayout);
        const { x, y, width, height } = getRectangleByNode(this.node as MindmapNode);

        this.maskG = drawRoundRectangle(
            this.roughSVG as RoughSVG,
            isHorizontal ? x - 10 : x - 2,
            !isHorizontal ? y - 10 : y - 2,
            x + width + 20,
            y + height + 15,
            { stroke: 'none', fill: 'rgba(255,255,255,0)', fillStyle: 'solid' },
            true
        );
        this.maskG.classList.add('mask');
        this.maskG.setAttribute('visibility', 'visible');
        this.gGroup.append(this.maskG);

        fromEvent<MouseEvent>(this.maskG, 'mouseenter')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.selection && !this.node.origin.isCollapsed && !this.isEditable;
                })
            )
            .subscribe(() => {
                this.gGroup.classList.add('hovered');
            });
        fromEvent<MouseEvent>(this.maskG, 'mouseleave')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.selection && !this.node.origin.isCollapsed && !this.isEditable;
                })
            )
            .subscribe(() => {
                this.gGroup.classList.remove('hovered');
            });
    }

    destroyMaskG() {
        if (this.maskG) {
            this.maskG.remove();
        }
    }

    enableMaskG() {
        if (this.maskG) {
            this.maskG.setAttribute('visibility', 'visible');
        }
    }

    disabledMaskG() {
        if (this.maskG) {
            this.maskG.setAttribute('visibility', 'hidden');
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
            // 影响 mask 移入移出事件
            selectedStrokeG.style.pointerEvents = 'none';
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
        const extendY = y + height / 2;
        const nodeLayout = getCorrectLayoutByElement(this.node.origin) as MindmapLayoutType;

        let extendLineXY = [
            [x + width, extendY],
            [x + width + EXTEND_OFFSET, extendY]
        ];

        let arrowYOffset = [-4, 1, -0.6, 4];
        let arrowXOffset = [10, 5.5, 5, 10];

        let extendLineXOffset = [0, 0];
        let extendLineYOffset = [0, 0];

        let circleOffset = [EXTEND_RADIUS / 2, 0];

        if (isHorizontalLayout(nodeLayout)) {
            extendLineYOffset =
                (getNodeShapeByElement(this.node.origin) as MindmapNodeShape) === MindmapNodeShape.roundRectangle
                    ? [0, 0]
                    : [height / 2, height / 2];
            if (isLeftLayout(nodeLayout)) {
                //左
                extendLineXOffset = [-width, -width - EXTEND_OFFSET * 2];
                circleOffset = [-EXTEND_RADIUS / 2, 0];
                arrowXOffset = [-10, -5.5, -5, -10];
            }
        } else {
            arrowXOffset = [-4, 0.6, -1, 4];
            if (isTopLayout(nodeLayout)) {
                //上
                extendLineXOffset = [-width / 2, -width / 2 - EXTEND_OFFSET];
                extendLineYOffset = [-height / 2, -height / 2 - EXTEND_OFFSET];
                arrowYOffset = [-10, -5.5, -5, -10];
                circleOffset = [0, -EXTEND_RADIUS / 2];
            } else {
                //下
                extendLineXOffset = [-width / 2, -width / 2 - EXTEND_OFFSET];
                extendLineYOffset = [height / 2, height / 2 + EXTEND_OFFSET];
                arrowYOffset = [10, 5.5, 5, 10];
                circleOffset = [0, EXTEND_RADIUS / 2];
            }
        }

        extendLineXY = [
            [extendLineXY[0][0] + extendLineXOffset[0], extendLineXY[0][1] + extendLineYOffset[0]],
            [extendLineXY[1][0] + extendLineXOffset[1], extendLineXY[1][1] + extendLineYOffset[1]]
        ];

        const extendLine = this.roughSVG.line(extendLineXY[0][0], extendLineXY[0][1], extendLineXY[1][0], extendLineXY[1][1], {
            strokeWidth,
            stroke
        });

        //绘制箭头
        const hideArrowTopLine = this.roughSVG.line(
            extendLineXY[1][0] + arrowXOffset[0],
            extendLineXY[1][1] + arrowYOffset[0],
            extendLineXY[1][0] + arrowXOffset[1],
            extendLineXY[1][1] + arrowYOffset[1],
            {
                stroke,
                strokeWidth
            }
        );
        const hideArrowBottomLine = this.roughSVG.line(
            extendLineXY[1][0] + arrowXOffset[2],
            extendLineXY[1][1] + arrowYOffset[2],
            extendLineXY[1][0] + arrowXOffset[3],
            extendLineXY[1][1] + arrowYOffset[3],
            {
                stroke,
                strokeWidth
            }
        );

        if (this.node.origin.isCollapsed) {
            this.gGroup.classList.add('collapsed');

            this.extendG.appendChild(extendLine);

            const badge = this.roughSVG.circle(extendLineXY[1][0] + circleOffset[0], extendLineXY[1][1] + circleOffset[1], EXTEND_RADIUS, {
                fill: stroke,
                stroke,
                fillStyle: 'solid'
            });
            const badgeText = createText(
                extendLineXY[1][0] + circleOffset[0] - 4,
                extendLineXY[1][1] + circleOffset[1] + 4,
                stroke,
                `${getChildrenCount(this.node.origin)}`
            );
            badge.setAttribute('style', 'opacity: 0.15');
            badgeText.setAttribute('style', 'font-size: 12px');
            this.extendG.appendChild(badge);
            this.extendG.appendChild(badgeText);
        } else {
            this.gGroup.classList.remove('collapsed');

            if (this.node.origin.children.length > 0) {
                const hideCircleG = this.roughSVG.circle(
                    extendLineXY[1][0] + circleOffset[0],
                    extendLineXY[1][1] + circleOffset[1],
                    EXTEND_RADIUS,
                    {
                        fill: '#fff',
                        stroke,
                        strokeWidth,
                        fillStyle: 'solid'
                    }
                );
                this.extendG.appendChild(hideCircleG);
                this.extendG.appendChild(hideArrowTopLine);
                this.extendG.appendChild(hideArrowBottomLine);
            }
        }
    }

    destroyExtend() {
        if (this.extendG) {
            this.extendG.remove();
        }
    }

    destroyRichtext() {
        if (this.richtextG) {
            this.richtextG.remove();
        }
        if (this.richtextComponentRef) {
            this.richtextComponentRef.destroy();
        }
    }

    updateRichtext() {
        updateRichText(this.node.origin.value, this.richtextComponentRef!);
        updateMindmapNodeRichtextLocation(this.node as MindmapNode, this.richtextG as SVGGElement, this.isEditable);
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
                this.updateRichtext();
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
        this.disabledMaskG();
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
        const valueChange$ = richtextInstance.plaitChange
            .pipe(
                debounceTime(0),
                filter(event => event.operations[0]?.type !== 'set_selection')
            )
            .subscribe(event => {
                console.log(event.value === richtext, 'event');
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
                MERGING.set(this.board, true);
            }
        });
        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = transformPoint(this.board, toPoint(event.x, event.y, this.host));
            if (!hitMindmapNode(this.board, point, this.node as MindmapNode)) {
                exitHandle();
                this.enableMaskG();
            }
        });
        const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event: KeyboardEvent) => {
            if (event.isComposing) {
                return;
            }
            if (event.key === 'Escape') {
                exitHandle();
                this.drawActiveG();
                this.enableMaskG();
            }
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                exitHandle();
                this.drawActiveG();
                this.enableMaskG();
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
        deleteSelectedMindmapElements(this.board, this.node.origin);
        this.gGroup.remove();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
