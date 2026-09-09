import {createElement} from "react";

const presentations=new Set(["micro","compact","small","standard","medium","large","xlarge","spacious","display","hero","landmark"]);

export function iconFrameSizeForControl(size,{large="standard"}={}){
  if(size==="compact"||size==="standard")return "small";
  if(size==="large")return large;
  return "standard";
}

export function iconFrameSizeForChoice(size){
  return size==="comfortable"||size==="large"?"compact":"micro";
}

export function IconFrame({children,className="ol8-NavigationItem__icon",size="standard"}){
  if(!children)return null;
  const resolvedSize=presentations.has(size)?size:"standard";
  return createElement("span",{className:["ol8-IconFrame",className].filter(Boolean).join(" "),"data-ol8-icon-size":resolvedSize,"aria-hidden":"true"},children);
}
