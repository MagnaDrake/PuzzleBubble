import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import Bubble from "../Object/Bubble";
import BubbleManager from "../Manager/BubbleManager";

export default class GameScene extends Phaser.Scene {
  private fpsText: FpsText;
  private bubbleManager: BubbleManager;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {}

  create(): void {
    this.fpsText = new FpsText(this);
    this.bubbleManager = BubbleManager.Instance;
    this.bubbleManager.initBubbles(this);
    /*new Bubble(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "bubble"
    );*/
  }

  update(): void {
    this.fpsText.update();
  }
}
