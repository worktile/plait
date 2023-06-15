import { CustomText } from './src/custom-types';

declare module 'slate' {
    interface CustomTypes {
        Text: CustomText;
    }
}
