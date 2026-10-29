import P3TransitionLink from "@/components/P3TransitionLink";

export default function About() {
  return (
    <div>
      <h1 className="mb-6 w-fit -skew-x-6 bg-foreground px-4 py-1 text-2xl font-bold font-brand italic text-background shadow-[4px_4px_0_0_var(--shadow)]">
        <span className="inline-block skew-x-6">
          About<span className="text-background">.</span>
        </span>
      </h1>
      <div className="-skew-x-2 border-2 border-foreground bg-surface p-4 shadow-[5px_5px_0_0_var(--shadow)]">
        <div className="skew-x-2">
          <p className="text-muted">Hi. This is the page about learning Next.js.</p>
        </div>
      </div>
      <div className="mt-8 text-center">
        <P3TransitionLink
          href="/"
          className="inline-block -skew-x-6 bg-accent px-3 py-1 text-sm font-bold text-background"
        >
          <span className="inline-block skew-x-6">← 首页</span>
        </P3TransitionLink>
      </div>
    </div>
  );
}
