import {createElement,forwardRef} from "react";
import {AnchorControl} from "../atoms/AnchorControl.js";
import {Label} from "../atoms/Label.js";

const forms=new Set(["inline","standalone","navigation"]);
const sizes=new Set(["small","standard","large","inherit"]);
const motions=new Set(["system","none"]);

export const Link=forwardRef(function Link({children,href,form="inline",size="standard",current,motion="system",className="",...rest},ref){
  return createElement(AnchorControl,{...rest,ref,href,current,className:["ol8-Link",className].filter(Boolean).join(" "),
    "data-ol8-form":forms.has(form)?form:"inline","data-ol8-size":sizes.has(size)?size:"standard","data-ol8-motion":motions.has(motion)?motion:"system"},
    createElement(Label,{className:"ol8-Link__label"},children)
  );
});
