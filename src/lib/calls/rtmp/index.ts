import {GroupCallStreamChannel, GroupCall} from '../../../layer';
import EventListenerBase from '../../../helpers/eventListenerBase';
import {AppManagers} from '../../appManagers/managers';
import safeAssign from '../../../helpers/object/safeAssign';
import GROUP_CALL_STATE from '../groupCallState';
import {logger} from '../../logger';
import DEBUG from '../../../config/debug';
import deepEqual from '../../../helpers/object/deepEqual';

type RTMPConnectionOptions = {
  managers: AppManagers;
  call: GroupCall.groupCall;
  onRejoinRequest(): void;
}

export class RTMPConnection extends EventListenerBase<{
  statechange: (state: GROUP_CALL_STATE) => void
}> {
  private log = logger('RTMPConnection');
  private managers: AppManagers;
  private channels: GroupCallStreamChannel[];
  private buffers: Uint8Array[] = [];
  private call: GroupCall.groupCall;
  private onRejoinRequest: () => void;
  public canPlay = false;
  public partDuration = 1000; // ms
  public state: GROUP_CALL_STATE;
  private lastTimeMs = -1;

  constructor(options: RTMPConnectionOptions) {
    super(false);
    safeAssign(this, options);

    this.state = GROUP_CALL_STATE.CONNECTING;
    this.init();
  }

  private async init() {
    await this.initConnection();
  }

  private async initConnection() {
    const streamChannels = await this.managers.appGroupCallsManager.getGroupCallStreamChannels(this.call.id);

    const restart = () => {
      setTimeout(() => {
        this.initConnection();
      }, this.partDuration);
    }

    if(!deepEqual(this.channels, streamChannels.channels)) {
      this.channels = streamChannels.channels;
    } else {
      return restart();
    }

    if(this.channels?.length >= 3 && !this.channels.some(el => Number(el.last_timestamp_ms) === this.lastTimeMs)) {
      this.setState(GROUP_CALL_STATE.UNMUTED);
    } else {
      return restart();
    }
  }

  private setState(state: GROUP_CALL_STATE) {
    this.state = state;
    this.dispatchEvent('statechange', this.state);
  }

  private resync() {
    this.log('Resync');
    this.stop();
    this.setState(GROUP_CALL_STATE.CONNECTING);
    this.init();
  }

  private getChannelTimestamp(idx = 0): number {
    if(!this.channels[idx]?.last_timestamp_ms) {
      throw new Error(`Cannot get timestamp for channel ${idx}`);
    }
    return Number(this.channels[idx].last_timestamp_ms)
  }

  public async start() {
    this.canPlay = true;

    if(!this.channels?.length) {
      throw new Error('Stream is not started');
    }

    try {
      const startTimeMs = this.getChannelTimestamp();
      this.startBroadcast(startTimeMs);
    } catch(e) {
      this.log.error(`Cannot start connection, trying again...`, e);
      await this.delay(this.partDuration);
      this.start();
    }
  }

  public stop() {
    this.lastTimeMs = -1;
    this.canPlay = false;
  }

  public getNextVideoPart(): Uint8Array | null {
    if(!this.buffers.length) {
      return null;
    }

    return this.buffers.shift();
  }

  private async startBroadcast(startTimeMs: number) {
    let nextTimeMs = startTimeMs;
    while(this.canPlay) {
      try {
        const videoPart = await this.requestVideoBroadcastPart(nextTimeMs);
        this.buffers.push(videoPart);
      } catch(e) {
        const error = e as ApiError;
        this.log.error(error);

        if(error.type === 'TIME_TOO_BIG' || error.type === 'TIME_TOO_SMALL') {
          this.resync();
          return;
        } else if(error.type === 'GROUPCALL_JOIN_MISSING') {
          this.stop();
          this.onRejoinRequest();
          return;
        }
      } finally {
        await this.delay(this.partDuration);
        nextTimeMs = nextTimeMs + this.partDuration;
      }
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  private checkChannelsStatus() {
    if(this.channels.length < 3) {
      throw new Error('Stream is not started');
    }
  }

  private async requestVideoBroadcastPart(timeMs: number): Promise<Uint8Array> {
    this.checkChannelsStatus();

    if(this.lastTimeMs === timeMs) {
      throw new Error('Cannot get the same chunk');
    }

    this.log('Getting video part', timeMs);
    const channel = this.channels[0];
    const rtmpVideoPart = await this.managers.appGroupCallsManager.getRTMPVideoPart(this.call, channel.scale, timeMs, channel.channel, 2);
    if(!rtmpVideoPart.byteLength) {
      throw new Error('Cannot get video part');
    }
    const updatedVideo = await this.managers.apiFileManager.decodeStream(rtmpVideoPart, `${timeMs}.mp4`);
    this.lastTimeMs = timeMs;

    DEBUG && this.log.debug('Video part', {timeMs, video: updatedVideo})

    return updatedVideo;
  }

  public async getPreviewImage(): Promise<string> {
    this.checkChannelsStatus();

    const channelIndex = this.channels.length - 1;
    const channel = this.channels[channelIndex];
    if(!channel) {
      throw new Error('Cannot get channel for preview image');
    }

    const startTimeMs = this.getChannelTimestamp(channelIndex);
    const previewImage = await this.managers.appGroupCallsManager.getRTMPVideoPreview(this.call, channel.scale, startTimeMs, channel.channel);
    if(!previewImage.byteLength) {
      throw new Error('Cannot get preview image');
    }
    const result = await this.managers.apiFileManager.encodeMjpeg(previewImage, `${startTimeMs}.mjpeg`);

    const previewImageUrl = URL.createObjectURL(new Blob([result], {type: 'image/jpeg'}));
    this.log('Preview image', previewImageUrl)
    return previewImageUrl
  }

  public closeConnection() {
    this.setState(GROUP_CALL_STATE.CLOSED);
    this.stop();
  }
}
