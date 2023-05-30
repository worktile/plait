import { Path, PlaitBoard, PlaitNode } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { getRootLayout } from '../layout';
import { MindLayoutType } from '@plait/layouts';

export const isInRightBranchOfStandardLayout = (selectedElement: MindElement) => {
    const parentElement = MindElement.findParent(selectedElement);
    if (parentElement) {
        const nodeIndex: number = parentElement.children.findIndex(item => item.id === selectedElement.id);
        if (
            parentElement.isRoot &&
            getRootLayout(parentElement) === MindLayoutType.standard &&
            parentElement.rightNodeCount &&
            nodeIndex <= parentElement.rightNodeCount - 1
        ) {
            return true;
        }
    }
    return false;
};

export interface RightNodeCountRef {
    path: Path;
    rightNodeCount: number;
}

export const insertElementHandleRightNodeCount = (
    board: PlaitBoard,
    path: Path,
    number: number,
    effectedRightNodeCount: RightNodeCountRef[] = []
) => {
    let index = effectedRightNodeCount.findIndex(ref => Path.equals(ref.path, path));
    const mind = PlaitNode.get(board, path) as MindElement;
    if (index === -1) {
        effectedRightNodeCount.push({ path, rightNodeCount: mind.rightNodeCount! + number });
    } else {
        effectedRightNodeCount[index].rightNodeCount += number;
    }
    return effectedRightNodeCount;
};

export const deleteElementsHandleRightNodeCount = (
    board: PlaitBoard,
    deletableElements: MindElement[],
    effectedRightNodeCount: RightNodeCountRef[] = []
) => {
    deletableElements.forEach(element => {
        if (isInRightBranchOfStandardLayout(element)) {
            const mind = MindElement.getParent(element);
            const path = PlaitBoard.findPath(board, mind);
            let index = effectedRightNodeCount.findIndex(ref => Path.equals(ref.path, path));
            if (index === -1) {
                effectedRightNodeCount.push({ path, rightNodeCount: mind.rightNodeCount! - 1 });
            } else {
                effectedRightNodeCount[index].rightNodeCount -= 1;
            }
        }
    });
    return effectedRightNodeCount;
};
