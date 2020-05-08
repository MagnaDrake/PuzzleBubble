import * as Phaser from "phaser";

export default class ScoreManager {
  private static instance: ScoreManager;
  private text: Phaser.GameObjects.Text;
  private score: number;

  public static get Instance() {
    return this.instance || (this.instance = new ScoreManager());
  }

  initScoreText(scene: Phaser.Scene) {
    this.score = 0;
    this.text = new Phaser.GameObjects.Text(
      scene,
      10,
      scene.cameras.main.height - 100,
      "",
      {
        color: "white",
        fontSize: "28px",
      }
    );
    scene.add.existing(this.text);
    this.text.setOrigin(0);
    this.updateScoreText();
  }

  update() {}

  addScore(score: number) {
    this.score += score;
    this.updateScoreText();
  }

  updateScoreText() {
    this.text.text = "Score: " + this.score;
  }
}
