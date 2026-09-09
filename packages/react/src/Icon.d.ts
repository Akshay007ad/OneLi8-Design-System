export type IconName="add"|"forward"|"critical"|"visibility-open"|"loading"|"caution"|"positive"|"informative"|"visibility-closed"|"chevron-down"|"chevron-up"|"search"|"clear"|"close"|"selection-check"|"selection-mixed"|"selection-dot";
export interface IconProps{name:IconName;className?:string}
export declare const iconNames:readonly IconName[];
export declare function Icon(props:IconProps):import("react").ReactNode;
