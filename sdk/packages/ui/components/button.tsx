"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
	type ButtonHTMLAttributes,
	cloneElement,
	forwardRef,
	isValidElement,
	type MouseEventHandler,
	type ReactNode,
} from "react";

const BASE =
	"inline-flex items-center justify-center whitespace-nowrap rounded-kerberosec-ui-md font-kerberosec-ui-medium cursor-pointer " +
	"disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 " +
	"[&_svg]:pointer-events-none [&_svg]:shrink-0 shrink-0 " +
	"outline-none focus-visible:ring-2 focus-visible:ring-kerberosec-ui-ring/60 transition-colors";

// ─── Button ───────────────────────────────────────────────────────────────────

export const buttonVariants = cva(BASE, {
	variants: {
		variant: {
			fill: "",
			surface: "",
			ghost: "",
		},
		tone: {
			accent: "",
			neutral: "",
			destructive: "",
		},
		size: {
			xs: "h-7 px-2.5 gap-1.5 text-kerberosec-ui-xs [&_svg:not([class*='size-'])]:size-3",
			sm: "h-8 px-3 gap-1.5 text-kerberosec-ui-sm [&_svg:not([class*='size-'])]:size-3.5",
			md: "h-9 px-3.5 gap-2 text-kerberosec-ui-sm [&_svg:not([class*='size-'])]:size-4",
			lg: "h-10 px-4 gap-2 text-kerberosec-ui-base [&_svg:not([class*='size-'])]:size-4",
		},
	},
	compoundVariants: [
		// fill
		{
			variant: "fill",
			tone: "accent",
			className:
				"bg-kerberosec-ui-primary text-kerberosec-ui-primary-foreground hover:bg-kerberosec-ui-primary-emphasis",
		},
		{
			variant: "fill",
			tone: "neutral",
			className:
				"bg-kerberosec-ui-secondary text-kerberosec-ui-secondary-foreground hover:bg-kerberosec-ui-border",
		},
		{
			variant: "fill",
			tone: "destructive",
			className:
				"bg-kerberosec-ui-destructive text-kerberosec-ui-destructive-foreground hover:bg-kerberosec-ui-destructive/90",
		},
		// surface
		{
			variant: "surface",
			tone: "accent",
			className:
				"bg-kerberosec-ui-accent text-kerberosec-ui-accent-foreground hover:bg-kerberosec-ui-primary/15",
		},
		{
			variant: "surface",
			tone: "neutral",
			className:
				"bg-kerberosec-ui-surface-hover-lighter text-kerberosec-ui-foreground hover:bg-kerberosec-ui-surface-hover",
		},
		{
			variant: "surface",
			tone: "destructive",
			className:
				"bg-kerberosec-ui-destructive/10 text-kerberosec-ui-destructive hover:bg-kerberosec-ui-destructive/15",
		},
		// ghost
		{
			variant: "ghost",
			tone: "accent",
			className: "text-kerberosec-ui-primary hover:bg-kerberosec-ui-primary/10",
		},
		{
			variant: "ghost",
			tone: "neutral",
			className:
				"text-kerberosec-ui-muted-foreground hover:bg-kerberosec-ui-surface-hover hover:text-kerberosec-ui-foreground",
		},
		{
			variant: "ghost",
			tone: "destructive",
			className:
				"text-kerberosec-ui-destructive hover:bg-kerberosec-ui-destructive/10",
		},
	],
	defaultVariants: {
		variant: "fill",
		tone: "accent",
		size: "md",
	},
});

export type ButtonVariant = NonNullable<
	VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonTone = NonNullable<
	VariantProps<typeof buttonVariants>["tone"]
>;
export type ButtonSize = NonNullable<
	VariantProps<typeof buttonVariants>["size"]
>;

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	children?: ReactNode;
}

const preventDisabledActivation: MouseEventHandler<HTMLElement> = (event) => {
	event.preventDefault();
	event.stopPropagation();
};

