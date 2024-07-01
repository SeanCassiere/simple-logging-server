import type { JSX, PropsWithChildren } from "hono/jsx";

const buttonStyles = {
  primary:
    "border border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm",
  secondary:
    "border border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
};

const buttonSize = {
  xs: "px-3 py-2 text-sm leading-4 font-medium rounded-md",
  sm: "px-4 py-2 text-sm font-medium rounded-md",
  md: "px-4 py-2 text-base font-medium rounded-md",
};

export function getButtonStyles(variant: keyof typeof buttonStyles, size: keyof typeof buttonSize = "md") {
  return ["inline-flex items-center justify-center", buttonStyles[variant], buttonSize[size]].join(" ");
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  class: className,
  ...props
}: PropsWithChildren<
  { variant?: keyof typeof buttonStyles; size?: keyof typeof buttonSize } & JSX.IntrinsicElements["button"]
>) {
  return (
    <button class={[getButtonStyles(variant, size), className].filter(Boolean).join(" ")} {...props}>
      {children}
    </button>
  );
}
