# NeuroCTF

NeuroCTF is an extensible CTF automation framework built in C# and .NET. It is designed to help contributors build a modular command-line toolkit for decoding, extracting, inspecting, and scoring unknown inputs across multiple CTF domains.

This repository is intended to grow through open source collaboration. The current codebase already includes a cleanly layered runtime, plugin loading, a recursive analysis pipeline, a CLI/REPL, test harnesses, and a growing set of built-in modules for crypto, forensics, reverse engineering, pwn helpers, web analysis, network inspection, steganography, and OSINT-style recon.

## Project Status

NeuroCTF is under active development.

What is already in place:

- Clean architecture split across `Core`, `Application`, `Infrastructure`, `Modules`, `CLI`, `Plugins`, and `Tests`
- Recursive analysis pipeline with scoring and visited-state protection
- Built-in modules for common decoding, archive traversal, artifact carving, JWT inspection, lightweight reverse/pwn helpers, PCAP-lite inspection, URL/domain recon, and more
- Reflection-based plugin loading with module descriptors
- Human-readable and JSON report output
- Self-hosted unit tests, fuzz harness, and benchmark harness

What still needs contributors:

- Deeper parsers and protocol support
- Better heuristics and scoring models
- More complete web/network/reversing/pwn workflows
- Documentation, examples, and plugin ecosystem growth

## Why Contribute

NeuroCTF is a good fit if you want to contribute to:

- Offensive security tooling architecture in modern .NET
- Pluggable CLI systems
- Binary/file/network parsing
- Heuristic analysis pipelines
- CTF-oriented utility modules
- Fuzzing, benchmarks, and robustness work

The project is intentionally structured so contributors can work on isolated modules or infrastructure slices without having to understand the entire codebase first.

## Quick Start

```powershell
dotnet build .\NeuroCTF.slnx
.\neuroctf.cmd modules
.\neuroctf.cmd analyze --input "ZmxhZ3tuZXVyb30="
dotnet run --project .\tests\NeuroCTF.Tests\NeuroCTF.Tests.csproj
```

On Linux or macOS:

```bash
chmod +x ./neuroctf
./neuroctf modules
./neuroctf analyze --input "ZmxhZ3tuZXVyb30="
```

## Example Commands

```powershell
.\neuroctf.cmd analyze --file .\sample.bin
.\neuroctf.cmd decode --module base64 --input "ZmxhZ3t0ZXN0fQ=="
.\neuroctf.cmd bruteforce --module xor --input "..."
.\neuroctf.cmd exploit --module elf-sec --file .\a.out
.\neuroctf.cmd scan --file .\capture.pcap
.\neuroctf.cmd recon --input "https://ctf.example.com/challenge?id=42"
.\neuroctf.cmd extract --file .\archive.zip --out .\artifacts
.\neuroctf.cmd shell
```

## Example Analysis Output

```text
Source: inline
Timestamp (UTC): 2026-04-11T09:16:51.1771334+00:00
File type: unknown
Entropy: 4.715
Printable ratio: 1.000

Top candidates:
  Score=0.987 Depth=1 Pipeline=[jwt]
  Preview={"flag":"flag{jwt}"}

Flags:
  flag{jwt} (confidence 0.98)

Pipeline visualization:
  [jwt]
```

## Repository Layout

```text
.
|-- Directory.Build.props
|-- NeuroCTF.slnx
|-- README.md
|-- plugins
|   `-- NeuroCTF.SamplePlugin
|-- src
|   |-- NeuroCTF.Application
|   |-- NeuroCTF.Cli
|   |-- NeuroCTF.Core
|   |-- NeuroCTF.Infrastructure
|   `-- NeuroCTF.Modules
`-- tests
    |-- NeuroCTF.Tests
    |-- NeuroCTF.Benchmarks
    `-- NeuroCTF.Fuzz
```

## Architecture Overview

### Core

`src/NeuroCTF.Core`

Contains:

- domain contracts
- immutable analysis models
- module/plugin abstractions
- shared options and execution context

Key files:

- [Contracts.cs](/src/NeuroCTF.Core/Abstractions/Contracts.cs)
- [AnalysisModels.cs](/src/NeuroCTF.Core/Models/AnalysisModels.cs)

### Application

`src/NeuroCTF.Application`

Contains:

- analysis orchestration
- detection heuristics
- scoring
- pipeline traversal
- shared module execution services

Key files:

- [PipelineEngine.cs](/src/NeuroCTF.Application/Services/PipelineEngine.cs)
- [ModuleExecutionService.cs](/src/NeuroCTF.Application/Services/ModuleExecutionService.cs)

### Infrastructure

`src/NeuroCTF.Infrastructure`

Contains:

- configuration wiring
- streaming input inspection
- plugin discovery and loading
- report formatting
- session persistence

Key files:

- [StreamingInspector.cs](/src/NeuroCTF.Infrastructure/Input/StreamingInspector.cs)
- [ReflectionPluginLoader.cs](/src/NeuroCTF.Infrastructure/Plugins/ReflectionPluginLoader.cs)

