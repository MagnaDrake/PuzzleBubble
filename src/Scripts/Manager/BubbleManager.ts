import * as Phaser from "phaser";
import Bubble from "../Object/Bubble";
import GameOverPanel from "../Object/GameOverPanel";
import Player from "../Object/Player";

const INIT_BUBBLE_NUMBER: number = 37; //5 rows, 7 on odds 8 on evens, 7*3 + 8*2 = 37
const BUBBLE_WIDTH: number = 90; //from ball radius *2. Will need to find out how to make this a global variable
const ROW_HEIGHT: number = 80;
const OFFSET: number = 45;
const CENTER_OFFSET: number = 10; //for position checking purposes

const NEIGHBOR_OFFSETS = [
  [
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
  ], // Even row tiles
  [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
  ],
]; // Odd row tiles
export default class BubbleManager {
  private static instance: BubbleManager;
  private bubbleGridArray: Bubble[][];
  public bubblePool: Phaser.GameObjects.Group;
  public gridGroup: Phaser.GameObjects.Group;
  public shootGroup: Phaser.GameObjects.Group;
  public scene: Phaser.Scene;
  public gameOverPanel: GameOverPanel;
  public player: Player;

  public static get Instance() {
    return this.instance || (this.instance = new BubbleManager());
  }

  public initBubbles(scene: Phaser.Scene): void {
    let ceiling = new Phaser.GameObjects.Rectangle(
      scene,
      scene.cameras.main.width / 2,
      0,
      scene.cameras.main.width,
      20,
      0xff0070,
      0.1
    );

    scene.add.existing(ceiling);
    scene.physics.add.existing(ceiling);

    ceiling.setVisible(true);

    this.scene = scene;
    this.bubblePool = scene.add.group({
      classType: Bubble,
      maxSize: 200,
      createCallback: function (bubble: Bubble) {
        bubble.setName("pool " + this.getLength());
      },
    });

    this.gridGroup = scene.add.group({
      classType: Bubble,
      createCallback: function (bubble: Bubble) {
        bubble.setName("grid " + this.getLength());
      },
    });

    this.shootGroup = scene.add.group({
      classType: Bubble,
      maxSize: 5,
      createCallback: function (bubble: Bubble) {
        bubble.setName("shoot " + this.getLength());
      },
    });

    scene.physics.add.overlap(
      this.shootGroup,
      this.gridGroup,
      this.snapBubbleDelay,
      null,
      this
    );

    scene.physics.add.overlap(
      this.shootGroup,
      ceiling,
      this.snapBubbleDelay,
      null,
      this
    );

    this.bubbleGridArray = new Array<Array<Bubble>>();
    let columnCounter = 7;
    for (let i = 0; i < 12; i++) {
      i % 2 === 0 ? (columnCounter = 8) : (columnCounter = 7); //check even/odd row
      let row: Bubble[] = new Array<Bubble>();

      for (let j = 0; j < columnCounter; j++) {
        if (i < 5) {
          let b: Bubble = new Bubble(
            scene,
            scene.cameras.main.width / 2,
            scene.cameras.main.height / 2,
            "bubble"
          );
          row.push(b);
          this.gridGroup.add(b);
        } else {
          row.push(null);
        }
      }
      this.bubbleGridArray.push(row);
    }

    this.sortBubbles();

    this.gameOverPanel = new GameOverPanel(scene);
    this.gameOverPanel.show(false);
  }

  public sortBubbles(): void {
    let count = 0;
    console.log("sort!");
    for (let y = 0; y < this.bubbleGridArray.length; y++) {
      for (let x = 0; x < this.bubbleGridArray[y].length; x++) {
        let b: Bubble = this.bubbleGridArray[y][x];
        if (b) {
          //b.body.enable = true;
          count++;
          this.setBubblePosOnGrid(b, x, y);
        }
      }
    }
    if (count <= 0) this.gameOver();
  }

