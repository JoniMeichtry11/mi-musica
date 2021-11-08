import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MusicaService } from './services/musica.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './app.component.scss'],
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

  constructor(private musicaService: MusicaService, private toastrSvc:ToastrService) {}

  ngOnInit() {
    // CARGA DE IFRAME DE YOUTUBE DE FORMA ASINCRONA
    if (!this.apiLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      this.apiLoaded = true;
    }
    this.cargarMusicaYoutube();
    this.cargarMusicaMP3();
  }

  cargarMusicaYoutube(){
    this.musicaService.obtenerMusica().subscribe((data: any) => {
      this.listMusicYoutube = [];
      data.forEach((element: any) => {
        this.listMusicYoutube.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(),
        });
      });
    });
  }

  cargarMusicaMP3(){
    this.musicaService.obtenerMusicaMP3().subscribe((data: any) => {
      this.listMusicMP3 = [];
      data.forEach((element: any) => {
        this.listMusicMP3.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(),
        });
      });
      this.listMusic = this.listMusicMP3.concat(this.listMusicYoutube);
      this.listMusic = this.listMusic.sort(function() {return Math.random() - 0.5});
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
      this.toastrSvc.info('Subiendo canción . . .');
      if (this.urlID.length === 11) {
        this.musicaService
          .setMusic(this.urlID, title.value)
          .then(() => {
            this.cargarMusicaYoutube();
            this.cargarMusicaMP3();
          })
          .catch((err) => {
            console.log('Ocurrio algo, lo siento :/', err);
          });
      } else {
        this.musicaService
          .setMusicMP3(this.file, title.value)
          .then(() => {
            this.cargarMusicaYoutube();
            this.cargarMusicaMP3();
          })
          .catch((err) => {
            console.log('Ocurrio algo, lo siento :/', err);
          });
      }
    } else {
      console.log('Falta que subas la canción :/');
    }
  }

  deleteMusicYoutube(id: string){
    this.toastrSvc.info('Eliminando canción . . .');
    this.musicaService.borrarMusicaYoutube(id)
      .then(() => {
        this.toastrSvc.success(`Eliminaste la canción`);
        this.cargarMusicaYoutube();
        this.cargarMusicaMP3();
      }).catch(() => {
        this.toastrSvc.error(`Ocurrió un error :/`);
        console.log("Ocurrió un problema al eliminar tu canción");
      });
  }

  deleteMusicFile(id: string){
    this.toastrSvc.info('Eliminando canción . . .');
    this.musicaService.borrarMusicaFile(id)
      .then(() => {
        this.toastrSvc.success(`Eliminaste la canción`);
        this.cargarMusicaYoutube();
        this.cargarMusicaMP3();
      }).catch(() => {
        this.toastrSvc.error(`Ocurrió un error :/`);
        console.log("Ocurrió un problema al eliminar tu canción");
      });
  }
}
