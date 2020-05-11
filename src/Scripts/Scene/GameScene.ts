import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import Bubble from "../Object/Bubble";
import BubbleManager from "../Manager/BubbleManager";
import ScoreManager from "../Manager/ScoreManager";
import Player from "../Object/Player";

export default class GameScene extends Phaser.Scene {
  private fpsText: FpsText;
  private bubbleManager: BubbleManager;
  private scoreManager: ScoreManager;
  private player: Player;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {}

  create(): void {
    this.fpsText = new FpsText(this);
    this.bubbleManager = BubbleManager.Instance;
    this.bubbleManager.initBubbles(this);
    this.scoreManager = ScoreManager.Instance;
    this.scoreManager.initScoreText(this);

    this.player = new Player(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 4
    );

    this.bubbleManager.player = this.player;
  }

  update(): void {
    this.fpsText.update();
    this.bubbleManager.update();
    this.player.update(this.time);
  }
}
