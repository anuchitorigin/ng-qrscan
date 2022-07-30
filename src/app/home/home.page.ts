import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ToastController, LoadingController, Platform } from '@ionic/angular';
import jsQR from 'jsqr';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit {
  @ViewChild('video', { static: false }) video: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('fileinput', { static: false }) fileinput: ElementRef;

  videoElement: any;
  canvasElement: any;
  canvasContext: any;
  videoStart = false;
  canvasShow = false;
  scanResult = null;
  loading: HTMLIonLoadingElement = null;
  waiting: any;
  videoConstraints: MediaStreamConstraints = {
    audio: false,
    video: { facingMode: 'environment' }
  };

  constructor(
    private toastCtrl: ToastController,
    // private loadingCtrl: LoadingController,
    // private plt: Platform,
  ) {
    // const isInStandaloneMode = () => false;
    //   // 'standalone' in window.navigator && window.navigator['standalone'];
    // if (this.plt.is('ios') && isInStandaloneMode()) {
    //   console.log('I am a an iOS PWA!');
    //   this.txtOpenCamera = 'NOPE!';
    //   // E.g. hide the scan functionality!
    // }
  }

  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
    this.canvasElement = this.canvas.nativeElement;
    this.canvasContext = this.canvasElement.getContext('2d');
  }

  drawLine(begin, end, color) {
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(begin.x, begin.y);
    this.canvasContext.lineTo(end.x, end.y);
    this.canvasContext.lineWidth = 4;
    this.canvasContext.strokeStyle = color;
    this.canvasContext.stroke();
    return true;
  }

  tick() {
    // loadingMessage.innerText = "⏳ Loading video...";
    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA && !this.waiting) {
      // console.log('hi');
      // loadingMessage.hidden = true;
      // outputContainer.hidden = false;
      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
      const imageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      // if (!this.videoElement.paused) {
      //     imageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      //     code = jsQR(imageData.data, imageData.width, imageData.height, {
      //       inversionAttempts: 'dontInvert',
      //     });
      // }
      if (code) {
        const borderColor = '#00FF00';
        const TLR = this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, borderColor);
        const TRR = this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, borderColor);
        const BRL = this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, borderColor);
        const BLL = this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, borderColor);
        // outputMessage.hidden = true;
        // outputData.parentElement.hidden = false;
        // outputData.innerText = code.data;
        if (code.data !== '' && !this.waiting && TLR === true && TRR === true && BRL === true && BLL === true ) {
          // console.log(code);
          // สามารถส่งค่า code.data ไปทำงานอย่างอื่นๆ ผ่าน ajax ได้
          this.videoElement.pause();
          this.canvasShow = true;
          this.scanResult = code.data;
          this.waiting = true;
          // this.showQrToast();
          // beepsound.play();
          // beepsound.onended = function() {
          //     beepsound.muted = true;
          // };
          // ให้เริ่มเล่นวิดีโอก่อนล็กน้อย เพื่อล้างค่ารูป qrcod ล่าสุด เป็นการใช้รูปจากกล้องแทน
          setTimeout(() => {
            this.videoElement.play();
            this.canvasShow = false;
            this.waiting = null;
          }, 2500);
          // ให้รอ 3 วินาทีสำหรับการ สแกนในครั้งจ่อไป
          // this.waiting = setTimeout(() => {
          //     TLR = null;
          //     TRR = null;
          //     BRL = null;
          //     BLL = null;
          //     // beepsound.muted = false;
          //     if (this.waiting){
          //         clearTimeout(this.waiting);
          //         this.waiting = null;
          //     }
          //   }, 5000
          // );
        } else {
          // requestAnimationFrame(this.tick.bind(this));
        }
      } else {
        // outputMessage.hidden = false;
        // outputData.parentElement.hidden = true;
      }
    } else {
      // requestAnimationFrame(this.tick.bind(this));
    }
    requestAnimationFrame(this.tick.bind(this));
  }

  toggleVideoMedia() {
    if (this.videoStart) {
      this.stopVideo();
    } else {
      this.startVideo();
    }
    // this.videoStart ? this.stopVideo() : this.startVideo()
  }

  startVideo() {
    // this.videoConstraints.video = true;
    navigator.mediaDevices.getUserMedia(this.videoConstraints).then(
      (localStream: MediaStream) => {
        this.videoElement.srcObject = localStream;
        this.videoStart = true;
        this.canvasShow = false;
        this.videoElement.play();
        // this.videoElement.onloadedmetadata = () => {
        //   this.videoElement.play();
        // };
        // requestAnimationFrame(this.scan.bind(this));
        requestAnimationFrame(this.tick.bind(this));
        // this.checkImage();
      }
    ).catch(
      (error) => {
        console.error(error);
        this.videoStart = false;
        this.canvasShow = false;
      }
    );
    // Not working on iOS standalone mode!
    // const stream = await navigator.mediaDevices.getUserMedia({
    //   video: { facingMode: 'environment' }
    // });

    // this.videoElement.srcObject = stream;
    // // Required for Safari
    // this.videoElement.setAttribute('playsinline', true);

    // this.loading = await this.loadingCtrl.create({});
    // await this.loading.present();

    // this.videoElement.play();
    // requestAnimationFrame(this.scan.bind(this));
  }

  reset() {
    this.scanResult = null;
  }

  stopVideo() {
    // this.medias.video = false;
    this.videoElement.srcObject.getVideoTracks()[0].enabled = false;
    this.videoElement.srcObject.getVideoTracks()[0].stop();
    this.videoStart = false;
    this.canvasShow = false;
  }

  // Helper functions
  async showQrToast() {
    const toast = await this.toastCtrl.create({
      message: `Open ${this.scanResult}?`,
      position: 'top',
      buttons: [
        {
          text: 'Open',
          handler: () => {
            window.open(this.scanResult, '_system', 'location=yes');
          }
        }
      ]
    });
    toast.present();
  }

  // async scan() {
  //   if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
  //     if (this.loading) {
  //       await this.loading.dismiss();
  //       this.loading = null;
  //       this.videoStart = true;
  //     }

  //     this.canvasElement.height = this.videoElement.videoHeight;
  //     this.canvasElement.width = this.videoElement.videoWidth;

  //     this.canvasContext.drawImage(
  //       this.videoElement,
  //       0,
  //       0,
  //       this.canvasElement.width,
  //       this.canvasElement.height
  //     );
  //     const imageData = this.canvasContext.getImageData(
  //       0,
  //       0,
  //       this.canvasElement.width,
  //       this.canvasElement.height
  //     );
  //     const code = jsQR(imageData.data, imageData.width, imageData.height, {
  //       inversionAttempts: 'dontInvert'
  //     });

  //     if (code) {
  //       this.videoStart = false;
  //       this.scanResult = code.data;
  //       this.showQrToast();
  //     } else {
  //       if (this.videoStart) {
  //         requestAnimationFrame(this.scan.bind(this));
  //       }
  //     }
  //   } else {
  //     requestAnimationFrame(this.scan.bind(this));
  //   }
  // }

  // checkImage() {
  //   const WIDTH = this.videoElement.clientWidth;
  //   const HEIGHT = this.videoElement.clientHeight;
  //   this.canvasElement.width  = WIDTH;
  //   this.canvasElement.height = HEIGHT;

  //   const ctx = this.canvasElement.getContext('2d') as CanvasRenderingContext2D;

  //   ctx.drawImage(this.videoElement, 0, 0, WIDTH, HEIGHT);
  //   const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  //   const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });

  //   if (code) {
  //     this.showQrToast();
  //   } else {
  //     setTimeout(() => { this.checkImage(); }, 100);
  //   }
  // }

  captureImage() {
    this.fileinput.nativeElement.click();
  }

  handleFile(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    const file = fileList.item(0);

    const img = new Image();
    img.onload = () => {
      this.canvasContext.drawImage(img, 0, 0, this.canvasElement.width, this.canvasElement.height);
      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code) {
        this.scanResult = code.data;
        this.showQrToast();
      }
    };
    img.src = URL.createObjectURL(file);
  }
}
