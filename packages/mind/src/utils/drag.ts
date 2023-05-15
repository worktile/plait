import { Path, PlaitBoard, PlaitElement, Transforms, ELEMENT_TO_COMPONENT } from '@plait/core';
import {
    isBottomLayout,
    isHorizontalLogicLayout,
    isIndentedLayout,
    isLeftLayout,
    isRightLayout,
    isTopLayout,
    isVerticalLogicLayout,
    MindLayoutType
} from '@plait/layouts';
import { MindElement, PlaitMind } from '../interfaces/element';
import { DetectResult } from '../interfaces/node';
import { MindNodeComponent } from '../node.component';
import { findUpElement, getBehindAbstracts, getCorrespondingAbstract, isChildElement } from '../utils';
import { PlaitMindComponent } from '../mind.component';

export const isValidTarget = (origin: MindElement, target: MindElement) => {
    return origin !== target && !isChildElement(origin, target);
};

export const addActiveOnDragOrigin = (activeElement: MindElement, isOrigin = true) => {
    const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
    if (isOrigin) {
        activeComponent.g.classList.add('dragging-origin');
    } else {
        activeComponent.g.classList.add('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            addActiveOnDragOrigin(child, false);
        });
};

export const removeActiveOnDragOrigin = (activeElement: MindElement, isOrigin = true) => {
    const activeComponent = PlaitElement.getComponent(activeElement) as MindNodeComponent;
    if (isOrigin) {
        activeComponent.g.classList.remove('dragging-origin');
    } else {
        activeComponent.g.classList.remove('dragging-child');
    }
    !activeElement.isCollapsed &&
        activeElement.children.forEach(child => {
            removeActiveOnDragOrigin(child, false);
        });
};

export const updatePathByLayoutAndDropTarget = (
    targetPath: Path,
    layout: MindLayoutType,
    dropTarget: { target: MindElement; detectResult: DetectResult }
) => {
    // 上下布局：左右是兄弟节点，上下是子节点
    if (isVerticalLogicLayout(layout)) {
        if (isTopLayout(layout) && dropTarget.detectResult === 'top') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (isBottomLayout(layout) && dropTarget.detectResult === 'bottom') {
            targetPath.push(dropTarget.target.children.length);
        }
        // 如果是左，位置不变，右则插入到下一个兄弟节点
        if (dropTarget.detectResult === 'right') {
            targetPath = Path.next(targetPath);
        }
    }
    // 水平布局/标准布局：上下是兄弟节点，左右是子节点
    if (isHorizontalLogicLayout(layout)) {
        if (dropTarget.detectResult === 'right') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (dropTarget.detectResult === 'left') {
            targetPath.push(dropTarget.target.children.length);
        }
        // 如果是上，位置不变，下插入到下一个兄弟节点
        if (dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
    }
    // 缩进布局：上下是兄弟节点，左右是子节点，但上（左上/右上），探测到上是子节点，下则位置不变，反之同理。
    if (isIndentedLayout(layout)) {
        if (isTopLayout(layout) && dropTarget.detectResult === 'top') {
            targetPath = Path.next(targetPath);
        }
        if (isBottomLayout(layout) && dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
        if (isLeftLayout(layout) && dropTarget.detectResult === 'left') {
            targetPath.push(dropTarget.target.children.length);
        }
        if (isRightLayout(layout) && dropTarget.detectResult === 'right') {
            targetPath.push(dropTarget.target.children.length);
        }
    }
    return targetPath;
};

export const updateRightNodeCount = (
    board: PlaitBoard,
    activeComponent: MindNodeComponent,
    targetComponent: MindNodeComponent,
    detectResult: DetectResult
) => {
    let rightNodeCount;
    const mindmapElement = findUpElement(targetComponent.node.origin).root;
    const mindmapComponent = ELEMENT_TO_COMPONENT.get(mindmapElement as PlaitMind) as PlaitMindComponent;
    const activeIndex = mindmapComponent?.root.children.indexOf(activeComponent.node) as number;
    const targetIndex = mindmapComponent?.root.children.indexOf(targetComponent.node) as number;
    const isActiveOnRight = activeIndex !== -1 && activeIndex <= (activeComponent.parent.origin.rightNodeCount as number) - 1;
    const isTargetOnRight =
        targetComponent.parent && targetIndex !== -1 && targetIndex <= (targetComponent.parent.origin.rightNodeCount as number) - 1;
    const isBothOnRight = isActiveOnRight && isTargetOnRight;
    const rootChildCount = mindmapComponent.root.children?.length as number;
    const rootRightNodeCount = mindmapComponent?.root.origin.rightNodeCount as number;

    if (!isBothOnRight) {
        if (isActiveOnRight) {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootChildCount - 1 : rootRightNodeCount - 1;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, activeComponent.parent.origin));
        }

        if (isTargetOnRight && detectResult !== 'right') {
            rightNodeCount = rootChildCount < rootRightNodeCount ? rootRightNodeCount : rootRightNodeCount + 1;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, targetComponent.parent.origin));
        }

        //二级子节点拖动到根节点左侧
        if (targetComponent.node.origin.isRoot && detectResult === 'left' && activeIndex === -1) {
            rightNodeCount = rootChildCount;
            Transforms.setNode(board, { rightNodeCount }, PlaitBoard.findPath(board, targetComponent.element));
        }
    }
};

