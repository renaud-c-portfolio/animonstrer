import { Animonstrer } from "../main";
import { DisplayImage } from "./DisplayImageComponent";


const bigCanvasDivStyle = `
    width:100%;
    height:100%;    
    display:flex;
    flex-direction:column;
`
const topMenuStyle = `
    background:silver;
    color:black;
    width:100%;
    height:160px;
    border: solid white 1px;
    padding: 5px;
`

const canvasStyle = `
    width:100%;
    height:calc(100% - 160px); 
    image-rendering: pixelated;
    cursor:none;
`

const coordSpanStyle = `
    display: inline-block;
    font-family: 'zero4B';
    font-size:32px;
    min-width:96px;
`
 

export class AnimDisplayCanvas {

    cursor = 1;

    bigCanvasDiv = document.createElement("div");
    zoomAmount = document.createElement("span");
    xCoord = document.createElement("span");
    yCoord = document.createElement("span");

    canvasElem = document.createElement("canvas");
    context:CanvasRenderingContext2D = this.canvasElem.getContext("2d") as CanvasRenderingContext2D;

    canvasTopMenu:HTMLDivElement = document.createElement("div"); 
    zoomSlider = document.createElement("input");

    canvasBackground:HTMLImageElement = new Image(100,100);



    tempImage = new DisplayImage();

    gridSize = 32;
    canvasWidth = 0;
    canvasHeight = 0;
    zoom = 2;

    activeImage:DisplayImage | null = null;



    bgGradient1 = "rgb(0,20,50)";
    bgGradient2 = "rgb(50,100,150)";

    floorGradient1 = "rgb(50,100,150)"; 
    floorGradient2 = "rgb(100,150,200)";


    //controls variables
    mouseX = 0;
    mouseY = 0;
    mousePrevX = 0;
    mousePrevY = 0;

    scrollX = 0;
    scrollY = 0;

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
        this.bigCanvasDiv.setAttribute("style",bigCanvasDivStyle);

        /// top menu stuff
        this.canvasTopMenu.setAttribute("style",topMenuStyle);
        
        const topMenuFirstDiv = document.createElement("div");
        this.canvasTopMenu.appendChild(topMenuFirstDiv);
        topMenuFirstDiv.appendChild(this.zoomSlider); 
        
        this.zoomSlider.setAttribute("type","range");
        this.zoomSlider.setAttribute("value","2");
        this.zoomSlider.setAttribute("min","1");
        this.zoomSlider.setAttribute("max","5");

        
        this.zoomSlider.oninput = () => {
            this.zoom = Number(this.zoomSlider.value);
            this.zoomAmount.innerText = this.zoomSlider.value;
            this.ResizeCanvas();
        }
        
        const zoomText = document.createElement("p");
        zoomText.innerText = "zoom: ";
        zoomText.appendChild(this.zoomAmount);
        this.zoomAmount.innerText = "2";
        topMenuFirstDiv.appendChild(zoomText); 

        const coordP = document.createElement("p");
        topMenuFirstDiv.appendChild(coordP);
        coordP.appendChild(this.xCoord);
        this.xCoord.setAttribute("style",coordSpanStyle);
        this.xCoord.innerText = "0000";
        this.yCoord.setAttribute("style",coordSpanStyle);
        this.yCoord.innerText = "0000";
        const commaSpan = document.createElement("span");
        commaSpan.innerText = ",";
        commaSpan.setAttribute("style",`
            display: inline-block;
            font-family: 'zero4B';
            font-size:32px;
        `)
        coordP.appendChild(commaSpan);
        coordP.appendChild(this.yCoord);




        //------------------------------------------------------------
        //actual canvas stuff
        this.canvasElem.setAttribute("style",canvasStyle); 


        this.canvasWidth = Math.floor((window.innerWidth-220)/this.zoom);
        this.canvasHeight = Math.floor((window.innerHeight - 160)/this.zoom);
        this.canvasElem.setAttribute("width", String(this.canvasWidth)+"px");
        this.canvasElem.setAttribute("height",String(this.canvasHeight)+"px"); 
        this.context.imageSmoothingEnabled = false

        main.appDiv.appendChild(this.bigCanvasDiv);

        this.bigCanvasDiv.appendChild(this.canvasTopMenu);
        this.bigCanvasDiv.appendChild(this.canvasElem);  
 
