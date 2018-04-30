import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';

import { Camera, CameraOptions } from '@ionic-native/camera';
import * as firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // pickedImage: any;

  bigImg = null;
  bigSize = '0';

  smallImg = null;
  smallSize = '0';

  smallImgTwo = null;
  smallSizeTwo = '0';


  constructor(public navCtrl: NavController, 
    // private imageResizer: ImageResizer,
    private camera: Camera
  
  ) {
    // this.pickedImage = "assets/imgs/main.jpg";
    // this.resizeImage(this.pickedImage);
  }

  loadImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      allowEdit: false
    };

    this.camera.getPicture(options).then(imageData => {
      let base64data = 'data:image/jpeg;base64,' + imageData;
      this.bigImg = base64data;
      this.bigSize = this.getImageSize(this.bigImg);
      this.createThumbnail()
    }, err => {
      console.log('gallery error: ', err);
    });
  }


  uploadImage(imageString, type): Promise<any> {
    let image: string = 'test-' + type + new Date().getTime() + '.jpg',
      storageRef: any,
      parseUpload: any;

    return new Promise((resolve, reject) => {
      storageRef = firebase.storage().ref('test/' + image);
      parseUpload = storageRef.putString(imageString, 'data_url');

      parseUpload.on('state_changed', (_snapshot) => {
        // We could log the progress here IF necessary
        // console.log('snapshot progess ' + _snapshot);
      },
        (_err) => {
          reject(_err);
        },
        (success) => {
          resolve(parseUpload.snapshot);
        });
    });
  }

  createThumbnail() {
    this.generateFromImage(this.bigImg, 400, 100, 1, data => {
      this.smallImg = data;
      this.smallSize = this.getImageSize(this.smallImg);
      this.uploadImage(this.smallImg, 'small');
    });

    this.generateFromImage(this.bigImg, 100, 50, 1, data => {
      this.smallImgTwo = data;
      this.smallSizeTwo = this.getImageSize(this.smallImgTwo);
      this.uploadImage(this.smallImgTwo, 'sm');
    });
  }

  generateFromImage(img, MAX_WIDTH: number = 700, MAX_HEIGHT: number = 700, quality: number = 1, callback) {
    var canvas: any = document.createElement("canvas");
    var image = new Image();

    image.onload = () => {
      var width = image.width;
      var height = image.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, width, height);

      // IMPORTANT: 'jpeg' NOT 'jpg'
      var dataUrl = canvas.toDataURL('image/jpeg', quality);

      callback(dataUrl)
    }
    image.src = img;
  }

  getImageSize(data_url) {
    var head = 'data:image/jpeg;base64,';
    return ((data_url.length - head.length) * 3 / 4 / (1024 * 1024)).toFixed(4);
  }


  //  NOT WORKING  NEED TO CHECK IN SIMULATOR
  // resizeImage(uri) {
  //   console.log(uri);
  //   let options = {
  //     uri: uri,
  //     filename: 'new.jpg',
  //     // folderName: 'Protonet',
  //     quality: 100,
  //     width: 180,
  //     height: 120
  //   } as ImageResizerOptions;

  //   this.imageResizer
  //     .resize(options)
  //     .then((filePath: 'assets/imgs/') => console.log('FilePath', filePath))
  //     .catch(e => console.log(e));
  // }
}
