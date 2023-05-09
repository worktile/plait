import { isStandardLayout, isIndentedLayout, isVerticalLogicLayout, isTopLayout, MindLayoutType } from '@plait/layouts';
import { DetectResult, MindElement } from '../interfaces';
import { MindNodeComponent } from '../node.component';
import { MIND_ELEMENT_TO_COMPONENT } from './weak-maps';
import { MindQueries } from '../queries';
import { isMixedLayout } from './layout';

/* 根据布局调整 target 以及 direction */
export const readjustmentDropTarget = (dropTarget: {
    target: MindElement;
    detectResult: DetectResult;
}): { target: MindElement; detectResult: DetectResult } => {
    const { target, detectResult } = dropTarget;
    const newDropTarget = { target, detectResult };
    const targetComponent = MIND_ELEMENT_TO_COMPONENT.get(target) as MindNodeComponent;
    if (targetComponent.node.children.length > 0 && dropTarget.detectResult) {
        const layout = MindQueries.getCorrectLayoutByElement(targetComponent.node.origin);
        const parentLayout = MindQueries.getCorrectLayoutByElement(
            targetComponent.node.origin.isRoot ? targetComponent.node.origin : targetComponent.node.parent.origin
        );
        if (['right', 'left'].includes(dropTarget.detectResult)) {
            if (!isMixedLayout(parentLayout, layout)) {
                if (targetComponent.node.origin.isRoot) {
                    const layout = MindQueries.getCorrectLayoutByElement(targetComponent.node.origin);
                    // 标准布局，根节点
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
                    }
                }

                // 缩进布局探测到第一个子节点
                if (isIndentedLayout(parentLayout)) {
                    newDropTarget.target = targetComponent.node.children[0].origin;
                    newDropTarget.detectResult = isTopLayout(parentLayout) ? 'bottom' : 'top';
                    return newDropTarget;
                }
                // 上下布局的根节点只可以探测到上或者下，子节点的左右探测不处理，跳过。
                if (isVerticalLogicLayout(parentLayout)) {
                    return newDropTarget;
                }
                // 剩下是水平布局的默认情况：插入最后一个子节点的下方
                const lastChildNodeIndex = targetComponent.node.children.length - 1;
                newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
                newDropTarget.detectResult = 'bottom';
            } else {
                // 处理左右布局下的混合布局
                if ([MindLayoutType.left, MindLayoutType.right].includes(parentLayout)) {
                    const layout = MindQueries.getCorrectLayoutByElement(targetComponent.node.origin);
                    if (isIndentedLayout(layout)) {
                        newDropTarget.target = targetComponent.node.children[0].origin;
                        newDropTarget.detectResult = isTopLayout(layout) ? 'bottom' : 'top';
                        return newDropTarget;
                    }
                }
            }
        }
        if (['top', 'bottom'].includes(dropTarget.detectResult)) {
            // 缩进布局移动至第一个节点
            if (targetComponent.node.origin.isRoot && isIndentedLayout(layout)) {
                newDropTarget.target = targetComponent.node.children[0].origin;
                newDropTarget.detectResult = isTopLayout(layout) ? 'bottom' : 'top';
                return newDropTarget;
            }
            // 上下布局，插到右边
            const parentLayout = MindQueries.getCorrectLayoutByElement(
                targetComponent.node.origin.isRoot ? targetComponent.node.origin : targetComponent.node.parent.origin
            );
            if (isVerticalLogicLayout(parentLayout)) {
                const lastChildNodeIndex = targetComponent.node.children.length - 1;
                newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
                newDropTarget.detectResult = 'right';
                return newDropTarget;
            }
        }
        return newDropTarget;
    }
    return dropTarget;
};
