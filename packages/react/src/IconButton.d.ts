import type {ButtonHTMLAttributes,ReactNode} from "react";
import type {ButtonSize,ButtonVariant} from "./Button.js";

export type IconButtonShape="rounded"|"circle";
export type IconButtonMaterial="regular"|"gem";
export type IconButtonMotion="system"|"none";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,"children"|"size">{
  icon:ReactNode;
  accessibleName:string;
  variant?:ButtonVariant;
  size?:ButtonSize;
  shape?:IconButtonShape;
  material?:IconButtonMaterial;
  loading?:boolean;
  pressed?:boolean;
  motion?:IconButtonMotion;
}

export declare const IconButton:import("react").ForwardRefExoticComponent<IconButtonProps&import("react").RefAttributes<HTMLButtonElement>>;
