export function Footer() {
  return (
    <footer class="border-t border-stone-200 dark:border-stone-800 bg-[#f4f2ed] dark:bg-[#0c0c0e] mt-24 py-16 text-stone-600 dark:text-stone-400 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="md:col-span-2">
            <a href="/" class="font-serif text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
              CHRONICLE
            </a>
            <p class="mt-4 text-sm text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed">
              An independent publication dedicated to deep technical craft, intentional software design, and long-form
              architecture essays.
            </p>
            <div class="mt-6 flex items-center gap-4 text-xs font-mono text-stone-500 dark:text-stone-400">
              <span>POWERED BY CEQURE & SOLIDJS 2</span>
              <span>•</span>
              <span>EST. 2026</span>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-mono tracking-wider uppercase text-stone-900 dark:text-stone-200 font-semibold mb-4">
              Sections
            </h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  href="/?category=Technology"
                  class="hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="/?category=Engineering"
                  class="hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
                >
                  Engineering
                </a>
              </li>
              <li>
                <a href="/?category=Design" class="hover:text-stone-950 dark:hover:text-stone-100 transition-colors">
                  Design & Craft
                </a>
              </li>
              <li>
                <a
                  href="/?category=Architecture"
                  class="hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
                >
                  Architecture
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-xs font-mono tracking-wider uppercase text-stone-900 dark:text-stone-200 font-semibold mb-4">
              Community
            </h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a href="/write" class="hover:text-stone-950 dark:hover:text-stone-100 transition-colors">
                  Become a Writer
                </a>
              </li>
              <li>
                <a href="/login" class="hover:text-stone-950 dark:hover:text-stone-100 transition-colors">
                  Author Sign In
                </a>
              </li>
              <li>
                <a href="/register" class="hover:text-stone-950 dark:hover:text-stone-100 transition-colors">
                  Create Account
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-stone-200/60 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <p>
            © {new Date().getFullYear()} Chronicle Journal. Built with SolidJS 2 and Cequre Zero-Dependency Client SDK.
          </p>
          <p class="mt-2 sm:mt-0 font-mono">Row-Level Security & Native Typed SDK</p>
        </div>
      </div>
    </footer>
  );
}
