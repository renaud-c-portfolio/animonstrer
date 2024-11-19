import './style.css' 
 
import { AnimDisplayCanvas } from './components/AnimDisplayCanvas';


//---- style strings in the theme of styled components

const appStyle = `
  display:flex;
  width:100vw;
  height:100vh; 
  overflow:hidden;
`

const animMenuStyle = `
    width:316px;
    padding:4px;
    height:100%;
    background:gray; 
`

//----- file related functions

//----- start displaying Things

export class Animonstrer { 

 

  projectObj = {
    monstrerVersion: "test version",
    name: "new project",

    partTypes: [],
    parts: [],
    characters: [],

    imageNames: [""],
    imageBase64List: [""], 
  }

  testPartType = {
    name: "torso",
    anchors: [],
    poses: [],
  }

  testPart = {
    name: "test part",
    type: "torso",
    images: [],
    origins: [],
    anchors: [],
  }
 
  testCharTemplate = {
    name: "new test template",
    defaultAnims: [],
    partTypes: [], 
  }

  testChar = {
    name: "new test char",
    template: -1,

    defaultReplacement: [],
    uniqueAnims: [],
  }


  poseArray:Array<PartPose> = [];  

  currentPartTypeIndex:number = -1;

  appDiv = document.getElementById("app") as HTMLDivElement;
  menuObj:AnimMenu;
  canvasObj:AnimDisplayCanvas;

  canvasZoom = 2;
  canvasMouseX = 0;
  canvasMouseY = 0;

  imageNames:Array<string> = [];
  imageUrls:Array<string> = [];
  imageElements:Array<HTMLImageElement> = [];

  constructor() {
    this.menuObj = new AnimMenu(this);
    this.canvasObj = new AnimDisplayCanvas(this); 
    this.appDiv.setAttribute("style",appStyle); 
    this.canvasObj.RenderCanvas();   
    
  }

    changeFile = (event:InputEvent) => { 
    //console.log(event);
    return event;
  }
     
     
      
   
} 
 

class AnimMenu {
 

    
    projectNameHeader = document.createElement("h4"); 
    renameProjectButton = document.createElement("button");
    saveProjectButton = document.createElement("button");

    loadProjectButton:HTMLInputElement = document.createElement("input");

    imageDropDown = document.createElement("select");
    importButton = document.createElement("input");

    saveImageCanvas = document.createElement("canvas");



    //
    categoryPartTypeDiv = document.createElement("div");
    partTypeSelect = document.createElement("select");

    categoryPartsListDiv = document.createElement("div");
    categoryCharaTemplateDiv = document.createElement("div");
    categoryCharasListDiv = document.createElement("div");

    posesSelect = document.createElement("select");

    anchorsSelect = document.createElement("select");






