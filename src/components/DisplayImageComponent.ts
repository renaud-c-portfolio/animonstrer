import tempUrl from "../assets/abyss_worm.png";

export class DisplayImage {

    imageElem:HTMLImageElement = document.createElement("img"); 
    loaded = false;
    imageX = 0;
    imageY = 0;

    constructor() { 
      
         this.imageElem.setAttribute("width","50px");    
         this.imageElem.setAttribute("height","50px");    
         this.imageElem.setAttribute("src",tempUrl);    

         this.imageElem.onload = () => { 
            this.loaded = true;
          }
          
    }


}