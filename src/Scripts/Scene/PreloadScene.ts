import * as Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.path = "src/Assets/";
    this.load.image("shopee", "shopee.png");
    this.load.spritesheet("bubble", "bubblesprite.png", {
      frameWidth: 180,
      frameHeight: 180,
      endFrame: 6,
      startFrame: 0,
    });
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
