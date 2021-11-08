import { Injectable } from '@angular/core';

import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Formulario } from '../model/formulario';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MusicaService {

  title: any;

  url = "";

  constructor(private storage: AngularFireStorage, private afs: AngularFirestore, private toastrSvc:ToastrService){}

  // SI SUBO UN LINK DE YOUTUBE

  async setMusic(url: string, title: string){
    const CANCION: Formulario = {
      title: title,
      urlVideo: url,
      fechaCreacion: new Date()
    };
    this.guardarCancion(CANCION);
  }

  // SI SUBO UN ARCHIVO MP3

  async setMusicMP3(_file: any, title: string){
    this.title = title;
    const filePath = `files/${_file.name}`;
    const snap = await this.storage.upload(filePath, _file, this.title);
      this.getUrl(snap);
  }

  async getUrl(snap: firebase.default.storage.UploadTaskSnapshot): Promise<void> {
    const URL = await snap.ref.getDownloadURL();
    this.url = URL;//store the URL

    const CANCION: Formulario = {
      title: this.title,
      fileName: this.url,
      fechaCreacion: new Date()
    };
    this.guardarCancionMP3(CANCION);
  }

  // FireStore

  guardarCancion(CANCION: Formulario): Promise<any>{
    return this.afs.collection(`youtube`).add(CANCION)
    .then(() => {
      this.toastrSvc.success(`Subiste la canción ${CANCION.title}`);
      console.log('Canción subida con exito');
    }, error => {
       console.log(error);
       this.toastrSvc.error(`Ocurrió un error :/`);
    })
  }

  guardarCancionMP3(CANCION: Formulario): Promise<any>{
    return this.afs.collection(`files`).add(CANCION)
    .then(() => {
      this.toastrSvc.success(`Subiste la canción ${CANCION.title}`);
      console.log('Canción subida con exito');
    }, error => {
      this.toastrSvc.error(`Ocurrió un error :/`);
       console.log(error);
    })
  }

  obtenerMusica(): Observable<any>{
    const youtube = this.afs.collection(`youtube`, ref => ref.orderBy('fechaCreacion', 'desc')).snapshotChanges();
    return youtube;
  }

  obtenerMusicaMP3(): Observable<any>{
    const musicaMP3 = this.afs.collection(`files`, ref => ref.orderBy('fechaCreacion', 'desc')).snapshotChanges();
    return musicaMP3;
  }

  borrarMusicaYoutube(id: string): Promise<any>{
    return this.afs.collection('youtube').doc(id).delete();
  }

  borrarMusicaFile(id: string): Promise<any>{
    return this.afs.collection('files').doc(id).delete();
  }

}