    constructor(public main:Animonstrer)
    {
        const newDiv = document.createElement("div");
        newDiv.setAttribute("style",animMenuStyle);
        main.appDiv.appendChild(newDiv);
 
        ////-----project load save etc----
        this.projectNameHeader.innerText = "new project";
        newDiv.appendChild(this.projectNameHeader)

        const saveProjectDiv = document.createElement("div");
        newDiv.appendChild(saveProjectDiv);

        this.saveProjectButton.innerText = "Save as";
        saveProjectDiv.appendChild(this.saveProjectButton);

        this.renameProjectButton.innerText = "Rename";
        saveProjectDiv.appendChild(this.renameProjectButton);
        this.renameProjectButton.onclick = () => {
          let newName = prompt("Rename Project");
          if (newName != null)
          { 
            if (newName.length > 0)
              {
                this.main.projectObj.name = newName;
                this.projectNameHeader.innerText = newName;

              }
          }
        }
        const loadProjectDiv = document.createElement("div");
        newDiv.appendChild(loadProjectDiv);
        const loadLabel = document.createElement("label"); 
        loadLabel.classList.add("file-upload")
        loadLabel.setAttribute("style","font-size:16px;")
        loadLabel.innerHTML = "Load Project";  
        loadProjectDiv.appendChild(loadLabel);
        loadLabel.appendChild(this.loadProjectButton);
        this.loadProjectButton.setAttribute("type","file"); 
        this.loadProjectButton.setAttribute("accept",".monstrer");

        ////////----------- load a project!!! wow
        
        this.loadProjectButton.addEventListener("change", async (event:Event)=>{
            if (this.loadProjectButton.files != null)
            {
              const file = this.loadProjectButton.files[0];
              console.log(file); 

              const newObjJson = await new Promise((res,rej)=>{

                const reader = new FileReader();
                reader.onloadend = () => {
                  res(reader.result);                    
                }
                reader.onerror = rej;
                reader.readAsText(file); 
              });  


              if (typeof newObjJson === "string")
              { 
                const newObj = JSON.parse(newObjJson);
                if (newObj.monstrerVersion === "test version")
                { 
                  this.main.projectObj = newObj;
                  this.projectNameHeader.innerText = newObj.name;
                  this.imageDropDown.replaceChildren();


                  for (let i=0; i < newObj.imageBase64List.length; i++)
                  {
                      const newSrc:string = newObj.imageBase64List[i];
                      const newImg = new Image();
                      newImg.src = newSrc;
                      newImg.alt = newObj.imageNames[i];
                      this.main.imageElements.push(newImg);
                      addDropDownChoice(this.imageDropDown,newObj.imageNames[i],String(i));

                      newImg.onload = () => {
                        this.main.canvasObj.tempImage.imageElem = newImg;
                      } 
                  }

                  for (let i =0; i < newObj.partTypes.length; i++)
                  {
                    const loadPartName:string = newObj.partTypes[i].name;
                    const newOption = document.createElement("option");
                    
                    newOption.value = String(i);
                    newOption.innerText = loadPartName;
                    //newOption
                    
                    this.partTypeSelect.appendChild(newOption);
                  }
                  
                  
                }
              }
              else
              {
                console.log("whoa baby what's wrong");
              }
              

            }
        }); 
        //---------------------------------------


        // save project function

        this.saveProjectButton.addEventListener("click", ()=>{

          if (this.main.imageUrls.length >= 0)
          { 
            this.saveImageCanvas.setAttribute("width","120px");
            this.saveImageCanvas.setAttribute("height","120px"); 
 
            
            const jason = JSON.stringify(this.main.projectObj);

            const jasonArray:Array<string> = [jason]

            const blobby = new Blob(jasonArray)
            const url = URL.createObjectURL(blobby);
            const link = document.createElement("a");
            link.href = url;
            link.download = "project.monstrer";
            link.click();
          }

        })
        let divider = document.createElement("div");
        newDiv.appendChild(divider);
        divider.setAttribute("style","border-bottom:2px solid white;margin:10px;");

        //adding image from file
         const allImagesHeader = document.createElement("h5");
         allImagesHeader.innerText = "all images";
         newDiv.appendChild(allImagesHeader);

         const addNewLabel = document.createElement("label");
         addNewLabel.classList.add("file-upload")
         addNewLabel.innerText = "add new image";
         newDiv.appendChild(addNewLabel);

         addNewLabel.appendChild(this.importButton);
        this.importButton.setAttribute("type","file");
        this.importButton.setAttribute("accept","image/png, image/gif");  

        

        this.importButton.addEventListener("change", async (event:Event)=>{

          let index = this.main.projectObj.imageBase64List.length; 
          if (this.main.projectObj.imageBase64List[0] === "")
          {
            index = 0;
          }
          console.log("index ",index);
          this.main.imageUrls[index] = "TEMP";
          this.main.projectObj.imageBase64List[index] = "TEMP";

          console.log("64 list ",main.projectObj.imageBase64List);
            if (this.importButton.files != null)
            {    
                const file = this.importButton.files[0];
                const fileName = file.name;
                const url = URL.createObjectURL(this.importButton.files[0]);
                //this.main.canvasObj.tempImage.imageElem.src = url;
                //this.main.canvasObj.tempImage.loaded = false;
 
                const base64 = await new Promise((res,rej)=>{ 
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    res(reader.result);                    
                  }
                  reader.onerror = rej;
                  reader.readAsDataURL(file);
                });
                
                if (typeof base64 === "string")
                {
                  console.log("big ol test ",base64);
                  this.main.imageUrls[index] = base64;
                  this.main.projectObj.imageBase64List[index] = base64;
                  this.main.projectObj.imageNames[index] = fileName;
                  addDropDownChoice(this.imageDropDown,fileName,String(index));
                  this.imageDropDown.selectedIndex = this.imageDropDown.length-1;
                  
                  const newImg = new Image();
                  newImg.src = base64;
                  newImg.alt = fileName;
                  this.main.imageElements.push(newImg);
                  newImg.onload = () => {
                      this.main.canvasObj.tempImage.imageElem = newImg;
                  }
                   
                }
                else
                {
                  console.log("whoa baby what's wrong");
                }
                 
            }

        },false);

