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

  getBuffer(): Uint8Array<ArrayBuffer> {
    if (this.testImageBuffer.byteLength === 0) {
      this.load();
    }
    return this.testImageBuffer;
  }

  private load() {
    this.testImageBuffer = new Uint8Array(readFileSync("Test.png"));
  }
}