const IS_DRAGGING = new WeakMap<PlaitBoard, boolean>();

export const isDragging = (board: PlaitBoard) => {
    return !!IS_DRAGGING.get(board);
};

export const setIsDragging = (board: PlaitBoard, state: boolean) => {
    IS_DRAGGING.set(board, state);
};

export const updateAbstractInDnd = (board: PlaitBoard, activeElement: MindElement, target: MindElement, detectResult: DetectResult) => {
    //拖拽节点-删除
    const activeBehindAbstracts = getBehindAbstracts(activeElement);
    const activeCorrespondAbstract = getCorrespondingAbstract(activeElement);
    const accumulativeProperties = new Map<MindElement, { start: number; end: number }>();

    if (activeCorrespondAbstract) {
        const newProperties = { start: activeCorrespondAbstract.start!, end: activeCorrespondAbstract.end! - 1 };
        accumulativeProperties.set(activeCorrespondAbstract, newProperties);
    }

    if (activeBehindAbstracts.length) {
        activeBehindAbstracts.forEach(abstract => {
            const newProperties = { start: abstract.start! - 1, end: abstract.end! - 1 };
            accumulativeProperties.set(abstract, newProperties);
        });
    }

    //拖拽节点-添加
    const targetBehindAbstracts = getBehindAbstracts(target);
    const index = MindElement.getParent(target).children.indexOf(target);
    let targetCorrespondAbstract = getCorrespondingAbstract(target);

    if (targetCorrespondAbstract && targetCorrespondAbstract.start === index && detectResult === 'top') {
        targetBehindAbstracts.push(targetCorrespondAbstract);
    }

    if (targetCorrespondAbstract) {
        let newProperties = accumulativeProperties.get(targetCorrespondAbstract);
        if (!newProperties) {
            newProperties = { start: targetCorrespondAbstract.start!, end: targetCorrespondAbstract.end! };
            accumulativeProperties.set(targetCorrespondAbstract, newProperties);
        }

        if (
            !(targetCorrespondAbstract?.start! === index && detectResult === 'top') &&
            !(targetCorrespondAbstract?.end! === index && detectResult === 'bottom')
        ) {
            newProperties.end = newProperties.end + 1;
        }
    }

    if (targetBehindAbstracts.length) {
        targetBehindAbstracts.forEach(abstract => {
            let newProperties = accumulativeProperties.get(abstract);
            if (!newProperties) {
                newProperties = { start: abstract.start!, end: abstract.end! };
                accumulativeProperties.set(abstract, newProperties);
            }
            newProperties.start = newProperties.start + 1;
            newProperties.end = newProperties.end + 1;
        });
    }

    accumulativeProperties.forEach((property, abstract) => {
        if (property.start > property.end) {
            Transforms.removeNode(board, PlaitBoard.findPath(board, abstract));
        } else {
            Transforms.setNode(board, property, PlaitBoard.findPath(board, abstract));
        }
    });
};
