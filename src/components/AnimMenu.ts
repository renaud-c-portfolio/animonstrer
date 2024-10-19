import { Animonstrer } from "../main";

const style = `
    width:220px;
    height:100%;
    background:yellow;
`

export class AnimMenu {
    constructor(main:Animonstrer)
    {
        const newDiv = document.createElement("div");
        newDiv.setAttribute("style",style);
        main.appDiv.appendChild(newDiv);

        const importForm = document.createElement("form");
        newDiv.appendChild(importForm)
        const importButton = document.createElement("input");
        importButton.setAttribute("type","file");
        importButton.setAttribute("accept","image/png, image/gif");
        importForm.appendChild(importButton); 
        newDiv.appendChild(importButton);

     }
 
}