import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import {
    PlaitPointerType,
    createG,
    createText,
    IS_TEXT_EDITABLE,
    MERGING,
    PlaitBoard,
    toPoint,
    transformPoint,
    Transforms,
    drawRoundRectangle,
    PlaitPluginElementComponent,
    PlaitElement,
    NODE_TO_INDEX,
    PlaitPluginElementContext,
    OnContextChanged
} from '@plait/core';
import {
    isBottomLayout,
    isHorizontalLayout,
    isIndentedLayout,
    isLeftLayout,
    AbstractNode,
    isRightLayout,
    isStandardLayout,
    isTopLayout,
    MindmapLayoutType,
    OriginNode
} from '@plait/layouts';
import { hasEditableTarget, PlaitRichtextComponent, setFullSelectionAndFocus, updateRichText } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject, timer } from 'rxjs';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { Editor, Operation } from 'slate';
import {
    EXTEND_OFFSET,
    EXTEND_RADIUS,
    MindmapNodeShape,
    NODE_MIN_WIDTH,
    PRIMARY_COLOR,
    QUICK_INSERT_CIRCLE_COLOR,
    QUICK_INSERT_CIRCLE_OFFSET,
    QUICK_INSERT_INNER_CROSS_COLOR,
    STROKE_WIDTH
} from './constants';
import { drawIndentedLink } from './draw/indented-link';
import { drawLogicLink } from './draw/link/logic-link';
import { drawMindmapNodeRichtext, updateMindmapNodeRichtextLocation } from './draw/richtext';
import { drawRectangleNode } from './draw/shape';
import { MindmapNodeElement, PlaitMindmap } from './interfaces/element';
import { ExtendLayoutType, ExtendUnderlineCoordinateType, MindmapNode } from './interfaces/node';
import { MindmapQueries } from './queries';
import { getLinkLineColorByMindmapElement, getRootLinkLineColorByMindmapElement } from './utils/colors';
import { getRectangleByNode, hitMindmapElement } from './utils/graph';
import { createEmptyNode, getChildrenCount } from './utils/mindmap';
import { getNodeShapeByElement } from './utils/shape';
import { ELEMENT_TO_NODE, MINDMAP_ELEMENT_TO_COMPONENT } from './utils/weak-maps';
import { getRichtextContentSize } from '@plait/richtext';
import { drawAbstractLink } from './draw/link/abstract-link';

