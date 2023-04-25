import { layout } from '../algorithms/non-overlapping-tree-layout';
import { LayoutBlockNode, LayoutNode } from '../interfaces/layout-node';
import { AbstractNode, LayoutContext, LayoutOptions, LayoutType, MindmapLayoutType, OriginNode } from '../interfaces/mindmap';
import { extractLayoutType, isHorizontalLayout, isLeftLayout, isTopLayout } from '../utils/layout';
import * as indent from './indent';
import * as logic from './logic';

export class BaseLayout {
    constructor() {}

    layout(
        node: OriginNode,
        layoutType: string,
        options: LayoutOptions,
        context: LayoutContext,
        isHorizontal = false,
        parent?: LayoutNode
    ) {
        // build layout node
        const isolatedNodes: LayoutNode[] = [];
        const isolatedLayoutRoots: LayoutNode[] = [];

        // 1、build layout node
        const root = this.buildLayoutNode(node, options, context, isolatedNodes, parent);

        // 2、handle sub node layout
        isolatedNodes
            .filter(v => v.origin.children.length > 0)
            .forEach((isolatedNode: LayoutNode) => {
                const _mindmapLayoutType = isolatedNode.layout as MindmapLayoutType;
                const toTop = context.toTop || (isHorizontalLayout(context.rootLayoutType) && isTopLayout(_mindmapLayoutType));
                const toLeft = context.toLeft || (!isHorizontalLayout(context.rootLayoutType) && isLeftLayout(_mindmapLayoutType));
                const _isHorizontal = isHorizontalLayout(_mindmapLayoutType);
                const isolatedRoot = this.layout(
                    isolatedNode.origin,
                    extractLayoutType(_mindmapLayoutType),
                    options,
                    { toTop, toLeft, rootLayoutType: context.rootLayoutType },
                    _isHorizontal,
                    isolatedNode.parent
                );
                if (!context.toTop && toTop && layoutType !== LayoutType.indented) {
                    isolatedRoot.down2up();
                }
                if (!context.toLeft && toLeft) {
                    isolatedRoot.right2left();
                }
                // 3、set sub node as black box
                const boundingBox = isolatedRoot.getBoundingBox();
                isolatedNode.width = boundingBox.width;
                isolatedNode.height = boundingBox.height;
                isolatedNode.blackNode = new LayoutBlockNode(
                    boundingBox.left,
                    boundingBox.right,
                    boundingBox.top,
                    boundingBox.bottom,
                    boundingBox.width,
                    boundingBox.height,
                    isolatedRoot.x,
                    isolatedRoot.y,
                    isolatedRoot.width,
                    isolatedRoot.height
                );

                isolatedLayoutRoots.push(isolatedRoot);
            });

        // 4、layout handle
        switch (layoutType) {
            case LayoutType.indented:
                indent.separateXAxle(root);
                indent.separateYAxle(root, options);
                break;
            case LayoutType.fishBone:
                break;
            case LayoutType.logic:
            default:
                logic.separateYAxle(root, isHorizontal);
                const layoutTree = logic.buildLayoutTree(root, isHorizontal);
                layout(layoutTree);
                logic.setLayoutTreeResult(layoutTree, root, isHorizontal);
                break;
        }

        // 5、apply isolated nodes to root
        const attachedMetaOfIsolatedNodes: { parent: LayoutNode; offsetX: number; offsetY: number }[] = []; // store the offset caused by isolated nodes to avoid multiple offset accumulation
        isolatedNodes
            .filter(v => v.origin.children.length > 0)
            .forEach((isolatedNode: LayoutNode, index) => {
                if (isolatedNode.parent) {
                    const layoutRoot = isolatedLayoutRoots[index];
                    layoutRoot.parent = isolatedNode.parent;
                    let offsetX, offsetY;
                    const parentNodeIsHorizontalLayout = isHorizontalLayout(isolatedNode.parent.layout);
                    // the cross direction does not need to be transformed
                    if (parentNodeIsHorizontalLayout) {
                        offsetX = layoutRoot.x;
                        offsetY = 0;
                    } else {
                        offsetX = 0;
                        offsetY = layoutRoot.y;
                    }
                    layoutRoot.translate(isolatedNode.x - offsetX, isolatedNode.y - offsetY);
                    const _index = isolatedNode.parent.children.indexOf(isolatedNode);
                    const oldNode = isolatedNode.parent.children[_index];
                    isolatedNode.parent.children[_index] = Object.assign(oldNode, layoutRoot);
                    const meta = attachedMetaOfIsolatedNodes.find(
                        m => m.parent === isolatedNode.parent && !AbstractNode.isAbstract(isolatedNode.origin)
                    );
                    if (meta) {
                        if (meta.offsetX < offsetX) {
                            meta.offsetX = offsetX;
                        }
                        if (meta.offsetX < offsetY) {
                            meta.offsetX = offsetY;
                        }
                    } else if (!AbstractNode.isAbstract(isolatedNode.origin)) {
                        attachedMetaOfIsolatedNodes.push({ parent: isolatedNode.parent, offsetX, offsetY });
                    }
                }
            });
        // 6、correct the offset of sibling nodes caused by sub-layout
        attachedMetaOfIsolatedNodes.forEach(meta => {
            meta.parent.children.forEach(child => child.translate(meta.offsetX, meta.offsetY));
        });

        return root;
    }

    private buildLayoutNode(
        origin: OriginNode,
        options: LayoutOptions,
        context: LayoutContext,
        isolatedNodes: LayoutNode[],
        parent?: LayoutNode
    ) {
        const root = new LayoutNode(origin, options, context, parent);
        if (!root.origin.isCollapsed) {
            const nodes: LayoutNode[] = [root];
            let node: LayoutNode | undefined;
            while ((node = nodes.pop())) {
                if (!node.origin.isCollapsed) {
                    const children = node.origin.children;
                    const length = children ? children.length : 0;
                    node.children = [];
                    if (children && length) {
                        for (let i = 0; i < length; i++) {
                            const child = new LayoutNode(children[i], options, context, node);
                            node.children.push(child);
                            child.depth = node.depth + 1;
                            const isolated =
                                (node.layout !== child.layout &&
                                    (extractLayoutType(node.layout) !== extractLayoutType(child.layout) ||
                                        isHorizontalLayout(node.layout) !== isHorizontalLayout(child.layout))) ||
                                AbstractNode.isAbstract(child.origin);
                            if (isolated && !child.origin.isCollapsed) {
                                isolatedNodes.push(child);
                            } else {
                                nodes.push(child);
                            }
                        }
                    }
                }
            }
        }
        return root;
    }
}
