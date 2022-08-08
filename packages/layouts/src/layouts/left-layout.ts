import { OriginNode, LayoutOptions } from '../types';
import { BaseLayout } from './layout';

export class LeftLayout extends BaseLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        const root = this.treeLayout(treeData, options, true);
        root.right2left();
        return root;
    }
}
