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
  private line: Phaser.Geom.Line;
  private guidanceHead: Phaser.Geom.Line;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y * 3.5, x * 2, y, 0xff0000, 0.5);

    this.scene.add.existing(this);

    this.offset = 150;

    this.launchPos = new Phaser.Math.Vector2(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 1.25
    );

    this.bubblespeed = 2000;

    let graphics = scene.add.graphics();
    this.line = new Phaser.Geom.Line(
      this.launchPos.x,
      this.launchPos.y,
      this.launchPos.x,
      this.launchPos.y
    );

    this.guidanceHead = new Phaser.Geom.Line(
      this.launchPos.x,
      this.launchPos.y,
      this.launchPos.x,
      this.launchPos.y
    );
    graphics.lineStyle(10, 0x00fff0);
    graphics.strokeLineShape(this.line);
    graphics.strokeLineShape(this.guidanceHead);

    this.setInteractive({ draggable: true });
    this.heldBubbles = new Array<Bubble>();
    this.heldBubbles.push(BubbleManager.Instance.getBubble());
    this.heldBubbles.push(BubbleManager.Instance.getBubble());
    BubbleManager.Instance.shootGroup.add(this.heldBubbles[0]);
    BubbleManager.Instance.shootGroup.add(this.heldBubbles[1]);
    BubbleManager.Instance.bubblePool.remove(this.heldBubbles[0]);
    BubbleManager.Instance.bubblePool.remove(this.heldBubbles[1]);

    this.setBubbleForLaunch();

    this.on("dragstart", function (pointer: Phaser.Input.Pointer) {
      console.log("dragstart");
    });

    this.on("drag", function (pointer: Phaser.Input.Pointer) {
      //console.log(pointer.x);
      //console.log(pointer.y);

      this.line.x2 = pointer.x;
      this.line.y2 = pointer.y;

      this.guidanceHead.x1 = -pointer.x;
      this.guidanceHead.y1 = -pointer.y;
      console.log(this.line.x2);
      graphics.clear();
      graphics.lineStyle(10, 0x00fff0);
      graphics.strokeLineShape(this.line);
      graphics.strokeLineShape(this.guidanceHead);
    });

    this.on("dragend", function (pointer: Phaser.Input.Pointer) {
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
      this.line.setTo(0, 0, 0, 0);
      graphics.clear();
      graphics.lineStyle(2, 0x00ff00);
      graphics.strokeLineShape(this.line);

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
