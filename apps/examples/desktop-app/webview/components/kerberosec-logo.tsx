import { cn } from "@/lib/utils";

export function KerberoSecLogo({ className }: { className?: string }) {
	return (
		<span
			aria-hidden="true"
			className={cn("inline-block shrink-0 font-bold", className)}
		>
			KS
		</span>
	);
}
