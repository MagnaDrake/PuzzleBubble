import * as Phaser from "phaser";
import Bubble from "../Object/Bubble";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.path = "src/Assets/";
    this.load.image("shopee", "shopee.png");

    this.load.image("panel", "Panel.png");
    this.load.image("replayButton", "Replay.png");
    this.load.spritesheet("bubble", "bubblesprite.png", {
      frameWidth: 180,
      frameHeight: 180,
      endFrame: 6,
      startFrame: 0,
    });
    this.load.audio("bubblePopAudio", "Audio/Blop.mp3");
    this.load.audio("bubbleDropAudio", "Audio/highDown.ogg");
  }

  create(): void {
    this.anims.create({
      key: "bubblePop",
      frames: this.anims.generateFrameNumbers("bubble", {
        start: 0,
        end: 6,
      }),
      frameRate: 12,
    });

    this.scene.start("GameScene");
  }
}
