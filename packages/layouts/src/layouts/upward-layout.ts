import { OriginNode, LayoutOptions, LayoutType } from '../types';
import { BaseLayout } from './base-layout';

export class UpwardLayout extends BaseLayout {
    layout(root: OriginNode, options: LayoutOptions) {
        const layout = this.baseLayout(root, LayoutType.logic, options);
        layout.down2up();
        return layout;
    }
}
