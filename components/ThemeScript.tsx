// Inline script that applies the saved theme before paint to avoid a flash.
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');var d=t? t==='dark' : true;document.documentElement.classList.toggle('dark', d);}catch(e){document.documentElement.classList.add('dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
