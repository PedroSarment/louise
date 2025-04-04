// Complete Game class with all logic including UI, music, random letter sequence puzzle, and transitions
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import io from 'socket.io-client';
import { WebSocketService, webSocketService } from '../../services/websocket';

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

    private puzzleBoard: { id: number, hasDot: boolean }[] = [];
    private puzzleGroup!: Phaser.GameObjects.Container;
    private characters: { [key: string]: number[] } = {
        'A': [0], 'B': [0, 2], 'C': [0, 1], 'D': [0, 1, 3], 'E': [0, 3], 'F': [0, 1, 2], 'G': [0, 1, 2, 3],
        'H': [0, 2, 3], 'I': [1, 2], 'J': [1, 2, 3], 'K': [0, 4], 'L': [0, 2, 4], 'M': [0, 1, 4], 'N': [0, 1, 3, 4],
        'O': [0, 3, 4], 'P': [0, 1, 2, 4], 'Q': [0, 1, 2, 3, 4], 'R': [0, 2, 3, 4], 'S': [1, 2, 4], 'T': [1, 2, 3, 4],
        'U': [0, 4, 5], 'V': [0, 2, 4, 5], 'W': [1, 2, 3, 5], 'X': [0, 1, 4, 5], 'Y': [0, 1, 3, 4, 5], 'Z': [0, 3, 4, 5]
    };

    private brailleMap: { [key: string]: string } = {
        'A': '⠁', 'B': '⠃', 'C': '⠉', 'D': '⠙', 'E': '⠑', 'F': '⠋', 'G': '⠛', 'H': '⠓', 'I': '⠊', 'J': '⠚',
        'K': '⠅', 'L': '⠇', 'M': '⠍', 'N': '⠝', 'O': '⠕', 'P': '⠏', 'Q': '⠟', 'R': '⠗', 'S': '⠎', 'T': '⠞',
        'U': '⠥', 'V': '⠧', 'W': '⠺', 'X': '⠭', 'Y': '⠽', 'Z': '⠵', ' ': ' '
    };

    private minMoves: { [key: string]: number} = {
        'A': 9, 'B': 8, 'C': 13, 'D': 3, 'E': 11, 'F': 6, 'G': 10, 'H': 7, 'I': 10, 'J': 3, 'K': 7, 'L': 9, 'M': 5, 
        'N': 7, 'O': 7, 'P': 7, 'Q': 3, 'R': 3, 'S': 6, 'T': 3, 'U': 7, 'V': 2, 'W': 4, 'X': 5, 'Y': 1, 'Z': 1
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

    private clues = [
        'Encontre o som que o silencio tenta esconder',
        'Caminhe onde o vento leva sonhos perdidos',
        'A verdade mora onde o medo nao entra',
        'O tempo guarda segredos que a pressa nao ve',
        'A sabedoria cresce no solo da escuta',
        'A alma floresce na sombra do cuidado',
        'Ouvir e a arte de tocar sem as maos',
        'Quem espera com fe nunca esta sozinho',
        'Veja com os olhos que o coracao desenha',
        'Ha luz onde o olhar encontra calma',
        'O amor vive onde o ego se cala',
        'O vazio tambem ensina a ser inteiro',
        'Siga onde a duvida ensina mais que a certeza',
        'Busque o silencio onde as palavras pesam',
        'A paz nasce onde o orgulho adormece',
        'O sentido esta no passo e nao no fim',
        'A estrada muda quando o olhar desperta',
        'Escute o vento que fala sem voz',
        'O bem floresce onde o outro tambem sorri',
        'A alma ve o que os olhos ignoram',
        'Toda sombra e convite para acender luz',
        'O destino se revela no agora vivido',
        'Quem aprende com dor carrega leveza',
        'A verdade se esconde em gestos simples',
        'Cure o mundo com o que te cura',
        'A calma e a coragem disfarcada de silencio',
        'Onde ha escuta nasce conexao sincera',
        'A vida pulsa onde ha entrega real',
        'Sinta onde a mente tenta entender',
        'A beleza mora no detalhe esquecido',
        'Toda espera carrega um tipo de fe',
        'Ser leve tambem e forma de resistir',
        'A humildade constrói pontes invisiveis',
        'Quem se conhece nao teme escuridao',
        'O amor verdadeiro nao precisa provar',
        'O tempo traz o que o querer nao força',
        'Viver e arte de cair com elegancia',
        'A sabedoria fala baixo mas toca fundo',
        'A coragem nem sempre grita alto',
        'So enxerga claro quem aceita a neblina',
        'A verdade pesa mas liberta os passos',
        'A escuta transforma mais que o discurso',
        'O presente e tudo que podemos moldar',
        'Quem doa sem esperar ja recebe',
        'A solidao pode ser fonte de encontro',
        'A vida respira onde ha entrega',
        'O caminho certo as vezes assusta',
        'A alma leve dança mesmo sem musica',
        'Ha luz em cada passo consciente',
        'A cura comeca onde a culpa termina',
        'Voce e aquilo que escolhe cultivar',
        'A simplicidade guarda beleza profunda',
        'Todo inicio e chance de recomeço',
        'Quem ama cuida tambem com distancia',
        'A verdade e filha do tempo vivido',
        'A fe sustenta onde a logica falha',
        'O coracao guia quando o mapa some',
        'Sinta o que a pressa te fez esquecer',
        'Seja raiz onde falta firmeza',
        'O silencio da alma e sagrado',
        'Cada erro e convite para clareza',
        'A escuta e presente raro e valioso',
        'A sombra e parte do desenho inteiro',
        'Quem observa aprende sem falar nada',
        'O cuidado muda tudo sem fazer barulho',
        'A entrega revela o que o medo esconde',
        'Ser e mais do que parecer certo',
        'Ha sabedoria em aceitar o nao saber',
        'A liberdade comeca na mente serena',
        'Todo gesto sincero deixa rastro eterno',
        'A esperanca nasce do simples respiro',
        'A brisa leve traz verdades profundas',
        'O agora guarda todos os caminhos',
        'Quem sente entende sem explicacao',
        'A alma cansada pede escuta gentil',
        'Toda despedida carrega renascimento',
        'O destino e moldado por pequenas escolhas',
        'A beleza brota onde ha cuidado',
        'Ser gentil e um ato de coragem',
        'A vida pede mais toque que palavra',
        'So ha verdade onde ha vulnerabilidade',
        'O silencio ilumina o que o ruido esconde',
        'Todo gesto de amor e revolucao',
        'A fe e o farol na noite escura',
        'Seja paz onde o caos quer vencer',
        'A alma encontra sentido no caminho',
        'O chao firme nasce de dentro',
        'Ser inteiro e aceitar todas as partes',
        'A vida acontece onde ha presenca',
        'A brisa leve tambem move montanhas',
        'Quem respeita o tempo planta flores',
        'A escuta e semente de empatia',
        'A serenidade e a força que acolhe',
        'Toda escolha e um tipo de arte',
        'A humildade ensina mais que o saber',
        'A cura e um sim repetido ao coracao',
        'So e livre quem se perdoa primeiro',
        'Toda sombra pede um novo olhar',
        'A espera pode ser caminho tambem',
        'O simples guarda o que e essencial',
        'Quem sente profundamente toca o eterno',
        'A luz mora onde ha compaixao',
        'Aceitar tambem e forma de amar',
        'A gratidao transforma a percepcao do mundo',
      ];
      
    private chosenClue: string = '';
    private brailleTranslation: string = '';

    private tryAgainText!: Phaser.GameObjects.Text;
    private clueTextGroup!: Phaser.GameObjects.Container;
    private socket: WebSocketService;


    constructor() {
        super('Game');

        this.initSocket()
    }


    initSocket() {
        this.socket = webSocketService;
        this.socket.connect('ws://localhost:3000');
    }

    // DESIGN
    preload() {
        this.load.audio('backgroundMusic', 'assets/audio/background.m4a');
        this.load.image('background', 'assets/background.png');
        this.load.image('dotsPuzzle', 'assets/dotsPuzzle.png');
        this.load.image('header1', 'assets/Header1.png');
        this.load.image('header2', 'assets/Header2.png');
        this.load.image('Behind', 'assets/Behind 1.png');
        this.load.image('Menu3CategF', 'assets/Menu3CategoriesFront.png');
        this.load.image('Menu3CategB', 'assets/Menu3CategoriesBehind.png');
        this.load.image('Menu2', 'assets/Menu2.png');
        this.load.image('Menu1', 'assets/Menu1.png');
        this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');
        this.bgMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.1 });
        this.bgMusic.play();

        this.header = this.add.graphics();
        const headerWidth = 1080, headerHeight = 100, dotSpacing = 10, dotRadius = 3;
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

        this.titleLouise = this.add.text(512, 100, 'Louise', {
            fontFamily: 'Love Light', fontSize: '150px', color: '#C2A385', stroke: '#ffffff', strokeThickness: 5,
            shadow: { color: '#000000', fill: true, offsetX: 5, offsetY: 5, blur: 5 }, letterSpacing: 5
        }).setOrigin(0.5);

        this.boxTimer = this.add.image(512, 200, 'header1').setDisplaySize(192, 60).setOrigin(0.5);
        this.timerText = this.add.text(512, 200, '01:00', {
            fontFamily: 'Love Light', fontSize: '50px', color: '#000000' }).setOrigin(0.5);
        this.startTimer();

        this.boxPlayer1 = this.add.image(124, 30, 'header2').setDisplaySize(150, 40).setOrigin(0.5);
        this.player1Text = this.add.text(124, 30, 'Jogador 1', {
            fontFamily: 'Jacques Francois', fontSize: '20px', color: '#000000' }).setOrigin(0.5);

        this.boxPlayer2 = this.add.image(924, 30, 'header2').setDisplaySize(150, 40).setOrigin(0.5);
        this.player2Text = this.add.text(924, 30, 'Jogador 2', {
            fontFamily: 'Jacques Francois', fontSize: '20px', color: '#000000' }).setOrigin(0.5);

        this.boxProgress1 = this.add.image(174, 65, 'Behind').setDisplaySize(300, 50).setOrigin(0.5);
        this.player1Progress = this.add.graphics();
        this.updateProgressBar(this.player1Progress, 174, 80, this.player1ProgressValue);

        this.boxProgress2 = this.add.image(874, 65, 'Behind').setDisplaySize(300, 50).setOrigin(0.5);
        this.player2Progress = this.add.graphics();
        this.updateProgressBarReverse(this.player2Progress, 774, 60, this.player2ProgressValue);



        this.tryAgainText = this.add.text(512, 290, 'Try again!', {
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5).setVisible(false).setDepth(10); // Make sure it's higher than the image's depth
        ;
        




        this.chosenClue = this.clues[Math.floor(Math.random() * this.clues.length)];
    
        this.generateCharSequence();
   
        // Generate Braille translation, removing spaces and line breaks
        this.brailleTranslation = this.translateToBraille(this.chosenClue);
    
        // Render images first to set up the layout
        this.boxClueText = this.add.image(200, 330, 'Menu1').setDisplaySize(303.8, 308.7).setOrigin(0.5);
        this.boxPuzzle = this.add.image(512, 375, 'Menu2').setDisplaySize(209.3, 247.8).setOrigin(0.5);
        this.boxBraille = this.add.image(844, 330, 'Menu1').setDisplaySize(303.8, 308.7).setOrigin(0.5);
    

        this.renderBrailleTranslation();
        this.currentChar = this.puzzleSequence[0];
        this.renderClueText();

        // Initialize first puzzle
        this.initializePuzzleBoard();
        this.renderPuzzleBoard();

        
        this.checkSolutionBtn = this.add.text(512, 550, 'Check Solution', {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', backgroundColor: '#6f4e37', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.checkPuzzleSolution());

        this.finishPhaseBtn = this.add.text(512, 610, 'Finalizar Fase', {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', backgroundColor: '#6f4e37', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.finishPhase());

        EventBus.emit('current-scene-ready', this);

    }

    // makes the text translation to braille, keeping an original array and creating an empty slots one
    private translateToBraille(text: string): string {
        const uppercaseText = text.toUpperCase();
        this.originalBrailleArray = uppercaseText.split('').map(char => this.brailleMap[char] || char);
        this.brailleArray = [...this.originalBrailleArray];
        this.missingBraillePositions = {};
    
        let charOccurrences: { [key: string]: number[] } = {};
    
        for (let i = 0; i < this.brailleArray.length; i++) {
            const originalChar = uppercaseText[i];
            if (this.charSequence.includes(originalChar) && originalChar !== ' ') { 
                if (!charOccurrences[originalChar]) {
                    charOccurrences[originalChar] = [];
                }
                charOccurrences[originalChar].push(i);
            }
        }
    
        let removalList: { char: string, position: number }[] = [];
    
        // Select **one** occurrence per character and track position
        for (const char of this.charSequence) {
            if (charOccurrences[char] && charOccurrences[char].length > 0) {
                const randomIndex = Math.floor(Math.random() * charOccurrences[char].length);
                const position = charOccurrences[char][randomIndex];
    
                this.brailleArray[position] = '_';  // Hide character in Braille
                this.missingBraillePositions[char] = position; // Track missing character position
                removalList.push({ char, position });
            }
        }
    
        removalList.sort((a, b) => a.position - b.position);
        this.puzzleSequence = removalList.map(item => item.char);
    
        return this.brailleArray.join('');
    }
    
    
    // renders the clue and array of chars
    private generateCharSequence(): void {
        const charMap: { [key: string]: number } = {};
    
        // Convert to uppercase and keep spaces in the text
        const cleanedSentence = this.chosenClue.toUpperCase();
    
        // Count occurrences of each character **ignoring spaces**
        for (const char of cleanedSentence) {
            if (char !== ' ') {
                charMap[char] = (charMap[char] || 0) + 1;
            }
        }
    
        // Create an array of characters that appear more than once
        let possibleReplacements: string[] = [];
        for (const [char, count] of Object.entries(charMap)) {
            if (count > 1) {
                possibleReplacements.push(char);
            }
        }
    
        this.charSequence = this.shuffleArray(possibleReplacements).slice(0, Math.min(6, possibleReplacements.length));
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
        const maxWidth = boxWidth - (padding * 2);
        
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
        const currentCharPosition = this.missingBraillePositions[this.currentChar];
        console.log(currentCharPosition);
        
        // Process each word
        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
            const word = words[wordIndex].toUpperCase();
            const wordWidth = word.length * letterSpacing;
            
            // Check if we need to start a new line
            if ((lineWidth + wordWidth) > maxWidth) {
                x = 0;
                y += lineHeight;
                lineWidth = 0;
                lines++;
            }
            
            // Process each letter in the word
            for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
                const letter = word[letterIndex];
                
                // Check if this letter is the current puzzle character (direct position comparison)
                const isCurrentPuzzleLetter = charIndex === currentCharPosition;
                
                console.log(isCurrentPuzzleLetter);
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
            this.boxClueText.x - (maxWidth / 2),
            this.boxClueText.y - (totalHeight / 2) + 10 // Small vertical adjustment
        );
    }
    

    // braille text space
    private renderBrailleTranslation(): void {
        const startX = 755, startY = 250, charWidth = 25, charHeight = 40;
        const maxColumns = 8;
        const brailleChars = this.brailleTranslation.split('');
    
        brailleChars.forEach((char, index) => {
            const x = startX + (index % maxColumns) * charWidth;
            const y = startY + Math.floor(index / maxColumns) * charHeight;
    
            this.add.text(x, y, char, {
                fontSize: '18px',
                color: char === ' ' ? '#888888' : '#000000',
                fontFamily: 'Love Light'
            }).setOrigin(0.5);
        });
    }
    
    // puzzle board styling
    private renderPuzzleBoard(): void {
        if (this.puzzleGroup) this.puzzleGroup.destroy(true);
        this.puzzleGroup = this.add.container(this.boxPuzzle.x - 50, this.boxPuzzle.y - 60);
        const tileWidth = 40, tileHeight = 40, gap = 5;

        for (let i = 0; i < 6; i++) {
            const col = i % 2, row = Math.floor(i / 2);
            const x = col * (tileWidth + gap), y = row * (tileHeight + gap);
            
            const isEmpty = this.puzzleBoard[i].id === 0;

            if (!isEmpty) {
                const rect = this.add.rectangle(x + tileWidth / 2, y + tileHeight / 2, tileWidth, tileHeight, 0xC2A385).setOrigin(0.5);
                rect.setInteractive().on('pointerdown', () => this.movePuzzleTile(i));
                this.puzzleGroup.add(rect);
                
                if (this.puzzleBoard[i].hasDot) {
                    const dot = this.add.text(x + tileWidth / 2, y + tileHeight / 2, '●', { fontSize: '24px', color: '#000000' }).setOrigin(0.5);
                    this.puzzleGroup.add(dot);
                }
            }
        }
    }

    // Loads the puzzle board for the current CHAR
    private initializePuzzleBoard(): void {
        this.moveCount = 0;
        const dots = this.boardSelectionPuzzle(this.characters[this.currentChar].length);
        this.puzzleBoard = Array.from({ length: 6 }, (_, index) => ({ id: index, hasDot: dots.includes(index) }));
    }

    private shuffleArray(array: string[]): string[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Array of valid moves and calculation of movements made by the player in each CHAR
    private movePuzzleTile(index: number): void {
        const emptyIndex = this.puzzleBoard.findIndex(tile => tile.id === 0);
        const validMoves: { [key: number]: number[] } = {
            0: [1, 2], 1: [0, 3], 2: [0, 3, 4], 3: [1, 2, 5], 4: [2, 5], 5: [3, 4]
        };
    
        if (validMoves[emptyIndex].includes(index)) {
            [this.puzzleBoard[emptyIndex], this.puzzleBoard[index]] = 
            [this.puzzleBoard[index], this.puzzleBoard[emptyIndex]];
    
            this.moveCount++;    
            this.renderPuzzleBoard();
        }
    }    

    // Check the puzzle solution
    private checkPuzzleSolution(): void {    
        // the correct char solution
        const correct = this.characters[this.currentChar] ? [...this.characters[this.currentChar]].sort() : [];

        // current board
        const current = this.puzzleBoard
            .map((t, i) => (t.hasDot ? i : -1))
            .filter(i => i !== -1)
            .sort();
        
        // check if correct = current
        const success = correct.length === current.length && correct.every((val, idx) => val === current[idx]);
    
        // correct = current
        if (success) {
            // takes possible try again text off the screen
            this.tryAgainText.setVisible(false);
    
            // remakes the braille array to fill the current empty char
            for (let i = 0; i < this.brailleArray.length; i++) {
                if (this.brailleArray[i] === '_' && this.originalBrailleArray[i] === this.brailleMap[this.currentChar]) {
                    this.brailleArray[i] = this.originalBrailleArray[i];
                    this.brailleTranslation = this.brailleArray.join('');
                    break;
                }
            }
            this.renderBrailleTranslation();
    
            // Add the points for solving the char, being the time left/amount of moves made over the minimum amount
            this.points += this.timeLeft / ((this.moveCount - (this.minMoves[this.currentChar])));

            // loads the next char if there is any
            if (this.currentCharIndex < (this.puzzleSequence.length - 1)) {
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
            this.tryAgainText.setVisible(true);
        }
    }
    

    // Puzzle board generation based on the amount of Dots there is in the CHAR
    private boardSelectionPuzzle(size: number): number[] {
        switch (size) {
            case 1: return [5];
            case 2: return [4, 5];
            case 3: return [1, 3, 5];
            case 4: return [2, 3, 4, 5];
            case 5: return [1, 2, 3, 4, 5];
            default: return [];
        }
    }  

    // ---------------- Fim da lógica do Puzzle ---------------- //

    private startTimer(): void
    {
        this.timeLeft = 180;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                if (this.timeLeft < 0) {
                    this.timeLeft = 0;
                    this.timerEvent.remove(false);
                    this.finishPhase();
                }
                this.updateTimerText();
            },
            loop: true
        });
    }

    private updateTimerText(): void
    {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerText.setText(formatted);
    }

    private updateProgressBar(progressBar: Phaser.GameObjects.Graphics, x: number, y: number, progressValue: number) {
        const width = 250;
        const progressWidth = (width * progressValue) / 100;
    
        progressBar.clear();
        progressBar.fillStyle(0xC2A385, 1);
        progressBar.fillRect(x - width / 2, y - 10, progressWidth, 20);
    }

    private updateProgressBarReverse(progressBar: Phaser.GameObjects.Graphics, x: number, y: number, progressValue: number) {
        const width = 250;
        const progressWidth = (width * progressValue) / 100;
    
        progressBar.clear();
        progressBar.fillStyle(0xC2A385, 1);
        progressBar.fillRect(x + width / 2 - progressWidth, y - 10, progressWidth, 20);
    }

    override update () {
        // Simulação de progresso dos jogadores
        if (this.player1ProgressValue < 100) {
            this.player1ProgressValue += 0.5;
        }
        if (this.player2ProgressValue < 100) {
            this.player2ProgressValue += 0.3;
        }

        this.updateProgressBar(this.player1Progress, 120, 60, this.player1ProgressValue);
        this.updateProgressBarReverse(this.player2Progress, 774, 60, this.player2ProgressValue);
    }

    private gameOver(): void
    {
        this.timerEvent.remove(false);
        this.bgMusic.stop();
        this.scene.start('GameOver');
    }

    private finishPhase(): void
    {
        this.gameOver();
    }
}
