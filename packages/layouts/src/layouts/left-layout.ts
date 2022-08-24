import { OriginNode, LayoutOptions, LayoutType } from '../types';
import { BaseLayout } from './base-layout';

export class LeftLayout extends BaseLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        const root = this.baseLayout(treeData, LayoutType.logic, options, true);
        root.right2left();
        return root;
    }
}
