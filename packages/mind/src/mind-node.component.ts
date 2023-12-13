import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import {
    createG,
    PlaitBoard,
    PlaitElement,
    NODE_TO_INDEX,
    PlaitPluginElementContext,
    OnContextChanged,
    RectangleClient,
    PlaitChildrenElementComponent
} from '@plait/core';
import { isHorizontalLayout, AbstractNode, MindLayoutType } from '@plait/layouts';
import { TextManageRef, TextManage, ExitOrigin } from '@plait/text';
import { RoughSVG } from 'roughjs/bin/svg';
import { Subject } from 'rxjs';
import { MindElement, PlaitMind } from './interfaces/element';
import { MindNode } from './interfaces/node';
import { MindQueries } from './queries';
import { ELEMENT_TO_NODE } from './utils/weak-maps';
import { drawAbstractLink } from './utils/draw/node-link/abstract-link';
import { NodeEmojisGenerator } from './generators/node-emojis.generator';
import { MindTransforms } from './transforms';
import { NodePlusGenerator } from './generators/node-plus.generator';
import { PlaitMindBoard } from './plugins/with-mind.board';
import { drawLink } from './utils/draw/node-link/draw-link';
import { getTopicRectangleByNode } from './utils/position/topic';
import { NodeActiveGenerator } from './generators/node-active.generator';
import { CollapseGenerator } from './generators/node-collapse.generator';
import { NodeSpace } from './utils/space/node-space';
import { NodeTopicThreshold } from './constants/node-topic-style';
import { CommonPluginElement, ImageGenerator, WithTextOptions, WithTextPluginKey } from '@plait/common';
import { NodeShapeGenerator } from './generators/node-shape.generator';
import { NgIf } from '@angular/common';
import { getImageForeignRectangle } from './utils';
import { ImageData } from './interfaces';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, PlaitChildrenElementComponent]
})
export class MindNodeComponent extends CommonPluginElement<MindElement, PlaitMindBoard>
    implements OnInit, OnDestroy, OnContextChanged<MindElement, PlaitMindBoard> {
    roughSVG!: RoughSVG;

    node!: MindNode;

    index!: number;

    parentG!: SVGGElement;

    shapeG: SVGGElement | null = null;

    linkG?: SVGGElement;

    extendG?: SVGGElement;

    destroy$ = new Subject<void>();

    nodeEmojisGenerator!: NodeEmojisGenerator;

    nodeShapeGenerator!: NodeShapeGenerator;

    nodePlusGenerator!: NodePlusGenerator;

    imageGenerator!: ImageGenerator<MindElement<ImageData>>;

    activeGenerator!: NodeActiveGenerator;

    collapseGenerator!: CollapseGenerator;

    get textManage() {
        return this.getTextManages()[0];
    }

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeDrawer() {
        this.nodeShapeGenerator = new NodeShapeGenerator(this.board);
        this.nodeEmojisGenerator = new NodeEmojisGenerator(this.board, this.viewContainerRef);
        this.activeGenerator = new NodeActiveGenerator(this.board);
        this.nodePlusGenerator = new NodePlusGenerator(this.board);
        this.collapseGenerator = new CollapseGenerator(this.board);
        this.imageGenerator = new ImageGenerator<MindElement<ImageData>>(this.board, {
            getRectangle: (element: MindElement<ImageData>) => {
                return getImageForeignRectangle(this.board as PlaitMindBoard, element);
            },
            getImageItem: (element: MindElement<ImageData>) => {
                return element.data.image;
            }
        });
        const plugins = this.board.getPluginOptions<WithTextOptions>(WithTextPluginKey).textPlugins;
        const textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const rect = getTopicRectangleByNode(this.board, this.node);
                return rect;
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                const width = textManageRef.width;
                const height = textManageRef.height;
                if (textManageRef.newValue) {
                    MindTransforms.setTopic(this.board, this.element, textManageRef.newValue as MindElement, width, height);
                } else {
                    MindTransforms.setTopicSize(this.board, this.element, width, height);
                }
            },
            textPlugins: plugins,
            getMaxWidth: () => {
                if (this.element.manualWidth) {
                    return NodeSpace.getNodeDynamicWidth(this.board, this.element);
                } else {
                    return Math.max(NodeSpace.getNodeDynamicWidth(this.board, this.element), NodeTopicThreshold.defaultTextMaxWidth);
                }
            }
        });
        this.initializeTextManages([textManage]);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeDrawer();
        this.node = MindElement.getNode(this.element);
        this.index = NODE_TO_INDEX.get(this.element) || 0;
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.parentG = PlaitElement.getComponent(MindElement.getRoot(this.board, this.element)).rootG as SVGGElement;
        this.nodeShapeGenerator.processDrawing(this.element, this.g, { node: this.node });
        this.drawLink();
        this.drawTopic();
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected,
            isEditing: this.textManage.isEditing
        });
        this.drawEmojis();
        this.drawExtend();
        this.imageGenerator.processDrawing(this.element as MindElement<ImageData>, this.g, this.viewContainerRef);
        if (PlaitMind.isMind(this.context.parent)) {
            this.g.classList.add('branch');
        }
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
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected, isEditing: this.textManage.isEditing });
            this.nodeShapeGenerator.processDrawing(this.element, this.g, { node: this.node });
            // this.nodeShapeGenerator.
            this.drawLink();
            this.drawEmojis();
            this.drawExtend();
            if (!MindElement.hasImage(previous.element) && MindElement.hasImage(this.element)) {
                this.imageGenerator.processDrawing(this.element, this.g, this.viewContainerRef);
            }
            if (MindElement.hasImage(previous.element) && MindElement.hasImage(this.element)) {
                this.imageGenerator.updateImage(
                    this.g,
                    previous.element as MindElement<ImageData>,
                    value.element as MindElement<ImageData>
                );
            }
            if (MindElement.hasImage(previous.element) && !MindElement.hasImage(this.element)) {
                this.imageGenerator.destroy();
            }
            this.updateTopic();
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameParent = value.parent === previous.parent;
            if (!hasSameSelected) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected,
                    isEditing: this.textManage.isEditing
                });
            }
            if (!hasSameParent) {
                this.drawLink();
            }
        }
    }

    drawEmojis() {
        const g = this.nodeEmojisGenerator.drawEmojis(this.element);
        if (g) {
            this.g.append(g);
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

    drawExtend() {
        if (!this.extendG) {
            this.extendG = createG();
            this.extendG.classList.add('extend');
            this.g.append(this.extendG);
        }
        if (this.element.isCollapsed) {
            this.g.classList.add('collapsed');
        } else {
            this.g.classList.remove('collapsed');
        }
        this.nodePlusGenerator.processDrawing(this.element, this.extendG!);
        this.collapseGenerator.processDrawing(this.element, this.extendG!);
    }

    drawTopic() {
        this.textManage.draw(this.element.data.topic);
        this.g.append(this.textManage.g);
    }

    updateTopic() {
        this.textManage.updateText(this.element.data.topic);
        this.textManage.updateRectangle();
    }

    editTopic() {
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected, isEditing: true });
        this.textManage.edit((origin: ExitOrigin) => {
            if (origin === ExitOrigin.default) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected, isEditing: false });
            }
        });
    }

    trackBy = (index: number, node: MindNode) => {
        return node.origin.id;
    };

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.textManage.destroy();
        this.nodeEmojisGenerator.destroy();
        this.imageGenerator.destroy();
        this.activeGenerator.destroy();
        this.destroy$.next();
        this.destroy$.complete();
        if (ELEMENT_TO_NODE.get(this.element) === this.node) {
            ELEMENT_TO_NODE.delete(this.element);
        }
    }
}
