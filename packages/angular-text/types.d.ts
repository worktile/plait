import { CustomText, CustomElement } from './src/custom-types';

declare module 'slate' {
    interface CustomTypes {
        Text: CustomText;
        Element: CustomElement;
    }
}
