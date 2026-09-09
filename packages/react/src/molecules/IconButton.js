import {createElement,forwardRef} from "react";
import {BusyIndicator} from "../atoms/BusyIndicator.js";
import {ButtonControl} from "../atoms/ButtonControl.js";
import {IconFrame,iconFrameSizeForControl} from "../atoms/IconFrame.js";

const shapes=new Set(["rounded","circle"]);
const motions=new Set(["system","none"]);

export const IconButton=forwardRef(function IconButton({icon,accessibleName,variant="quiet",size="comfortable",shape="rounded",material="regular",loading=false,disabled=false,pressed,motion="system",className="",...rest},ref){
  if(typeof accessibleName!=="string"||!accessibleName.trim())throw new TypeError("IconButton requires a non-empty accessibleName.");
  if(!icon&&!loading)throw new TypeError("IconButton requires icon artwork when it is not loading.");
  const iconSize=iconFrameSizeForControl(size,{large:"large"});
  const content=loading?createElement(BusyIndicator,{className:"ol8-IconButton__status"}):createElement(IconFrame,{className:"ol8-IconButton__icon",size:iconSize},icon);
  return createElement(ButtonControl,{...rest,ref,baseClass:"ol8-IconButton",variant,size,material,loading,disabled,pressed,className,"aria-label":accessibleName,
    "data-ol8-shape":shapes.has(shape)?shape:"rounded","data-ol8-motion":motions.has(motion)?motion:"system"},
    createElement("span",{className:"ol8-IconButton__surface","aria-hidden":"true"},content)
  );
});
