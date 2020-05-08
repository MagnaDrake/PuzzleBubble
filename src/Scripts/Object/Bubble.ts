import * as Phaser from "phaser";
import BubbleManager from "../Manager/BubbleManager";
import ScoreManager from "../Manager/ScoreManager";
const offsetX: number = 33;
const offsetY: number = 33;
const ballSize: number = 56;
const score: number = 100;
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
  public clusterProcessed: boolean;
  public removedFromProcess: boolean;
  public row: number;
  public column: number;
  private popAudio;
  private dropAudio;
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, "bubble");

    this.scene.add.existing(this);
    this.clusterProcessed = false;
    this.removedFromProcess = false;
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

    this.popAudio = this.scene.sound.add("bubblePopAudio");
    this.dropAudio = this.scene.sound.add("bubbleDropAudio");
  }

  public randomizeColor(): void {
    this.colorCode = Phaser.Math.Between(0, 6);
    let color = Phaser.Display.Color.HexStringToColor(COLORS[this.colorCode]);

    this.setTint(color.color);
  }
  update() {
    //console.log(this.x + " " + this.y);
  }

  pop() {
    //no idea what im doing
    //BubbleManager.Instance.sortBubbles();
    //console.log("poppin");
    this.popAudio.play();
    //BubbleManager.Instance.setBubblePosOnGrid(this, this.row, this.column);
    BubbleManager.Instance.removeBubbleFromGrid(this);
    //this.setPosition(this.x, this.y);

    this.play("bubblePop");
    //this.on("animationstart", BubbleManager.Instance.sortBubbles, this);

    BubbleManager.Instance.bubblePool.add(this);
    BubbleManager.Instance.gridGroup.remove(this);
    //BubbleManager.Instance.removeBubbleFromGrid(this);
    this.on("animationcomplete", this.popCallback, this);
  }

  drop() {
    //console.log("IM DROPPING");
    this.dropAudio.play();
    BubbleManager.Instance.removeBubbleFromGrid(this);

    this.setVelocityY(500);
    let tween = this.scene.tweens.add({
      targets: this,
      duration: 350,
      alpha: 0,
      callbackScope: this,
      onComplete: this.popCallback,
    });
    //BubbleManager.Instance.removeBubbleFromGrid(this);
  }

  popCallback() {
    this.setVelocity(0, 0);
    ScoreManager.Instance.addScore(100);

    //console.log("pop bubble " + this.name);
    //BubbleManager.Instance.removeBubbleFromGrid(this);

    this.setPosition(42000, 42000); //put offscren
    //console.group(this.parentContainer);
    BubbleManager.Instance.bubblePool.killAndHide(this);
    //this.scene.physics.world.removeCollider(this);
    this.setTexture("bubble");
    this.setActive(false).setVisible(false);
    //this.body.enable = false;
    this.setPosition(42000, 42000); //put offscren
  }

  playShoot() {
    this.popAudio.play();
  }
}
