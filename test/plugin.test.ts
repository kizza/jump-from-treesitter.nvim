import assert from "assert";
import {withVim} from "./helpers/vim";
import {populateBuffer} from "./helpers/buffer";
import {callLua, callVim} from "./helpers/call";

describe("jump-from-treesitter", () => {
  it("loads the test vimrc", () =>
    withVim(async nvim => {
      const loaded = (await nvim.getVar("test_vimrc_loaded")) as boolean;
      assert.equal(loaded, true);
    }));

  describe("embedded template", () => {
    it("parses embedded code", () =>
      withVim(async nvim => {
        await populateBuffer(nvim, "<html><% nope %> break <%= on|e.two %></html>", "eruby");
        const [code, column] = await callVim(nvim, `jump_from_treesitter#embedded_template#parse_executable_block()`)

        assert.equal(code, " one.two ")
        assert.equal(column, 4)
      }));

    it("returns range", () =>
      withVim(async nvim => {
        const result = await callLua<string[]>(nvim, "jump_from_treesitter", `parse_token_from_string("one.two", 5)`)

        assert.equal(result.toString(), [1, 5, 1, 7].toString())
      }));

    it("returns token", () =>
      withVim(async nvim => {
        await populateBuffer(nvim, "<html><% nope %> break <%= on|e.two %></html>", "eruby");
        const token = await callVim(nvim, `jump_from_treesitter#embedded_template#parse_token_under_cursor()`)
        assert.equal(token, "one")
      }));

    it("returns resolved module scope", () =>
      withVim(async nvim => {
        await populateBuffer(nvim, "<html><% nope %> break <%= One::T|wo %></html>", "eruby");
        const token = await callVim(nvim, `jump_from_treesitter#embedded_template#parse_token_under_cursor()`)
        assert.equal(token, "One::Two")
      }));
  })

  describe("matches", () => {
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
        console.log("foo", currentBufferPath)
        assert.equal(currentBufferPath, "test/examples.rb")
      }));

    it("handles module matches", () =>
      withVim(async nvim => {
        await nvim.commandOutput(`echo jump_from_treesitter#jump_to("SingleModule")`)
        const currentBufferPath = await nvim.commandOutput(`echo expand("%")`)
        assert.equal(currentBufferPath, "test/examples.rb")
      }));

    it("handles method matches", () =>
      withVim(async nvim => {
        await nvim.commandOutput(`echo jump_from_treesitter#jump_to("method")`)
        const currentBufferPath = await nvim.commandOutput(`echo expand("%")`)
        assert.equal(currentBufferPath, "test/examples.rb")
      }));

    it("handles self.method matches", () =>
      withVim(async nvim => {
        await nvim.commandOutput(`echo jump_from_treesitter#jump_to("self_method")`)
        const currentBufferPath = await nvim.commandOutput(`echo expand("%")`)
        assert.equal(currentBufferPath, "test/examples.rb")
      }));

    it("jumps to matched line number", () =>
      withVim(async nvim => {
        await nvim.commandOutput(`echo jump_from_treesitter#jump_to("method")`)
        const currentLineNumber = await nvim.commandOutput(`echo line(".")`)
        assert.equal(currentLineNumber, "2")
      }));

    it("handles zero matches", () =>
      withVim(async nvim => {
        await nvim.setVar("jump_from_treesitter_fallback", "echo 'custom fallback'")
        const result = await nvim.commandOutput(`call jump_from_treesitter#jump_to("F_oo")`)
        assert(result.indexOf("custom fallback") >= 0)
      }));
  });

  describe("token under cursor", () =>
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
            `echo luaeval("require'jump_from_treesitter'.parse_token_from_buffer()")`
          )
          assert.equal(result, output, `Trying ${input}`);
        }))
    })
  );
});
