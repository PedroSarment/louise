// Complete Game class with all logic including UI, music, random letter sequence puzzle, and transitions
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import io from 'socket.io-client';
import { WebSocketService, webSocketService } from '../../services/websocket';
import { riddlesService } from '../../services/riddles';
import { roundsService } from '../../services/rounds';
import { brailleService } from '../../services/braille';
import { Riddle } from '../../interfaces/riddle.interface';
import { characters } from '../../helpers/caracteres';
import { brailleMap } from '../../helpers/brailleMap';
import { roomService } from '../../services/room';
import { userService } from '../../services/user';
import { Subscription } from 'rxjs';

export class Game extends Scene {
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
    private checkSolutionBtn!: Phaser.GameObjects.Text;
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
    private player1ProgressValue: number = 0;
    private player2ProgressValue: number = 0;
    boxClueText!: Phaser.GameObjects.Image;
    boxPuzzle!: Phaser.GameObjects.Image;
    boxBraille!: Phaser.GameObjects.Image;
    bgMusic!: Phaser.Sound.BaseSound;
    private resultPopupContainer?: Phaser.GameObjects.Container;
    private gameOverTriggered = false;

    private puzzleBoard: { id: number; hasDot: boolean }[] = [];
    private puzzleGroup!: Phaser.GameObjects.Container;

    private minMoves: { [key: string]: number } = {
        A: 9,
        B: 8,
        C: 13,
        D: 3,
        E: 11,
        F: 6,
        G: 10,
        H: 7,
        I: 10,
        J: 3,
        K: 7,
        L: 9,
        M: 5,
        N: 7,
        O: 7,
        P: 7,
        Q: 3,
        R: 3,
        S: 6,
        T: 3,
        U: 7,
        V: 2,
        W: 4,
        X: 5,
        Y: 1,
        Z: 1,
    };

    // private solutionClicks: { [key: string]: number[] } = {
    //     A: [1, 3, 5, 4, 2, 3, 1, 0, 2], B: [2, 4, 5, 3, 1, 0, 2, 4], C: [2, 4, 5, 3, 1, 0, 2, 4, 5, 3, 1, 0, 2], D: [1, 3, 5],
    //     E: [1, 3, 5, 4, 2, 3, 1, 0, 2, 3, 5], F: [1, 3, 5, 4, 2, 3], G: [2, 3, 1, 0, 2, 4, 5, 3, 2, 4], H: [1, 3, 2, 0, 1, 3, 5],
    //     I: [2, 4, 5, 3, 2, 0, 1, 3, 2, 4], J: [2, 3, 5], K: [2, 4, 5, 3, 1, 0, 2], L: [1, 3, 2, 4, 5, 3, 2, 0, 1], M: [1, 3, 2, 4, 5],
    //     N: [1, 3, 2, 0, 1, 3, 5], O: [1, 3, 2, 4, 5, 3, 1], P: [2, 3, 1, 0, 2, 4, 5], Q: [1, 3, 5], R: [2, 3, 5], S: [2, 3, 5, 4, 2, 3],
    //     T: [1, 3, 5], U: [2, 4, 5, 3, 2, 0, 1], V: [2, 3], W: [1, 3, 2, 4], X: [2, 3, 1, 0, 2], Y: [2], Z: [2]
    // };

    private charSequence: string[] = [];
    private currentCharIndex: number = 0;
    private currentChar: string = '';
    private moveCount: number = 0;
    private points: number = 0;

    private puzzleSequence: string[] = [];
    private brailleArray: string[] = [];
    private originalBrailleArray: string[] = [];
    private missingBraillePositions: { [key: string]: number } = {};

    private chosenClue: string = '';
    private brailleTranslation: string = '';

    private tryAgainText!: Phaser.GameObjects.Text;
    private clueTextGroup!: Phaser.GameObjects.Container;
    private socket: WebSocketService;
    private propagateStopSub?: Subscription;
    endTime: number;

    constructor() {
        super('Game');
        this.initSocket();
    }

    initSocket() {
        this.socket = webSocketService;
        this.socket.connect('ws://localhost:3000');
    }

    // DESIGN
    preload() {
        // this.load.audio('backgroundMusic', 'assets/audio/background.m4a');
        // this.load.image('background', 'assets/background.png');
        // this.load.image('dotsPuzzle', 'assets/dotsPuzzle.png');
        // this.load.image('header1', 'assets/Header1.png');
        // this.load.image('header2', 'assets/Header2.png');
        // this.load.image('Behind', 'assets/Behind 1.png');
        // this.load.image('Menu3CategF', 'assets/Menu3CategoriesFront.png');
        // this.load.image('Menu3CategB', 'assets/Menu3CategoriesBehind.png');
        // this.load.image('Menu2', 'assets/Menu2.png');
        // this.load.image('Menu1', 'assets/Menu1.png');
        // this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        // this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
    }

