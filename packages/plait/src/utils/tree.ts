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

export interface TreeNode {
    children?: TreeNode[];
}
