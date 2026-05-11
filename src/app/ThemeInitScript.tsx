export default function ThemeInitScript() {
  const code = `
  (function () {
    try {
      var KEY = "theme";
      var theme = localStorage.getItem(KEY) || "system";
      var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effective = theme === "system" ? (systemDark ? "dark" : "light") : theme;
      if (theme === "system") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", effective);
      if (effective === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) {}
  })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

