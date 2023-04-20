import { LayoutNode } from '../interfaces/layout-node';
import { LayoutOptions } from '../types';
import { isHorizontalLogicLayout } from '../utils/layout';

export function separateXAxle(node: LayoutNode, d = 0) {
    node.x = d;
    node.children.forEach(child => {
        separateXAxle(child, node.x + node.width / 2);
    });
}

export function separateYAxle(root: LayoutNode, options: LayoutOptions) {
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
