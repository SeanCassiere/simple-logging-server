import type { FC, PropsWithChildren } from "hono/jsx";

export const RootDocument: FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <title>{title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">{children}</body>
    </html>
  );
};
