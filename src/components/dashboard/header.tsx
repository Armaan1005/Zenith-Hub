import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/95 px-4 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Logo className="h-6 w-6 text-primary-foreground/80 fill-primary" />
        <h1 className="font-headline text-xl font-semibold text-foreground">
          Zenith Hub
        </h1>
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
