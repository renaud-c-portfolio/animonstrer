import { Animonstrer } from "../main";
import { DisplayImage } from "./DisplayImageComponent";


const canvasStyle = `
    width:100%;
    height:100%; 
    image-rendering: pixelated;

`

export class AnimDisplayCanvas {

    canvasElem = document.createElement("canvas");
    context:CanvasRenderingContext2D = this.canvasElem.getContext("2d") as CanvasRenderingContext2D;


    canvasBackground:HTMLImageElement = new Image(100,100);

    tempImage = new DisplayImage();

    gridSize = 32;
    canvasWidth = 0;
    canvasHeight = 0;
    zoom = 2;

    activeImage:DisplayImage | null = null;


    //controls variables
    mouseX = 0;
    mouseY = 0;
    mousePrevX = 0;
    mousePrevY = 0;
    leftClick = 0;
    leftRelease = 0;
    rightClick = 0;
    rightRelease = 0;
    middleClick = 0;
    middleRelease = 0;
    wheel = 0; 
    keyPressed = 0;
    lastKeyChar = "";

    // variables end

    constructor(main:Animonstrer)
    {
        this.canvasElem.setAttribute("style",canvasStyle);
        this.canvasWidth = Math.floor((window.innerWidth-220)/this.zoom);
        this.canvasHeight = Math.floor((window.innerHeight)/this.zoom);
        this.canvasElem.setAttribute("width", String(this.canvasWidth)+"px");
        this.canvasElem.setAttribute("height",String(this.canvasHeight)+"px"); 
        this.context.imageSmoothingEnabled = false
        main.appDiv.appendChild(this.canvasElem);
 
        this.canvasElem.addEventListener("mousemove",this.updateMousePosition);
        window.addEventListener("resize",this.ResizeCanvas);

        
        this.canvasElem.addEventListener("mousedown",(event:MouseEvent)=>{
            this.ClickMouse(event);
        });

        this.canvasElem.addEventListener("mouseup",(event:MouseEvent)=>{
            this.ReleaseMouse(event);
        });  

        this.canvasElem.addEventListener("wheel",(event:WheelEvent)=>{ 
            this.MouseWheel(event);
        });  
    }


    //main draw and update functions

    ResizeCanvas = () => {
        
        this.canvasWidth = Math.floor((window.innerWidth-220)/this.zoom);
        this.canvasHeight = Math.floor((window.innerHeight)/this.zoom);
        this.canvasElem.setAttribute("width", String(this.canvasWidth)+"px");
        this.canvasElem.setAttribute("height",String(this.canvasHeight)+"px"); 
    }

    RenderCanvas = () => {


        //responsive controls wow
        if (this.leftClick === 1)
            {
                this.activeImage = this.tempImage;
                console.log("BALBOON");
            }
            else if (this.leftRelease > 0)
            {
                this.activeImage = null;
            }
    
            if (this.activeImage != null)
            {
                this.activeImage.imageX += this.mouseX - this.mousePrevX;
                this.activeImage.imageY += this.mouseY - this.mousePrevY;
            }
        //



        const ctx = this.context
        //reset art to blank
        ctx.clearRect(0,0,9999,9999)

        //grid background
        const grad=ctx.createLinearGradient(0,0, 0,380);
        grad.addColorStop(0, "lightblue");
        grad.addColorStop(1, "darkblue"); 
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);
        for (let i=0; i < Math.ceil(this.canvasHeight/this.gridSize); i++)
        {
            ctx.fillStyle = "rgb(150,235,245)";
            ctx.fillRect(0,0+i*this.gridSize,this.canvasWidth,2);
        }
        for (let i=0; i < Math.ceil(this.canvasWidth/this.gridSize);i++)
        {
            ctx.fillRect(0+i*this.gridSize,0,2,this.canvasHeight);
        }

        // draw actual animation images

        if (this.tempImage.loaded)
        {
            ctx.drawImage(this.tempImage.imageElem,this.tempImage.imageX,this.tempImage.imageY);
        }
        //draw mouse x/y indicator
        ctx.font = "16px 'zero4B'";
        ctx.fillStyle = "white";
        ctx.fillText(String(this.mouseX)+","+String(this.mouseY),12,12);

        

        //controls stuff at end of frame
        if (this.leftClick > 0)  {this.leftClick +=1;}
        if (this.leftRelease > 0) {this.leftRelease = 0;}
        if (this.rightClick > 0)  {this.rightClick +=1;}
        if (this.rightRelease > 0) {this.rightRelease = 0;}
        this.wheel = 0;
        this.keyPressed = 0;
        this.mousePrevX = this.mouseX;
        this.mousePrevY = this.mouseY;


        
        requestAnimationFrame(()=>{this.RenderCanvas()});  
    }

    // mouse and controls related variables

    updateMousePosition = (event:MouseEvent) => {
        const rect = this.canvasElem.getBoundingClientRect();
        const scaleX = this.canvasElem.width / rect.width;
        const scaleY = this.canvasElem.height / rect.height; 
        this.mouseX = Math.floor((event.clientX - rect.left)*scaleX);
        this.mouseY =  Math.floor((event.clientY - rect.top)*scaleY);  
    }

    MouseWheel = (event:WheelEvent) => { 
        if (event.deltaY != 0)
        { 
            this.wheel = event.deltaY;
        } 
    }

    ClickMouse = (event:MouseEvent) => {

        const rect = this.canvasElem.getBoundingClientRect();
        const scaleX = this.canvasElem.width / rect.width;
        const scaleY = this.canvasElem.height / rect.height;
        this.mouseX = Math.floor((event.clientX - rect.left)*scaleX);
        this.mouseY =  Math.floor((event.clientY - rect.top)*scaleY);
        if (event.button === 0)
        {
            this.leftClick = 1;  
        }
        else if (event.button === 2)
        {
            this.rightClick = 1;  
        }

        //console.log(event);
    }

    ReleaseMouse = (event:MouseEvent) => {

        const rect = this.canvasElem.getBoundingClientRect();
        const scaleX = this.canvasElem.width / rect.width;
        const scaleY = this.canvasElem.height / rect.height;
        this.mouseX = Math.floor((event.clientX - rect.left)*scaleX);
        this.mouseY =  Math.floor((event.clientY - rect.top)*scaleY); 
        if (event.button === 0)
        {
            this.leftRelease = this.leftClick;
            this.leftClick = 0;
        }
        else if (event.button === 2)
        {
            this.rightRelease = this.rightClick;
            this.rightClick = 0;
        }
        
        //console.log(event);
        
    }


    KeyboardEvent = (event:KeyboardEvent,canvas:HTMLCanvasElement) => {
 
        if (this.lastKeyChar === event.key)
            {
                this.keyPressed += 1;
            }
            else
            {
                this.keyPressed = 1;
                this.lastKeyChar = event.key;
            }  
        
        console.log("baboon "+event.key," ",this.keyPressed);
    }


    MouseInRect = (_left:number,_top:number,_width:number,_height:number):boolean => {

        if (this.mouseX > _left && this.mouseX < _left + _width && this.mouseY > _top && this.mouseY < _top+_height)
            {
                return true;
            }
            else
            {
                return false;
            }

    }

    

}