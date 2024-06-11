import { CustomElement, CustomText } from "@plait/common";

declare module 'slate' {
    interface CustomTypes {
        Text: CustomText;
        Element: CustomElement;
    }
}
