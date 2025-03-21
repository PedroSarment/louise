import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {

    private background!: Phaser.GameObjects.Image;
    private titleLouise!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private player1Text!: Phaser.GameObjects.Text;
    private player2Text!: Phaser.GameObjects.Text;
    private header!: Phaser.GameObjects.Graphics;
    private leftClueText!: Phaser.GameObjects.Text;
    private dotsPuzzle!: Phaser.GameObjects.Graphics;
    private asciiPuzzleText!: Phaser.GameObjects.Text;
    private finishPhaseBtn!: Phaser.GameObjects.Text;
    private timeLeft: number = 60;
    private timerEvent!: Phaser.Time.TimerEvent;

    private boxLouise!: Phaser.GameObjects.Image;
    private boxTimer!: Phaser.GameObjects.Image;
    private boxPlayer1!: Phaser.GameObjects.Image;
    private boxPlayer2!: Phaser.GameObjects.Image;
    player1Progress!: Phaser.GameObjects.Graphics;
    player2Progress!: Phaser.GameObjects.Graphics;
    boxProgress1!: Phaser.GameObjects.Image;
    boxProgress2!: Phaser.GameObjects.Image;
    bgMusic: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    winSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    drawSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    loseSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    gameOverText: Phaser.GameObjects.Text;
    backButton: Phaser.GameObjects.Text;

    private player1ProgressValue: number = 0;
    private player2ProgressValue: number = 0;

    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.audio('backgroundMusic', 'assets/audio/background.m4a');
        this.load.audio('winSound', 'assets/audio/winSound.mp3');

        this.load.image('background', 'assets/main-bg.png');
        
        this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
    }

    create() {
        // Adiciona o fundo
        this.background = this.add.image(512, 384, 'background');
        // Toca a música de fundo
        if (!this.bgMusic) {
            this.bgMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.1 });
            this.bgMusic.play();
        }
        

        // Cria o cabeçalho com dots
        this.header = this.add.graphics();
        this.createHeader();

        // Sons de vitória, empate e derrota
        this.winSound = this.sound.add('winSound');

        // Segunda camada do fundo com transparência
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        // Texto de Game Over
        this.gameOverText = this.add.text(512, 200, 'E quem ganhou foi...', {
            fontFamily: 'Jacques Francois',
            fontSize: '50px',
            color: '#C2A385',
            stroke: '#fffffff',
            strokeThickness: 5,
            shadow: { color: '#000000', fill: true, offsetX: 5, offsetY: 5, blur: 5 },
            letterSpacing: 5
        }).setOrigin(0.5).setDepth(100);

        // Pontuações simuladas
        const player1Score = 200;
        const player2Score = 150;  // Max 200

        // Anima as barras de progresso dos jogadores
        this.animateProgressBar(player1Score, 0x000000, "Player 1", 300, 300);
        this.animateProgressBar(player2Score, 0x000000, "Player 2", 300, 400);

        // Após 3 segundos, exibe o vencedor
        this.time.delayedCall(3000, () => {
            this.showWinner(player1Score, player2Score);
        });

        // Botão para voltar ao menu
        this.backButton = this.add.text(512, 600, 'Voltar ao Menu', {
            fontFamily: 'Jacques Francois', fontSize: 32, color: '#C2A385',
            stroke: '#ffffff', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        this.backButton.on('pointerdown', () => {
            this.changeScene();
        });

        this.backButton.on('pointerover', () => {
            this.backButton.setStyle({ color: '#ffcc00' });
        });

        this.backButton.on('pointerout', () => {
            this.backButton.setStyle({ color: '#000000' });
        });

        EventBus.emit('current-scene-ready', this);
    }

    animateProgressBar(score: number, color: number, playerName: string, xPos: number, yPos: number) {
        const maxWidth = 400;
        const barHeight = 30;
        const progressBarWidth = (score / 200) * maxWidth;

        // Cria o fundo da barra
        const barBg = this.add.graphics();
        barBg.fillStyle(0xffffff, 1);
        barBg.fillRect(xPos, yPos, maxWidth, barHeight);

        // Cria a barra de progresso
        const progressBar = this.add.graphics();
        progressBar.fillStyle(color, 1);

        // Exibe o nome do jogador
        this.add.text(xPos - 50, yPos - 40, playerName, { fontFamily: 'Jacques Francois', fontSize: '20px', color: '#C2A385', stroke: '#fffffff', strokeThickness: 5 });

        // Objeto auxiliar para animar a largura
        let tweenObject = { width: 0 };

        this.tweens.add({
            targets: tweenObject,
            width: progressBarWidth,
            duration: 2000,
            ease: 'Power2',
            onUpdate: () => {
                // Redesenha a barra com a largura atualizada
                progressBar.clear();
                progressBar.fillStyle(color, 1);
                progressBar.fillRect(xPos, yPos, tweenObject.width, barHeight);
            }
        });
    }

    showWinner(player1Score: number, player2Score: number) {
        let winnerText = "Empate!";
        let winnerColor = "#ffffff";

        if (player1Score > player2Score) {
            winnerText = "🏆 Player 1 venceu!";
            winnerColor = "#ffaa00";
            this.winSound.play();
        } else if (player2Score > player1Score) {
            winnerText = "🏆 Player 2 venceu!";
            winnerColor = "#00aaff";
            this.winSound.play();
        } else {
            winnerText = "🏆 Ninguém! Deu empate! 🏆 ";
            winnerColor = "#ffffff";
            this.winSound.play();
        }

        const winnerDisplay = this.add.text(512, 500, winnerText, {
            fontFamily: 'Jacques Francois', fontSize: 50, color: winnerColor,
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: winnerDisplay,
            alpha: 1,
            scale: 1.2,
            duration: 1500,
            ease: 'Bounce'
        });
    }

    changeScene() {
        this.scene.start('MainMenu');
    }

    createHeader() {
        const headerWidth = 1080;
        const headerHeight = 100;
        const dotSpacing = 10;
        const dotRadius = 3;
        const rows = Math.floor(headerHeight / dotSpacing);
        const startColor = new Phaser.Display.Color(200, 150, 100);
        const endColor = new Phaser.Display.Color(111, 78, 55);

        for (let y = dotSpacing / 2, rowIndex = 0; y < headerHeight; y += dotSpacing, rowIndex++) {
            const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, rows - 1, rowIndex);
            const colorHex = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
            const alpha = Phaser.Math.Linear(1, 0, rowIndex / (rows - 1));

            for (let x = dotSpacing / 2; x < headerWidth; x += dotSpacing) {
                this.header.fillStyle(colorHex, alpha);
                this.header.fillCircle(x, y, dotRadius);
            }
        }
        this.header.setPosition(0, 0);
    }
}
