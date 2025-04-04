class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.atlas('start', 'assets/start/start.png', 'assets/start/start.json');
        // this.load.audio('startSfx', 'assets/sounds/start.mp3');
    }

    create() {
        // Animations
        this.anims.create({
            key: 'startAnim',
            frames: this.anims.generateFrameNames('start', {
                prefix: 'start',
                start: 0,
                end: 9,
                suffix: '.png'
            }),
            frameRate: 8,
            repeat: -1
        });

        // Elements
        this.add.text(400, 200, 'VOID JUMPER', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Poppins, sans-serif'
        }).setOrigin(0.5);

        const startButton = this.add.sprite(400, 350, 'start')
            .setInteractive()
            .play('startAnim')
            .setScale(4);

        // Event listeners
        startButton.on('pointerdown', () => {
            // this.sound.play('startSfx');
            this.scene.start('Game');
        });

        this.input.keyboard.on('keydown', () => {
            // this.sound.play('startSfx');
            this.scene.start('Game');
        });

        this.input.gamepad.on('down', (pad, button, index) => {
            // this.sound.play('startSfx');
            this.scene.start('Game');
        });
    }
}

class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.atlas('restart', 'assets/restart/restart.png', 'assets/restart/restart.json');
        this.load.audio('gameOverSfx', 'assets/sound/game-over.mp3');
    }

    create(data) {
        this.sound.play('gameOverSfx');

        // Text
        this.add.text(400, 230, 'GAME OVER', { 
            fontSize: '64px', 
            fill: '#ff0000',
            fontFamily: 'Poppins, sans-serif'
        }).setOrigin(0.5);
        
        this.add.text(400, 300, 'Score: ' + data.score, { 
            fontSize: '32px', 
            fill: '#ffffff',
            fontFamily: 'Poppins, sans-serif'
        }).setOrigin(0.5);

        // Animations
        this.anims.create({
            key: 'restartAnim',
            frames: this.anims.generateFrameNames('restart', {
                prefix: 'restart',
                start: 0,
                end: 14,
                suffix: '.png'
            }),
            frameRate: 8,
            repeat: -1
        });

        // Elements
        const restartButton = this.add.sprite(400, 400, 'restart')
            .setInteractive()
            .play('restartAnim')
            .setScale(3);

        restartButton.on('pointerdown', () => {
            this.scene.start('Start');
        });

        this.input.keyboard.on('keydown', () => {
            this.scene.start('Start');
        });

        this.input.gamepad.on('down', (pad, button, index) => {
            this.scene.start('Start');
        });
    }
}