        this.canvasElem.addEventListener("mousemove",this.updateMousePosition);
        window.addEventListener("resize",this.ResizeCanvas);
        
        
        this.canvasElem.addEventListener("mousedown",(event:MouseEvent)=>{
            this.ClickMouse(event);
        });

        window.addEventListener("mouseup",(event:MouseEvent)=>{
            this.ReleaseMouse(event);
        });  

        window.addEventListener("keydown",(event:KeyboardEvent)=>{
            this.KeyboardEvent(event);
        })

        window.addEventListener("wheel",(event:WheelEvent)=>{ 
            this.MouseWheel(event);
        });  
    }


    //main draw and update functions

    ResizeCanvas = () => {
        
        this.canvasWidth = Math.floor((window.innerWidth-220)/this.zoom);
        this.canvasHeight = Math.floor((window.innerHeight - 160)/this.zoom);
        this.canvasElem.setAttribute("width", String(this.canvasWidth)+"px");
        this.canvasElem.setAttribute("height",String(this.canvasHeight)+"px"); 
    }


    ////// RENDER START ===================================================================================================
    /////  ===================================================================================================
    /////  ===================================================================================================

    RenderCanvas = () => {

 

        //responsive controls wow
        if (this.rightClick > 1)
            {
                this.scrollX -= this.mouseX - this.mousePrevX;
                this.scrollY -= this.mouseY - this.mousePrevY;
                
            }
        if (this.wheel < 0)
            {
                if (this.zoom < 5)
                {
                    this.zoom += 1;
                    this.ResizeCanvas();
                    this.zoomSlider.value = String(this.zoom); 
                    this.zoomAmount.innerText = this.zoomSlider.value;
                }
            }
            else if (this.wheel > 0)
            {
                if (this.zoom > 1)
                {
                    this.zoom -= 1;
                    this.ResizeCanvas();
                    this.zoomSlider.value = String(this.zoom); 
                    this.zoomAmount.innerText = this.zoomSlider.value;
                }
            }
        const halfGrid = this.gridSize/2;
        const scrollXMod = -this.gridSize -this.scrollX % this.gridSize;
        const scrollYMod = -this.gridSize - this.scrollY % this.gridSize;
        const halfWidth = this.gridSize*8 - this.scrollX;
        const floorHeight = Math.floor(this.gridSize*10) - this.scrollY;


        if (this.leftClick === 1)
            {
                this.activeImage = this.tempImage; 
            }
            else if (this.leftRelease > 0)
            {
                this.activeImage = null;
            }
    
            if (this.activeImage != null)
            {
                this.activeImage.imageX = this.mouseX - halfWidth;// - this.mousePrevX;
                this.activeImage.imageY = this.mouseY - floorHeight;// - this.mousePrevY;
            }
       


        
        // keyboard not-so-short cuts 
        if (this.keyPressed === 1)
        { 
            if (this.lastKeyChar === "a" || this.lastKeyChar === "A")
            {  
                this.tempImage.imageX -= 1; 
            }
            else if (this.lastKeyChar === "w" || this.lastKeyChar === "W")
            {  
                this.tempImage.imageY -= 1; 
            }
            else if (this.lastKeyChar === "d" || this.lastKeyChar === "D")
            {  
                this.tempImage.imageX += 1; 
            }
            else if (this.lastKeyChar === "s" || this.lastKeyChar === "S")
            {  
                this.tempImage.imageY += 1; 
            }
        }

        



        const ctx = this.context
        //reset art to blank
        ctx.clearRect(0,0,9999,9999)

        //grid background
        const grad=ctx.createLinearGradient(0,0, 0, Math.min(this.canvasHeight));
        grad.addColorStop(0, this.bgGradient1);
        grad.addColorStop(1, this.bgGradient2); 
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);
        ctx.fillStyle = "rgba(150,235,245,0.5)";
        for (let i= -1; i < Math.ceil(this.canvasHeight/this.gridSize)+3; i++)
        {
            ctx.fillRect(scrollXMod,scrollYMod+i*this.gridSize-1,this.canvasWidth+this.gridSize*3,3);
        }
        for (let i= -1; i < Math.ceil(this.canvasWidth/this.gridSize)+3;i++)
        {
            ctx.fillRect(scrollXMod+i*this.gridSize-1 , scrollYMod,3,this.canvasHeight+this.gridSize*3);
        }

        //floor grid bg
        const grado=ctx.createLinearGradient(0,0, 0,850);
        grado.addColorStop(0, this.floorGradient1);
        grado.addColorStop(1, this.floorGradient2); 
        ctx.fillStyle = grado;
        ctx.fillRect(0,floorHeight-halfGrid,this.canvasWidth,this.canvasHeight-floorHeight+halfGrid);

        ctx.fillStyle = "rgba(150,235,245,1)";
        let heightPlus = 0;
        for (let i= -1; i < Math.ceil(this.canvasHeight/this.gridSize)+3; i++)
            {
                const percent = Math.min(1,i*0.2); 
                const funnyNumber = 2 - percent; 
                
                let gridMult =  Math.round(this.gridSize / funnyNumber );   
                ctx.fillRect(scrollXMod,floorHeight+heightPlus-1-halfGrid, this.canvasWidth+this.gridSize*2,3);
                heightPlus += gridMult;
            }
            for (let i= -1; i < Math.ceil(this.canvasWidth/this.gridSize)+3;i++)
            { 
                ctx.fillRect(scrollXMod+i*this.gridSize-1 - halfGrid,floorHeight-halfGrid,3,this.canvasHeight-floorHeight+halfGrid+this.gridSize);
            }

        

        // draw origin indicator cross
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.fillRect(halfWidth-2,floorHeight-15,5,27);
        ctx.fillRect(halfWidth-13,floorHeight-5,27,5);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(halfWidth,floorHeight-15,1,27);
        ctx.fillRect(halfWidth-13,floorHeight-3,27,1);

        // draw actual animation images

        if (this.tempImage.loaded)
            {
                ctx.drawImage(this.tempImage.imageElem,halfWidth+this.tempImage.imageX,floorHeight+this.tempImage.imageY);
            }
        //draw mouse x/y indicator
        //ctx.font = "16px 'zero4B'";
        //ctx.fillStyle = "white";
        //ctx.fillText(String(this.mouseX-halfWidth)+","+String(this.mouseY-floorHeight),12,12);
        let xSign = Math.sign(this.mouseX-halfWidth);
        let ySign = Math.sign(this.mouseY-floorHeight);
        let xString = String(Math.abs(this.mouseX-halfWidth));
        let yString = String(Math.abs(this.mouseY-floorHeight));
        while (xString.length < 4)
        {
            xString = "0" + xString;
        }
        if (xSign === 1) { xString = "\xa0"+xString;} else {xString = "-" + xString;}
        
        while (yString.length < 4)
        {
            yString = "0" + yString;
        }
        if (ySign === 1) { yString = "\xa0"+yString;} else {yString = "-" + yString;}
        this.xCoord.innerText = xString;
        this.yCoord.innerText = yString;


        // draw cursor if you want one

        if (this.cursor)
        {
            ctx.fillStyle = "white";
            ctx.fillRect(this.mouseX-3,this.mouseY,7,1);
            ctx.fillRect(this.mouseX,this.mouseY-3,1,7);
        }

        //controls stuff at end of frame
        if (this.leftClick > 0)  {this.leftClick +=1;}
        if (this.leftRelease > 0) {this.leftRelease = 0;}
        if (this.rightClick > 0)  {this.rightClick +=1;}
        if (this.rightRelease > 0) {this.rightRelease = 0;}
        this.wheel = 0;
        if (this.keyPressed > 0)
        {
            this.keyPressed = 0; 
        }
        this.mousePrevX = this.mouseX;
        this.mousePrevY = this.mouseY; 
        
        requestAnimationFrame(()=>{this.RenderCanvas()});  
    }
    //////// END OF DRAWING -===================================================================================
    // mouse and controls related variables

    updateMousePosition = (event:MouseEvent) => {
        const rect = this.canvasElem.getBoundingClientRect();
        const scaleX = this.canvasElem.width / rect.width;
        const scaleY = this.canvasElem.height / rect.height; 
        this.mouseX = Math.floor((event.clientX - rect.left)*scaleX);
        this.mouseY =  Math.floor((event.clientY - rect.top)*scaleY);  
        this.xCoord.innerText = String(this.mouseX);
        this.yCoord.innerText = String(this.mouseY);
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


    KeyboardEvent = (event:KeyboardEvent) => {
 
        if (this.lastKeyChar === event.key)
            {
                this.keyPressed += 1;
            }
            else
            {
                this.keyPressed = 1;
                this.lastKeyChar = event.key;
            }   
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