    create() {
        console.log('entrou aqui');

        this.events.once('destroy', () => {
            this.propagateStopSub?.unsubscribe();
        });

        this.points = 0;
        this.timeLeft = 60;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const level = roundsService.currentRound;

        const levelTextValue = `Nível: ${level}`;
        this.add
            .text(centerX - 20, centerY - 300, levelTextValue, {
                fontFamily: 'Love Light',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000',
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        if (this.resultPopupContainer) {
            this.resultPopupContainer.destroy(true);
            this.resultPopupContainer = undefined;
        }

        this.background = this.add.image(512, 384, 'background');
        this.bgMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.1,
        });
        this.bgMusic.play();

        //this.header = this.add.graphics();
        //const headerWidth = 1080, headerHeight = 100, dotSpacing = 10, dotRadius = 3;
        //const rows = Math.floor(headerHeight / dotSpacing);
        //const startColor = new Phaser.Display.Color(200, 150, 100);
        //const endColor = new Phaser.Display.Color(111, 78, 55);
        //for (let y = dotSpacing / 2, rowIndex = 0; y < headerHeight; y += dotSpacing, rowIndex++) {
        //    const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, rows - 1, rowIndex);
        //    const colorHex = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
        //    const alpha = Phaser.Math.Linear(1, 0, rowIndex / (rows - 1));
        //    for (let x = dotSpacing / 2; x < headerWidth; x += dotSpacing) {
        //        this.header.fillStyle(colorHex, alpha);
        //        this.header.fillCircle(x, y, dotRadius);
        //    }
        //}
        //this.header.setPosition(0, 0);

        this.titleLouise = this.add
            .text(512, 100, 'Louise', {
                fontFamily: 'Love Light',
                fontSize: '150px',
                color: '#C2A385',
                stroke: '#ffffff',
                strokeThickness: 5,
                shadow: {
                    color: '#000000',
                    fill: true,
                    offsetX: 5,
                    offsetY: 5,
                    blur: 5,
                },
                letterSpacing: 5,
            })
            .setOrigin(0.5);

        this.boxTimer = this.add
            .image(512, 200, 'header1')
            .setDisplaySize(192, 60)
            .setOrigin(0.5);
        this.timerText = this.add
            .text(512, 200, '01:00', {
                fontFamily: 'Love Light',
                fontSize: '50px',
                color: '#000000',
            })
            .setOrigin(0.5);
        this.startTimer();

        this.boxPlayer1 = this.add
            .image(124, 30, 'header2')
            .setDisplaySize(150, 40)
            .setOrigin(0.5);
        this.player1Text = this.add
            .text(124, 30, userService.getUser().name, {
                fontFamily: 'Jacques Francois',
                fontSize: '20px',
                color: '#000000',
            })
            .setOrigin(0.5);

        this.boxPlayer2 = this.add
            .image(924, 30, 'header2')
            .setDisplaySize(150, 40)
            .setOrigin(0.5);
        this.player2Text = this.add
            .text(924, 30, roomService.getRoom().adversary ?? 'Jogador 2', {
                fontFamily: 'Jacques Francois',
                fontSize: '24px',
                color: '#000000',
            })
            .setOrigin(0.5);

        // this.tryAgainText = this.add
        //     .text(512, 290, 'Try again!', {
        //         fontSize: '24px',
        //         color: '#ff0000',
        //     })
        //     .setOrigin(0.5)
        //     .setVisible(false)
        //     .setDepth(10); // Make sure it's higher than the image's depth
        const riddle = riddlesService.getCurrentRiddle(
            roundsService.currentRound - 1
        );

        if (!riddle) {
            throw new Error('Riddle not found');
        }

        this.chosenClue = riddle.text;

        //this.generateCharSequence();

        // Generate Braille translation, removing spaces and line breaks
        this.brailleTranslation = this.translateToBraille(riddle);

        // Render images first to set up the layout
        this.boxClueText = this.add
            .image(200, 330, 'Menu1')
            .setDisplaySize(303.8, 308.7)
            .setOrigin(0.5);
        this.boxPuzzle = this.add
            .image(512, 375, 'Menu2')
            .setDisplaySize(209.3, 247.8)
            .setOrigin(0.5);
        this.boxBraille = this.add
            .image(844, 330, 'Menu1')
            .setDisplaySize(303.8, 308.7)
            .setOrigin(0.5);

        this.renderBrailleTranslation();
        this.currentChar = this.puzzleSequence[0];
        this.renderClueText();

        // Initialize first puzzle
        this.initializePuzzleBoard();
        this.renderPuzzleBoard();

        EventBus.emit('current-scene-ready', this);

        webSocketService.listenOnce('propagate-stop', (result: any) => {
            this.showMatchResultPopup(this.points, result);
        });

        this.gameOverTriggered = false;

        webSocketService.listenOnce('propagate-continue', (result: any) => {
            console.log('propagate-continue');
            console.log('já foi chamado', this.gameOverTriggered);

            this.bgMusic.stop();
            this.gameover();
            this.gameOverTriggered = true;
        });
    }

