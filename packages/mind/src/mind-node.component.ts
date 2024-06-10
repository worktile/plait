import { createG, PlaitBoard, NODE_TO_INDEX, PlaitPluginElementContext, OnContextChanged, RectangleClient } from '@plait/core';
import { isHorizontalLayout, AbstractNode, MindLayoutType } from '@plait/layouts';
import { RoughSVG } from 'roughjs/bin/svg';
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
import {
    CommonElementFlavour,
    ImageGenerator,
    TextManage,
    TextManageChangeData,
    WithTextPluginKey,
    WithTextPluginOptions
} from '@plait/common';
import { NodeShapeGenerator } from './generators/node-shape.generator';
import { getImageForeignRectangle } from './utils';
import { ImageData } from './interfaces';

export class MindNodeComponent extends CommonElementFlavour<MindElement, PlaitMindBoard>
    implements OnContextChanged<MindElement, PlaitMindBoard> {
    roughSVG!: RoughSVG;

    node!: MindNode;

    index!: number;

    shapeG: SVGGElement | null = null;

    linkG?: SVGGElement;

    extendG?: SVGGElement;

    nodeEmojisGenerator!: NodeEmojisGenerator;

    nodeShapeGenerator!: NodeShapeGenerator;

    nodePlusGenerator!: NodePlusGenerator;

    imageGenerator!: ImageGenerator<MindElement<ImageData>>;

    activeGenerator!: NodeActiveGenerator;

    collapseGenerator!: CollapseGenerator;

    get textManage() {
        return this.getTextManages()[0];
    }

    constructor() {
        super();
    }

    initializeGenerator() {
        this.nodeShapeGenerator = new NodeShapeGenerator(this.board);
        this.nodeEmojisGenerator = new NodeEmojisGenerator(this.board);
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
        const plugins = (this.board.getPluginOptions<WithTextPluginOptions>(WithTextPluginKey) || {}).textPlugins;
        const textManage = new TextManage(this.board, {
            getRectangle: () => {
                const rect = getTopicRectangleByNode(this.board, this.node);
                return rect;
            },
            onChange: (data: TextManageChangeData) => {
                const width = data.width;
                const height = data.height;
                if (data.newText) {
                    MindTransforms.setTopic(this.board, this.element, data.newText as MindElement, width, height);
                } else {
                    MindTransforms.setTopicSize(this.board, this.element, width, height);
                }
            },
            getMaxWidth: () => {
                if (this.element.manualWidth) {
                    return NodeSpace.getNodeDynamicWidth(this.board, this.element);
                } else {
                    return Math.max(NodeSpace.getNodeDynamicWidth(this.board, this.element), NodeTopicThreshold.defaultTextMaxWidth);
                }
            },
            textPlugins: plugins || []
        });
        this.initializeTextManages([textManage]);
        this.getRef().addGenerator(NodeActiveGenerator.key, this.activeGenerator);
        this.getRef().addGenerator(NodeEmojisGenerator.key, this.nodeEmojisGenerator);
        this.getRef().addGenerator(ImageGenerator.key, this.imageGenerator);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        this.node = MindElement.getNode(this.element);
        this.index = NODE_TO_INDEX.get(this.element) || 0;
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);
        this.nodeShapeGenerator.processDrawing(this.element, this.getElementG(), { node: this.node });
        this.drawLink();
        this.drawTopic();
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected
        });
        this.drawEmojis();
        this.drawExtend();
        this.imageGenerator.processDrawing(this.element as MindElement<ImageData>, this.getElementG());
        if (PlaitMind.isMind(this.context.parent)) {
            this.getElementG().classList.add('branch');
        }
    }

    onContextChanged(
        value: PlaitPluginElementContext<MindElement, PlaitMindBoard>,
        previous: PlaitPluginElementContext<MindElement, PlaitMindBoard>
    ) {
        this.initializeWeakMap();
        const newNode = MindElement.getNode(value.element);
        const isEqualNode = RectangleClient.isEqual(this.node, newNode);
        this.node = newNode;
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        if (!isEqualNode || value.element !== previous.element || isChangeTheme) {
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected
            });
            this.nodeShapeGenerator.processDrawing(this.element, this.getElementG(), { node: this.node });
            this.drawLink();
            this.drawEmojis();
            this.drawExtend();
            if (!MindElement.hasImage(previous.element) && MindElement.hasImage(this.element)) {
                this.imageGenerator.processDrawing(this.element, this.getElementG());
            }
            if (MindElement.hasImage(previous.element) && MindElement.hasImage(this.element)) {
                this.imageGenerator.updateImage(
                    this.getElementG(),
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
                    selected: this.selected
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
            this.getElementG().append(g);
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
        this.getElementG().append(this.linkG);
    }

    drawExtend() {
        if (!this.extendG) {
            this.extendG = createG();
            this.extendG.classList.add('extend');
            this.getElementG().append(this.extendG);
        }
        if (this.element.isCollapsed) {
            this.getElementG().classList.add('collapsed');
        } else {
            this.getElementG().classList.remove('collapsed');
        }
        this.nodePlusGenerator.processDrawing(this.element, this.extendG!);
        this.collapseGenerator.processDrawing(this.element, this.extendG!);
    }

    drawTopic() {
        this.textManage.draw(this.element.data.topic);
        this.getElementG().append(this.textManage.g);
    }

    updateTopic() {
        this.textManage.updateText(this.element.data.topic);
        this.textManage.updateRectangle();
    }

    trackBy = (index: number, node: MindNode) => {
        return node.origin.id;
    };

    destroy(): void {
        super.destroy();
        this.nodeEmojisGenerator.destroy();
        this.imageGenerator.destroy();
        this.activeGenerator.destroy();
        if (ELEMENT_TO_NODE.get(this.element) === this.node) {
            ELEMENT_TO_NODE.delete(this.element);
        }
        this.destroyTextManages();
    }
}