  public getBubbleCoordinate(column: number, row: number): number[] {
    let xcor = column * BUBBLE_WIDTH;

    if (row % 2) {
      xcor += BUBBLE_WIDTH / 2;
    }

    let ycor = row * ROW_HEIGHT;
    return new Array(xcor, ycor);
  }

  public getBubble(): Bubble {
    let bubble: Bubble = this.bubblePool.get(); //get bubble from pool, create new if no free bubble while under max
    bubble.randomizeColor();

    if (!bubble) return null; //max size, none free

    bubble.setActive(true).setVisible(true);
    bubble.setDepth(5);
    bubble.body.enable = true;

    return bubble;
  }

  getGridPosition(x: number, y: number): number[] {
    let gridY = Math.floor(y / ROW_HEIGHT);

    let xoffset = 0;
    if (gridY % 2) {
      xoffset = BUBBLE_WIDTH / 2;
    }

    let gridX = Math.floor((x - xoffset) / BUBBLE_WIDTH);

    if (gridX < 0) gridX = 0;

    return new Array(gridX, gridY);
  }

  public snapBubbleDelay(shootBubble: Bubble, gridBubble: Bubble) {
    shootBubble.setVelocity(0, 0);
    shootBubble.playShoot();
    BubbleManager.Instance.shootGroup.remove(shootBubble);
    let timeDelay = BubbleManager.Instance.scene.time.delayedCall(
      10,
      BubbleManager.Instance.snapBubble,
      [shootBubble, gridBubble],
      this
    );
  }

  public snapBubble(shootBubble: Bubble, gridBubble: Bubble): void {
    let bm = BubbleManager.Instance;

    shootBubble.setVelocity(0, 0);
    bm.gridGroup.add(shootBubble);
    let gridPos = bm.getGridPosition(
      shootBubble.x,
      shootBubble.y - CENTER_OFFSET
    );

    if (gridPos[1] >= 11) {
      this.gameOver();
      return;
    }
    if (bm.bubbleGridArray.length - 1 < gridPos[1]) {
      let n = 0;
      gridPos[1] % 2 === 0 ? (n = 8) : (n = 7); //check even/odd row
      let row = new Array<Bubble>(n);
      bm.bubbleGridArray.push(row);
    }
    let xLimit = Math.min(
      gridPos[0],
      bm.bubbleGridArray[gridPos[1]].length - 1
    );
    if (
      bm.bubbleGridArray[gridPos[1]][xLimit] != null ||
      bm.bubbleGridArray[gridPos[1]][xLimit] != undefined
    ) {
      //somehow got an occupied slot, offset 1 row down
      if (
        bm.bubbleGridArray[gridPos[1] + 1][xLimit] != null ||
        bm.bubbleGridArray[gridPos[1] + 1][xLimit] != undefined
      ) {
        //1 row down still has a bubble in, offset 1 column right
        bm.bubbleGridArray[gridPos[1] + 1][xLimit + 1] = shootBubble;
      } else {
        bm.bubbleGridArray[gridPos[1] + 1][xLimit] = shootBubble;
      }
    } else {
      bm.bubbleGridArray[gridPos[1]][xLimit] = shootBubble;
    }

    bm.setBubblePosOnGrid(shootBubble, gridPos[0], gridPos[1]);

    bm.sortBubbles();

    bm.popBubble(shootBubble);
  }

  popBubble(bubble: Bubble) {
    let cluster = this.findCluster(bubble, true, true, false);

    if (cluster.length >= 3) {
      cluster.forEach((b: Bubble) => {
        b.pop();
      });
      this.dropBubble();
    }
  }

  dropBubble() {
    let floatCluster = this.findFloatingClusters();
    console.log("drop bubble");

    floatCluster.forEach((cluster) => {
      cluster.forEach((bubble) => {
        bubble.drop();
      });
    });
    this.sortBubbles();
  }

  setBubblePosOnGrid(bubble: Bubble, x: number, y: number) {
    let pos = this.getBubbleCoordinate(x, y);
    bubble.row = y;
    bubble.column = x;

    bubble.setPosition(pos[0] + OFFSET, pos[1] + OFFSET);
  }

