import { CustomText, CustomElement } from './src/types';

declare module 'slate' {
    interface CustomTypes {
        Text: CustomText;
        Element: CustomElement;
    }
}
