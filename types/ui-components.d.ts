declare module "@/components/ui/button" {
  import * as React from "react";

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    variant?: string;
    size?: string;
  }

  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >;

  // Used for styling variants; keep loose typing to match JS implementation.
  export const buttonVariants: (...args: any[]) => string;
}

declare module "@/components/ui/input" {
  import * as React from "react";

  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

  export const Input: React.ForwardRefExoticComponent<
    InputProps & React.RefAttributes<HTMLInputElement>
  >;
}

declare module "@/components/ui/checkbox" {
  import * as React from "react";

  export interface CheckboxProps extends React.ComponentPropsWithoutRef<"button"> {
    checked?: boolean | "indeterminate";
    defaultChecked?: boolean;
    disabled?: boolean;
    required?: boolean;
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
  }

  export const Checkbox: React.ForwardRefExoticComponent<
    CheckboxProps & React.RefAttributes<HTMLButtonElement>
  >;
}

declare module "@/components/ui/card" {
  import * as React from "react";

  export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

  export const Card: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardHeader: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardContent: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardFooter: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardTitle: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardDescription: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
}

declare module "@/components/ui/label" {
  import * as React from "react";

  export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

  export const Label: React.ForwardRefExoticComponent<
    LabelProps & React.RefAttributes<HTMLLabelElement>
  >;
}
