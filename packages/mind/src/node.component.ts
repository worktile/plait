import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import {
    PlaitPointerType,
    createG,
    createText,
    PlaitBoard,
    Transforms,
    PlaitPluginElementComponent,
    PlaitElement,
    NODE_TO_INDEX,
    PlaitPluginElementContext,
    OnContextChanged,
    RectangleClient,
    Point
} from '@plait/core';
import { isHorizontalLayout, isIndentedLayout, isLeftLayout, AbstractNode, isTopLayout, MindLayoutType } from '@plait/layouts';
import { TextChangeRef, TextManage } from '@plait/richtext';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { EXTEND_OFFSET, EXTEND_RADIUS } from './constants';
import { drawRoundRectangleByNode } from './utils/draw/node-shape';
import { MindElement, PlaitMind } from './interfaces/element';
import { MindNode } from './interfaces/node';
import { MindQueries } from './queries';
import { getRectangleByNode, isHitMindElement } from './utils/position/node';
import { getChildrenCount } from './utils/mind';
import { getShapeByElement } from './utils/node-style/shape';
import { ELEMENT_TO_NODE } from './utils/weak-maps';
import { drawAbstractLink } from './utils/draw/node-link/abstract-link';
import { NodeEmojisDrawer } from './drawer/node-emojis.drawer';
import { MindTransforms } from './transforms';
import { MindElementShape } from './interfaces';
import { NodeInsertDrawer } from './drawer/node-insert.drawer';
import { getBranchColorByMindElement, getBranchWidthByMindElement } from './utils/node-style/branch';
import { PlaitMindBoard } from './plugins/with-mind.board';
import { drawLink } from './utils/draw/node-link/draw-link';
import { getTopicRectangleByNode } from './utils/position/topic';
import { NodeActiveDrawer } from './drawer/node-active.drawer';

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
export class MindNodeComponent extends PlaitPluginElementComponent<MindElement, PlaitMindBoard>
    implements OnInit, OnDestroy, OnContextChanged<MindElement, PlaitMindBoard> {
    roughSVG!: RoughSVG;

    node!: MindNode;

    index!: number;

    parentG!: SVGGElement;

    shapeG: SVGGElement | null = null;

    linkG?: SVGGElement;

    extendG?: SVGGElement;

    destroy$ = new Subject<void>();

    nodeEmojisDrawer!: NodeEmojisDrawer;

    nodeInsertDrawer!: NodeInsertDrawer;

    textManage!: TextManage;

    activeDrawer!: NodeActiveDrawer;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef, private render2: Renderer2) {
        super(cdr);
    }

    initializeDrawer() {
        this.nodeEmojisDrawer = new NodeEmojisDrawer(this.board, this.viewContainerRef);
        this.nodeInsertDrawer = new NodeInsertDrawer(this.board);
        this.activeDrawer = new NodeActiveDrawer(this.board);
        this.textManage = new TextManage(
            this.board,
            this.viewContainerRef,
            () => {
                return getTopicRectangleByNode(this.board, this.node);
            },
            (point: Point) => {
                return isHitMindElement(this.board, point, this.element);
            },
            (textChangeRef: TextChangeRef) => {
                const width = textChangeRef.width / this.board.viewport.zoom;
                const height = textChangeRef.height / this.board.viewport.zoom;
                if (textChangeRef.newValue) {
                    MindTransforms.setTopic(this.board, this.element, textChangeRef.newValue as MindElement, width, height);
                } else {
                    MindTransforms.setTopicSize(this.board, this.element, width, height);
                }
            }
        );
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeDrawer();
        this.node = MindElement.getNode(this.element);
        this.index = NODE_TO_INDEX.get(this.element) || 0;
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.parentG = PlaitElement.getComponent(MindElement.getRoot(this.board, this.element)).rootG as SVGGElement;
        this.drawShape();
        this.drawLink();
        this.drawRichtext();
        this.activeDrawer.draw(this.element, this.g, { selected: this.selected, isEditing: this.textManage.isEditing });
        this.drawEmojis();
        this.drawExtend();
        this.nodeInsertDrawer.draw(this.element, this.extendG!);
    }

    startEdit() {
        this.activeDrawer.draw(this.element, this.g, { selected: this.selected, isEditing: true });
        this.textManage.edit(() => {
            this.activeDrawer.draw(this.element, this.g, { selected: this.selected, isEditing: false });
        });
    }

    onContextChanged(
        value: PlaitPluginElementContext<MindElement, PlaitMindBoard>,
        previous: PlaitPluginElementContext<MindElement, PlaitMindBoard>
    ) {
        const newNode = MindElement.getNode(value.element);
        const isEqualNode = RectangleClient.isEqual(this.node, newNode);
        this.node = newNode;

        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');

        if (!isEqualNode || value.element !== previous.element || isChangeTheme) {
            this.activeDrawer.draw(this.element, this.g, { selected: this.selected, isEditing: this.textManage.isEditing });
            this.drawShape();
            this.drawLink();
            this.drawEmojis();
            this.drawExtend();
            this.nodeInsertDrawer.draw(this.element, this.extendG!);
            this.textManage.redraw();
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameParent = value.parent === previous.parent;
            if (!hasSameSelected) {
                this.activeDrawer.draw(this.element, this.g, { selected: this.selected, isEditing: this.textManage.isEditing });
            }
            if (!hasSameParent) {
                this.drawLink();
            }
        }
    }

    drawEmojis() {
        const g = this.nodeEmojisDrawer.drawEmojis(this.element);
        if (g) {
            this.g.append(g);
        }
    }

    drawShape() {
        this.destroyShape();
        const shape = getShapeByElement(this.board, this.node.origin) as MindElementShape;
        switch (shape) {
            case MindElementShape.roundRectangle:
                this.shapeG = drawRoundRectangleByNode(this.board, this.node as MindNode);
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
        if (PlaitMind.isMind(this.element)) {
            return;
        }

        const parent = MindElement.getParent(this.element);
        const parentNode = MindElement.getNode(parent);

        if (this.linkG) {
            this.linkG.remove();
        }

        const layout = MindQueries.getLayoutByElement(parent) as MindLayoutType;
        if (AbstractNode.isAbstract(this.node.origin)) {
            this.linkG = drawAbstractLink(this.board, this.node, isHorizontalLayout(layout));
        } else {
            this.linkG = drawLink(this.board, parentNode, this.node, isHorizontalLayout(layout));
        }
        this.g.append(this.linkG);
    }

    destroyLine() {
        if (this.linkG) {
            this.linkG.remove();
        }
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
                filter(() => !PlaitBoard.isPointer(this.board, PlaitPointerType.hand) || !!PlaitBoard.isReadonly(this.board)),
                take(1)
            )
            .subscribe(() => {
                const isCollapsed = !this.node.origin.isCollapsed;
                const newElement: Partial<MindElement> = { isCollapsed };
                const path = PlaitBoard.findPath(this.board, this.element);
                Transforms.setNode(this.board, newElement, path);
            });

        const { x, y, width, height } = getRectangleByNode(this.node);
        const stroke = getBranchColorByMindElement(this.board, this.element);
        const branchWidth = getBranchWidthByMindElement(this.board, this.element);
        const extendY = y + height / 2;
        const nodeLayout = MindQueries.getCorrectLayoutByElement(this.board, this.element) as MindLayoutType;

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
                (getShapeByElement(this.board, this.node.origin) as MindElementShape) === MindElementShape.roundRectangle
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
            strokeWidth: branchWidth,
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
                        strokeWidth: branchWidth,
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

    drawRichtext() {
        this.textManage.draw(this.element.data.topic);
        this.g.append(this.textManage.g);
    }

    trackBy = (index: number, node: MindNode) => {
        return node.origin.id;
    };

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.textManage.destroy();
        this.nodeEmojisDrawer.destroy();
        this.destroy$.next();
        this.destroy$.complete();
        if (ELEMENT_TO_NODE.get(this.element) === this.node) {
            ELEMENT_TO_NODE.delete(this.element);
        }
    }
}
