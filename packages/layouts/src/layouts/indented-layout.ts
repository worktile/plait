import { LayoutNode } from '../interfaces/node';
import { OriginNode, LayoutOptions, LayoutType } from '../types';
import { BaseLayout } from './base-layout';

export class IndentedLayout extends BaseLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        return this.baseLayout(treeData, LayoutType.indented, options, true);
    }
}