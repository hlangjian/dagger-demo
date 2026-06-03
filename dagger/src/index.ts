import { dag, object, func, Directory, Container, Secret } from "@dagger.io/dagger"

/** Shared Node.js + pnpm base container. */
function base(): Container {
  return dag
    .container()
    .from("node:20-alpine")
    .withExec(["corepack", "enable", "pnpm"])
}

@object()
export class DaggerNpmTest {
  /**
   * Build the package: install deps + compile TypeScript.
   * Returns the `dist/` directory.
   */
  @func()
  build(source: Directory): Directory {
    return base()
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["pnpm", "install"])
      .withExec(["pnpm", "build"])
      .directory("/app/dist")
  }

  /**
   * Run the test suite and return stdout.
   */
  @func()
  async test(source: Directory): Promise<string> {
    return base()
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["pnpm", "install"])
      .withExec(["pnpm", "test"])
      .stdout()
  }

  /**
   * Test → build → publish to npm.
   * Requires an npm access token (classic automation token).
   */
  @func()
  async publish(source: Directory, npmToken: Secret): Promise<string> {
    // Fail fast if tests don't pass
    await this.test(source)

    const result = await base()
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withSecretVariable("NPM_TOKEN", npmToken)
      .withExec([
        "sh", "-c",
        // pnpm publish respects NPM_TOKEN env var for registry auth
        "pnpm install && pnpm build && pnpm publish --no-git-checks --access public",
      ])
      .stdout()

    return result
  }
}
