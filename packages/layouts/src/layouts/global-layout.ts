import { AbstractNode, LayoutOptions, LayoutType, MindLayoutType, OriginNode } from '../interfaces/mind';
import { isHorizontalLayout, isIndentedLayout, isLeftLayout, isStandardLayout, isTopLayout } from '../utils/layout';
import { BaseLayout } from './base-layout';

export class GlobalLayout {
    static layout(root: OriginNode, options: LayoutOptions, mindmapLayoutType: MindLayoutType) {
        const baseLayout = new BaseLayout();

        if (isStandardLayout(mindmapLayoutType)) {
            const primaryNodeCount = root.children.length;
            const rightBranchNodes = [];
            const leftBranchNodes = [];
            const fakeRootNode = { ...root };
            for (let i = 0; i < primaryNodeCount; i++) {
                const child = root.children[i];

                if (AbstractNode.isAbstract(child) && child.end < root.rightNodeCount) {
                    rightBranchNodes.push(child);
                    continue;
                }
                if (AbstractNode.isAbstract(child) && child.start >= root.rightNodeCount) {
                    leftBranchNodes.push(child);
                    continue;
                }

                if (i < root.rightNodeCount) {
                    rightBranchNodes.push(child);
                } else {
                    leftBranchNodes.push(child);
                }
            }
            // right
            fakeRootNode.children = rightBranchNodes;
            const rightRoot = baseLayout.layout(
                fakeRootNode,
                LayoutType.logic,
                options,
                { toLeft: false, toTop: false, rootLayoutType: mindmapLayoutType },
                true
            );
            fakeRootNode.children = leftBranchNodes;
            const leftRoot = baseLayout.layout(
                fakeRootNode,
                LayoutType.logic,
                options,
                { toLeft: true, toTop: false, rootLayoutType: mindmapLayoutType },
                true
            );
            leftRoot.right2left();
            rightRoot.translate(leftRoot.x - rightRoot.x, leftRoot.y - rightRoot.y);

            const rightAbstractArray = rightRoot.children.filter(child => AbstractNode.isAbstract(child.origin));
            rightRoot.children = rightRoot.children.filter(child => !AbstractNode.isAbstract(child.origin));

            leftRoot.children.forEach(leftPrimaryNode => {
                rightRoot.children.push(leftPrimaryNode);
                leftPrimaryNode.parent = rightRoot;
            });
            rightRoot.children = rightRoot.children.concat(rightAbstractArray);

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
