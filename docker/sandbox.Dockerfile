# Multi-language execution sandbox for the merged web IDE (/api/execute).
#
# Build once (whenever this file or the language list changes):
#   docker build -t vedcode-sandbox -f docker/sandbox.Dockerfile .
#
# /api/execute runs one --rm, --network none, resource-capped container from this
# image per execution request, mounting only that request's temp source file
# read-only. See src/app/api/execute/route.ts for the runtime side of this.
#
# This replaces the previous implementation, which spawned the host machine's own
# compilers/interpreters directly with zero isolation and no auth check — see
# PROGRESS.md Part 1, #9 for why that was a real security issue, not just a gap.

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    nodejs \
    build-essential \
    default-jdk-headless \
    golang-go \
    rustc \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

# Non-root, no-login user — the container also runs with --cap-drop ALL,
# --security-opt no-new-privileges, --read-only root fs, and --network none, so
# even a break-out from an individual language runtime has essentially nothing to
# reach: no other users' files, no capabilities to escalate with, no network to
# exfiltrate over.
RUN useradd --create-home --uid 10001 --shell /usr/sbin/nologin sandbox
USER sandbox
WORKDIR /sandbox

CMD ["true"]
