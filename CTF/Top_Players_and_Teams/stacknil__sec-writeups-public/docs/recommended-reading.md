# Recommended Reading

Date: 2026-06-14

This index highlights a small path through the public note corpus for readers
who want a curated starting point instead of a full directory walk.

Selection criteria:

* prioritize reusable security reasoning over one-off task answers
* pair foundations with operational examples
* keep each section short enough to finish in one focused reading session
* prefer public-safe notes that show how to write about risky material without
  publishing unnecessary exploit detail

## Systems and Linux Evidence

Start here for host-level evidence, Linux workflows, and practical incident
triage.

* [NIS: Linux Part I](../notes/20-linux/foundations/nis-linux-part-1-public.md): command-line fluency for listing, searching, permissions, archives, and evidence handling.
* [Pwnkit (CVE-2021-4034)](../notes/20-linux/priv-esc/pwnkit-cve-2021-4034-public.md): public-safe local privilege escalation analysis with remediation focus.
* [Digital Forensics Fundamentals](../notes/60-forensics/digital-forensics-fundamentals.md): core forensic process, evidence handling, and investigation framing.
* [Logs Fundamentals](../notes/80-blue-team/logs-fundamentals.md): log sources and event interpretation for blue-team investigations.
* [ContAInment](../notes/80-blue-team/containment-public.md): AI-assisted IR case study combining PCAP triage, artefact recovery, and human validation.

## Detection Engineering

Use this set for blue-team workflow, signal quality, triage, and reporting.

* [SOC Fundamentals](../notes/80-blue-team/soc-fundamentals.md): baseline SOC roles, monitoring flow, and defensive operating model.
* [SOC Role in Blue Team](../notes/80-blue-team/soc-role-in-blue-team.md): how SOC responsibilities fit into broader detection and response.
* [SOC L2 Report Writing](../notes/80-blue-team/soc-l2-report-writing.md): turning investigations into clear, reviewable reports.
* [Capa: The Basics](../notes/80-blue-team/capa-the-basics.md): capability-based malware triage and rule-driven analysis.
* [Cyber Threat Intelligence](../notes/80-blue-team/10-cti/intro-to-cyber-threat-intel.md): CTI concepts that help connect detections to adversary context.

## AI Security Boundaries

Read these when the question is where AI systems should trust, retrieve, act,
or remember.

* [Securing AI Systems](../notes/00-foundations/securing-ai-systems.md): first principles for AI assets, trust boundaries, and secure architecture.
* [LLM Security](../notes/00-foundations/llm-security.md): threat families across data, model, system, and user attack surfaces.
* [AI Threat Modelling](../notes/80-blue-team/ai-threat-modelling.md): mapping AI risks with STRIDE, MITRE ATLAS, and OWASP LLM Top 10.
* [Prompt Injection in Action](../notes/80-blue-team/prompt-injection-in-action.md): direct and indirect prompt-injection failure modes.
* [RAG Security Fundamentals](../notes/80-blue-team/rag-security-fundamentals-public.md): retrieval, vector stores, context injection, and monitoring.

## Supply Chain / Repository Hygiene

These readings connect vulnerability research, dependency trust, and repository
governance.

* [Understanding AI Supply Chains](../notes/80-blue-team/understanding-ai-supply-chains-public.md): model, dataset, dependency, and infrastructure trust in AI systems.
* [Vulnerabilities 101](../notes/10-web/foundations/vulnerabilities-101-public.md): moving from version discovery to CVE research, scoring, and validation.
* [Confluence CVE-2023-22515](../notes/10-web/atlassian/confluence-cve-2023-22515-public.md): critical enterprise-app advisory handling with detection and remediation notes.
* [Vulnerability Scanner Overview](../notes/80-blue-team/vulnerability-scanner-overview.md): scanner role, limits, and prioritization mindset.
* [Cloud Security Pitfalls](../notes/80-blue-team/40-cloud/cloud-security-pitfalls.md): cloud exposure and configuration lessons for repository-backed infrastructure.

## Public-Safe Security Writing

Use these governance docs when preparing, reviewing, or maintaining public
security notes.

* [Publication Workflow](publication-workflow.md): how to move private or raw notes into a sanitized public shape.
* [Placeholder Policy](placeholder-policy.md): canonical placeholder rules and false-positive guidance.
* [Taxonomy Governance](taxonomy-governance.md): how controlled vocabulary changes should be proposed and maintained.
* [Maintenance Quick Reference](maintenance-quick-reference.md): shortest command path from a repo change to validation.
* [Docs Hub](README.md): map of current governance docs, derived docs, and historical maintenance context.
