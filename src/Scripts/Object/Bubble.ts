import * as Phaser from "phaser";
const offsetX: number = 28;
const offsetY: number = 28;
const ballSize: number = 60;
const COLORS = {
  0: "FF2D00", //red
  1: "00CE2E", //green
  2: "0006CE", //blue
  3: "F6FD00", //yellow
  4: "9F00FD", //purple
  5: "FFFFFF", //white
  6: "000000", //black
};
export default class Bubble extends Phaser.Physics.Arcade.Sprite {
  public color: number;
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.scene.add.existing(this);

    scene.physics.add.existing(this);
    this.setCircle(ballSize, offsetX, offsetY);
    this.setInteractive();

    this.setCollideWorldBounds(true);
    this.setBounce(1);
    this.setGravity(0, 0);

    let hsv = Phaser.Display.Color.HSVColorWheel();

    let colorCode = Phaser.Math.Between(0, 6);
    let color = Phaser.Display.Color.HexStringToColor(COLORS[colorCode]);

    this.setTint(color.color);

    this.setScale(0.75);

    this.on("pointerdown", function () {
      this.setVelocity(-100, 100);
    });
  }
}