        newDiv.appendChild(this.imageDropDown);
        //this.imageDropDown.setAttribute("style","");
        this.imageDropDown.onchange = () => {
          const index = this.imageDropDown.selectedIndex;
          this.main.canvasObj.tempImage.imageElem = this.main.imageElements[index];
        }


        divider = document.createElement("div");
        newDiv.appendChild(divider);
        divider.setAttribute("style","border-bottom:2px solid white;margin:10px;");
          

        //choose editing category
         const categoryHeader = document.createElement("h5");
         categoryHeader.innerText = "category";
         newDiv.appendChild(categoryHeader);

         const partsTypeHeaderButton = document.createElement("h6");
         partsTypeHeaderButton.classList.add("category-button");
         partsTypeHeaderButton.classList.add("selected");
         partsTypeHeaderButton.innerText = "Part Type";
         newDiv.appendChild(partsTypeHeaderButton);

         const partsListHeaderButton = document.createElement("h6");
         partsListHeaderButton.classList.add("category-button");
         partsListHeaderButton.innerText = "Parts List";
         newDiv.appendChild(partsListHeaderButton);

         const charTemplatesHeaderButton = document.createElement("h6");
         charTemplatesHeaderButton.classList.add("category-button");
         charTemplatesHeaderButton.innerText = "Chara Template";
         newDiv.appendChild(charTemplatesHeaderButton);

         const charsListsHeaderButton = document.createElement("h6");
         charsListsHeaderButton.classList.add("category-button");
         charsListsHeaderButton.innerText = "Characters List";
         newDiv.appendChild(charsListsHeaderButton);

         divider = document.createElement("div");
         newDiv.appendChild(divider);
         divider.setAttribute("style","border-bottom:2px solid white;margin:10px;");


         //------ category : part types
         newDiv.appendChild(this.categoryPartTypeDiv);
         const partTypeHeader = document.createElement("h5");
         partTypeHeader.innerText = "Part Types";
         this.categoryPartTypeDiv.appendChild(partTypeHeader);
         this.categoryPartTypeDiv.appendChild(this.partTypeSelect);
         const addPartTypeButton = document.createElement("button");
         addPartTypeButton.innerText = "new part type";
         addPartTypeButton.onclick = () => {
          createPartType(this.main.projectObj.partTypes,this.partTypeSelect); 
             main.currentPartTypeIndex = this.main.projectObj.partTypes.length - 1;
         }
         this.categoryPartTypeDiv.appendChild(addPartTypeButton);
         const renamePartType = document.createElement("button");
         renamePartType.innerText = "rename"; 
         this.categoryPartTypeDiv.appendChild(renamePartType); 
         const deletePartType = document.createElement("button");
         deletePartType.innerText = "delete"; 
         this.categoryPartTypeDiv.appendChild(deletePartType);
         
         ///category: poses
         const posesTitle = document.createElement("h6");
         posesTitle.innerText = "Poses";
         this.categoryPartTypeDiv.appendChild(posesTitle);
         this.categoryPartTypeDiv.appendChild(this.posesSelect);

         
         const addPoseButton = document.createElement("button");
         addPoseButton.innerText = "new pose";
         addPoseButton.onclick = () => {
         // createNewPoseForPartType("name",this.main.currentPartType);
        }
         this.categoryPartTypeDiv.appendChild(addPoseButton);

         const renamePoseButton = document.createElement("button");
         renamePoseButton.innerText = "rename"; 
         this.categoryPartTypeDiv.appendChild(renamePoseButton); 
         const deletePoseButton = document.createElement("button");
         deletePoseButton.innerText = "delete"; 
         this.categoryPartTypeDiv.appendChild(deletePoseButton);
         
         
         const anchorsTitle = document.createElement("h6");
         anchorsTitle.innerText = "Anchors";
         this.categoryPartTypeDiv.appendChild(anchorsTitle);
         this.categoryPartTypeDiv.appendChild(this.anchorsSelect);

         const addAnchorButton = document.createElement("button");
         addAnchorButton.innerText = "new anchor";
         addAnchorButton.onclick = () => {

        }
         this.categoryPartTypeDiv.appendChild(addAnchorButton);

