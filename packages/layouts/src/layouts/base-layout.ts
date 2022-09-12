import { layout } from '../algorithms/non-overlapping-tree-layout';
import { LayoutNode } from '../interfaces/node';
import { buildLayoutTree, LayoutTree } from '../interfaces/tree';
import { LayoutContext, LayoutOptions, LayoutType, MindmapLayoutType, OriginNode } from '../types';
import { extractLayoutType, isHorizontalLayout, isLeftLayout, isTopLayout } from '../utils/layout';

export class BaseLayout {
    constructor() {}

    layout(node: OriginNode, layoutType: string, options: LayoutOptions, context: LayoutContext, isHorizontal = false) {
        // build layout node
        const isolatedNodes: LayoutNode[] = [];
        const isolatedLayoutRoots: LayoutNode[] = [];

        // 1、build layout node
        const root = this.buildLayoutNode(node, options, isolatedNodes);

        // 2、handle sub node layout
        isolatedNodes.forEach((isolatedNode: LayoutNode) => {
            const _mindmapLayoutType = isolatedNode.layout as MindmapLayoutType;
            const toTop = context.toTop || (context.isHorizontal && isTopLayout(_mindmapLayoutType));
            const toLeft = context.toLeft || (!context.isHorizontal && isLeftLayout(_mindmapLayoutType));
            const _isHorizontal = isHorizontalLayout(_mindmapLayoutType);
            const isolatedRoot = this.layout(
                isolatedNode.origin,
                extractLayoutType(_mindmapLayoutType),
                options,
                { toTop, toLeft, isHorizontal: context.isHorizontal },
                _isHorizontal
            );
            const { width, height } = isolatedRoot.getBoundingBox();
            if (!context.toTop && toTop) {
                isolatedRoot.down2up();
            }
            if (!context.toLeft && toLeft) {
                isolatedRoot.right2left();
            }
            // 3、set sub node as black box
            isolatedNode.width = width;
            isolatedNode.height = height;

            isolatedLayoutRoots.push(isolatedRoot);
        });

        // 4、layout handle
        switch (layoutType) {
            case LayoutType.indented:
                indentMainAxle(root);
                seperateSecondaryAxle(root);
                break;
            case LayoutType.fishBone:
                break;
            case LayoutType.logic:
            default:
                this.seperateMainMxle(root, isHorizontal);
                const layoutTree = buildLayoutTree(root, isHorizontal);
                layout(layoutTree);
                setLayoutTreeResult(layoutTree, root, isHorizontal);
                break;
        }

        // 5、apply isolated nodes to root
        isolatedNodes.forEach((isolatedNode: LayoutNode, index) => {
            const layoutRoot = isolatedLayoutRoots[index];
            layoutRoot.parent = isolatedNode.parent;
            layoutRoot.translate(isolatedNode.x, isolatedNode.y);
            if (isolatedNode.parent) {
                const index = isolatedNode.parent.children.indexOf(isolatedNode);
                const oldNode = isolatedNode.parent.children[index];
                const offsetX = layoutRoot.x - oldNode.x;
                const offsetY = layoutRoot.y - oldNode.y;
                isolatedNode.parent.children.forEach(child => child.translate(offsetX, offsetY));
                isolatedNode.parent.children[index] = Object.assign(oldNode, layoutRoot);
            }
        });

        return root;
    }

    private seperateMainMxle(node: LayoutNode, isHorizontal: boolean, d = 0) {
        if (isHorizontal) {
            node.x = d;
            d += node.width;
        } else {
            node.y = d;
            d += node.height;
        }
        node.children.forEach(child => {
            this.seperateMainMxle(child, isHorizontal, d);
        });
    }

    private buildLayoutNode(node: OriginNode, options: LayoutOptions, isolatedNodes: LayoutNode[]) {
        const root = new LayoutNode(node, options);
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
                            const child = new LayoutNode(children[i], options, node);
                            node.children.push(child);
                            child.depth = node.depth + 1;
                            const isolated = node.layout !== child.layout;
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

function seperateSecondaryAxle(root: LayoutNode) {
    let previousBottom = root.y + root.height - root.vGap;
    updateY(root);
    function updateY(node: LayoutNode) {
        node.children.forEach(child => {
            child.y = previousBottom;
            previousBottom = child.y + child.height - child.vGap;
            updateY(child);
        });
    }
}

function setLayoutTreeResult(tree: LayoutTree, root: LayoutNode, isHorizontal: Boolean) {
    if (isHorizontal) {
        root.y = tree.x;
    } else {
        root.x = tree.x;
    }
    tree.children.forEach((child, i) => {
        setLayoutTreeResult(child, root.children[i], isHorizontal);
    });
}
