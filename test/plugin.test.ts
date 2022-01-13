import assert from "assert";
import {withVim} from "./helpers/vim";

describe("jump-from-treesitter", () => {
  it("loads the test vimrc", () =>
    withVim(async nvim => {
      const loaded = (await nvim.getVar("test_vimrc_loaded")) as boolean;
      assert.equal(loaded, true);
    }));

  it("handles single class matches", () =>
    withVim(async nvim => {
      await nvim.commandOutput(`echo jump_from_treesitter#jump_to("Token")`)
      const currentBufferPath = await nvim.commandOutput(`echo expand("%")`)
      assert.equal(currentBufferPath, "test/examples.rb")
    }));

  it("handles single nested class matches", () =>
    withVim(async nvim => {
      await nvim.commandOutput(`echo jump_from_treesitter#jump_to("Module::Token")`)
      const currentBufferPath = await nvim.commandOutput(`echo expand("%")`)
      assert.equal(currentBufferPath, "test/examples.rb")
    }));

  it("handles zero matches", () =>
    withVim(async nvim => {
      const result = await nvim.commandOutput(`call jump_from_treesitter#jump_to("F_oo")`)
      assert.equal(result, 'No definition found for "F_oo"')
    }));

  [
    [
      ["class |Foo", "end"],
      "Foo",
    ],
    [
      ["class Foo", "  with Foo::B|ar::Baz", "end"],
      "Foo::Bar::Baz",
    ],
  ].forEach(([input, output]) => {
    it(`resolves "${input}" to "${output}" correctly`, () =>
      withVim(async nvim => {
        const lines = (Array.isArray(input) ? input : [input]) as string[]
        const cursorIndex = lines.findIndex(line => line.indexOf("|") !== -1)
        const cursorX = lines[cursorIndex].indexOf("|")

        await nvim.command(`set filetype=ruby`);
        await nvim.buffer.setLines(
          lines.map(line => line.replace("|", "")),
          {start: 0, end: 0}
        )
        await nvim.command(`call setpos(".", [0, ${cursorIndex + 1}, ${cursorX + 1}, 0])`);

        const result = await nvim.commandOutput(
          `echo luaeval("require'jump-from-treesitter'.get_text()")`
        )
        assert.equal(result, output, `Trying ${input}`);
      }))
  })
});
