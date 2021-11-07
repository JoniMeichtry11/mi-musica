import { Component, OnInit, ViewChild } from '@angular/core';
import { MusicaService } from './services/musica.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('audio', { static: false }) audioMusic: any;

  @ViewChild('play', { static: false }) playMusic: any;

  @ViewChild('subirArchivo', { static: false }) subirArchivo: any;

  @ViewChild('subirArchivo2', { static: false }) subirArchivo2: any;

  @ViewChild('previewYoutube', { static: false }) previewYoutube: any;

  @ViewChild('fileInput', { static: false }) fileInput: any;

  @ViewChild('titulo', { static: false }) titulo: any;

  @ViewChild('enviar', { static: false }) enviar: any;

  urlID = '';

  file = '';

  urlYoutube = ``;

  apiLoaded = false;

  // ARRAYS PARA RECIBIR DATOS DE FIRESTORE

  public listMusicYoutube: any[] = [];

  public listMusicMP3: any[] = [];

  public listMusic: any[] = [];

  constructor(private musicaService: MusicaService) {}

  ngOnInit() {
    // CARGA DE IFRAME DE YOUTUBE DE FORMA ASINCRONA
    if (!this.apiLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      this.apiLoaded = true;
    }
    // OBTENER MUSICA DE YOUTUBE
    this.musicaService.obtenerMusica().subscribe((data: any) => {
      this.listMusicYoutube = [];
      data.forEach((element: any) => {
        this.listMusicYoutube.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(),
        });
        console.log("musica YOUTUBE", this.listMusicYoutube);
      });
    });
    // OBTENER MUSICA MP3
    this.musicaService.obtenerMusicaMP3().subscribe((data: any) => {
      this.listMusicMP3 = [];
      data.forEach((element: any) => {
        this.listMusicMP3.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(),
        });
      });
      console.log("MUSICA MP3", this.listMusicMP3);
      this.listMusic = this.listMusicMP3.concat(this.listMusicYoutube);
      this.listMusic = this.listMusic.sort(function() {return Math.random() - 0.5});
      console.log("Musica completa", this.listMusic);
    });

  }

  cambiarPreview(value: string) {
    this.urlID = value.substring(value.length - 11);
    this.urlYoutube = `http://img.youtube.com/vi/${this.urlID}/0.jpg`;
    const archivo = this.subirArchivo.nativeElement;
    const archivo2 = this.subirArchivo2.nativeElement;
    const preview = this.previewYoutube.nativeElement;
    if (value.length > 0) {
      archivo.style.display = 'none';
      archivo2.style.display = 'none';
      preview.style.display = 'block';
    } else {
      this.urlYoutube = '';
      preview.style.display = 'none';
      archivo.style.display = 'flex';
      archivo2.style.display = 'block';
    }
  }

  archivoMP3(event: any) {
    this.file = event.target.files[0];
    return this.file;
  }

  // Envio de video o archivo junto con el titulo a firestore

  subirMusica() {
    const file = this.fileInput.nativeElement;
    const title = this.titulo.nativeElement;
    const enviar = this.enviar.nativeElement;

    if (
      file.value.length > 0 ||
      (this.urlID.length === 11 && title.value.length > 0)
    ) {
      enviar.setAttribute('data-dismiss', 'modal');
      if (this.urlID.length === 11) {
        this.musicaService
          .setMusic(this.urlID, title.value)
          .then(() => {
            console.log(
              'Puedes subir tu cancion :D, esta es: ',
              title.value,
              'viene de youtube, este es el ID: ',
              this.urlID
            );
          })
          .catch((err) => {
            console.log('Ocurrio algo, lo siento :/', err);
          });
      } else {
        this.musicaService
          .setMusicMP3(this.file, title.value)
          .then(() => {
            console.log(
              'Puedes subir tu cancion :D, esta es: ',
              title.value,
              'viene de un archivo, este es el archivo: ',
              file.value
            );
          })
          .catch((err) => {
            console.log('Ocurrio algo, lo siento :/', err);
          });
      }
    } else {
      console.log('Falta que subas la canción :/');
    }
  }
}