### Modules

`src/NeuroCTF.Modules`

Contains built-in modules for:

- Crypto: Base32, Base64, hex, XOR, Caesar, JWT
- Forensics: carving, recursive archive traversal, archive password hints
- Reverse: PE/ELF inspection, .NET indicators, disassembly-lite, CFG-lite
- Pwn: cyclic pattern, offset finder, ELF security checks, ROP gadget lite
- Network/Web: PCAP-lite, HTTP request replay parsing, parameter discovery
- Stego: LSB extraction
- OSINT: URL and domain recon

### CLI

`src/NeuroCTF.Cli`

Contains:

- top-level command routing
- report rendering
- REPL shell
- module listing and export flow

Key files:

- [CliRouter.cs](/src/NeuroCTF.Cli/Commands/CliRouter.cs)
- [InteractiveShell.cs](/src/NeuroCTF.Cli/Shell/InteractiveShell.cs)

### Plugins

`plugins/NeuroCTF.SamplePlugin`

Contains a minimal sample plugin showing how a module can be provided out-of-tree and loaded dynamically.

### Tests

`tests`

Contains:

- `NeuroCTF.Tests`: self-hosted unit/integration-style tests
- `NeuroCTF.Benchmarks`: repeatable performance smoke benchmarks
- `NeuroCTF.Fuzz`: malformed and binary-heavy input robustness checks

## Development Workflow

### Prerequisites

- .NET SDK 10 currently matches the checked-in workspace and local validation flow
- Windows or Linux shell

The project targets `.NET 10` in this repository because that is the latest installed SDK/reference-pack set used during validation. The design remains compatible with the original `.NET 8+` intent.

### Build

```powershell
dotnet build .\NeuroCTF.slnx
```

### Simple Local Run Command

From the repository root:

```powershell
.\neuroctf.cmd <command> [options]
```

Examples:

```powershell
.\neuroctf.cmd modules
.\neuroctf.cmd analyze --input "ZmxhZ3tuZXVyb30="
.\neuroctf.cmd recon --input "https://ctf.example.com/challenge?id=42"
```

On Linux or macOS:

```bash
./neuroctf <command> [options]
```

### Run Unit Tests

```powershell
dotnet run --project .\tests\NeuroCTF.Tests\NeuroCTF.Tests.csproj
```

### Run Fuzz Harness

```powershell
dotnet run --project .\tests\NeuroCTF.Fuzz\NeuroCTF.Fuzz.csproj
```

### Run Benchmarks

```powershell
dotnet run --project .\tests\NeuroCTF.Benchmarks\NeuroCTF.Benchmarks.csproj
```

## Contributing

Contributions are welcome.

Good contribution areas:

- new analysis modules
- parser improvements
- performance optimization
- REPL and CLI ergonomics
- documentation and examples
- fuzzing and benchmark coverage
- plugin system improvements

### Before You Start

- Read the architecture overview above
- Prefer changes that fit the existing layer boundaries
- Keep modules focused and composable
- Favor testable services over command-specific logic

### Contribution Guidelines

- Keep public interfaces small and purposeful
- Prefer adding new capability as a module instead of hard-coding behavior into the CLI
- Add or update tests when changing module behavior, pipeline behavior, or command routing
- Keep memory-heavy operations bounded for large or malformed inputs
- Preserve plugin compatibility whenever practical

### Suggested PR Flow

1. Open an issue or describe the problem clearly in your PR
2. Keep PRs scoped to one improvement area when possible
3. Add validation notes: build, tests, fuzz, benchmark, or smoke commands you ran
4. If the change affects a module or command, include a short before/after example

## Writing a Plugin

To add an external plugin:

1. Reference `NeuroCTF.Core`
2. Implement `NeuroCTF.Core.Abstractions.IModule`
3. Compile the assembly into the configured plugin directory
4. Run `dotnet run --project .\src\NeuroCTF.Cli -- modules` to verify discovery

The sample implementation lives in:
[Rot13Module.cs](/plugins/NeuroCTF.SamplePlugin/Rot13Module.cs)

## Quality Standards

The repository aims for:

- production-oriented code paths
- explicit layering
- exception-safe execution
- bounded brute-force behavior
- streaming where practical
- testable and replaceable services

When contributing, please try to maintain those standards.

## Collaboration Notes

If you are collaborating on a larger feature:

- call out which layer you are touching
- mention any new module names or command names
- document new config options
- note any follow-up work left intentionally out of scope

This helps contributors avoid overlapping work and keeps the plugin/module ecosystem coherent.

## Roadmap Areas

High-value next steps for contributors:

- richer PE/ELF parsing and real symbol extraction
- stronger web and PCAP workflows
- deeper stego/image/audio analysis
- better heuristic scoring and language models
- richer pipeline graph visualization
- persistent REPL history and session bookmarks
- more complete archive/container traversal

## License

No license file is currently present in this repository.

If this project is intended for broad open source collaboration, adding a license should be treated as a near-term priority.
