import {createElement,forwardRef} from "react";
import {cx,valid} from "../foundations/runtime.js";

export const buttonVariants=new Set(["primary","secondary","quiet","destructive"]);
export const buttonSizes=new Set(["compact","standard","comfortable","large"]);
export const buttonMaterials=new Set(["regular","gem"]);

export const ButtonControl=forwardRef(function ButtonControl({as="button",baseClass,variant="primary",size="comfortable",material="regular",loading=false,disabled=false,pressed,className="",type="button",onClick,children,...rest},ref){
  const toggleProps=typeof pressed==="boolean"?{"aria-pressed":pressed}:{};
  const handleClick=event=>{if(loading){event.preventDefault();event.stopPropagation();return;}onClick?.(event)};
  return createElement(as,{...rest,...toggleProps,ref,type,disabled,"aria-busy":loading||undefined,"aria-disabled":loading||disabled||undefined,
    "data-ol8-variant":valid(buttonVariants,variant,"primary"),"data-ol8-size":valid(buttonSizes,size,"comfortable"),"data-ol8-material":valid(buttonMaterials,material,"regular"),
    className:cx(baseClass,className),onClick:handleClick},children);
});
