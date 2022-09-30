import { isStandardLayout } from '@plait/layouts';
import { DetectResult, MindmapElement } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import { getCorrectLayoutByElement } from './layout';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';

/* 根据布局调整 target 以及 direction */
export const readjustmentDropTarget = (dropTarget: {
    target: MindmapElement;
    detectResult: DetectResult;
}): { target: MindmapElement; detectResult: DetectResult } => {
    if (dropTarget.detectResult && ['right', 'left'].includes(dropTarget.detectResult)) {
        const { target, detectResult } = dropTarget;
        const newDropTarget = { target, detectResult };
        const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(target) as MindmapNodeComponent;
        if (targetComponent.node.children.length > 0) {
            const layout = getCorrectLayoutByElement(targetComponent.node.origin);
            // 标准布局，根节点
            if (targetComponent.node.origin.isRoot && isStandardLayout(layout)) {
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
            // 当有子节点是，目标节点是 root 时，默认插入最后一个子节点的下方
            const lastChildNodeIndex = targetComponent.node.children.length - 1;
            newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
            newDropTarget.detectResult = 'bottom';
        }
        return newDropTarget;
    }
    return dropTarget;
};
