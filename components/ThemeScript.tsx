/**
 * Inline script to apply stored theme before paint (avoids flash).
 * Default: light.
 */
export default function ThemeScript() {
  const script = `
    (function() {
      var key = 'it-tools-theme';
      var stored = localStorage.getItem(key);
      var theme = (stored === 'dark' || stored === 'light') ? stored : 'light';
      document.documentElement.classList.toggle('dark', theme === 'dark');
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
