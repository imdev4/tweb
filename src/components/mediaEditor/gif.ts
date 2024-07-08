export class GIF {
  private width: number;
  private height: number;
  private frames: ImageData[] = [];
  private delay: number = 1000 / 25; // 25 FPS
  private colorDepth: number = 8;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public addFrame(imageData: ImageData): void {
    if(imageData.width !== this.width || imageData.height !== this.height) {
      throw new Error('Frame dimensions do not match GIF dimensions');
    }
    this.frames.push(imageData);
  }

  public async getBlob(onProgress?: (progress: number) => void): Promise<Blob> {
    const chunks: Uint8Array[] = [];
    await this.encode(chunks, onProgress);
    return new Blob(chunks, {type: 'image/gif'});
  }

  private async encode(chunks: Uint8Array[], onProgress?: (progress: number) => void): Promise<void> {
    this.writeHeader(chunks);
    this.writeLogicalScreenDescriptor(chunks);

    const globalPalette = this.createGlobalPalette();
    this.writeGlobalColorTable(chunks, globalPalette);

    this.writeNetscapeExt(chunks);

    let processedFrames = 0;
    for(const frame of this.frames) {
      await new Promise(resolve => setTimeout(resolve, 0));

      this.writeGraphicControlExt(chunks);
      this.writeImageDesc(chunks);

      const indexedPixels = this.quantizeImage(frame, globalPalette);
      this.writeLZWEncoded(indexedPixels, chunks);

      processedFrames++;
      if(onProgress) {
        onProgress(processedFrames / this.frames.length);
      }
    }

    chunks.push(new Uint8Array([0x3B])); // Trailer
  }


  private writeHeader(chunks: Uint8Array[]): void {
    chunks.push(new TextEncoder().encode('GIF89a'));
  }

  private writeLogicalScreenDescriptor(chunks: Uint8Array[]): void {
    const lsd = new Uint8Array(7);
    const view = new DataView(lsd.buffer);
    view.setUint16(0, this.width, true);
    view.setUint16(2, this.height, true);
    lsd[4] = 0xF0 | (this.colorDepth - 1); // Global Color Table Flag, Color Resolution
    lsd[5] = 0; // Background Color Index
    lsd[6] = 0; // Pixel Aspect Ratio
    chunks.push(lsd);
  }

  private writeGlobalColorTable(chunks: Uint8Array[], palette: number[][]): void {
    const gct = new Uint8Array(palette.length * 3);
    for(let i = 0; i < palette.length; i++) {
      gct[i * 3] = palette[i][0];
      gct[i * 3 + 1] = palette[i][1];
      gct[i * 3 + 2] = palette[i][2];
    }
    chunks.push(gct);
  }

  private writeNetscapeExt(chunks: Uint8Array[]): void {
    chunks.push(new Uint8Array([
      0x21, 0xFF, 0x0B,
      0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30,
      0x03, 0x01,
      0 & 0xFF, (0 >> 8) & 0xFF, // 0 for infinite loop
      0x00
    ]));
  }

  private writeGraphicControlExt(chunks: Uint8Array[]): void {
    chunks.push(new Uint8Array([
      0x21, 0xF9, 0x04,
      0x05, // Disposal method: 1 (Keep), Transparent Color Flag: 1
      this.delay & 0xFF, (this.delay >> 8) & 0xFF,
      this.colorDepth - 1, // Transparent Color Index (last palette entry)
      0x00
    ]));
  }


  private writeImageDesc(chunks: Uint8Array[]): void {
    chunks.push(new Uint8Array([
      0x2C,
      0x00, 0x00, 0x00, 0x00,
      this.width & 0xFF, (this.width >> 8) & 0xFF,
      this.height & 0xFF, (this.height >> 8) & 0xFF,
      0x00 // Local Color Table Flag off
    ]));
  }

  private createGlobalPalette(): number[][] {
    const colorCount = 1 << this.colorDepth;
    const palette: number[][] = [];

    palette.push([0, 0, 0]);// Black
    palette.push([255, 255, 255]); // White
    palette.push([255, 0, 0]); // Red
    palette.push([0, 255, 0]); // Green
    palette.push([0, 0, 255]); // Blue

    const step = Math.ceil(Math.pow(colorCount - palette.length - 1, 1/3)); // One slot for transparency
    for(let r = 0; r < 256; r += step) {
      for(let g = 0; g < 256; g += step) {
        for(let b = 0; b < 256; b += step) {
          if(palette.length < colorCount - 1) { // One slot for transparency
            palette.push([r, g, b]);
          }
        }
      }
    }

    // Transparent color as the last palette entry
    palette.push([0, 0, 0, 0]);

    return palette;
  }

  private quantizeImage(imageData: ImageData, palette: number[][]): Uint8Array {
    const pixels = new Uint8Array(imageData.data.buffer);
    const indexedPixels = new Uint8Array(this.width * this.height);

    for(let i = 0; i < this.width * this.height; i++) {
      const r = pixels[i * 4];
      const g = pixels[i * 4 + 1];
      const b = pixels[i * 4 + 2];
      const a = pixels[i * 4 + 3];

      // Skip fully transparent pixels
      if(a === 0) {
        indexedPixels[i] = palette.length - 1;
      } else {
        indexedPixels[i] = this.findClosestPaletteColor(palette, r, g, b);
      }
    }

    return indexedPixels;
  }


  private findClosestPaletteColor(palette: number[][], r: number, g: number, b: number): number {
    let minDistance = Infinity;
    let closestIndex = 0;

    for(let i = 0; i < palette.length; i++) {
      const [pr, pg, pb] = palette[i];
      const distance = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if(distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  private writeLZWEncoded(pixels: Uint8Array, chunks: Uint8Array[]): void {
    const MAX_DICT_SIZE = 4096;
    const initDictSize = 1 << this.colorDepth;
    const dict = new Map<string, number>();
    let dictSize = initDictSize + 2;
    let codeSize = this.colorDepth;
    const clearCode = initDictSize;
    const eofCode = initDictSize + 1;

    let curByte = 0;
    let curBitPos = 0;
    let chunk: number[] = [];

    const writeCode = (code: number) => {
      curByte |= code << curBitPos;
      curBitPos += codeSize;
      while(curBitPos >= 8) {
        chunk.push(curByte & 0xFF);
        if(chunk.length === 255) {
          chunks.push(new Uint8Array([255, ...chunk]));
          chunk = [];
        }
        curByte >>= 8;
        curBitPos -= 8;
      }
    };

    chunks.push(new Uint8Array([this.colorDepth])); // LZW Minimum Code Size

    writeCode(clearCode);

    let index = pixels[0].toString();
    for(let i = 1; i < pixels.length; i++) {
      const pixel = pixels[i].toString();
      const key = index + ',' + pixel;

      if(dict.has(key)) {
        index = key;
      } else {
        writeCode(parseInt(index) || dict.get(index)!);
        if(dictSize < MAX_DICT_SIZE) {
          dict.set(key, dictSize++);
          if(dictSize > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          writeCode(clearCode);
          dict.clear();
          dictSize = initDictSize + 2;
          codeSize = this.colorDepth;
        }
        index = pixel;
      }
    }

    writeCode(parseInt(index) || dict.get(index)!);
    writeCode(eofCode);

    if(chunk.length > 0) {
      chunks.push(new Uint8Array([chunk.length, ...chunk]));
    }
    chunks.push(new Uint8Array([0])); // Block Terminator
  }
}
