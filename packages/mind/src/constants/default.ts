import { rgbaToHEX } from "@plait/core";

export const WithMindPluginKey = 'plait-mind-plugin-key';

export const BASE = 4;
export const PRIMARY_COLOR = '#6698FF';
export const GRAY_COLOR = '#AAAAAA';
export const STROKE_WIDTH = 2;

export const RESIZE_HANDLE_BUFFER_DISTANCE = 8;

export const NODE_MORE_LINE_DISTANCE = 10;

export const NODE_MORE_STROKE_WIDTH = 2;

export const NODE_MORE_ICON_DIAMETER = 20;

export const NODE_MORE_BRIDGE_DISTANCE = 10;

export const NODE_ADD_CIRCLE_COLOR = rgbaToHEX('#000000', 0.2);

export const NODE_ADD_HOVER_COLOR = '#6698FF';

export const NODE_ADD_INNER_CROSS_COLOR = 'white';

export const DEFAULT_MIND_IMAGE_WIDTH = 240;

export enum MindI18nKey {
    mindCentralText = 'mind-center-text',
    abstractNodeText = 'abstract-node-text'
}