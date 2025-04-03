class Game extends Phaser.Scene {
    preload() {
        // this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
        this.load.setBaseURL("/")

        this.load.atlas("player", "assets/player/Player/Player.png", "assets/player/Player/Player.json");
        this.load.atlas("floor", "assets/floor/Floor/Floor.png", "assets/floor/Floor/Floor.json");
    }

    create() {
        const player = this.physics.add.sprite(100, 100, "player");
        player.setScale(2);
        player.setCollideWorldBounds(true);
        player.anims.create({
            key: "default",
            frames: this.anims.generateFrameNames("player", {
                prefix: "Player",
                suffix: ".png",
                start: 0,
                end: 3,
            }),
            frameRate: 4,
            repeat: -1
        });
        player.play("default");
        this.player = player;

        const fl = this.add.tileSprite(0, (600-(32*2)), 800, 32, 'floor');
        fl.originX = 0;
        fl.originY = 0;
        fl.setScale(2);
        fl.anims.create({
            key: "default",
            frames: this.anims.generateFrameNames("floor", {
                prefix: "Seaweed Floor",
                suffix: ".png",
                start: 0,
                end: 3,
            }),
            frameRate: 4,
            repeat: -1
        });
        fl.play("default");
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Game,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    pixelArt: true,
};

const game = new Phaser.Game(config);