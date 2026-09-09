import {useEffect,useState} from "react";
export {enabledIndexes,nextEnabled,rovingIndex} from "./collection.js";

export const navigationSizes=new Set(["compact","standard","comfortable","large"]);
export const navigationMaterials=new Set(["regular","gem"]);
export const tabHierarchies=new Set(["primary","secondary","tertiary"]);
export const tabOrientations=new Set(["horizontal","vertical"]);
export const tabActivations=new Set(["automatic","manual"]);
export const tabOverflows=new Set(["none","scroll"]);
export const segmentBehaviors=new Set(["single","multi","momentary"]);
export const segmentPresentations=new Set(["fill","line","outline","pill","icons","stacked"]);
export const segmentWidths=new Set(["equal","content"]);
export const tabBarPresentations=new Set(["bottom","inline","sidebar","spatial"]);
export const choiceSizes=navigationSizes;
export const choiceMaterials=navigationMaterials;

export const valid=(set,value,fallback)=>set.has(value)?value:fallback;
export const cx=(...values)=>values.filter(Boolean).join(" ");
export const assignRef=(ref,value)=>{if(typeof ref==="function")ref(value);else if(ref)ref.current=value;};
export function useControllableValue(value,defaultValue,onValueChange){
  const [internal,setInternal]=useState(defaultValue);
  const controlled=value!==undefined;
  const selected=controlled?value:internal;
  const setSelected=next=>{
    if(!controlled)setInternal(next);
    onValueChange?.(next);
  };
  return [selected,setSelected];
}

export function useNativeCheckedState(checked,defaultChecked,inputRef){
  const controlled=checked!==undefined;
  const [internal,setInternal]=useState(Boolean(defaultChecked));
  useEffect(()=>{
    if(controlled)return;
    const input=inputRef.current;
    const form=input?.form;
    if(!form)return;
    const synchronize=()=>queueMicrotask(()=>setInternal(Boolean(input.checked)));
    form.addEventListener("reset",synchronize);
    return ()=>form.removeEventListener("reset",synchronize);
  },[controlled,inputRef]);
  return [controlled?Boolean(checked):internal,next=>{if(!controlled)setInternal(Boolean(next))}];
}
