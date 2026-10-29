const startYear = 2026;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 mt-8 border-t-[3px] border-foreground">
      <div className="mx-auto flex max-w-2xl items-center justify-between p-4 text-sm text-muted">
        <span>© {startYear}-{year} kiyone.top</span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-2 w-2 -skew-x-12 bg-accent-2" />
          <span aria-hidden className="inline-block h-2 w-2 -skew-x-12 bg-accent-3" />
          <span>Powered by Next.js</span>
        </span>
      </div>
    </footer>
  );
}
