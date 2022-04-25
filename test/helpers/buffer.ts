import {NeovimClient} from "neovim";

export const populateBuffer = async (
  nvim: NeovimClient,
  input: string | string[],
  fileType: string,
) => {
  const lines = (Array.isArray(input) ? input : [input]) as string[]
  const cursorIndex = lines.findIndex(line => line.indexOf("|") !== -1)
  const cursorX = lines[cursorIndex].indexOf("|")

  await nvim.command(`set filetype=${fileType}`);

  await nvim.buffer.setLines(
    lines.map(line => line.replace("|", "")),
    {start: 0, end: 0}
  )

  await nvim.command(
    `call setpos(".", [0, ${cursorIndex + 1}, ${cursorX + 1}, 0])`,
  );
}

export const getLines = async (nvim: NeovimClient) =>
  (await nvim.buffer.getLines()).filter(Boolean).join("\n")

