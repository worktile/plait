import { OriginNode, LayoutOptions, LayoutType } from "../types";
import { BaseLayout } from "./base-layout";

export class RightLayout extends BaseLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        return this.baseLayout(treeData, LayoutType.logic, options, true);
    }
}