@Component({
    selector: 'plait-mindmap-node',
    template: `
        <plait-children
            *ngIf="!element.isCollapsed"
            [board]="board"
            [parent]="element"
            [effect]="effect"
            [parentG]="parentG"
        ></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindmapNodeComponent<T extends MindmapNodeElement = MindmapNodeElement> extends PlaitPluginElementComponent<T>
    implements OnInit, OnDestroy, OnContextChanged<T> {
    isEditable = false;

    roughSVG!: RoughSVG;

    node!: MindmapNode;

    parent!: MindmapNode;

    index!: number;

    parentG!: SVGGElement;

    activeG: SVGGElement[] = [];

    shapeG: SVGGElement | null = null;

    linkG?: SVGGElement;

    richtextG?: SVGGElement;

    foreignObject?: SVGForeignObjectElement;

    extendG?: SVGGElement;

    maskG!: SVGGElement;

    richtextComponentRef?: ComponentRef<PlaitRichtextComponent>;

    destroy$ = new Subject<void>();

    public get handActive(): boolean {
        return this.board.pointer === PlaitPointerType.hand;
    }

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef, private render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        MINDMAP_ELEMENT_TO_COMPONENT.set(this.element, this);
        super.ngOnInit();
        this.node = ELEMENT_TO_NODE.get(this.element) as MindmapNode;
        if (!PlaitMindmap.isMindmap(this.element)) {
            this.parent = MindmapNodeElement.getNode(this.board, MindmapNodeElement.getParent(this.element));
        }
        this.index = NODE_TO_INDEX.get(this.element) || 0;
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.parentG = PlaitElement.getComponent(MindmapNodeElement.getRoot(this.board, this.element)).rootG as SVGGElement;
        this.drawShape();
        this.drawLink();
        this.drawRichtext();
        this.drawActiveG();
        this.updateActiveClass();
        this.drawMaskG();
        this.drawExtend();
    }

    onContextChanged(value: PlaitPluginElementContext<T>, previous: PlaitPluginElementContext<T>) {
        const newNode = ELEMENT_TO_NODE.get(this.element) as MindmapNode;
        if (!PlaitMindmap.isMindmap(this.element)) {
            this.parent = MindmapNodeElement.getNode(this.board, MindmapNodeElement.getParent(this.element));
        }

        MINDMAP_ELEMENT_TO_COMPONENT.set(this.element, this);

        // resolve move node richtext lose issue
        if (this.node !== newNode) {
            if (this.foreignObject && this.foreignObject.children.length <= 0) {
                this.foreignObject?.appendChild(this.richtextComponentRef?.instance.editable as HTMLElement);
            }
        }

        const isEquals = MindmapNode.isEquals(this.node, newNode);
        this.node = newNode;
        this.drawActiveG();
        this.updateActiveClass();
        if (!isEquals) {
            this.drawShape();
            this.drawLink();
            this.updateRichtext();
            this.drawMaskG();
            this.drawExtend();
        }
    }

    drawShape() {
        this.destroyShape();
        const shape = getNodeShapeByElement(this.node.origin) as MindmapNodeShape;
        switch (shape) {
            case MindmapNodeShape.roundRectangle:
                this.shapeG = drawRectangleNode(this.board, this.node as MindmapNode);
                this.g.prepend(this.shapeG);
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

        const layout = MindmapQueries.getLayoutByElement(this.parent.origin) as MindmapLayoutType;
        if (AbstractNode.isAbstract(this.node.origin)) {
            this.linkG = drawAbstractLink(this.board, this.node, isHorizontalLayout(layout));
        } else if (MindmapNodeElement.isIndentedLayout(this.parent.origin)) {
            this.linkG = drawIndentedLink(this.roughSVG, this.parent, this.node);
        } else {
            this.linkG = drawLogicLink(this.roughSVG, this.node, this.parent, isHorizontalLayout(layout));
        }
        this.g.append(this.linkG);
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
        const lineWidthOffset = 2;
        const extendOffset = 15;
        const nodeLayout = MindmapQueries.getLayoutByElement(this.node.origin) as MindmapLayoutType;
        const isTop = isTopLayout(nodeLayout);
        const isRight = isRightLayout(nodeLayout);
        const isBottom = isBottomLayout(nodeLayout);
        const isLeft = isLeftLayout(nodeLayout);
        const { x, y, width, height } = getRectangleByNode(this.node as MindmapNode);

        let drawX = x;
        let drawY = y;
        let drawWidth = x + width;
        let drawHeight = y + height;

        switch (true) {
            case isTop:
                drawX = x - lineWidthOffset;
                drawY = y - extendOffset;
                drawWidth = x + width + lineWidthOffset;
                drawHeight = y + height + lineWidthOffset;
                break;
            case isBottom:
                drawX = x - lineWidthOffset;
                drawY = y - lineWidthOffset;
                drawWidth = x + width + lineWidthOffset;
                drawHeight = y + height + extendOffset;
                break;
            case isLeft:
                drawX = x - extendOffset;
                drawY = y - lineWidthOffset;
                drawWidth = x + width + lineWidthOffset;
                drawHeight = y + height + lineWidthOffset;
                break;
            case isRight:
                drawX = x - lineWidthOffset;
                drawY = y - lineWidthOffset;
                drawWidth = x + width + extendOffset;
                drawHeight = y + height + lineWidthOffset;
                break;
        }
        this.maskG = drawRoundRectangle(
            this.roughSVG as RoughSVG,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
            { stroke: 'none', fill: 'rgba(255,255,255,0)', fillStyle: 'solid' },
            true
        );
        this.maskG.classList.add('mask');
        this.maskG.setAttribute('visibility', 'visible');
        this.g.append(this.maskG);

        if (this.isEditable) {
            this.disabledMaskG();
        }

        fromEvent<MouseEvent>(this.maskG, 'mouseenter')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return PlaitBoard.isFocus(this.board) && !this.element.isCollapsed && !this.handActive;
                })
            )
            .subscribe(() => {
                this.g.classList.add('hovered');
            });
        fromEvent<MouseEvent>(this.maskG, 'mouseleave')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return PlaitBoard.isFocus(this.board) && !this.element.isCollapsed;
                })
            )
            .subscribe(() => {
                this.g.classList.remove('hovered');
            });
    }

    destroyMaskG() {
        if (this.maskG) {
            this.maskG.remove();
            this.g.classList.remove('hovered');
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
        if (this.selected) {
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
            this.g.appendChild(selectedStrokeG);
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
                this.g.appendChild(selectedBackgroundG);
                this.activeG.push(selectedBackgroundG, selectedStrokeG);
            }
        }
    }

    destroyActiveG() {
        this.activeG.forEach(g => g.remove());
        this.activeG = [];
    }

    updateActiveClass() {
        if (!this.g) {
            return;
        }
        if (this.selected) {
            this.render2.addClass(this.g, 'active');
        } else {
            this.render2.removeClass(this.g, 'active');
        }
    }

    drawRichtext() {
        const { richtextG, richtextComponentRef, foreignObject } = drawMindmapNodeRichtext(this.node as MindmapNode, this.viewContainerRef);
        this.richtextComponentRef = richtextComponentRef;
        this.richtextG = richtextG;
        this.foreignObject = foreignObject;
        this.render2.addClass(richtextG, 'richtext');
        this.g.append(richtextG);
    }

    private drawQuickInsert(offset = 0) {
        if (this.board.options.readonly) {
            return;
        }
        const quickInsertG = createG();
        quickInsertG.classList.add('quick-insert');
        this.extendG?.append(quickInsertG);
        const { x, y, width, height } = getRectangleByNode(this.node);

        /**
         * 方位：
         *    1. 左、左上、左下
         *    2. 右、右上、右下
         *    3. 上、上左、上右
         *    4. 下、下左、下右
         */
        const shape = getNodeShapeByElement(this.node.origin);
        // 形状是矩形要偏移边框的线宽
        const strokeWidth = this.node.origin.linkLineWidth ? this.node.origin.linkLineWidth : STROKE_WIDTH;
        let offsetBorderLineWidth = 0;
        if (shape === MindmapNodeShape.roundRectangle && offset === 0) {
            offsetBorderLineWidth = strokeWidth;
        }
        let offsetRootBorderLineWidth = 0;
        if (this.node.origin.isRoot) {
            offsetRootBorderLineWidth = strokeWidth;
        }
        // 当没有子节点时，需要缩小的偏移量
        const extraOffset = 3;
        const underlineCoordinates: ExtendUnderlineCoordinateType = {
            // 画线方向：右向左 <--
            [MindmapLayoutType.left]: {
                // EXTEND_RADIUS * 0.5 是 左方向，折叠/收起的偏移量
                startX: x - (offset > 0 ? offset + EXTEND_RADIUS * 0.5 : 0) - offsetRootBorderLineWidth,
                startY: y + height,
                endX:
                    x -
                    offsetBorderLineWidth -
                    offsetRootBorderLineWidth -
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET - extraOffset : 0) -
                    EXTEND_RADIUS,
                endY: y + height
            },
            // 画线方向：左向右 -->
            [MindmapLayoutType.right]: {
                startX: x + width + (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) + offsetRootBorderLineWidth,
                startY: y + height,
                endX:
                    x +
                    width +
                    offsetBorderLineWidth +
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET - extraOffset : 0) +
                    EXTEND_RADIUS +
                    offsetRootBorderLineWidth,
                endY: y + height
            },
            // 画线方向：下向上 -->
            [MindmapLayoutType.upward]: {
                startX: x + width * 0.5,
                startY: y - offsetBorderLineWidth - (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) - offsetRootBorderLineWidth,
                endX: x + width * 0.5,
                endY:
                    y -
                    offsetBorderLineWidth -
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET - extraOffset : 0) -
                    EXTEND_RADIUS -
                    offsetRootBorderLineWidth
            },
            // 画线方向：上向下 -->
            [MindmapLayoutType.downward]: {
                startX: x + width * 0.5,
                startY:
                    y + height + offsetBorderLineWidth + (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) + offsetRootBorderLineWidth,
                endX: x + width * 0.5,
                endY:
                    y +
                    height +
                    offsetBorderLineWidth +
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET - extraOffset : 0) +
                    EXTEND_RADIUS +
                    offsetRootBorderLineWidth
            },
            [MindmapLayoutType.leftBottomIndented]: {
                startX: x + width * 0.5,
                startY:
                    y + height + offsetBorderLineWidth + (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) + offsetRootBorderLineWidth,
                endX: x + width * 0.5,
                endY:
                    y +
                    height +
                    offsetBorderLineWidth +
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET - extraOffset : 0) +
                    EXTEND_RADIUS +
                    offsetRootBorderLineWidth
            },
            [MindmapLayoutType.leftTopIndented]: {
                startX: x + width * 0.5,
                startY: y - offsetBorderLineWidth - (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) - offsetRootBorderLineWidth,
                endX: x + width * 0.5,
                endY:
                    y -
                    offsetBorderLineWidth -
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) -
                    EXTEND_RADIUS -
                    offsetRootBorderLineWidth
            },
            [MindmapLayoutType.rightBottomIndented]: {
                startX: x + width * 0.5,
                startY:
                    y + height + offsetBorderLineWidth + (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) + offsetRootBorderLineWidth,
                endX: x + width * 0.5,
                endY:
                    y +
                    height +
                    offsetBorderLineWidth +
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET - extraOffset : 0) +
                    EXTEND_RADIUS +
                    offsetRootBorderLineWidth
            },
            [MindmapLayoutType.rightTopIndented]: {
                startX: x + width * 0.5,
                startY: y - offsetBorderLineWidth - (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) - offsetRootBorderLineWidth,
                endX: x + width * 0.5,
                endY:
                    y -
                    offsetBorderLineWidth -
                    (offset > 0 ? offset + QUICK_INSERT_CIRCLE_OFFSET : 0) -
                    EXTEND_RADIUS -
                    offsetRootBorderLineWidth
            }
        };
        if (shape === MindmapNodeShape.roundRectangle || this.node.origin.isRoot) {
            underlineCoordinates[MindmapLayoutType.left].startY -= height * 0.5;
            underlineCoordinates[MindmapLayoutType.left].endY -= height * 0.5;
            underlineCoordinates[MindmapLayoutType.right].startY -= height * 0.5;
            underlineCoordinates[MindmapLayoutType.right].endY -= height * 0.5;
        }
        const stroke = this.node.origin.isRoot
            ? getRootLinkLineColorByMindmapElement(this.element)
            : getLinkLineColorByMindmapElement(this.element);
        let nodeLayout = MindmapQueries.getCorrectLayoutByElement(this.node.origin) as ExtendLayoutType;
        if (this.node.origin.isRoot && isStandardLayout(nodeLayout)) {
            const root = this.node.origin as OriginNode;
            nodeLayout = root.children.length >= root.rightNodeCount ? MindmapLayoutType.left : MindmapLayoutType.right;
        }
        const underlineCoordinate = underlineCoordinates[nodeLayout];
        if (underlineCoordinate) {
            const underline = this.roughSVG.line(
                underlineCoordinate.startX,
                underlineCoordinate.startY,
                underlineCoordinate.endX,
                underlineCoordinate.endY,
                { stroke, strokeWidth }
            );
            const circleCoordinates = {
                startX: underlineCoordinate.endX,
                startY: underlineCoordinate.endY
            };
            const circle = this.roughSVG.circle(circleCoordinates.startX, circleCoordinates.startY, EXTEND_RADIUS, {
                fill: QUICK_INSERT_CIRCLE_COLOR,
                stroke: QUICK_INSERT_CIRCLE_COLOR,
                fillStyle: 'solid'
            });
            const innerCrossCoordinates = {
                horizontal: {
                    startX: circleCoordinates.startX - EXTEND_RADIUS * 0.5 + 3,
                    startY: circleCoordinates.startY,
                    endX: circleCoordinates.startX + EXTEND_RADIUS * 0.5 - 3,
                    endY: circleCoordinates.startY
                },
                vertical: {
                    startX: circleCoordinates.startX,
                    startY: circleCoordinates.startY - EXTEND_RADIUS * 0.5 + 3,
                    endX: circleCoordinates.startX,
                    endY: circleCoordinates.startY + EXTEND_RADIUS * 0.5 - 3
                }
            };
            const innerCrossHLine = this.roughSVG.line(
                innerCrossCoordinates.horizontal.startX,
                innerCrossCoordinates.horizontal.startY,
                innerCrossCoordinates.horizontal.endX,
                innerCrossCoordinates.horizontal.endY,
                {
                    stroke: QUICK_INSERT_INNER_CROSS_COLOR,
                    strokeWidth: 2
                }
            );
            const innerRingVLine = this.roughSVG.line(
                innerCrossCoordinates.vertical.startX,
                innerCrossCoordinates.vertical.startY,
                innerCrossCoordinates.vertical.endX,
                innerCrossCoordinates.vertical.endY,
                {
                    stroke: QUICK_INSERT_INNER_CROSS_COLOR,
                    strokeWidth: 2
                }
            );
            quickInsertG.appendChild(underline);
            quickInsertG.appendChild(circle);
            quickInsertG.appendChild(innerCrossHLine);
            quickInsertG.appendChild(innerRingVLine);
        }

        fromEvent(quickInsertG, 'mouseup')
            .pipe(take(1))
            .subscribe(() => {
                const path = PlaitBoard.findPath(this.board, this.element).concat(
                    this.element.children.filter(child => !AbstractNode.isAbstract(child)).length
                );
                createEmptyNode(this.board, this.node.origin, path);
            });
    }

    drawExtend() {
        // destroy
        this.destroyExtend();
        // create extend
        this.extendG = createG();
        const collapseG = createG();
        this.extendG.classList.add('extend');
        collapseG.classList.add('collapse-container');
        this.g.append(this.extendG);
        this.extendG.append(collapseG);
        if (this.node.origin.isRoot) {
            this.drawQuickInsert();
            return;
        }
        // interactive
        fromEvent(collapseG, 'mouseup')
            .pipe(
                filter(() => !this.handActive || this.board.options.readonly),
                take(1)
            )
            .subscribe(() => {
                const isCollapsed = !this.node.origin.isCollapsed;
                const newElement: Partial<MindmapNodeElement> = { isCollapsed };
                const path = PlaitBoard.findPath(this.board, this.element);
                Transforms.setNode(this.board, newElement, path);
            });

        const { x, y, width, height } = getRectangleByNode(this.node);
        const stroke = getLinkLineColorByMindmapElement(this.element);
        const strokeWidth = this.node.origin.linkLineWidth ? this.node.origin.linkLineWidth : STROKE_WIDTH;
        const extendY = y + height / 2;
        const nodeLayout = MindmapQueries.getCorrectLayoutByElement(this.element) as MindmapLayoutType;

        let extendLineXY = [
            [x + width, extendY],
            [x + width + EXTEND_OFFSET, extendY]
        ];

        let arrowYOffset = [-4, 1, -0.6, 4];
        let arrowXOffset = [10, 5.5, 5.5, 10];

        let extendLineXOffset = [0, 0];
        let extendLineYOffset = [0, 0];

        let circleOffset = [EXTEND_RADIUS / 2, 0];

        if (isHorizontalLayout(nodeLayout) && !isIndentedLayout(nodeLayout)) {
            extendLineYOffset =
                (getNodeShapeByElement(this.node.origin) as MindmapNodeShape) === MindmapNodeShape.roundRectangle
                    ? [0, 0]
                    : [height / 2, height / 2];
            if (isLeftLayout(nodeLayout)) {
                //左
                extendLineXOffset = [-width, -width - EXTEND_OFFSET * 2];
                circleOffset = [-EXTEND_RADIUS / 2, 0];
                arrowXOffset = [-10, -5.5, -5.5, -10];
            }
        } else {
            arrowXOffset = [-4, 0.6, -1, 4];
            if (isTopLayout(nodeLayout)) {
                //上
                extendLineXOffset = [-width / 2, -width / 2 - EXTEND_OFFSET];
                extendLineYOffset = [-height / 2, -height / 2 - EXTEND_OFFSET];
                arrowYOffset = [-10, -5.5, -5.5, -10];
                circleOffset = [0, -EXTEND_RADIUS / 2];
            } else {
                //下
                extendLineXOffset = [-width / 2, -width / 2 - EXTEND_OFFSET];
                extendLineYOffset = [height / 2, height / 2 + EXTEND_OFFSET];
                arrowYOffset = [10, 5.5, 5.5, 10];
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
                strokeWidth: 2
            }
        );
        const hideArrowBottomLine = this.roughSVG.line(
            extendLineXY[1][0] + arrowXOffset[2],
            extendLineXY[1][1] + arrowYOffset[2],
            extendLineXY[1][0] + arrowXOffset[3],
            extendLineXY[1][1] + arrowYOffset[3],
            {
                stroke,
                strokeWidth: 2
            }
        );

        if (this.node.origin.isCollapsed) {
            const badge = this.roughSVG.circle(extendLineXY[1][0] + circleOffset[0], extendLineXY[1][1] + circleOffset[1], EXTEND_RADIUS, {
                fill: stroke,
                stroke,
                fillStyle: 'solid'
            });

            let numberOffset = 0;
            if (getChildrenCount(this.node.origin) >= 10) numberOffset = -2;
            if (getChildrenCount(this.node.origin) === 1) numberOffset = 1;

            const badgeText = createText(
                extendLineXY[1][0] + circleOffset[0] - 4 + numberOffset,
                extendLineXY[1][1] + circleOffset[1] + 4,
                stroke,
                `${getChildrenCount(this.node.origin)}`
            );

            this.g.classList.add('collapsed');
            badge.setAttribute('style', 'opacity: 0.15');
            badgeText.setAttribute('style', 'font-size: 12px');
            collapseG.appendChild(badge);
            collapseG.appendChild(badgeText);
            collapseG.appendChild(extendLine);
        } else {
            this.g.classList.remove('collapsed');

            if (this.node.origin.children.length > 0) {
                const hideCircleG = this.roughSVG.circle(
                    extendLineXY[1][0] + circleOffset[0],
                    extendLineXY[1][1] + circleOffset[1],
                    EXTEND_RADIUS - 1,
                    {
                        fill: '#fff',
                        stroke,
                        strokeWidth,
                        fillStyle: 'solid'
                    }
                );
                collapseG.appendChild(hideCircleG);
                collapseG.appendChild(hideArrowTopLine);
                collapseG.appendChild(hideArrowBottomLine);
                this.drawQuickInsert(EXTEND_RADIUS);
            } else {
                this.drawQuickInsert();
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

    startEditText(isEnd: boolean, isClear: boolean) {
        this.isEditable = true;
        this.disabledMaskG();
        IS_TEXT_EDITABLE.set(this.board, true);
        if (!this.richtextComponentRef) {
            throw new Error('undefined richtextComponentRef');
        }
        const richtextInstance = this.richtextComponentRef.instance;
        if (richtextInstance.plaitReadonly) {
            richtextInstance.plaitReadonly = false;
            this.richtextComponentRef.changeDetectorRef.detectChanges();
            this.drawActiveG();
            const location = isEnd ? Editor.end(richtextInstance.editor, [0]) : [0];
            setFullSelectionAndFocus(richtextInstance.editor, location);
            if (isClear) {
                Editor.deleteBackward(richtextInstance.editor);
            }
        }
        let richtext = richtextInstance.plaitValue;
        // 增加 debounceTime 等待 DOM 渲染完成后再去取文本宽高
        const valueChange$ = richtextInstance.plaitChange
            .pipe(
                debounceTime(0),
                filter(event => {
                    // 过滤掉 operations 中全是 set_selection 的操作
                    return !event.operations.every(op => Operation.isSelectionOperation(op));
                })
            )
            .subscribe(event => {
                if (richtext === event.value) {
                    return;
                }
                richtext = event.value;
                this.updateRichtext();
                // 更新富文本、更新宽高
                let { width, height } = getRichtextContentSize(richtextInstance.editable);
                const newElement = {
                    value: richtext,
                    width: width < NODE_MIN_WIDTH * this.board.viewport.zoom ? NODE_MIN_WIDTH : width / this.board.viewport.zoom,
                    height: height / this.board.viewport.zoom
                } as MindmapNodeElement;
                const path = PlaitBoard.findPath(this.board, this.element);
                Transforms.setNode(this.board, newElement, path);
                MERGING.set(this.board, true);
            });
        const composition$ = richtextInstance.plaitComposition.pipe(debounceTime(0)).subscribe(event => {
            let { width, height } = getRichtextContentSize(richtextInstance.editable);
            if (width < NODE_MIN_WIDTH) {
                width = NODE_MIN_WIDTH;
            }
            if (event.isComposing && (width !== this.node.origin.width || height !== this.node.origin.height)) {
                const newElement: Partial<MindmapNodeElement> = {
                    width: width / this.board.viewport.zoom,
                    height: height / this.board.viewport.zoom
                };
                const path = PlaitBoard.findPath(this.board, this.element);
                Transforms.setNode(this.board, newElement, path);
                MERGING.set(this.board, true);
            }
        });
        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = transformPoint(this.board, toPoint(event.x, event.y, PlaitBoard.getHost(this.board)));
            const clickInNode = hitMindmapElement(this.board, point, this.element);
            if (clickInNode && !hasEditableTarget(richtextInstance.editor, event.target)) {
                event.preventDefault();
            } else if (!clickInNode) {
                // handle composition input state, like: Chinese IME Composition Input
                timer(0).subscribe(() => {
                    exitHandle();
                    this.enableMaskG();
                });
            }
        });
        const editor = richtextInstance.editor;
        const { keydown } = editor;
        editor.keydown = (event: KeyboardEvent) => {
            if (event.isComposing) {
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                exitHandle();
                this.drawActiveG();
                this.enableMaskG();
                return;
            }
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                exitHandle();
                this.drawActiveG();
                this.enableMaskG();
                return;
            }
            if (event.key === 'Tab') {
                event.preventDefault();
                event.stopPropagation();
                exitHandle();
                this.drawActiveG();
                this.drawMaskG();
            }
        };
        const exitHandle = () => {
            // unsubscribe
            valueChange$.unsubscribe();
            composition$.unsubscribe();
            mousedown$.unsubscribe();
            editor.keydown = keydown; // reset keydown
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
        super.ngOnDestroy();
        this.destroyRichtext();
        this.destroy$.next();
        this.destroy$.complete();
        if (ELEMENT_TO_NODE.get(this.element) === this.node) {
            ELEMENT_TO_NODE.delete(this.element);
        }
        if (MINDMAP_ELEMENT_TO_COMPONENT.get(this.element) === this) {
            MINDMAP_ELEMENT_TO_COMPONENT.delete(this.element);
        }
    }
}