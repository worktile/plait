import { OriginNode, LayoutOptions } from "../types";
import { BaseLayout } from "./layout";

export class RightLayout extends BaseLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        return this.treeLayout(treeData, options, true);
    }
}
