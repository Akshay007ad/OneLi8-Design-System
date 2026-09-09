import {createElement} from "react";

const definitions={
  "add":[["path",{d:"M12 5V19M5 12H19"}]],
  "forward":[["path",{d:"M3 12H21M15 18L21 12L15 6"}]],
  "critical":[["circle",{cx:12,cy:12,r:9}],["path",{d:"M9 9L15 15M15 9L9 15"}]],
  "visibility-open":[["path",{d:"M3 12C5.25 8.25 8.25 6.375 12 6.375C15.75 6.375 18.75 8.25 21 12C18.75 15.75 15.75 17.625 12 17.625C8.25 17.625 5.25 15.75 3 12Z"}],["circle",{cx:12,cy:12,r:2.625}]],
  "loading":[["path",{d:"M12 3C14.082 2.998 16.101 3.718 17.712 5.038C19.322 6.358 20.426 8.195 20.834 10.237C21.241 12.279 20.929 14.399 19.949 16.236C18.968 18.074 17.382 19.514 15.458 20.312C13.535 21.111 11.395 21.217 9.402 20.614C7.409 20.011 5.686 18.736 4.528 17.005C3.37 15.275 2.848 13.196 3.051 11.124C3.253 9.051 4.169 7.113 5.64 5.64"}]],
  "caution":[["circle",{cx:12,cy:12,r:9}],["path",{d:"M12 7V13"}],["circle",{cx:12,cy:16.6,r:1,fill:"currentColor",stroke:"none"}]],
  "positive":[["circle",{cx:12,cy:12,r:9}],["path",{d:"M7.6 12.2L10.6 15.2L16.6 9.2"}]],
  "informative":[["circle",{cx:12,cy:12,r:9}],["path",{d:"M12 11V16"}],["circle",{cx:12,cy:7.6,r:1,fill:"currentColor",stroke:"none"}]],
  "visibility-closed":[["path",{d:"M4.5 10.5C6.75 13.5 9.25 15 12 15C14.75 15 17.25 13.5 19.5 10.5M6.75 13.05L5.4 15M9.75 14.55L9.3 16.8M14.25 14.55L14.7 16.8M17.25 13.05L18.6 15"}]],
  "chevron-down":[["path",{d:"M5 8.5L12 15.5L19 8.5"}]],
  "chevron-up":[["path",{d:"M5 15.5L12 8.5L19 15.5"}]],
  "search":[["path",{d:"M15 15L20 20M10 3C6.134 3 3 6.134 3 10C3 13.866 6.134 17 10 17C13.866 17 17 13.866 17 10C17 6.134 13.866 3 10 3Z"}]],
  "clear":[["path",{d:"M5 5L19 19M19 5L5 19"}]],
  "close":[["path",{d:"M6 6L18 18M18 6L6 18"}]],
  "selection-check":[["path",{d:"M6.9 12.15L10.2 15.45L17.1 8.55"}]],
  "selection-mixed":[["path",{d:"M7.5 12H16.5"}]],
  "selection-dot":[["circle",{cx:12,cy:12,r:6,fill:"currentColor",stroke:"none"}]]
};

export const iconNames=Object.freeze(Object.keys(definitions));

export function Icon({name,className=""}){
  const definition=definitions[name];
  if(!definition)return null;
  return createElement("svg",{className:["ol8-Icon",className].filter(Boolean).join(" "),viewBox:"0 0 24 24",fill:"none",
    stroke:"currentColor",strokeWidth:"var(--ol8-component-icon-stroke)",strokeLinecap:"round",strokeLinejoin:"round",
    "data-ol8-icon":name,"aria-hidden":"true",focusable:"false"},
    ...definition.map(([element,props],index)=>createElement(element,{vectorEffect:props.stroke==="none"?undefined:"non-scaling-stroke",...props,key:index})));
}
