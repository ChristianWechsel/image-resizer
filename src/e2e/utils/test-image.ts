import { readFileSync } from "fs";

export class TestImage {
  private static instance: TestImage;
  private testImageBuffer: Uint8Array<ArrayBuffer>;

  private constructor() {
    this.testImageBuffer = new Uint8Array();
  }

  static getInstance(): TestImage {
    if (!TestImage.instance) {
      TestImage.instance = new TestImage();
    }
    return TestImage.instance;
  }

  getRegularImage(): Uint8Array<ArrayBuffer> {
    if (this.testImageBuffer.byteLength === 0) {
      this.load();
    }
    return this.testImageBuffer;
  }

  getOversizedData(): Uint8Array<ArrayBuffer> {
    return new Uint8Array(10 * 1024 * 1024 + 1); // 10 MB + 1 byte
  }

  private load() {
    this.testImageBuffer = new Uint8Array(readFileSync("Test.png"));
  }
}
