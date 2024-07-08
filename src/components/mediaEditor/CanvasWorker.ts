import {type CanvasWorkerActions, CanvasWorkerAction} from './types';

/**
 * Typed wrapped for canvas worker
 */
export class CanvasWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('./canvas.worker.ts', import.meta.url), {type: 'module'});
  }

  public setup(options: CanvasWorkerActions[CanvasWorkerAction.Setup]) {
    this.worker.postMessage({type: CanvasWorkerAction.Setup, ...options}, [options.offscreenCanvas]);
  }

  public drawImage(options: CanvasWorkerActions[CanvasWorkerAction.DrawImage]) {
    this.worker.postMessage({type: CanvasWorkerAction.DrawImage, ...options});
  }

  public applyEffects(options: CanvasWorkerActions[CanvasWorkerAction.ApplyEffects]) {
    this.worker.postMessage({type: CanvasWorkerAction.ApplyEffects, ...options});
  }

  public rotateCanvas(options: CanvasWorkerActions[CanvasWorkerAction.RotateCanvas]) {
    this.worker.postMessage({type: CanvasWorkerAction.RotateCanvas, ...options});
  }

  public updateCropState(options: CanvasWorkerActions[CanvasWorkerAction.UpdateCropState]) {
    this.worker.postMessage({type: CanvasWorkerAction.UpdateCropState, ...options});
  }
}
