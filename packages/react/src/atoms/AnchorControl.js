import {createElement,forwardRef} from "react";
import {cx} from "../foundations/runtime.js";

export const AnchorControl=forwardRef(function AnchorControl({href,current,className="",children,...rest},ref){
  if(typeof href!=="string"||!href.trim())throw new TypeError("Link requires a non-empty href.");
  return createElement("a",{...rest,ref,href,"aria-current":current||undefined,className:cx("ol8-AnchorControl",className)},children);
});
