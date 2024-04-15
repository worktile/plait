import { PlaitBoard } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';

export function depthFirstRecursion<T extends TreeNode = TreeNode>(
    node: T,
    callback: (node: T) => void,
    recursion?: (node: T) => boolean,
    isReverse?: boolean
) {
    if (!recursion || recursion(node)) {
        let children: TreeNode[] = [];
        if (node.children) {
            children = [...node.children];
        }
        children = isReverse ? children.reverse() : children;
        children.forEach(child => {
            depthFirstRecursion(child as T, callback, recursion);
        });
    }
    callback(node);
}

export const getIsRecursionFunc = (board: PlaitBoard) => {
    return (element: PlaitElement | PlaitBoard) => {
        if (PlaitBoard.isBoard(element) || board.isRecursion(element)) {
            return true;
        } else {
            return false;
        }
    };
};

export interface TreeNode {
    children?: TreeNode[];
}
