# Contributing to NeuroCTF

Thanks for contributing.

## Getting Started

1. Build the solution:

```powershell
dotnet build .\NeuroCTF.slnx
```

2. Run the main validation steps:

```powershell
dotnet run --project .\tests\NeuroCTF.Tests\NeuroCTF.Tests.csproj
dotnet run --project .\tests\NeuroCTF.Fuzz\NeuroCTF.Fuzz.csproj
dotnet run --project .\tests\NeuroCTF.Benchmarks\NeuroCTF.Benchmarks.csproj
```

## What To Contribute

High-value areas:
- new analysis modules
- performance improvements
- parser improvements
- REPL and CLI ergonomics
- plugin system improvements
- tests, fuzzing, and benchmarks
- documentation and examples

## Engineering Guidelines

- Keep changes aligned with the current architecture boundaries.
- Prefer adding capability as a module instead of embedding it in the CLI.
- Keep public contracts stable unless a change is clearly necessary.
- Add tests for behavior changes.
- Keep large-input handling bounded and streaming-friendly where possible.
- Avoid introducing hidden network or external tool dependencies without documenting them clearly.

## Pull Requests

Please include:
- what changed
- why it changed
- how you validated it
- any known follow-up work

Small, focused pull requests are preferred over broad mixed changes.

## Code Style

- Follow the existing project structure and naming style.
- Keep code production-oriented and testable.
- Prefer simple, explicit logic over clever shortcuts.

## Communication

If you plan to work on a larger area, open an issue or draft PR first so others can coordinate with you.
