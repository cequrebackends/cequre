import { createMemo, For, Show, Switch, Match } from "solid-js";
import { marked, type Tokens, type Token } from "marked";

interface MarkdownProps {
  content: string;
  class?: string;
}

function InlineRenderer(props: { tokens?: Token[] }) {
  return (
    <Show when={props.tokens && props.tokens.length > 0}>
      <For each={props.tokens}>
        {(token) => (
          <Switch fallback={"raw" in token ? (token as any).raw : ""}>
            <Match when={token.type === "strong"}>
              <strong class="font-semibold text-stone-950">
                <InlineRenderer tokens={(token as Tokens.Strong).tokens} />
              </strong>
            </Match>
            <Match when={token.type === "em"}>
              <em class="italic">
                <InlineRenderer tokens={(token as Tokens.Em).tokens} />
              </em>
            </Match>
            <Match when={token.type === "codespan"}>
              <code class="px-1.5 py-0.5 rounded bg-stone-100 text-stone-900 font-mono text-xs sm:text-sm border border-stone-200">
                {(token as Tokens.Codespan).text}
              </code>
            </Match>
            <Match when={token.type === "link"}>
              <a
                href={(token as Tokens.Link).href}
                class="text-amber-800 underline underline-offset-2 hover:text-stone-950 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InlineRenderer tokens={(token as Tokens.Link).tokens} />
              </a>
            </Match>
            <Match when={token.type === "text"}>
              <Show
                when={(token as Tokens.Text).tokens && (token as Tokens.Text).tokens!.length > 0}
                fallback={(token as Tokens.Text).text}
              >
                <InlineRenderer tokens={(token as Tokens.Text).tokens} />
              </Show>
            </Match>
          </Switch>
        )}
      </For>
    </Show>
  );
}

export function Markdown(props: MarkdownProps) {
  const tokens = createMemo(() => {
    if (!props.content) return [];
    return marked.lexer(props.content);
  });

  return (
    <div class={props.class || "article-prose max-w-none"}>
      <For each={tokens()}>
        {(token) => (
          <Switch>
            <Match when={token.type === "heading"}>
              <Switch>
                <Match when={(token as Tokens.Heading).depth === 1}>
                  <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-950 mt-10 mb-4 tracking-tight">
                    <InlineRenderer tokens={(token as Tokens.Heading).tokens} />
                  </h1>
                </Match>
                <Match when={(token as Tokens.Heading).depth === 2}>
                  <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-950 mt-8 mb-4 tracking-tight">
                    <InlineRenderer tokens={(token as Tokens.Heading).tokens} />
                  </h2>
                </Match>
                <Match when={(token as Tokens.Heading).depth === 3}>
                  <h3 class="font-serif text-xl sm:text-2xl font-bold text-stone-950 mt-6 mb-3">
                    <InlineRenderer tokens={(token as Tokens.Heading).tokens} />
                  </h3>
                </Match>
                <Match when={(token as Tokens.Heading).depth > 3}>
                  <h4 class="font-serif text-lg sm:text-xl font-semibold text-stone-900 mt-4 mb-2">
                    <InlineRenderer tokens={(token as Tokens.Heading).tokens} />
                  </h4>
                </Match>
              </Switch>
            </Match>

            <Match when={token.type === "paragraph"}>
              <p class="text-lg leading-relaxed text-stone-800 mb-6 font-light">
                <InlineRenderer tokens={(token as Tokens.Paragraph).tokens} />
              </p>
            </Match>

            <Match when={token.type === "blockquote"}>
              <blockquote class="border-l-3 border-amber-800 pl-6 my-6 font-serif italic text-xl text-stone-700 leading-relaxed bg-stone-50/50 py-2 rounded-r-lg">
                <For each={(token as Tokens.Blockquote).tokens}>
                  {(innerToken) => (
                    <Show when={innerToken.type === "paragraph"}>
                      <p class="mb-0">
                        <InlineRenderer tokens={(innerToken as Tokens.Paragraph).tokens} />
                      </p>
                    </Show>
                  )}
                </For>
              </blockquote>
            </Match>

            <Match when={token.type === "code"}>
              <div class="my-6 rounded-2xl bg-stone-900 p-5 sm:p-6 overflow-x-auto text-stone-100 shadow-md">
                <Show when={(token as Tokens.Code).lang}>
                  <div class="text-[11px] font-mono tracking-wider text-stone-400 uppercase mb-2">
                    {(token as Tokens.Code).lang}
                  </div>
                </Show>
                <pre class="font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto m-0 p-0 bg-transparent text-inherit">
                  <code>{(token as Tokens.Code).text}</code>
                </pre>
              </div>
            </Match>

            <Match when={token.type === "list"}>
              <Show
                when={(token as Tokens.List).ordered}
                fallback={
                  <ul class="list-disc pl-6 mb-6 space-y-2 text-stone-800 text-lg">
                    <For each={(token as Tokens.List).items}>
                      {(item) => (
                        <li class="pl-1">
                          <InlineRenderer tokens={item.tokens} />
                        </li>
                      )}
                    </For>
                  </ul>
                }
              >
                <ol class="list-decimal pl-6 mb-6 space-y-2 text-stone-800 text-lg">
                  <For each={(token as Tokens.List).items}>
                    {(item) => (
                      <li class="pl-1">
                        <InlineRenderer tokens={item.tokens} />
                      </li>
                    )}
                  </For>
                </ol>
              </Show>
            </Match>

            <Match when={token.type === "hr"}>
              <hr class="my-8 border-t border-stone-200" />
            </Match>
          </Switch>
        )}
      </For>
    </div>
  );
}
