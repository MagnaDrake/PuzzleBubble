import * as Phaser from "phaser";

export default class GameOverPanel extends Phaser.GameObjects.Image {
  private button: Phaser.GameObjects.Image;
  private text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) {
    super(
      scene,
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      "panel"
    );
    scene.add.existing(this);
    this.button = new Phaser.GameObjects.Image(
      scene,
      this.x,
      this.y + 50,
      "replayButton"
    );
    scene.add.existing(this.button);

    this.text = new Phaser.GameObjects.Text(
      scene,
      this.x,
      this.y - 100,
      "Game Over!",
      { color: "white", fontSize: "28px" }
    );
    this.text.setOrigin(0.5);
    scene.add.existing(this.text);

    this.button.setInteractive();

    this.button.on("pointerdown", () => {
      this.setScale(1.25);
      this.scene.scene.start("GameScene");
    });

    this.setDepth(7);
    this.button.setDepth(8);
    this.text.setDepth(8);
  }

  update() {}

  show(flag: boolean) {
    this.setVisible(flag);
    this.button.setInteractive(flag);
    this.button.setVisible(flag);
    this.text.setVisible(flag);
  }
}
