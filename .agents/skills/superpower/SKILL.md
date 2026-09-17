---
name: superpower
description: Superpower developer patterns for autonomous agent workflows, iterative hardware synthesis, circuit diffing, multi-turn prompt engineering, and stateful code execution.
---

# Superpower Agent Patterns & Workflows

## Workflows
1. **Iterative Multi-Turn Refinement**: Treat prompt modifications as state transitions over an existing hardware circuit graph rather than resetting state from scratch.
2. **Context Preservation**: Preserve component IDs, coordinates, and existing routing where unchanged, calculating structural diffs (`+`, `-`, `~`) for clear change summaries.
3. **Multi-Model Fallbacks**: Orchestrate robust fallbacks from live LLM APIs to deterministic heuristic routing when API keys or network latency are constrained.
4. **Instant Verification**: Validate syntactic correctness, pin safety, and power rail voltage compliance before rendering to the canvas.
