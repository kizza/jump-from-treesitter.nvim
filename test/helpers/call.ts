import {NeovimClient} from "neovim"

export const callVim = async <T>(
  nvim: NeovimClient,
  fn: string,
  verbose = false,
) => {
  const logs = await nvim.commandOutput(`let g:vim_return=${fn}`);

  if (verbose) console.log("Verbose:", logs)

  return await nvim.getVar("vim_return") as T;
}

export const callLua = async <T>(
  nvim: NeovimClient,
  script: string,
  fn: string,
  verbose = false,
) => {
  const logs = await nvim.commandOutput(
    `let g:lua_return=v:lua.require'${script}'.${fn}`,
  );

  if (verbose) console.log("Verbose:", logs)

  return await nvim.getVar("lua_return") as T;
}