  //cluster finding methods
  public findCluster(
    targetBubble: Bubble,
    match: boolean,
    reset: boolean,
    skipremoved: boolean
  ) {
    if (reset) {
      BubbleManager.Instance.resetProcessed(BubbleManager.Instance);
    }

    let processTarget = [targetBubble];
    let clusterResult = new Array();

    while (processTarget.length > 0) {
      let currentBubble = processTarget.pop();

      if (!currentBubble || currentBubble.clusterProcessed) {
        continue;
      }

      if (skipremoved && currentBubble.removedFromProcess) {
        continue;
      }
      if (!match || currentBubble.colorCode === targetBubble.colorCode) {
        clusterResult.push(currentBubble);
        currentBubble.clusterProcessed = true;

        let neighbors = this.getNeighbors(currentBubble);

        for (let i = 0; i < neighbors.length; i++) {
          if (!neighbors[i].clusterProcessed) {
            processTarget.push(neighbors[i]);
          }
        }
      }
    }
    return clusterResult;
  }

  resetProcessed(bm: BubbleManager) {
    for (let y = 0; y < bm.bubbleGridArray.length; y++) {
      for (let x = 0; x < bm.bubbleGridArray[y].length; x++) {
        if (bm.bubbleGridArray[y][x]) {
          bm.bubbleGridArray[y][x].clusterProcessed = false;
          bm.bubbleGridArray[y][x].removedFromProcess = false;
        }
      }
    }
  }

  getNeighbors(bubble: Bubble): Bubble[] {
    let gridPos = this.getGridPosition(bubble.x, bubble.y);
    let rowType = gridPos[1] % 2;
    let neighbors = new Array();
    let n = NEIGHBOR_OFFSETS[rowType];

    for (let i = 0; i < n.length; i++) {
      let nx = gridPos[0] + n[i][0];
      let ny = gridPos[1] + n[i][1];
      let leny = BubbleManager.Instance.bubbleGridArray.length;
      if (
        ny > -1 &&
        ny < leny &&
        nx >= 0 &&
        nx < BubbleManager.Instance.bubbleGridArray[ny].length
      ) {
        if (this.bubbleGridArray[ny][nx]) {
          neighbors.push(this.bubbleGridArray[ny][nx]);
        }
      }
    }

    return neighbors;
  }

  findFloatingClusters() {
    this.resetProcessed(BubbleManager.Instance);

    let floatingClusters = new Array();
    let grid = BubbleManager.Instance.bubbleGridArray;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        let bubble: Bubble = grid[y][x];
        if (bubble && !bubble.clusterProcessed) {
          let cluster = BubbleManager.Instance.findCluster(
            bubble,
            false,
            false,
            true
          );
          if (!cluster || cluster.length <= 0) {
            continue;
          }

          let floating = true;
          for (let i = 0; i < cluster.length; i++) {
            let gridPos = BubbleManager.Instance.getGridPosition(
              cluster[i].x,
              cluster[i].y
            );
            if (gridPos[1] == 0) {
              floating = false;
              break;
            }
          }
          if (floating) {
            floatingClusters.push(cluster);
          }
        }
      }
    }

    return floatingClusters;
  }

  public removeBubbleFromGrid(bubble: Bubble) {
    this.bubbleGridArray[bubble.row][bubble.column] = null;
  }

  public update() {
    //this.sortBubbles(); //not entirely sure why this function doesnt run when put inside snapBubbles
    //for now it runs on update to make sure the sprites align properly
  }

  public gameOver() {
    this.player.setActive(false).setVisible(false);
    this.scene.physics.world.colliders.destroy();

    this.gameOverPanel.show(true);
  }

  public getBubbleFromGrid(x: number, y: number) {
    //console.log(x + " " + y);
    if (y < this.bubbleGridArray.length && y >= 0) {
      return this.bubbleGridArray[y][x];
    }
  }
}
