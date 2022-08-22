import { OriginNode, LayoutOptions } from "../types";
import { BaseMindLayout } from "./base-mind";

export class DownwardLayout extends BaseMindLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        return this.treeLayout(treeData, options);
    }
}
