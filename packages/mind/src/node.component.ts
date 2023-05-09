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
    isTopLayout,
    MindLayoutType
} from '@plait/layouts';
import { hasEditableTarget, PlaitRichtextComponent, setFullSelectionAndFocus, updateRichText } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject, timer } from 'rxjs';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { Editor, Operation } from 'slate';
import { EXTEND_OFFSET, EXTEND_RADIUS, MindNodeShape, NODE_MIN_WIDTH, PRIMARY_COLOR, STROKE_WIDTH } from './constants';
import { drawIndentedLink } from './draw/indented-link';
import { drawLogicLink } from './draw/link/logic-link';
import { drawMindNodeRichtext, updateMindNodeTopicSize } from './draw/richtext';
import { drawRectangleNode } from './draw/shape';
import { MindElement, PlaitMind } from './interfaces/element';
import { MindNode } from './interfaces/node';
import { MindQueries } from './queries';
import { getLinkLineColorByMindElement } from './utils/colors';
import { getRectangleByNode, hitMindElement } from './utils/graph';
import { getChildrenCount } from './utils/mind';
import { getNodeShapeByElement } from './utils/shape';
import { ELEMENT_TO_NODE } from './utils/weak-maps';
import { getRichtextContentSize } from '@plait/richtext';
import { drawAbstractLink } from './draw/link/abstract-link';
import { EmojisDrawer } from './plugins/emoji/emoji.drawer';
import { PlaitMindEmojiBoard } from './plugins/emoji/with-mind-emoji';
import { MindTransforms } from './transforms';
import { drawAbstractIncludedOutline } from './draw/abstract';
import { AbstractHandlePosition } from './interfaces';
import { QuickInsertDrawer } from './drawer/quick-insert.drawer';
import { hasAfterDraw } from './drawer/base/base';

