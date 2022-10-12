import { isStandardLayout, isIndentedLayout, isVerticalLogicLayout } from '@plait/layouts';
import { DetectResult, MindmapElement } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { MindmapQueries } from '../queries';

/* 根据布局调整 target 以及 direction */
export const readjustmentDropTarget = (dropTarget: {
    target: MindmapElement;
    detectResult: DetectResult;
}): { target: MindmapElement; detectResult: DetectResult } => {
    const { target, detectResult } = dropTarget;
    const newDropTarget = { target, detectResult };
    const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(target) as MindmapNodeComponent;
    const layout = MindmapQueries.getCorrectLayoutByElement(targetComponent.node.origin);
    if (targetComponent.node.children.length > 0 && dropTarget.detectResult) {
        if (['right', 'left'].includes(dropTarget.detectResult)) {
            if (targetComponent.node.origin.isRoot) {
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
            // 上下布局的根节点只可以探测到上或者下，子节点的左右探测不处理，跳过。
            if (isVerticalLogicLayout(layout)) {
                return newDropTarget;
            }
            // 剩下是水平布局的默认情况：插入最后一个子节点的下方
            const lastChildNodeIndex = targetComponent.node.children.length - 1;
            newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
            newDropTarget.detectResult = 'bottom';
        }
        if (['top', 'bottom'].includes(dropTarget.detectResult)) {
            // 缩进布局移动至第一个节点
            if (isIndentedLayout(layout)) {
                newDropTarget.target = targetComponent.node.children[0].origin;
                newDropTarget.detectResult = dropTarget.detectResult === 'top' ? 'bottom' : 'top';
                return newDropTarget;
            }
            // 上下布局，插到右边
            if (isVerticalLogicLayout(layout)) {
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
