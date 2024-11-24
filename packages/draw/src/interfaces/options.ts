import { WithPluginOptions } from "@plait/core";

export interface WithDrawOptions extends WithPluginOptions {
    customGeometryTypes: string[];
}