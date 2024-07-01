import type { FC, PropsWithChildren } from "hono/jsx";

export const Card: FC<PropsWithChildren<{ class?: string }>> = ({ class: className, children }) => {
  return (
    <div
      class={["rounded-lg border bg-white text-gray-950 shadow overflow-hidden", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
};
