import {MOUNT_CLASS_TO} from '../../config/debug';
import {FFmpeg} from '@ffmpeg/ffmpeg';
import {toBlobURL} from '@ffmpeg/util';
import {logger} from '../logger';
import DEBUG from '../../config/debug';
import {IS_SAFARI} from '../../environment/userAgent';
import {nextRandomUint} from '../../helpers/random';

export class FfmpegWorkerController {
  private log = logger('FfmpegWorkerController');
  private instance: FFmpeg;

  constructor() {
    this.init()
  }

  public async init() {
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
    this.instance = new FFmpeg();
    await this.instance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    });
  }

  private getConversionConfig() {
    if(IS_SAFARI) {
      return [
        // H.264 for video
        '-c:v', 'libx264',
        // CRF quality control (max 51)
        '-crf', '30',
        // AAC for audio
        '-c:a', 'aac',
        '-b:a', '126k',
        '-ac', '2'
      ];
    }

    return [
      '-c:v', 'copy',
      '-c:a', 'copy'
    ];
  }

  private async invoke(fileName: string, bytes: Uint8Array, fileType: string, config: string[], outType: 'mp4' | 'jpg'): Promise<Uint8Array> {
    if(!bytes || !bytes.length) {
      throw new Error('File for decoding is empty')
    }

    DEBUG && this.log.debug('Invoke', {bytes});
    const randomInt = nextRandomUint(32);
    const inputFileName = `i-${randomInt}-${fileName}`;
    const outputFileName = `o-${randomInt}-${fileName}.${outType}`;

    await this.instance.writeFile(inputFileName, bytes);
    await this.instance.exec(['-i', inputFileName, ...config, outputFileName]);

    const file = await this.instance.readFile(outputFileName);
    this.instance.deleteFile(outputFileName);
    DEBUG && this.log.debug('Result', {file});

    if(typeof file === 'string') {
      throw new Error('Cannot process file');
    }

    return file;
  }

  public async decodeStream(fileName: string, bytes: Uint8Array): Promise<Uint8Array> {
    const config = [
      // Browser-based conversion config
      ...this.getConversionConfig(),
      // Preset and flags for streams
      '-preset', 'ultrafast',
      '-movflags', 'frag_keyframe+empty_moov+default_base_moof+faststart'
    ];

    return this.invoke(fileName, bytes, 'video/mp4', config, 'mp4');
  }

  public async mjpegEncode(fileName: string, bytes: Uint8Array): Promise<Uint8Array> {
    const config = [
      '-vframes', '1',
      '-q:v', '2'
    ];
    return this.invoke(fileName, bytes, 'video/mjpeg', config, 'jpg');
  }

  public async reencodeAudio(fileName: string, bytes: Uint8Array): Promise<Uint8Array> {
    const config = [
      '-c', 'copy',
      '-c:a', 'aac',
      '-b:a', '126k',
      '-ac', '2',
      '-preset', 'ultrafast'
    ];
    return this.invoke(fileName, bytes, 'video/mp4', config, 'mp4');
  }
}

const ffmpegWorkerController = new FfmpegWorkerController();
MOUNT_CLASS_TO.ffmpegWorkerController = ffmpegWorkerController;
export default ffmpegWorkerController;
