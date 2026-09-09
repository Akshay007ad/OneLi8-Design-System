import type {ButtonHTMLAttributes, ReactNode} from "react";

export type ButtonVariant="primary"|"secondary"|"quiet"|"destructive";
export type ButtonSize="compact"|"standard"|"comfortable"|"large";
export type ButtonIconMotion="none"|"rotate"|"forward"|"backward";
export type ButtonMaterial="regular"|"gem";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,"size">{
  variant?:ButtonVariant;
  size?:ButtonSize;
  material?:ButtonMaterial;
  loading?:boolean;
  pressed?:boolean;
  leadingIcon?:ReactNode;
  trailingIcon?:ReactNode;
  iconMotion?:ButtonIconMotion;
  fullWidth?:boolean;
}

export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps&import("react").RefAttributes<HTMLButtonElement>>;
