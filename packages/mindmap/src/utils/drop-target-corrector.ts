import { isStandardLayout, isIndentedLayout, isHorizontalLayout, isVerticalLayout } from '@plait/layouts';
import { DetectResult, MindmapElement } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import { getCorrectLayoutByElement } from './layout';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';

/* 根据布局调整 target 以及 direction */
export const readjustmentDropTarget = (dropTarget: {
    target: MindmapElement;
    detectResult: DetectResult;
}): { target: MindmapElement; detectResult: DetectResult } => {
    const { target, detectResult } = dropTarget;
    console.log('原始的target', target.value.children[0], detectResult);
    const newDropTarget = { target, detectResult };
    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(target) as MindmapNodeComponent;
    const layout = getCorrectLayoutByElement(targetComponent.node.origin);
    if (targetComponent.node.children.length > 0 && dropTarget.detectResult) {
        if (['right', 'left'].includes(dropTarget.detectResult)) {
            // 标准布局，根节点
            if (targetComponent.node.origin.isRoot) {
                if (isStandardLayout(layout)) {
                    const rightNodeCount = targetComponent.node.origin.rightNodeCount as number;
                    if (detectResult === 'left') {
                        // 作为左的第一个节点
                        if (targetComponent.node.children.length === rightNodeCount) {
                            return newDropTarget;
                        }
                    } else {
                        // 作为右的第一个节点或最后一个节点
                        if (rightNodeCount === 0) {
                            newDropTarget.target = target;
                        } else {
                            newDropTarget.target = targetComponent.node.children[rightNodeCount - 1].origin;
                            newDropTarget.detectResult = 'bottom';
                        }
                        return newDropTarget;
                    }
                    // 当有子节点是，目标节点是 root 时，默认插入最后一个子节点的下方
                    const lastChildNodeIndex = targetComponent.node.children.length - 1;
                    newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
                    if (isHorizontalLayout(layout)) {
                        newDropTarget.detectResult = 'bottom';
                    }
                    if (isVerticalLayout(layout)) {
                        newDropTarget.detectResult = 'right';
                    }
                }
            }
        }
        if (['top', 'bottom'].includes(dropTarget.detectResult)) {
            if (targetComponent.node.children.length > 0 && dropTarget.detectResult) {
                // 缩进布局移动至第一个节点
                if (targetComponent.node.origin.isRoot) {
                    if (isIndentedLayout(layout)) {
                        newDropTarget.target = targetComponent.node.children[0].origin;
                        newDropTarget.detectResult = dropTarget.detectResult === 'top' ? 'bottom' : 'top';
                        return newDropTarget;
                    }
                }
                // 当有子节点是，目标节点是 root 时，默认插入最后一个子节点的下方
                const lastChildNodeIndex = targetComponent.node.children.length - 1;
                newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
                if (isHorizontalLayout(layout)) {
                    newDropTarget.detectResult = 'bottom';
                }
                if (isVerticalLayout(layout)) {
                    newDropTarget.detectResult = 'right';
                }
                return newDropTarget;
            }
        }
        return newDropTarget;
    }
    return dropTarget;
};
