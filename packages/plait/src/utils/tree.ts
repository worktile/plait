export function depthFirstRecursion<T extends TreeNode = TreeNode>(node: T, callback: (node: T) => void) {
    node.children?.forEach(child => {
        depthFirstRecursion(child as T, callback);
    });
    callback(node);
}

export interface TreeNode {
    children?: TreeNode[];
}
