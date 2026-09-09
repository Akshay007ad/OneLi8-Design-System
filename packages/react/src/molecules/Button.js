import {createElement,forwardRef} from "react";
import {BusyIndicator} from "../atoms/BusyIndicator.js";
import {ButtonControl} from "../atoms/ButtonControl.js";
import {IconFrame,iconFrameSizeForControl} from "../atoms/IconFrame.js";

const motions=new Set(["none","rotate","forward","backward"]);

export const Button=forwardRef(function Button({
  children,variant="primary",size="comfortable",material="regular",loading=false,disabled=false,pressed,
  leadingIcon,trailingIcon,iconMotion="none",fullWidth=false,className="",type="button",onClick,...rest
},ref){
  const resolvedMotion=motions.has(iconMotion)?iconMotion:"none";
  const iconSize=iconFrameSizeForControl(size);
  const content=[];
  if(leadingIcon)content.push(createElement(IconFrame,{className:"ol8-Button__icon",size:iconSize,key:"leading"},leadingIcon));
  if(loading)content.push(createElement(BusyIndicator,{className:"ol8-Button__status",key:"status"}));
  content.push(createElement("span",{className:"ol8-Button__label",key:"label"},children));
  if(trailingIcon)content.push(createElement(IconFrame,{className:"ol8-Button__icon",size:iconSize,key:"trailing"},trailingIcon));
  return createElement(ButtonControl,{...rest,ref,type,disabled,loading,pressed,variant,size,material,className,baseClass:"ol8-Button",onClick,
    "data-ol8-icon-motion":resolvedMotion,"data-ol8-full-width":fullWidth||undefined},content);
});
