export function depthFirstRecursion<T extends TreeNode = TreeNode>(node: T, callback: (node: T) => void, recursion?: (node: T) => boolean) {
    if (!recursion || recursion(node)) {
        node.children?.forEach(child => {
            depthFirstRecursion(child as T, callback, recursion);
        });
    }
    callback(node);
}

export interface TreeNode {
    children?: TreeNode[];
}