    // makes the text translation to braille, keeping an original array and creating an empty slots one
    private translateToBraille(riddle: Riddle): string {
        this.originalBrailleArray = brailleService.translate(riddle.text);
        this.brailleArray = brailleService.translate(riddle.riddle_easy);

        this.puzzleSequence = riddle.riddle_easy
            .split('')
            .map((char, index) =>
                char === '_' ? riddle.text[index].toUpperCase() : null
            )
            .filter((char): char is string => char !== null);

        return this.brailleArray.join('');
    }

    // sentence text space
    private renderClueText(): void {
        // Remove existing text if any
        if (this.clueTextGroup) {
            this.clueTextGroup.destroy(true);
        }

        // Create new container
        this.clueTextGroup = this.add.container(0, 0);

        // Get dimensions from the background image
        const boxWidth = this.boxClueText.displayWidth;
        const boxHeight = this.boxClueText.displayHeight;
        const padding = 30; // Padding from edges
        const maxWidth = boxWidth - padding * 2;

        // Split the clue into words
        const words = this.chosenClue.split(' ');
        const lineHeight = 40;
        const letterSpacing = 10;
        const wordSpacing = 15;

        let x = 0;
        let y = 0;
        let lineWidth = 0;
        let lines = 1;

        // Calculate how many characters we can fit per line
        const charsPerLine = Math.floor(maxWidth / letterSpacing);

        // Track absolute character index for the entire text
        let charIndex = 0;

        // Get the position of the current character we're trying to solve
        const currentCharPosition =
            this.missingBraillePositions[this.currentChar];
            this.missingBraillePositions[this.currentChar];

        // Process each word
        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
            const word = words[wordIndex].toUpperCase();
            const wordWidth = word.length * letterSpacing;

            // Check if we need to start a new line
            if (lineWidth + wordWidth > maxWidth) {
                x = 0;
                y += lineHeight;
                lineWidth = 0;
                lines++;
            }

            // Process each letter in the word
            for (
                let letterIndex = 0;
                letterIndex < word.length;
                letterIndex++
            ) {
                const letter = word[letterIndex];
            

                const isCurrentPuzzleLetter = this.brailleArray[charIndex] === '_' && this.originalBrailleArray[charIndex] === brailleMap[this.currentChar];

                // Create text object for this letter with appropriate color
                const letterText = this.add.text(x, y, letter, {
                    color: isCurrentPuzzleLetter ? '#FF0000' : '#000000', // Orange highlight or black
                });

                // Add to container
                this.clueTextGroup.add(letterText);

                // Update position for next letter
                x += letterSpacing;
                lineWidth += letterSpacing;

                // Increment character index
                charIndex++;
            }

            // Add space after word (except for last word)
            if (wordIndex < words.length - 1) {
                x += wordSpacing - letterSpacing;
                lineWidth += wordSpacing - letterSpacing;
                charIndex++; // Account for space character
            }
        }

