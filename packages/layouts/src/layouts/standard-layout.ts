import { OriginNode, LayoutOptions, LayoutType } from '../types';
import { BaseLayout } from './base-layout';

export class StandardLayout extends BaseLayout {
    layout(rootNode: OriginNode, options: LayoutOptions) {
        const isHorizontal = true;
        const primaryNodeCount = rootNode.children.length;
        const rightNodeCount = Math.round(primaryNodeCount / 2);
        const rightPrimaryNodes = [];
        const leftPrimaryNodes = [];
        const fakeRootNode = { ...rootNode };
        for (let i = 0; i < primaryNodeCount; i++) {
            const child = rootNode.children[i];
            if (i < rightNodeCount) {
                rightPrimaryNodes.push(child);
            } else {
                leftPrimaryNodes.push(child);
            }
        }
        // right
        fakeRootNode.children = rightPrimaryNodes;
        const rightRoot = this.baseLayout(fakeRootNode, LayoutType.logic, options, true);
        fakeRootNode.children = leftPrimaryNodes;
        const leftRoot = this.baseLayout(fakeRootNode, LayoutType.logic, options, true);
        leftRoot.right2left();
        rightRoot.translate(leftRoot.x - rightRoot.x, leftRoot.y - rightRoot.y);
        leftRoot.children.forEach(leftPrimaryNode => {
            rightRoot.children.push(leftPrimaryNode);
            leftPrimaryNode.parent = rightRoot;
        });
        rightRoot.x = leftRoot.x;
        rightRoot.origin = rootNode;
        return rightRoot;
    }
}