class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init() {
        this.score = 0;
        this.isPlayerTop = true;
        this.platformSpeed = 200;
        this.spawnInterval = 1500;
        this.lastSpawnTime = 0;
    }

    preload() {
        this.load.atlas('player', 'assets/player/player.png', 'assets/player/player.json');
        this.load.atlas('goodPlatform', 'assets/goodPlatform/goodPlatform.png', 'assets/goodPlatform/goodPlatform.json');
        this.load.atlas('badPlatform', 'assets/badPlatform/badPlatform.png', 'assets/badPlatform/badPlatform.json');
        
        this.load.image('floor', 'assets/floor/floor.png');
        this.load.image('ceiling', 'assets/floor/floor.png');

        this.load.audio('collectSfx', 'assets/sound/kaching.mp3');
    }

    create() {
        this.input.gamepad.once('connected', (pad) => {
            console.log('Gamepad connected:', pad.id);
        });

        const tileScale = (800 + (32 * 2)) / 32;

        this.floor = this.physics.add.staticGroup();
        this.floor.create(400, (600 - 16), 'floor')
            .setScale(tileScale, 1)
            .refreshBody();

        this.ceiling = this.physics.add.staticGroup();
        this.ceiling.create(400, 16, 'ceiling')
            .setScale(tileScale, 1)
            .setFlipY(true)
            .refreshBody();

        this.createAnimations();

        // Player
        this.player = this.physics.add.sprite(100, 30, 'player', 'Player0.png');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(2);
        this.player.play('playerAnim');
        
        this.player.setVelocity(0, 0);
        this.player.setY(32 + this.player.height);
        this.isPlayerTop = true;

        // Platform groups
        this.goodPlatforms = this.physics.add.group();
        this.badPlatforms = this.physics.add.group();

        // Colliders
        this.physics.add.collider(this.player, this.floor);
        this.physics.add.collider(this.player, this.ceiling);
        
        // Overlap checks
        this.physics.add.overlap(this.player, this.goodPlatforms, this.collectGoodPlatform, null, this);
        this.physics.add.overlap(this.player, this.badPlatforms, this.hitBadPlatform, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.scoreText = this.add.text(10, 10, 'Score: 0', { 
            fontSize: '20px', 
            fill: '#ffffff',
            fontFamily: 'Poppins, sans-serif'
        });
    }

    createAnimations() {
        // Player
        this.anims.create({
            key: 'playerAnim',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'Player',
                start: 0,
                end: 3,
                suffix: '.png'
            }),
            frameRate: 4,
            repeat: -1
        });

        // Platforms
        this.anims.create({
            key: 'goodPlatformAnim',
            frames: this.anims.generateFrameNames('goodPlatform', {
                prefix: 'goodPlatform',
                start: 0,
                end: 7,
                suffix: '.png'
            }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'badPlatformAnim',
            frames: this.anims.generateFrameNames('badPlatform', {
                prefix: 'badPlatform',
                start: 0,
                end: 7,
                suffix: '.png'
            }),
            frameRate: 12,
            repeat: -1
        });
    }

    update(time) {
        // Player movement
        const gamepads = this.input.gamepad?.gamepads;
        if (gamepads) {
            gamepads.forEach(gamepad => {
                const isUpDown = gamepad.up || gamepad.axes[1] < -0.5;
                const isDownDown = gamepad.down || gamepad.axes[1] > 0.5;
                
                if (isUpDown) {
                    if (!this.isPlayerTop) {
                        this.player.setVelocityY(-300);
                        this.isPlayerTop = true;
                    }
                }
                else if (isDownDown) {
                    if (this.isPlayerTop) {
                        this.player.setVelocityY(300);
                        this.isPlayerTop = false;
                    }
                }
            });
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            if (this.isPlayerTop) {
                this.player.setVelocityY(300);
                this.isPlayerTop = false;
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (!this.isPlayerTop) {
                this.player.setVelocityY(-300);
                this.isPlayerTop = true;
            }
        }
        
        // Spawn platforms
        if (time > this.lastSpawnTime + this.spawnInterval) {
            this.spawnPlatforms();
            this.lastSpawnTime = time;
            
            // Increase difficulty
            if (this.spawnInterval > 800) this.spawnInterval -= 10;
            if (this.platformSpeed < 400) this.platformSpeed += 5;
        }
        
        // Clean up
        this.goodPlatforms.getChildren().forEach(p => p.x < -50 && p.destroy());
        this.badPlatforms.getChildren().forEach(p => p.x < -50 && p.destroy());
    }
    
    spawnPlatforms() {
        const height = this.game.config.height;
        const platformY = Phaser.Math.Between(100, height - 100);
        
        if (Math.random() < 0.5) {
            // Good platform
            const platform = this.goodPlatforms.create(850, platformY, 'goodPlatform', 'goodPlatform0.png');
            platform.setVelocityX(-this.platformSpeed);
            platform.play('goodPlatformAnim');
            platform.setScale(2);
        } else {
            // Bad platform
            const platform = this.badPlatforms.create(850, platformY, 'badPlatform', 'badPlatform0.png');
            platform.setVelocityX(-this.platformSpeed);
            platform.play('badPlatformAnim');
            platform.setScale(2);
        }
    }
    
    collectGoodPlatform(player, platform) {
        platform.destroy();
        this.scoreText.setText('Score: ' + ++this.score);
        
        this.sound.play('collectSfx');
        
        player.setTint(0x00ff00);
        this.time.delayedCall(200, () => player.clearTint());
    }
    
    hitBadPlatform() {
        this.physics.pause();
        this.player.anims.pause();
        
        this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 500,
            onUpdate: tween => {
                this.player.setTint(Math.floor(tween.getValue()) % 2 === 0 ? 0xff0000 : 0xffffff);
            },
            onComplete: () => {
                this.scene.start('GameOver', { score: this.score });
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Start, Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    input: {
        gamepad: true
    },
    pixelArt: true,
};

const game = new Phaser.Game(config);