@Component({
    selector: 'plait-mind-node',
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
export class MindNodeComponent<T extends MindElement = MindElement> extends PlaitPluginElementComponent<T>
    implements OnInit, OnDestroy, OnContextChanged<T> {
    isEditable = false;

    roughSVG!: RoughSVG;

    node!: MindNode;

    parent!: MindNode;

    index!: number;

    abstractIncludedOutlineG?: SVGGElement;

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

    emojisDrawer!: EmojisDrawer;

    quickInsertDrawer!: QuickInsertDrawer;

    public get handActive(): boolean {
        return this.board.pointer === PlaitPointerType.hand;
    }

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef, private render2: Renderer2) {
        super(cdr);
    }

    ngOnInit(): void {
        this.emojisDrawer = new EmojisDrawer(this.board as PlaitMindEmojiBoard, this.viewContainerRef);
        this.quickInsertDrawer = new QuickInsertDrawer(this.board);
        super.ngOnInit();
        this.node = ELEMENT_TO_NODE.get(this.element) as MindNode;
        if (!PlaitMind.isMind(this.element)) {
            this.parent = MindElement.getNode(MindElement.getParent(this.element));
        }
        this.index = NODE_TO_INDEX.get(this.element) || 0;
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.parentG = PlaitElement.getComponent(MindElement.getRoot(this.board, this.element)).rootG as SVGGElement;
        this.drawShape();
        this.drawLink();
        this.drawRichtext();
        this.drawEmojis();
        this.drawActiveG();
        this.updateActiveClass();
        this.drawMaskG();
        this.drawExtend();
        this.drawQuickInsert();
    }

    onContextChanged(value: PlaitPluginElementContext<T>, previous: PlaitPluginElementContext<T>) {
        const newNode = ELEMENT_TO_NODE.get(this.element) as MindNode;
        if (!PlaitMind.isMind(this.element)) {
            this.parent = MindElement.getNode(MindElement.getParent(this.element));
        }

        // resolve move node richtext lose issue
        if (this.node !== newNode) {
            if (this.foreignObject && this.foreignObject.children.length <= 0) {
                this.foreignObject?.appendChild(this.richtextComponentRef?.instance.editable as HTMLElement);
            }
        }

        const isEquals = MindNode.isEquals(this.node, newNode);
        this.node = newNode;
        this.drawActiveG();
        this.updateActiveClass();
        if (!isEquals) {
            this.drawShape();
            this.drawLink();
            this.updateRichtext();
            this.drawMaskG();
            this.drawExtend();
            this.drawQuickInsert();
            this.drawEmojis();
        }
    }

    drawEmojis() {
        const g = this.emojisDrawer.drawEmojis(this.element);
        if (g) {
            this.g.append(g);
        }
    }

    drawQuickInsert() {
        this.quickInsertDrawer.destroy();
        if (this.quickInsertDrawer.canDraw(this.element)) {
            const g = this.quickInsertDrawer.draw(this.element);
            if (hasAfterDraw(this.quickInsertDrawer)) {
                this.quickInsertDrawer.afterDraw(this.element);
            }
            this.extendG?.appendChild(g);
        }
    }

    drawShape() {
        this.destroyShape();
        const shape = getNodeShapeByElement(this.node.origin) as MindNodeShape;
        switch (shape) {
            case MindNodeShape.roundRectangle:
                this.shapeG = drawRectangleNode(this.board, this.node as MindNode);
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

        const layout = MindQueries.getLayoutByElement(this.parent.origin) as MindLayoutType;
        if (AbstractNode.isAbstract(this.node.origin)) {
            this.linkG = drawAbstractLink(this.board, this.node, isHorizontalLayout(layout));
        } else if (MindElement.isIndentedLayout(this.parent.origin)) {
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
        const nodeLayout = MindQueries.getLayoutByElement(this.node.origin) as MindLayoutType;
        const isTop = isTopLayout(nodeLayout);
        const isRight = isRightLayout(nodeLayout);
        const isBottom = isBottomLayout(nodeLayout);
        const isLeft = isLeftLayout(nodeLayout);
        const { x, y, width, height } = getRectangleByNode(this.node as MindNode);

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
        this.abstractIncludedOutlineG?.remove();
        if (this.selected) {
            if (AbstractNode.isAbstract(this.element)) {
                this.updateAbstractIncludedOutline();
            }
            let { x, y, width, height } = getRectangleByNode(this.node as MindNode);
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
        const { richtextG, richtextComponentRef, foreignObject } = drawMindNodeRichtext(this.node as MindNode, this.viewContainerRef);
        this.richtextComponentRef = richtextComponentRef;
        this.richtextG = richtextG;
        this.foreignObject = foreignObject;
        this.render2.addClass(richtextG, 'richtext');
        this.g.append(richtextG);
    }

    drawExtend() {
        this.destroyExtend();
        // create extend
        this.extendG = createG();
        const collapseG = createG();
        this.extendG.classList.add('extend');
        collapseG.classList.add('collapse-container');
        this.g.append(this.extendG);
        this.extendG.append(collapseG);
        if (this.node.origin.isRoot) {
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
                const newElement: Partial<MindElement> = { isCollapsed };
                const path = PlaitBoard.findPath(this.board, this.element);
                Transforms.setNode(this.board, newElement, path);
            });

        const { x, y, width, height } = getRectangleByNode(this.node);
        const stroke = getLinkLineColorByMindElement(this.element);
        const strokeWidth = this.node.origin.linkLineWidth ? this.node.origin.linkLineWidth : STROKE_WIDTH;
        const extendY = y + height / 2;
        const nodeLayout = MindQueries.getCorrectLayoutByElement(this.element) as MindLayoutType;

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
                (getNodeShapeByElement(this.node.origin) as MindNodeShape) === MindNodeShape.roundRectangle
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

    updateAbstractIncludedOutline(resizingLocation?: number, handlePosition?: AbstractHandlePosition) {
        this.abstractIncludedOutlineG?.remove();
        this.abstractIncludedOutlineG = drawAbstractIncludedOutline(
            this.board,
            this.roughSVG,
            this.element,
            handlePosition,
            resizingLocation
        );
        PlaitBoard.getHost(this.board).append(this.abstractIncludedOutlineG);
    }

    updateRichtext() {
        updateRichText(this.node.origin.data.topic, this.richtextComponentRef!);
        updateMindNodeTopicSize(this.node, this.richtextG as SVGGElement, this.isEditable);
    }

    startEditText(isEnd: boolean, isClear: boolean) {
        if (!this.richtextComponentRef) {
            throw new Error('undefined richtextComponentRef');
        }
        const richtextInstance = this.richtextComponentRef.instance;

        this.isEditable = true;
        IS_TEXT_EDITABLE.set(this.board, true);
        this.disabledMaskG();
        updateMindNodeTopicSize(this.node, this.richtextG as SVGGElement, this.isEditable);
        if (richtextInstance.plaitReadonly) {
            richtextInstance.plaitReadonly = false;
            this.richtextComponentRef.changeDetectorRef.detectChanges();
            this.drawActiveG();
            const location = isEnd ? Editor.end(richtextInstance.editor, [0]) : [0];
            setFullSelectionAndFocus(richtextInstance.editor, location);
            if (isClear) {
                Editor.deleteBackward(richtextInstance.editor);
            }
            // handle invalid width and height (old data)
            let { width, height } = getRichtextContentSize(richtextInstance.editable);
            if (width !== this.element.width || height !== this.element.height) {
                MindTransforms.setTopicSize(this.board, this.element, width, height);
            }
        }
        let richtext = richtextInstance.plaitValue;
        // use debounceTime to wait DOM render complete
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
                this.updateRichtext();
                // 更新富文本、更新宽高
                let { width, height } = getRichtextContentSize(richtextInstance.editable);
                MindTransforms.setTopic(this.board, this.element, event.value, width, height);
                MERGING.set(this.board, true);
            });
        const composition$ = richtextInstance.plaitComposition.pipe(debounceTime(0)).subscribe(event => {
            let { width, height } = getRichtextContentSize(richtextInstance.editable);
            if (width < NODE_MIN_WIDTH) {
                width = NODE_MIN_WIDTH;
            }
            if (event.isComposing && (width !== this.node.origin.width || height !== this.node.origin.height)) {
                const newElement: Partial<MindElement> = {
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
            const clickInNode = hitMindElement(this.board, point, this.element);
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
            updateMindNodeTopicSize(this.node, this.richtextG as SVGGElement, this.isEditable);
            IS_TEXT_EDITABLE.set(this.board, false);
        };
    }

    trackBy = (index: number, node: MindNode) => {
        return node.origin.id;
    };

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.abstractIncludedOutlineG?.remove();
        this.destroyRichtext();
        this.destroy$.next();
        this.destroy$.complete();
        if (ELEMENT_TO_NODE.get(this.element) === this.node) {
            ELEMENT_TO_NODE.delete(this.element);
        }
    }
}
