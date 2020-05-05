import * as Phaser from "phaser";
import BubbleManager from "../Manager/BubbleManager";
import Bubble from "../Object/Bubble";
import { Vector } from "matter";

export default class Player extends Phaser.GameObjects.Rectangle {
  public colorCode: number;
  private heldBubbles: Bubble[];
  private launchPos: Phaser.Math.Vector2;
  private offset: number;
  private bubblespeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y * 3.5, x * 2, y, 0xff0000, 0.5);

    this.scene.add.existing(this);

    this.offset = 150;

    this.launchPos = new Phaser.Math.Vector2(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 1.25
    );

    this.bubblespeed = 2100;

    this.setInteractive();
    this.heldBubbles = new Array<Bubble>();
    this.heldBubbles.push(BubbleManager.Instance.getBubble());
    this.heldBubbles.push(BubbleManager.Instance.getBubble());
    BubbleManager.Instance.shootGroup.add(this.heldBubbles[0]);
    BubbleManager.Instance.shootGroup.add(this.heldBubbles[1]);
    BubbleManager.Instance.bubblePool.remove(this.heldBubbles[0]);
    BubbleManager.Instance.bubblePool.remove(this.heldBubbles[1]);

    this.setBubbleForLaunch();

    this.on("pointerdown", function (pointer: Phaser.Input.Pointer) {
      console.log("touch");
      //console.log(pointer.x);
      //console.log(pointer.y);
      //this.heldBubbles[0].setPosition(pointer.x, pointer.y);
    });

    this.on("pointerup", function (pointer: Phaser.Input.Pointer) {
      console.log("lift");
      //console.log(pointer.x);
      //console.log(pointer.y);

      let endPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        pointer.x,
        pointer.y
      );

      let dir: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        this.launchPos.x - endPoint.x,
        this.launchPos.y - endPoint.y
      );
      dir.normalize();
      //console.log(dir);

      this.launchBubble(dir);
    });
  }

  setBubbleForLaunch(): void {
    this.heldBubbles[0].setPosition(this.launchPos.x, this.launchPos.y);
    this.heldBubbles[1].setPosition(
      this.launchPos.x - this.offset,
      this.launchPos.y
    );
  }

  launchBubble(dir: Phaser.Math.Vector2): void {
    this.heldBubbles
      .shift()
      .setVelocity(dir.x * this.bubblespeed, dir.y * this.bubblespeed);

    let b: Bubble = BubbleManager.Instance.getBubble();
    this.heldBubbles.push(b);
    BubbleManager.Instance.shootGroup.add(b);
    BubbleManager.Instance.bubblePool.remove(b);

    this.setBubbleForLaunch();
  }
}
