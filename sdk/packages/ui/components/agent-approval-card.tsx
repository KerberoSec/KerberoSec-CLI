"use client";

import { type ReactNode, useId } from "react";

export type AgentApprovalAction = "approve" | "reject";

export interface AgentApprovalCardProps {
	description?: ReactNode;
	detail?: ReactNode;
	error?: ReactNode;
	meta?: ReactNode;
	onApprove: () => void;
	onReject: () => void;
	responding?: AgentApprovalAction;
	title: ReactNode;
}

function Spinner() {
	return (
		<svg
			aria-hidden="true"
			className="kerberosec-ui-agent-approval-card__spinner mr-1 size-3.5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-2"
			viewBox="0 0 24 24"
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	);
}

export function AgentApprovalCard({
	description,
	detail,
	error,
	meta,
	onApprove,
	onReject,
	responding,
	title,
}: AgentApprovalCardProps) {
	const titleId = useId();
	const isPending = responding !== undefined;

	return (
		<section
			aria-busy={isPending || undefined}
			aria-labelledby={titleId}
			className="kerberosec-ui-agent-approval-card rounded-kerberosec-ui-lg border border-kerberosec-ui-border/80 bg-kerberosec-ui-background/70 p-3"
		>
			<div className="kerberosec-ui-agent-approval-card__header flex items-center justify-between gap-2">
				<div
					className="kerberosec-ui-agent-approval-card__title font-kerberosec-ui-medium text-kerberosec-ui-foreground text-kerberosec-ui-sm"
					id={titleId}
				>
					{title}
				</div>
				{meta ? (
					<div className="kerberosec-ui-agent-approval-card__meta inline-flex items-center gap-1 text-[11px] text-kerberosec-ui-muted-foreground">
						{meta}
					</div>
				) : null}
			</div>
			{description ? (
				<div className="kerberosec-ui-agent-approval-card__description mt-1 text-[11px] text-kerberosec-ui-muted-foreground">
					{description}
				</div>
			) : null}
			{detail != null ? (
				<pre className="kerberosec-ui-agent-approval-card__detail max-h-44 max-w-full">
					{detail}
				</pre>
			) : null}
			{error ? (
				<div className="kerberosec-ui-agent-approval-card__error">{error}</div>
			) : null}
			<div className="kerberosec-ui-agent-approval-card__actions">
				<button
					className="kerberosec-ui-agent-approval-card__button kerberosec-ui-agent-approval-card__button--approve inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-kerberosec-ui-md border-0 bg-kerberosec-ui-primary px-3 font-kerberosec-ui-medium text-kerberosec-ui-primary-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-[ease] [&:hover]:bg-kerberosec-ui-primary/90 focus-visible:outline-3 focus-visible:outline-kerberosec-ui-ring/50 focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-50"
					disabled={isPending}
					onClick={onApprove}
					type="button"
				>
					{responding === "approve" ? (
						<>
							<Spinner />
							Approving...
						</>
					) : (
						"Approve"
					)}
				</button>
				<button
					className="kerberosec-ui-agent-approval-card__button kerberosec-ui-agent-approval-card__button--reject inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-kerberosec-ui-md border border-kerberosec-ui-border bg-kerberosec-ui-background px-3 font-kerberosec-ui-medium text-kerberosec-ui-foreground shadow-xs transition-[color,background-color,border-color,box-shadow] duration-150 ease-[ease] [&:hover]:bg-kerberosec-ui-accent [&:hover]:text-kerberosec-ui-accent-foreground focus-visible:outline-3 focus-visible:outline-kerberosec-ui-ring/50 focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-50 kerberosec-ui-dark:border-kerberosec-ui-input kerberosec-ui-dark:bg-kerberosec-ui-input/30 kerberosec-ui-dark:[&:hover]:bg-kerberosec-ui-input/50"
					disabled={isPending}
					onClick={onReject}
					type="button"
				>
					{responding === "reject" ? (
						<>
							<Spinner />
							Rejecting...
						</>
					) : (
						"Reject"
					)}
				</button>
			</div>
		</section>
	);
}
