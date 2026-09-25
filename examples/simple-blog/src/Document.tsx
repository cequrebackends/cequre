import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";

const themeInitScript = `(function() {
  try {
    var stored = localStorage.getItem('chronicle_theme');
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();`;

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..800&family=Plus+Jakarta+Sans:wght@300..800&display=swap"
          rel="stylesheet"
        />
        {/* Prevent FOUC: Synchronously resolve dark/light theme before rendering */}
        <script>{themeInitScript}</script>
        <HydrationScript />
      </head>
      <body class="bg-paper text-ink transition-colors duration-200">{props.children}</body>
    </html>
  );
}
