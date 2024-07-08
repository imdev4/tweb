import {Effect, CanvasWorkerAction, checkActionType, type OptionalRecord, type CropState} from './types'
import {rotateCanvas, cloneImageData, cropImageData} from './utils';

let offscreenCanvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let originalImageData: ImageData;
let defaultEffects: Record<Effect, number>;

// State
let rotation = 0;
let effects: OptionalRecord<Effect, number> = {};
let cropState: CropState;

/**
 * Main listener and methods router
 */
self.onmessage = (e) => {
  // Setup action
  if(checkActionType(e, CanvasWorkerAction.Setup)) {
    offscreenCanvas = e.data.offscreenCanvas;
    ctx = e.data.offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    originalImageData = cloneImageData(e.data.imageData);
    defaultEffects = e.data.defaultEffects;
    cropState = e.data.cropState;
    drawImage();
  }

  // Draw action
  if(checkActionType(e, CanvasWorkerAction.DrawImage)) {
    drawImage();
  }

  // Effects action
  if(checkActionType(e, CanvasWorkerAction.ApplyEffects)) {
    effects = e.data.effects;
    drawImage();
  }

  // Rotate action
  if(checkActionType(e, CanvasWorkerAction.RotateCanvas)) {
    rotation = e.data.angle;
    drawImage();
  }

  // Update crop state
  if(checkActionType(e, CanvasWorkerAction.UpdateCropState)) {
    cropState = e.data;
    drawImage();
  }
}

/**
 * Draws `ImageData` on the canvas with applying all of the editor features
 */
function drawImage() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const croppedImage = cropImageData(originalImageData, {
    cropHeight: cropState.h,
    cropWidth: cropState.w,
    cropX: cropState.x,
    cropY: cropState.y,
    flipHorizontal: cropState.flip
  });

  ctx.drawImage(croppedImage, cropState.x, cropState.y);
  rotate(rotation);
  applyEffects(effects);
}

/**
 * Applies effects to the canvas
 */
function applyEffects(effects: OptionalRecord<Effect, number>) {
  const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  const data = imageData.data;

  for(const [_key, value] of Object.entries(effects)) {
    const key = _key as Effect;
    if(defaultEffects[key] === value) {
      continue;
    }

    switch(key) {
      case Effect.Enhance:
        const factor = value / 200;
        const pixels = data.length / 4;
        for(let i = 0; i < pixels; i++) {
          let r = data[i * 4];
          let g = data[i * 4 + 1];
          let b = data[i * 4 + 2];
          r = Math.min(255, Math.max(0, r + (r - 128) * factor));
          g = Math.min(255, Math.max(0, g + (g - 128) * factor));
          b = Math.min(255, Math.max(0, b + (b - 128) * factor));
          data[i * 4] = r;
          data[i * 4 + 1] = g;
          data[i * 4 + 2] = b;
        }
        break;

      case Effect.Brightness:
        for(let i = 0; i < data.length; i += 4) {
          data[i] += value; // red
          data[i + 1] += value; // green
          data[i + 2] += value; // blue
        }
        break;

      case Effect.Contrast:
        const contrastFactor = (259 * (value + 255)) / (255 * (259 - value));
        for(let i = 0; i < data.length; i += 4) {
          data[i] = contrastFactor * (data[i] - 128) + 128; // red
          data[i + 1] = contrastFactor * (data[i + 1] - 128) + 128; // green
          data[i + 2] = contrastFactor * (data[i + 2] - 128) + 128; // blue
        }
        break;

      case Effect.Saturation:
        for(let i = 0; i < data.length; i += 4) {
          const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
          data[i] = gray + value * (data[i] - gray); // red
          data[i + 1] = gray + value * (data[i + 1] - gray); // green
          data[i + 2] = gray + value * (data[i + 2] - gray); // blue
        }
        break;

      case Effect.Warmth:
        for(let i = 0; i < data.length; i += 4) {
          data[i] += value; // red
          data[i + 2] -= value; // blue
        }
        break;

      case Effect.Fade:
        for(let i = 0; i < data.length; i += 4) {
          data[i] = data[i] + (255 - data[i]) * value / 100; // red
          data[i + 1] = data[i + 1] + (255 - data[i + 1]) * value / 100; // green
          data[i + 2] = data[i + 2] + (255 - data[i + 2]) * value / 100; // blue
        }
        break;

      case Effect.Highlights:
        for(let i = 0; i < data.length; i += 4) {
          if(data[i] > 128) data[i] += value; // red
          if(data[i + 1] > 128) data[i + 1] += value; // green
          if(data[i + 2] > 128) data[i + 2] += value; // blue
        }
        break;

      case Effect.Shadows:
        for(let i = 0; i < data.length; i += 4) {
          if(data[i] < 128) data[i] += value; // red
          if(data[i + 1] < 128) data[i + 1] += value; // green
          if(data[i + 2] < 128) data[i + 2] += value; // blue
        }
        break;

      case Effect.Vignette:
        const centerX = offscreenCanvas.width / 2;
        const centerY = offscreenCanvas.height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        for(let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % offscreenCanvas.width;
          const y = Math.floor((i / 4) / offscreenCanvas.width);
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          const vignetteFactor = (maxDistance - distance) / maxDistance;
          data[i] *= vignetteFactor; // red
          data[i + 1] *= vignetteFactor; // green
          data[i + 2] *= vignetteFactor; // blue
        }
        break;

      case Effect.Grain:
        for(let i = 0; i < data.length; i += 4) {
          const grain = (Math.random() - 0.5) * value;
          data[i] += grain; // red
          data[i + 1] += grain; // green
          data[i + 2] += grain; // blue
        }
        break;

      case Effect.Sharpen:
        const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const side = Math.round(Math.sqrt(weights.length));
        const halfSide = Math.floor(side / 2);

        const src = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const sw = src.width;
        const sh = src.height;

        const w = offscreenCanvas.width;
        const h = offscreenCanvas.height;
        const output = ctx.createImageData(w, h);

        for(let y = 0; y < h; y++) {
          for(let x = 0; x < w; x++) {
            const sy = y;
            const sx = x;
            const dstOff = (y * w + x) * 4;
            let r = 0, g = 0, b = 0;
            for(let cy = 0; cy < side; cy++) {
              for(let cx = 0; cx < side; cx++) {
                const scy = sy + cy - halfSide;
                const scx = sx + cx - halfSide;
                if(scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                  const srcOff = (scy * sw + scx) * 4;
                  const wt = weights[cy * side + cx];
                  r += src.data[srcOff] * wt;
                  g += src.data[srcOff + 1] * wt;
                  b += src.data[srcOff + 2] * wt;
                }
              }
            }
            output.data[dstOff] = r;
            output.data[dstOff + 1] = g;
            output.data[dstOff + 2] = b;
            output.data[dstOff + 3] = 255;
          }
        }
        ctx.putImageData(output, 0, 0);
        break;

      default:
        break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Rotates canvas
 */
function rotate(angle: number) {
  rotateCanvas(ctx, angle);
}
