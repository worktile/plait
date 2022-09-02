import { LayoutOptions, LayoutType, MindmapLayoutType, OriginNode } from '../types';
import { isHorizontalLayout, isIndentedLayout, isLogicLayout, isStandardLayout } from '../utils/layout';
import { BaseLayout } from './base-layout';

export class GlobalLayout {
    static layout(root: OriginNode, options: LayoutOptions, layoutType: MindmapLayoutType) {
        const baseLayout = new BaseLayout();

        if (isIndentedLayout(layoutType)) {
            return baseLayout.layout(root, LayoutType.indented, options, true);
        }

        if (isLogicLayout(layoutType)) {
            const isHorizontal = isHorizontalLayout(layoutType);
            const resultRoot = baseLayout.layout(root, LayoutType.logic, options, isHorizontal);
            if (layoutType === MindmapLayoutType.left) {
                resultRoot.right2left();
                return resultRoot;
            }
            if (layoutType === MindmapLayoutType.upward) {
                resultRoot.down2up();
                return resultRoot;
            }
            return resultRoot;
        }

        if (isStandardLayout(layoutType)) {
            const primaryNodeCount = root.children.length;
            const rightNodeCount = Math.round(primaryNodeCount / 2);
            const rightPrimaryNodes = [];
            const leftPrimaryNodes = [];
            const fakeRootNode = { ...root };
            for (let i = 0; i < primaryNodeCount; i++) {
                const child = root.children[i];
                if (i < rightNodeCount) {
                    rightPrimaryNodes.push(child);
                } else {
                    leftPrimaryNodes.push(child);
                }
            }
            // right
            fakeRootNode.children = rightPrimaryNodes;
            const rightRoot = baseLayout.layout(fakeRootNode, LayoutType.logic, options, true);
            fakeRootNode.children = leftPrimaryNodes;
            const leftRoot = baseLayout.layout(fakeRootNode, LayoutType.logic, options, true);
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

        // 默认逻辑右布局
        return baseLayout.layout(root, LayoutType.logic, options, true);
    }
}
