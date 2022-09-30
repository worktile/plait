import { isStandardLayout } from '@plait/layouts';
import { DetectResult, MindmapElement } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import { getCorrectLayoutByElement } from './layout';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';

/* 根据布局调整 target 以及 direction */
export const readjustmentDropTarget = (dropTarget: {
    target: MindmapElement;
    detectResult: DetectResult;
}): { target: MindmapElement; detectResult: DetectResult; targetIndex: number } => {
    if (dropTarget.detectResult && ['right', 'left'].includes(dropTarget.detectResult)) {
        const { target, detectResult } = dropTarget;
        const newDropTarget = { target, detectResult, targetIndex: -1 };
        const targetComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(target) as MindmapNodeComponent;
        if (targetComponent.node.children.length > 0) {
            // 当有子节点是，目标节点是 root 时，默认插入最后一个子节点的下方
            const lastChildNodeIndex = targetComponent.node.children.length - 1;
            newDropTarget.target = targetComponent.node.children[lastChildNodeIndex].origin;
            newDropTarget.targetIndex = lastChildNodeIndex;
            newDropTarget.detectResult = 'bottom';

            const layout = getCorrectLayoutByElement(targetComponent.node.origin);
            // 标准布局，根节点
            if (targetComponent.node.origin.isRoot && isStandardLayout(layout)) {
                const rightNodeCount = targetComponent.node.origin.rightNodeCount as number;
                if (detectResult === 'left') {
                    // 作为左的第一个节点
                    if (targetComponent.node.children.length === rightNodeCount) {
                        newDropTarget.target = target;
                        newDropTarget.detectResult = 'left';
                        return newDropTarget;
                    }
                }
                if (detectResult === 'right') {
                    // 作为右的第一个节点或最后一个节点
                    if (rightNodeCount === 0) {
                        newDropTarget.target = target;
                        newDropTarget.detectResult = 'right';
                        return newDropTarget;
                    } else {
                        newDropTarget.target = targetComponent.node.children[rightNodeCount - 1].origin;
                        return newDropTarget;
                    }

                }
            }
        }
        return newDropTarget;
    } else {
        return dropTarget as any;
    }
};
