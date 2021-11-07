export class Formulario {
  title?: string;
  urlVideo?: string;
  fileName?: string;
  fechaCreacion?: any;

  constructor(title: string, fileName: string, urlVideo: string, fechaCreacion: any){
    this.title = title;
    this.fileName = fileName;
    this.urlVideo = urlVideo;
    this.fechaCreacion = fechaCreacion;
  }
};
