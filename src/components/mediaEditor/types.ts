import {type JSX} from 'solid-js';
import type RLottiePlayer from '../../lib/rlottie/rlottiePlayer';
import type {LayerController} from './Layers';

export enum Effect {
  Enhance = 'Enhance',
  Brightness = 'Brightness',
  Contrast = 'Contrast',
  Saturation = 'Saturation',
  Warmth = 'Warmth',
  Fade = 'Fade',
  Highlights = 'Highlights',
  Shadows = 'Shadows',
  Vignette = 'Vignette',
  Grain = 'Grain',
  Sharpen = 'Sharpen',
}

export enum CanvasWorkerAction {
  Setup = 'Setup',
  DrawImage = 'DrawImage',
  ApplyEffects = 'ApplyEffects',
  RotateCanvas = 'RotateCanvas',
  UpdateCropState = 'UpdateCropState'
}

export type CanvasWorkerActions = {
  [CanvasWorkerAction.Setup]: {
    offscreenCanvas: OffscreenCanvas;
    imageData: ImageData;
    defaultEffects?: Record<Effect, number>;
    cropState: CropState;
  };
  [CanvasWorkerAction.DrawImage]: {};
  [CanvasWorkerAction.ApplyEffects]: {
    effects: Record<Effect, number>;
  };
  [CanvasWorkerAction.RotateCanvas]: {
    angle: number;
  };
  [CanvasWorkerAction.UpdateCropState]: CropState;
}

export function checkActionType<T extends CanvasWorkerAction>(e: MessageEvent<any>, type: T): e is MessageEvent<CanvasWorkerActions[T]> {
  return e.data.type === type;
}

export enum EditorLayerType {
  StaticSticker = 'StaticSticker',
  LottieSticker = 'LottieSticker',
  VideoSticker = 'VideoSticker',
  Text = 'Text',
}

export type EditorLayerBase = {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  z: number;
  angle: number;
  controller?: LayerController;
}

export type EditorLayerStaticSticker = EditorLayerBase & {
  type: EditorLayerType.StaticSticker;
  image: HTMLImageElement;
}

export type EditorLayerLottieSticker = EditorLayerBase & {
  type: EditorLayerType.LottieSticker;
  player: RLottiePlayer;
}

export type EditorLayerText = EditorLayerBase & TextTool & {
  type: EditorLayerType.Text;
  text: string;
}

export type EditorLayerVideoSticker = EditorLayerBase & {
  type: EditorLayerType.VideoSticker;
  video: HTMLVideoElement;
}

export type EditorLayer = EditorLayerStaticSticker | EditorLayerLottieSticker | EditorLayerText | EditorLayerVideoSticker;

export type CropState = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  flip: boolean;
  aspectRatio: number | false;
}

export type MediaEditorState = {
  effects: Record<Effect, number>;
  draw: ImageData;
  layers: EditorLayer[];
  crop: CropState;
}

export enum DrawType {
  Pen = 'Pen',
  Arrow = 'Arrow',
  Brush = 'Brush',
  Neon = 'Neon',
  Blur = 'Blur',
  Eraser = 'Eraser'
}

export type DrawTool = {
  type: DrawType;
  size: number;
  color: string;
}

export enum TextStyle {
  NoFrame = 'NoFrame',
  White = 'White',
  Black = 'Black',
}

export type TextAlign = JSX.CSSProperties['text-align'];

export type TextTool = FontItem & {
  style: TextStyle;
  color: string;
  textAlign: TextAlign;
}

export enum AspectRatios {
  'Free' = 'Free',
  'Original' = 'Original',
  'Square' = 'Square',
  '3:2' = '3:2',
  '4:3' = '4:3',
  '5:4' = '5:4',
  '7:5' = '7:5',
  '16:9' = '16:9',
  '2:3' = '2:3',
  '3:4' = '3:4',
  '4:5' = '4:5',
  '5:7' = '5:7',
  '9:16' = '9:16'
}

export enum HandlesTypes {
  TopLeft = 'TopLeft',
  TopRight = 'TopRight',
  BottomLeft = 'BottomLeft',
  BottomRight = 'BottomRight',
}

export type FontItem = {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  fontStyle: string;
  name: string;
}

export type Size = {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type OptionalRecord<K extends keyof any, T> = {
    [P in K]?: T;
};
