import { OriginNode, LayoutOptions } from '../types';
import { BaseMindLayout } from './base-mind';

export class LeftLayout extends BaseMindLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        const root = this.treeLayout(treeData, options, true);
        root.right2left();
        return root;
    }
}
