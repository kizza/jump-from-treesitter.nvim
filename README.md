# A jump to definition tool for nvim (using treesitter)

- Currently built for use with ruby (as my mileage with Solargraph)
- Uses nvim's newly builtin tree-sitter to parse the tokens for constants to lookup

## Usage

The primary function to invoke is:
```vim
jump_from_treesitter#jump()
```

You may wish to invoke it via a mapping such as:
```vim
nmap <silent> gd :call jump_from_treesitter#jump()<CR>
```

## Implementation

- Leverages nvim's treesitter to grab the current constant (to jump to the definition of)
- Uses a rudimentary grep (via ripgrep) to pull back the matching definitions
- Open's the definitions buffer - or presents the results via fzf (if multiple are found)



