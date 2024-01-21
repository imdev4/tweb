import PopupElement from '../popups';
import {render} from 'solid-js/web';
import {createEffect, createSignal} from 'solid-js';
import Row from '../row';
import Section from '../section';
import InputField from '../inputField';
import safeAssign from '../../helpers/object/safeAssign';
import {GroupCallId} from '../../lib/appManagers/appGroupCallsManager';
import {i18n} from '../../lib/langPack';
import CheckboxField from '../checkboxField';
import {AppManagers} from '../../lib/appManagers/managers';
import {audioPreviewIcon, landscapeIcon, portraitIcon} from './streamRecordIcons';
import PopupPeer from '../popups/peer';

type PopupStreamRecordOptions = {
  managers: AppManagers;
  groupCallId: GroupCallId;
}

type RecordState = {
  title?: string;
  recordVideo?: boolean;
  orientation?: 'landscape' | 'portrait';
}

const streamCreateClassName = 'popup-stream-record';

export class PopupStreamRecord extends PopupElement {
  private groupCallId: GroupCallId;
  private recordState: RecordState = {
    title: '',
    recordVideo: false,
    orientation: 'landscape'
  }

  constructor(options: PopupStreamRecordOptions) {
    super(streamCreateClassName, {
      closable: true,
      overlayClosable: true,
      body: true,
      scrollable: true,
      footer: true,
      title: 'VideoChat.StreamRecord.Start',
      buttons: [
        {
          langKey: 'VideoChat.StreamRecord.Start',
          callback: () => {
            this.startRecording();
          }
        }
      ]
    });

    safeAssign(this, options);

    this.construct();
  }

  private async construct() {
    const isRecording = await this.isRecording();
    if(isRecording) {
      return PopupElement.createPopup(PopupPeer, 'popup-end-recording', {
        titleLangKey: 'VideoChat.StreamRecord.StopTitle',
        descriptionLangKey: 'VideoChat.StreamRecord.StopDescription',
        buttons: [{
          langKey: 'VideoChat.StreamRecord.Stop',
          callback: () => {
            this.stopRecording();
          }
        }]
      }).show();
    }

    const div = document.createElement('div');
    this.scrollable.append(div);
    const dispose = render(() => this.getBody(), div);
    this.addEventListener('closeAfterTimeout', dispose);

    if(this.buttons.length) {
      this.buttons[0].element.className = '';
      this.buttons[0].element.classList.add('btn-primary', 'btn-color-primary', 'text-uppercase');
    }

    this.show();
  }

  private getBody() {
    let orientationLandscapeRef: HTMLButtonElement;
    let orientationPortraitRef: HTMLButtonElement;
    const [orientation, setOrientation] = createSignal<RecordState['orientation']>(this.recordState.orientation);
    const [recordVideo, setRecordVideo] = createSignal(this.recordState.recordVideo)
    const inputField = new InputField({
      name: 'title',
      label: 'VideoChat.StreamRecord.RecordingTitle',
      plainText: true
    });

    const videoCheckbox = new Row({
      icon: 'videocamera',
      title: i18n('VideoChat.StreamRecord.RecordVideo'),
      checkboxField: new CheckboxField({
        toggle: true,
        name: 'record'
      })
    });

    createEffect(() => {
      this.listenerSetter.add(inputField.input)('input', (e) => {
        this.recordState.title = (e.target as HTMLInputElement).value;
      });

      this.listenerSetter.add(videoCheckbox.checkboxField.input)('input', (e) => {
        const newValue = (e.target as HTMLInputElement).checked;
        setRecordVideo(newValue);
        this.recordState.recordVideo = newValue;
      });
    }, [])

    return <>
      <Section noDelimiter={true}>{inputField.container}</Section>
      <Section>
        <div class={streamCreateClassName + '-subtitle'}>{i18n('VideoChat.StreamRecord.Description')}</div>
      </Section>
      <div class={streamCreateClassName + '-toggle-row'}>
        {videoCheckbox.container}
      </div>
      <div class={streamCreateClassName + '-bottom-wrapper'}>
        <div class={streamCreateClassName + '-bottom-wrapper-content'}>
          {recordVideo() ? <>
            <div class={streamCreateClassName + '-bottom-wrapper-content-video'}>
              <button
                classList={{active: orientation() === 'landscape'}}
                onClick={() => {
                  this.recordState.orientation = 'landscape';
                  setOrientation(this.recordState.orientation);
                }}
              >
                {landscapeIcon}
              </button>
              <button
                classList={{active: orientation() === 'portrait'}}
                onClick={() => {
                  this.recordState.orientation = 'portrait';
                  setOrientation(this.recordState.orientation);
                }}
              >
                {portraitIcon}
              </button>
            </div>
          </> : audioPreviewIcon}
        </div>
        <div class={streamCreateClassName + '-bottom-wrapper-description'}>
          {i18n(recordVideo() ? 'VideoChat.StreamRecord.ChooseOrientation' : 'VideoChat.StreamRecord.AudioOnly')}
        </div>
      </div>
    </>
  }

  private async startRecording() {
    return this.managers.appGroupCallsManager.startGroupCallRecord(this.groupCallId, this.recordState.title, this.recordState.recordVideo, this.recordState.orientation);
  }

  private async stopRecording() {
    return this.managers.appGroupCallsManager.stopGroupCallRecord(this.groupCallId);
  }

  private async isRecording(): Promise<boolean> {
    const groupInfo = await this.managers.appGroupCallsManager.getGroupCallFull(this.groupCallId);
    if(groupInfo._ !== 'groupCall') {
      return false;
    }

    return !!groupInfo.record_start_date;
  }
}
