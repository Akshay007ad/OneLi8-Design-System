import type {AnchorHTMLAttributes,HTMLAttributes,ReactNode} from "react";

export type LinkForm="inline"|"standalone"|"navigation";
export type LinkSize="small"|"standard"|"large"|"inherit";
export type LinkCurrent="page"|"step"|"location"|"date"|"time"|"true"|boolean;
export type LinkMotion="system"|"none";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>,"href">{
  href:string;
  form?:LinkForm;
  size?:LinkSize;
  current?:LinkCurrent;
  motion?:LinkMotion;
}

export declare const Link:import("react").ForwardRefExoticComponent<LinkProps&import("react").RefAttributes<HTMLAnchorElement>>;