        // Center the text container within the background box
        const totalHeight = lines * lineHeight;
        this.clueTextGroup.setPosition(
            this.boxClueText.x - maxWidth / 2,
            this.boxClueText.y - totalHeight / 2 + 10 // Small vertical adjustment
        );
    }

    // braille text space
    private renderBrailleTranslation(): void {
        const startX = 755,
            startY = 250,
            charWidth = 25,
            charHeight = 40;
        const maxColumns = 8;
        const brailleChars = this.brailleTranslation.split('');

        brailleChars.forEach((char, index) => {
            const x = startX + (index % maxColumns) * charWidth;
            const y = startY + Math.floor(index / maxColumns) * charHeight;

            this.add
                .text(x, y, char, {
                    fontSize: '18px',
                    color: char === ' ' ? '#888888' : '#000000',
                    fontFamily: 'Love Light',
                })
                .setOrigin(0.5);
        });
    }

    // puzzle board styling
    private renderPuzzleBoard(): void {
        if (this.puzzleGroup) this.puzzleGroup.destroy(true);
        this.puzzleGroup = this.add.container(
            this.boxPuzzle.x - 50,
            this.boxPuzzle.y - 60
        );
        const tileWidth = 40,
            tileHeight = 40,
            gap = 5;

        for (let i = 0; i < 6; i++) {
            const col = i % 2,
                row = Math.floor(i / 2);
            const x = col * (tileWidth + gap),
                y = row * (tileHeight + gap);

            const isEmpty = this.puzzleBoard[i].id === 0;

            if (!isEmpty) {
                const rect = this.add
                    .rectangle(
                        x + tileWidth / 2,
                        y + tileHeight / 2,
                        tileWidth,
                        tileHeight,
                        0xc2a385
                    )
                    .setOrigin(0.5);
                rect.setInteractive().on('pointerdown', () =>
                    this.movePuzzleTile(i)
                );
                this.puzzleGroup.add(rect);

                if (this.puzzleBoard[i].hasDot) {
                    const dot = this.add
                        .text(x + tileWidth / 2, y + tileHeight / 2, '●', {
                            fontSize: '24px',
                            color: '#000000',
                        })
                        .setOrigin(0.5);
                    this.puzzleGroup.add(dot);
                }
            }
        }
    }

    // Loads the puzzle board for the current CHAR
    private initializePuzzleBoard(): void {
        this.moveCount = 0;
        console.log('Current char:', this.currentChar);
        console.log('Current char index:', characters[this.currentChar].length);
        const dots = this.boardSelectionPuzzle(
            characters[this.currentChar].length
        );
        this.puzzleBoard = Array.from({ length: 6 }, (_, index) => ({
            id: index,
            hasDot: dots.includes(index),
        }));
    }

    // Array of valid moves and calculation of movements made by the player in each CHAR
    private movePuzzleTile(index: number): void {
        const emptyIndex = this.puzzleBoard.findIndex((tile) => tile.id === 0);
        const validMoves: { [key: number]: number[] } = {
            0: [1, 2],
            1: [0, 3],
            2: [0, 3, 4],
            3: [1, 2, 5],
            4: [2, 5],
            5: [3, 4],
        };

        if (validMoves[emptyIndex].includes(index)) {
            [this.puzzleBoard[emptyIndex], this.puzzleBoard[index]] = [
                this.puzzleBoard[index],
                this.puzzleBoard[emptyIndex],
            ];

            this.moveCount++;
            this.renderPuzzleBoard();
        }

        const success = this.checkSuccess();

        this.checkPuzzleSolution();
    }

    private checkSuccess(): boolean {
        const correct = characters[this.currentChar]
            ? [...characters[this.currentChar]].sort()
            : [];

        // current board
        const current = this.puzzleBoard
            .map((t, i) => (t.hasDot ? i : -1))
            .filter((i) => i !== -1)
            .sort();

        return (
            correct.length === current.length &&
            correct.every((val, idx) => val === current[idx])
        );
    }

    // Check the puzzle solution
    private checkPuzzleSolution(): void {
        // check if correct = current
        const success = this.checkSuccess();

        // correct = current
        if (success) {
            roomService.getRoom().addPointToUser(1);


            // remakes the braille array to fill the current empty char
            for (let i = 0; i < this.brailleArray.length; i++) {
                if (
                    this.brailleArray[i] === '_' &&
                    this.originalBrailleArray[i] ===
                        brailleMap[this.currentChar]
                ) {
                    this.brailleArray[i] = this.originalBrailleArray[i];
                    this.brailleTranslation = this.brailleArray.join('');
                    break;
                }
            }
            this.renderBrailleTranslation();

            // Add the points for solving the char, being the time left/amount of moves made over the minimum amount
            this.points += 1;

            // loads the next char if there is any
            if (this.currentCharIndex < this.puzzleSequence.length - 1) {
                this.currentCharIndex++;
                this.currentChar = this.puzzleSequence[this.currentCharIndex];

                this.initializePuzzleBoard();
                this.renderPuzzleBoard();
                this.renderClueText();


                // No next char, end of game
            } else {
                // PUXAR CODIGO DE FIM DE JOGO
                this.checkSolutionBtn.setText('Complete!');
                this.checkSolutionBtn.disableInteractive();
            }
            // wrong solution, try again text is displayed
        } else {
            //this.tryAgainText.setVisible(true);
        }
    }

    // Puzzle board generation based on the amount of Dots there is in the CHAR
    private boardSelectionPuzzle(size: number): number[] {
        switch (size) {
            case 1:
                return [5];
            case 2:
                return [4, 5];
            case 3:
                return [1, 3, 5];
            case 4:
                return [2, 3, 4, 5];
            case 5:
                return [1, 2, 3, 4, 5];
            default:
                return [];
        }
    }

    // ---------------- Fim da lógica do Puzzle ---------------- //

    private startTimer(): void {
        const matchDurationInSeconds = 360;
        const matchDurationInMs = matchDurationInSeconds * 1000;

        this.endTime = Date.now() + matchDurationInMs;

        this.timerEvent = this.time.addEvent({
            delay: 100,
            callback: () => {
                const remainingMs = this.endTime - Date.now();
                this.timeLeft = Math.max(0, Math.ceil(remainingMs / 1000));

                if (this.timeLeft <= 0) {
                    this.timerEvent.remove(false);
                    this.finishPhase();
                }

                this.updateTimerText();
            },
            loop: true,
        });
    }

    private updateTimerText(): void {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const formatted = `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
        this.timerText.setText(formatted);
    }

    override update() {
        // Simulação de progresso dos jogadores
    }

    private finishPhase(): void {
        const success = this.checkSuccess();
        this.timerEvent.remove(false);
        this.bgMusic.stop();

        webSocketService.emit('stop', this.points, () => {});
    }

    private showMatchResultPopup(
        userPoints: number,
        adversaryPoints: number
    ): void {
        let title = '';
        let subtitle = '';
        let color = '';

        if (userPoints > adversaryPoints) {
            title = 'Parabéns!';
            subtitle = `Você ganhou essa partida, você fez ${userPoints} ponto${
                userPoints === 1 ? '' : 's'
            } e seu adversário ${adversaryPoints}.`;
            color = '#006400'; // verde escuro

            roomService.getRoom().addPointToUser(1);
        } else if (userPoints < adversaryPoints) {
            title = 'Que pena, você perdeu =(';
            subtitle = `Você fez ${userPoints} ponto${
                userPoints === 1 ? '' : 's'
            } e seu adversário ${adversaryPoints}.`;
            color = '#8B0000'; // vermelho escuro
            roomService.getRoom().addPointsToAdversary(1);
        } else {
            title = 'Nossa, deu empate!';
            subtitle = `Você e seu adversário fizeram ${userPoints} ponto${
                userPoints === 1 ? '' : 's'
            }!`;
            color = '#444444'; // cinza
        }

        this.resultPopupContainer = this.add.container(0, 0);

        const box = this.add
            .rectangle(512, 384, 580, 280, 0xffffff, 1)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(100)
            .setOrigin(0.5);

        const titleText = this.add
            .text(512, 320, title, {
                fontSize: '46px',
                fontFamily: 'Love Light',
                color,
                stroke: '#000000',
                strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setDepth(101);

        const subText = this.add
            .text(512, 375, subtitle, {
                fontSize: '22px',
                fontFamily: 'Jacques Francois',
                color: '#333333',
                align: 'center',
                wordWrap: { width: 500 },
            })
            .setOrigin(0.5)
            .setDepth(101);

        const continueBtn = this.add
            .text(
                512,
                440,
                roundsService.isLastRound()
                    ? 'Visualizar Resultado'
                    : 'Continuar',
                {
                    fontSize: '22px',
                    fontFamily: 'Jacques Francois',
                    color: '#ffffff',
                    backgroundColor: '#6f4e37',
                    padding: { x: 20, y: 10 },
                }
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(101)
            .on('pointerover', () =>
                continueBtn.setStyle({ backgroundColor: '#8c6451' })
            )
            .on('pointerout', () =>
                continueBtn.setStyle({ backgroundColor: '#6f4e37' })
            )
            .on('pointerdown', () => {
                webSocketService.emit('continue', () => {
                    console.log('emitiu continue');
                });

                this.gameover();
            });

        this.resultPopupContainer.add([box, titleText, subText, continueBtn]);
    }

    private gameover = () => {
        this.bgMusic.stop();

        if (this.gameOverTriggered) return;

        if (this.resultPopupContainer) {
            this.resultPopupContainer.setVisible(false);
            this.resultPopupContainer.destroy(true);
            this.resultPopupContainer = undefined;
        }

        if (roundsService.isLastRound()) {
            this.scene.stop('Game');

            setTimeout(() => {
                this.scene.start('GameOver');
            }, 200);
        } else {
            roundsService.incrementRound();

            this.scene.stop('Game');

            setTimeout(() => {
                if (roomService.created) {
                    this.scene.start('WaitingRoom');
                } else {
                    this.scene.start('WaitingEnterRoom');
                }
            }, 200);
        }
    };
}
