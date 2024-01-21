import confirmationPopup from '../confirmationPopup';
import {LangPackKey} from '../../lib/langPack';

async function getAudioOutputs() {
  const permission = await navigator.permissions.query({
    name: 'microphone' as PermissionName
  });

  if(permission.state === 'granted') {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioOutputs = devices.filter(
      (device) => device.kind === 'audiooutput'
    );

    return audioOutputs
  }

  return null;
}

export async function chooseAudioOutput(currentAudioOutput?: string): Promise<MediaDeviceInfo | null> {
  const devices = await getAudioOutputs();

  if(!devices || !devices.length) {
    return null;
  }

  const results = await confirmationPopup({
    titleLangKey: 'VoiceChat.Chat.Livestream.OutputDevice',
    checkboxes: devices.map(device => ({
      name: 'device',
      text: device.label as LangPackKey,
      asRadio: true,
      round: true,
      checked: currentAudioOutput === device.deviceId
    })),
    button: {
      langKey: 'OK'
    }
  });

  const selectedIndex = results.findIndex(selected => selected === true);
  const selectedDevice = devices[selectedIndex];
  return selectedDevice;
}