         const renameAnchorsButton = document.createElement("button");
         renameAnchorsButton.innerText = "rename"; 
         this.categoryPartTypeDiv.appendChild(renameAnchorsButton); 
         const deleteAnchorsButton = document.createElement("button");
         deleteAnchorsButton.innerText = "delete"; 
         this.categoryPartTypeDiv.appendChild(deleteAnchorsButton);
         

     }
 
}


///functional functions

const addDropDownChoice = (dropdown:HTMLSelectElement,name:string,value:string) => {
  const newChoice = document.createElement("option");
  newChoice.value = value;
  newChoice.innerText = name;
  dropdown.appendChild(newChoice);
  
}


const createNewPoseForPartType = (currentPartType:object,poseArray:Array<object>|null,select:HTMLSelectElement) => {
    
  if (poseArray != null)
  {
     let newName = prompt("choose new pose name for ");

    if (newName != null)
    {
      poseArray.push(

        { name:newName, }

      )
      const newOption = document.createElement("option");
      newOption.innerHTML= newName;
      select.appendChild(newOption);
    }
  }
}

const createPartType = (partTypeList:Array<object>,select:HTMLSelectElement) => {
  
  let newName = prompt("Choose part type name"); 
  
  if (newName != null)
  {
    
     const newChoice = document.createElement("option");
     newChoice.value = String(partTypeList.length);
     partTypeList.push({
      name:newName,
      anchors:[],
      poses:[],
    }); 

    newChoice.innerText = newName;
    select.appendChild(newChoice);
    let newPartName = prompt("Choose default part name for "+newName); 
    
  }
    
  
}

////web element group classes

export class SelectMiniMenu {

  listSelect:HTMLSelectElement = document.createElement("select");
  createNewButton:HTMLButtonElement = document.createElement("button");
  renameButton:HTMLButtonElement = document.createElement("button");
  deleteButton:HTMLButtonElement = document.createElement("button");

  constructor(public mainArray:Array<any>,public categoryName:string){
      this.createNewButton.innerText = "new " + categoryName; 

      this.listSelect.onchange = () => {
         
      }

      this.createNewButton.onclick = () => {
         
      }

      this.renameButton.onclick = () => {
         
      }
      
      this.deleteButton.onclick = () => {
         
      }
  }


  addToDiv = (div:HTMLDivElement) => {
    div.appendChild(this.listSelect); 
    div.appendChild(this.createNewButton);
    div.appendChild(this.renameButton);
    div.appendChild(this.deleteButton); 
  }

}

export class CategoryButton { 

  clickableHeader:HTMLHeadingElement = document.createElement("h6"); 
  categoryDiv:HTMLDivElement = document.createElement("div");

  constructor(public categoryName:string){
     this.clickableHeader.innerText = categoryName;
     
     this.clickableHeader.onclick = () =>{

     }
  }

}

///Animation Element Classes 
export class PartType {

  partTypeIconChar:string = "@";
  partTypePoseList:Array<PartPose> = [];

  partTypeAnchors:Array<string> = [];

  constructor(){
     
  }
}

export class UniquePart { 

  spriteList:Array<any> = [];
  
   
  constructor(public partType:null|PartType = null)
  {
     
  }

}

export class PartPose {

  defaultHitboxes:Array<[string,number,number,number,number]> = [];

  constructor(){
     
  }
}

export class CharaTemplate { 

  partsTypeList:Array<PartType> = [];
  defaultAnimations:Array<MonstrAnimation> = [];


  constructor(public templateName:string){
     
  }
}

export class UniqueCharacter 
{ 
   
   
   
  constructor(public charTemplate:null|CharaTemplate,public charName:string){
     if (charTemplate != null)
     {
         
     }
  }
}

export class AnimationFrame {

  isPose:boolean = false;

  frameDuration:number = 1;

  addedHitboxes:Array<[string,number,number,number,number]> = [];

  tags:Array<string> = [];

  extraParts:Array<UniquePart> = [];

  offsetPart:Array<[number,number]> = [];
  mirrorPart:Array<number> = [];
  flipPart:Array<number> = [];
  rotatePart:Array<number> = [];
  displayPart:Array<number> = []; 
  partPose:Array<number> = [];
  

  constructor() {

  }
}

export class MonstrAnimation { 
   
  numFrames = 1;
   
  uniqueCharSpecific:boolean = false;
  uniqueChar:null|UniqueCharacter = null;
   
  constructor(public charTemplate:CharaTemplate,public animationName:string){

    
  }

}




document.addEventListener('contextmenu', event => event.preventDefault());
const app = new Animonstrer(); 



