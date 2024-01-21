import {RTMPConnection} from './rtmp';
import safeAssign from '../../helpers/object/safeAssign';
import {IS_SAFARI} from '../../environment/userAgent';
import {logger} from '../logger';
import DEBUG from '../../config/debug';
import EventListenerBase from '../../helpers/eventListenerBase';

export class LiveStreamPlayer extends EventListenerBase<{
  isStarted: (isStarted: boolean) => void
}> {
  private log = logger('LiveStreamPlayer');
  private videoElement: HTMLVideoElement;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private connection: RTMPConnection;
  private isStarted = false;
  private canPlay = false;
  private mimeType: string;

  constructor(options: {videoElement: HTMLVideoElement, connection: RTMPConnection}) {
    super(false);
    safeAssign(this, options);
    DEBUG && this.log.debug('LiveStreamPlayer constructor', {videoElement: this.videoElement});

    if(!window.MediaSource) {
      this.log.error('MediaSource API is not supported in this browser.');
      return;
    }

    this.mimeType = `video/mp4; codecs="avc1.64001f, ${IS_SAFARI ? 'mp4a.40.2' : 'opus'}"`;
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener('sourceopen', this.createSourceBuffer.bind(this));
    this.videoElement.src = URL.createObjectURL(this.mediaSource);
    DEBUG && this.log.debug('MediaSource created', this.mediaSource);

    this.bindVideoListeners();
  }

  public start() {
    this.canPlay = true;
    this.loop();
  }

  public stop() {
    this.canPlay = false;
  }

  private loop() {
    if(!this.canPlay) {
      return;
    }

    const nextVideoPart = this.connection.getNextVideoPart();
    DEBUG && this.log.debug('Got next video part', {nextVideoPart});

    if(nextVideoPart) {
      this.appendBuffer(nextVideoPart);
    }

    setTimeout(() => {
      this.loop();
    }, this.connection.partDuration);
  }

  private createSourceBuffer() {
    if(this.mediaSource) {
      this.sourceBuffer = this.mediaSource.addSourceBuffer(this.mimeType);
      this.sourceBuffer.mode = 'sequence';

      DEBUG && this.log.debug('MediaSource opened', {videoBuffer: this.sourceBuffer});
    }
  }

  private appendBuffer(video: Uint8Array) {
    if(this.sourceBuffer) {
      DEBUG && this.log.debug('Adding buffer', {video});
      this.sourceBuffer.appendBuffer(video);
    }
  }

  private bindVideoListeners() {
    this.videoElement.onerror = () => {
      this.log.error('Video error', this.videoElement.error);
    }

    this.videoElement.addEventListener('timeupdate', this.onTimeUpdate.bind(this))
  }

  public isVideoPlaying() {
    const video = this.videoElement;
    return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2)
  }

  private onTimeUpdate() {
    if(!this.isStarted) {
      const newIsStarted = this.isVideoPlaying()
      if(newIsStarted !== this.isStarted) {
        this.isStarted = newIsStarted;
        this.dispatchEvent('isStarted', this.isStarted);
      }
    }
  }

  public static createVideoElement(...classList: string[]) {
    const video = document.createElement('video');
    video.classList.add(...classList);
    video.setAttribute('preload', 'auto');
    video.setAttribute('autoplay', '');

    return video;
  }

  public setAudioOutput(device: MediaDeviceInfo) {
    (this.videoElement as any).setSinkId(device.deviceId);
  }

  public getAudioOutput(): string {
    return (this.videoElement as any).sinkId || 'default'
  }
}
