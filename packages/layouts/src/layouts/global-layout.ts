import { LayoutOptions, LayoutType, MindmapLayoutType, OriginNode } from '../types';
import { isHorizontalLayout, isIndentedLayout, isLeftLayout, isLogicLayout, isStandardLayout, isTopLayout } from '../utils/layout';
import { BaseLayout } from './base-layout';

export class GlobalLayout {
    static layout(root: OriginNode, options: LayoutOptions, mindmapLayoutType: MindmapLayoutType) {
        const baseLayout = new BaseLayout();

        if (isStandardLayout(mindmapLayoutType)) {
            const primaryNodeCount = root.children.length;
            const rightPrimaryNodes = [];
            const leftPrimaryNodes = [];
            const fakeRootNode = { ...root };
            for (let i = 0; i < primaryNodeCount; i++) {
                const child = root.children[i];
                if (i < root.rightNodeCount) {
                    rightPrimaryNodes.push(child);
                } else {
                    leftPrimaryNodes.push(child);
                }
            }
            // right
            fakeRootNode.children = rightPrimaryNodes;
            const rightRoot = baseLayout.layout(
                fakeRootNode,
                LayoutType.logic,
                options,
                { toLeft: false, toTop: false, rootLayoutType: mindmapLayoutType },
                true
            );
            fakeRootNode.children = leftPrimaryNodes;
            const leftRoot = baseLayout.layout(
                fakeRootNode,
                LayoutType.logic,
                options,
                { toLeft: true, toTop: false, rootLayoutType: mindmapLayoutType },
                true
            );
            leftRoot.right2left();
            rightRoot.translate(leftRoot.x - rightRoot.x, leftRoot.y - rightRoot.y);
            leftRoot.children.forEach(leftPrimaryNode => {
                rightRoot.children.push(leftPrimaryNode);
                leftPrimaryNode.parent = rightRoot;
            });
            rightRoot.x = leftRoot.x;
            rightRoot.origin = root;
            return rightRoot;
        }

        const isIndented = isIndentedLayout(mindmapLayoutType);
        // const isLogic = isLogicLayout(mindmapLayoutType);
        const layoutType = isIndented ? LayoutType.indented : LayoutType.logic;
        const isHorizontal = isIndented ? true : isHorizontalLayout(mindmapLayoutType);
        const toTop = isTopLayout(mindmapLayoutType);
        const toLeft = isLeftLayout(mindmapLayoutType);
        const resultRoot = baseLayout.layout(root, layoutType, options, { toTop, toLeft, rootLayoutType: mindmapLayoutType }, isHorizontal);
        if (toTop) {
            resultRoot.down2up();
        }
        if (toLeft) {
            resultRoot.right2left();
        }
        return resultRoot;
    }
}