function disableComposedChild(children: ReactNode) {
	if (
		!isValidElement<{
			onClick?: MouseEventHandler;
			onClickCapture?: MouseEventHandler;
		}>(children)
	) {
		return children;
	}

	// Radix Slot composes same-element event handlers child-first. Remove the
	// child's activation handlers before Slot sees them so disabled composed
	// controls cannot run an action before our guard.
	return cloneElement(children, {
		onClick: preventDisabledActivation,
		onClickCapture: preventDisabledActivation,
	});
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			asChild = false,
			children,
			className,
			disabled,
			onClick,
			onClickCapture,
			size,
			tone,
			type,
			variant,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				{...props}
				className={clsx(buttonVariants({ size, tone, variant }), className)}
				data-slot="button"
				ref={ref}
				{...(asChild
					? disabled
						? {
								"aria-disabled": true,
								"data-disabled": "",
								onClick: preventDisabledActivation,
								onClickCapture: preventDisabledActivation,
								tabIndex: -1,
							}
						: { onClick, onClickCapture }
					: { disabled, onClick, onClickCapture, type: type ?? "button" })}
			>
				{asChild && disabled ? disableComposedChild(children) : children}
			</Comp>
		);
	},
);
Button.displayName = "Button";

// ─── IconButton ───────────────────────────────────────────────────────────────

export const iconButtonVariants = cva(BASE, {
	variants: {
		variant: {
			fill: "",
			surface: "",
			ghost: "",
		},
		tone: {
			accent: "",
			neutral: "",
			destructive: "",
		},
		size: {
			xs: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
			sm: "size-8 [&_svg:not([class*='size-'])]:size-4",
			md: "size-9 [&_svg:not([class*='size-'])]:size-4",
			lg: "size-10 [&_svg:not([class*='size-'])]:size-5",
		},
	},
	compoundVariants: [
		// fill
		{
			variant: "fill",
			tone: "accent",
			className:
				"bg-kerberosec-ui-primary text-kerberosec-ui-primary-foreground hover:bg-kerberosec-ui-primary-emphasis",
		},
		{
			variant: "fill",
			tone: "neutral",
			className:
				"bg-kerberosec-ui-secondary text-kerberosec-ui-secondary-foreground hover:bg-kerberosec-ui-border",
		},
		{
			variant: "fill",
			tone: "destructive",
			className:
				"bg-kerberosec-ui-destructive text-kerberosec-ui-destructive-foreground hover:bg-kerberosec-ui-destructive/90",
		},
		// surface
		{
			variant: "surface",
			tone: "accent",
			className:
				"bg-kerberosec-ui-accent text-kerberosec-ui-accent-foreground hover:bg-kerberosec-ui-primary/15",
		},
		{
			variant: "surface",
			tone: "neutral",
			className:
				"bg-kerberosec-ui-surface-hover-lighter text-kerberosec-ui-foreground hover:bg-kerberosec-ui-surface-hover",
		},
		{
			variant: "surface",
			tone: "destructive",
			className:
				"bg-kerberosec-ui-destructive/10 text-kerberosec-ui-destructive hover:bg-kerberosec-ui-destructive/15",
		},
		// ghost
		{
			variant: "ghost",
			tone: "accent",
			className: "text-kerberosec-ui-primary hover:bg-kerberosec-ui-primary/10",
		},
		{
			variant: "ghost",
			tone: "neutral",
			className:
				"text-kerberosec-ui-muted-foreground hover:bg-kerberosec-ui-surface-hover hover:text-kerberosec-ui-foreground",
		},
		{
			variant: "ghost",
			tone: "destructive",
			className:
				"text-kerberosec-ui-destructive hover:bg-kerberosec-ui-destructive/10",
		},
	],
	defaultVariants: {
		variant: "ghost",
		tone: "neutral",
		size: "sm",
	},
});

export interface IconButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof iconButtonVariants> {
	"aria-label": string;
	asChild?: boolean;
	children?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
	(
		{
			asChild = false,
			children,
			className,
			disabled,
			onClick,
			onClickCapture,
			size,
			tone,
			type,
			variant,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				{...props}
				className={clsx(iconButtonVariants({ size, tone, variant }), className)}
				data-slot="icon-button"
				ref={ref}
				{...(asChild
					? disabled
						? {
								"aria-disabled": true,
								"data-disabled": "",
								onClick: preventDisabledActivation,
								onClickCapture: preventDisabledActivation,
								tabIndex: -1,
							}
						: { onClick, onClickCapture }
					: { disabled, onClick, onClickCapture, type: type ?? "button" })}
			>
				{asChild && disabled ? disableComposedChild(children) : children}
			</Comp>
		);
	},
);
IconButton.displayName = "IconButton";
