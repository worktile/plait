import { layout } from '../algorithms/non-overlapping-tree-layout';
import { LayoutBlockNode, LayoutNode } from '../interfaces/layout-node';
import { buildLayoutTree, LayoutTreeNode } from '../interfaces/layout-tree-node';
import { LayoutContext, LayoutOptions, LayoutType, MindmapLayoutType, OriginNode } from '../types';
import { extractLayoutType, isHorizontalLayout, isLeftLayout, isTopLayout, isHorizontalLogicLayout } from '../utils/layout';

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
                indentMainAxle(root);
                separateSecondaryAxle(root, options);
                break;
            case LayoutType.fishBone:
                break;
            case LayoutType.logic:
            default:
                this.separateSecondaryAxle(root, isHorizontal);
                const layoutTree = buildLayoutTree(root, isHorizontal);
                layout(layoutTree);
                setLayoutTreeResult(layoutTree, root, isHorizontal);
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
                    const meta = attachedMetaOfIsolatedNodes.find(m => m.parent === isolatedNode.parent);
                    if (meta) {
                        if (meta.offsetX < offsetX) {
                            meta.offsetX = offsetX;
                        }
                        if (meta.offsetX < offsetY) {
                            meta.offsetX = offsetY;
                        }
                    } else if (!isolatedNode.origin.isAbstract) {
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

    private separateSecondaryAxle(node: LayoutNode, isHorizontal: boolean, d = 0) {
        if (isHorizontal) {
            if (node.origin.isAbstract) {
                for (let i = node.origin.start!; i <= node.origin.end!; i++) {
                    const right = node.parent?.children[i].getBoundingBox().right;
                    d = Math.max(right!, d);
                }
            }
            node.x = d;

            d += node.width;
        } else {
            if (node.origin.isAbstract) {
                for (let i = node.origin.start!; i <= node.origin.end!; i++) {
                    const bottom = node.parent?.children[i].getBoundingBox().bottom;
                    d = Math.max(bottom!, d);
                }
            }
            node.y = d;
            d += node.height;
        }
        node.children.forEach(child => {
            this.separateSecondaryAxle(child, isHorizontal, d);
        });
    }

    private buildLayoutNode(
        origin: OriginNode,
        options: LayoutOptions,
        context: LayoutContext,
        isolatedNodes: (LayoutNode | any)[],
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
                                child.origin.isAbstract;
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

function indentMainAxle(node: LayoutNode, d = 0) {
    node.x = d;
    node.children.forEach(child => {
        indentMainAxle(child, node.x + node.width / 2);
    });
}

function separateSecondaryAxle(root: LayoutNode, options: LayoutOptions) {
    let previousBottom = root.y + root.height;
    let previousNode: null | LayoutNode = null;
    updateY(root);
    function updateY(node: LayoutNode) {
        node.children.forEach(child => {
            let y = previousBottom + child.vGap;
            if (previousNode && !isHorizontalLogicLayout(previousNode.layout) && previousNode.origin.children.length > 0) {
                if (previousNode.origin.isCollapsed) {
                    y = y + options.getExtendHeight(child.origin);
                } else {
                    y = y + options.getIndentedCrossLevelGap();
                }
            }
            child.y = y;
            previousNode = child;
            previousBottom = child.y + child.height;
            updateY(child);
        });
    }
}

function setLayoutTreeResult(tree: LayoutTreeNode, root: LayoutNode, isHorizontal: Boolean) {
    if (isHorizontal) {
        root.y = tree.x;
    } else {
        root.x = tree.x;
    }
    tree.children.forEach((child, i) => {
        setLayoutTreeResult(child, root.children[i], isHorizontal);
    });
}
