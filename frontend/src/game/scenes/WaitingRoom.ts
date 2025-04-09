import { Scene } from 'phaser';
import { roomService } from '../../services/room';
import { webSocketService } from '../../services/websocket';
import { userService } from '../../services/user';
import { roundsService } from '../../services/rounds';
import { riddlesService } from '../../services/riddles';
import { Game } from './Game';

export class WaitingRoom extends Scene {
  private countdownText!: Phaser.GameObjects.Text;
  private playerListContainer!: Phaser.GameObjects.Container;
  private playerBoxes: Phaser.GameObjects.Image[] = [];

  constructor() {
    super('WaitingRoom');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const room = roomService.getRoom();
    const user = userService.getUser();

    const level = roundsService.currentRound;

    const levelTextValue = `Level: ${level}`;
    this.add.text(centerX, centerY - 120, levelTextValue, {
      fontFamily: 'serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const roomLabel = this.add.text(centerX, centerY - 180, 'SALA', {
      fontFamily: 'serif',
      fontSize: '22px',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const roomNameText = this.add.text(centerX, centerY - 150, room.id, {
      fontFamily: 'serif',
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    roomNameText.setScale(0);
    this.tweens.add({
      targets: roomNameText,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 500
    });

    this.playerListContainer = this.add.container(centerX, centerY + 20);

    const box1 = this.add.image(0, -40, 'header-button').setScale(5);
    const player1Text = this.add.text(0, -40, `Jogador 1: ${user.name}`, {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.playerListContainer.add([box1, player1Text]);
    this.playerBoxes.push(box1);

    const box2 = this.add.image(0, 60, 'header-button').setScale(5);
    const player2Text = this.add.text(0, 60, 'Jogador 2: Aguardando...', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.playerListContainer.add([box2, player2Text]);
    this.playerBoxes.push(box2);

    this.countdownText = this.add.text(centerX, centerY + 160, '', {
      fontFamily: 'serif',
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);

     // Adiciona o botão "Pronto para iniciar"
    const readyButton = this.add.text(centerX, centerY + 240, 'Iniciar Partida', {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#28a745',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

    const waitingText = this.add.text(centerX, centerY + 240, 'Aguardando o outro jogador...', {
      fontFamily: 'serif',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    readyButton.on('pointerdown', () => {
      readyButton.setVisible(false);
      waitingText.setVisible(true);
      this.startGame();
    });

    webSocketService
    .on('player-joined')
    .subscribe({
        next: (result: any) => {
            console.log('result player-joined', result);
            player2Text.setText(`Jogador 2: ${result.players[1]._name}`);
            roomService.setAdversary(result.players[1]._name);
            riddlesService.riddles = result.riddles;

            setTimeout(() => {
              readyButton.setVisible(true);
            }, 1000);

        },
        error: error => {
            alert(error.message)
        }
    })
  }

  private startGame() {

    webSocketService
    .emit('start', (response: any) => {
      this.startCountdown();

    })
  }

  private startCountdown() {
    const countdownNumbers = ['5', '4', '3', '2', '1'];
    let index = 0;

    const next = () => {
      if (index >= countdownNumbers.length) {
        
        this.scene.start('Game');
        return;
      }

      this.countdownText.setText(countdownNumbers[index]);
      this.countdownText.setScale(0);
      this.tweens.add({
        targets: this.countdownText,
        scale: 1,
        ease: 'Bounce.easeOut',
        duration: 500
      });

      index++;
      this.time.delayedCall(1000, next, [], this);
    };

    next();
  }
}