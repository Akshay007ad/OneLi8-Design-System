import {createElement} from "react";

export function Label({children,className="ol8-NavigationItem__label"}){
  return createElement("span",{className},children);
}
