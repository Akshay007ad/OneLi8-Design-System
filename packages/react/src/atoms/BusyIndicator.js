import {createElement} from "react";
import {Icon} from "./Icon.js";

export function BusyIndicator({className="ol8-BusyIndicator"}){
  return createElement(Icon,{name:"loading",className});
}
