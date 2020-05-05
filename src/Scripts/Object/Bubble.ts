import * as Phaser from "phaser";
const offsetX: number = 33;
const offsetY: number = 33;
const ballSize: number = 56;
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
  public colorCode: number;
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, "bubble");

    this.scene.add.existing(this);

    scene.physics.add.existing(this);
    this.setCircle(ballSize, offsetX, offsetY);
    //this.setInteractive();

    this.setCollideWorldBounds(true);
    this.setBounce(1);
    this.setGravity(0, 0);

    this.randomizeColor();
    let hsv = Phaser.Display.Color.HSVColorWheel();

    this.setScale(0.75);

    this.on("pointerdown", function () {
      this.setVelocity(-100, 100);
    });
  }

  public randomizeColor(): void {
    this.colorCode = Phaser.Math.Between(0, 6);
    let color = Phaser.Display.Color.HexStringToColor(COLORS[this.colorCode]);

    this.setTint(color.color);
  }
  update() {
    console.log(this.x + " " + this.y);
  }
}
