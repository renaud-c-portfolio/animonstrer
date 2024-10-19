import './style.css' 

import { AnimMenu } from './components/AnimMenu';
import { AnimDisplayCanvas } from './components/AnimDisplayCanvas';


//---- style strings in the theme of styled components

const appStyle = `
  display:flex;
  width:100vw;
  height:100vh; 
`

//----- file related functions

//----- start displaying Things

export class Animonstrer { 

  appDiv = document.getElementById("app") as HTMLDivElement;
  menuObj:AnimMenu;
  canvasObj:AnimDisplayCanvas;

  canvasMouseX = 0;
  canvasMouseY = 0;

  imageFiles:Array<File> = [];

  constructor() {
    this.menuObj = new AnimMenu(this);
    this.canvasObj = new AnimDisplayCanvas(this); 
    this.appDiv.setAttribute("style",appStyle); 
    this.canvasObj.RenderCanvas();
  }

   changeFile = (event:InputEvent) => { 
    console.log(event);
    return event;
  }
  
   
   
   
}
document.addEventListener('contextmenu', event => event.preventDefault());
const app = new Animonstrer(); 



