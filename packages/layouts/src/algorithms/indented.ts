import { LayoutNode } from '../interfaces/node';
import { LayoutOptions, MindmapLayoutType } from '../types';
import { isIndentedLayout } from '../utils/layout';

function indentMainAxle(node: LayoutNode, d = 0) {
    node.x = d;
    node.children.forEach(child => {
        indentMainAxle(child, node.x + node.width / 2);
    });
}

function seperateSecondaryAxle(root: LayoutNode, options: LayoutOptions) {
    let previousBottom = root.y + root.height;
    let previousNode: null | LayoutNode = null;
    updateY(root);
    function updateY(node: LayoutNode) {
        node.children.forEach(child => {
            let y = previousBottom + child.vGap;
            if (
                previousNode &&
                (isIndentedLayout(previousNode.layout) || previousNode.layout === MindmapLayoutType.downward) &&
                previousNode.origin.children.length > 0
            ) {
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

export const indetnedLayout = { indentMainAxle, seperateSecondaryAxle };
