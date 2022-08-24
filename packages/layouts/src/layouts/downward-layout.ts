import { OriginNode, LayoutOptions, LayoutType } from "../types";
import { BaseLayout } from "./base-layout";

export class DownwardLayout extends BaseLayout {
    layout(root: OriginNode, options: LayoutOptions) {
        return this.baseLayout(root, LayoutType.logic, options);
    }
}
