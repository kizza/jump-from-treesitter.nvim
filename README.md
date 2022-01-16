
# A jump to definition tool for nvim (using treesitter)

![example workflow](https://github.com/kizza/jump-from-treesitter.nvim/actions/workflows/tests.yml/badge.svg)

- Currently built for use with ruby only - as my mileage with [Solargraph](https://solargraph.org/) (via [coc-solargraph](https://github.com/neoclide/coc-solargraph)) leaves some definitions wanting (other language servers seem to work great!)
- Uses nvim's newly builtin tree-sitter  to parse the tokens to lookup
- Leverages nvim's tree-sitter implementation (via [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)) to grab the current constant (to jump to the definition of)
- Uses a rudimentary grep (via [ripgrep](https://github.com/BurntSushi/ripgrep)) to pull back the matching definitions
- Open's the definition's buffer (at the correct line) - or presents the results via [fzf](https://github.com/junegunn/fzf.vim) (if multiple results are found)

## Installation

Whatever method works for you.  I use [vim-plug](https://github.com/junegunn/vim-plug), so it's...

```vim
Plug 'kizza/jump-from-treesitter.nvim'
```

## Usage

To jump to the definition under the cursor, the function to invoke is:
```vim
jump_from_treesitter#jump()
```

You may wish to invoke it via a mapping such as:
```vim
nmap <silent> gd :call jump_from_treesitter#jump()<CR>
```

It will currently fallback to [coc's](https://github.com/neoclide/coc.nvim) implementation...
```vim
call CocAction("jumpDefinition")
```

## Dependencies

- [nvim](https://neovim.io/)
- [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) (to parse the current cursor's token)
- [ripgrep](https://github.com/BurntSushi/ripgrep) (to grep for results)
- [fzf.vim](https://github.com/junegunn/fzf.vim) (to display multiple matches)

I have something like this...
```
Plug 'nvim-treesitter/nvim-treesitter'
Plug 'junegunn/fzf.vim'
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
```


## Future plans

- To iterate and improve the grep approaches
- Maybe to prioritise nested module classes (based on the context within the current buffer for example)

