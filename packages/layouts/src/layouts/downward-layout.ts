import { OriginNode, LayoutOptions } from "../types";
import { BaseLayout } from "./layout";

export class DownwardLayout extends BaseLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        return this.treeLayout(treeData, options);
    }
}
