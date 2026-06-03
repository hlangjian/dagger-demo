import { dag, object, func, Directory, Container, Secret } from "@dagger.io/dagger"

/** Workspace root → pnpm install, target app via --filter */
const FILTER = "@huanglangjian/dagger-hello"

/** Shared Node.js + pnpm base, with workspace mounted. */
function base(source: Directory): Container {
  return dag
    .container()
    .from("node:22-alpine")
    .withExec(["corepack", "enable", "pnpm"])
    .withDirectory("/workspace", source)
    .withWorkdir("/workspace")
    .withExec(["pnpm", "install"])
}

@object()
export class DaggerNpmTest {
  /**
   * Build the package: workspace install + pnpm build (filtered).
   * Returns the `dist/` directory.
   */
  @func()
  build(source: Directory): Directory {
    return base(source)
      .withExec(["pnpm", "--filter", FILTER, "build"])
      .directory(`/workspace/app/dist`)
  }

  /**
   * Run the test suite (workspace + filter) and return stdout.
   */
  @func()
  async test(source: Directory): Promise<string> {
    return base(source)
      .withExec(["pnpm", "--filter", FILTER, "test"])
      .stdout()
  }

  /**
   * Test → build → publish to npm.
   */
  @func()
  async publish(source: Directory, npmToken: Secret): Promise<string> {
    // Fail fast if tests don't pass
    await this.test(source)

    const result = await base(source)
      .withSecretVariable("NPM_TOKEN", npmToken)
      .withExec([
        "sh", "-c",
        `pnpm --filter ${FILTER} build && pnpm --filter ${FILTER} publish --no-git-checks --access public`,
      ])
      .stdout()

    return result
  }
}
