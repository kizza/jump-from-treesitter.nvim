" Return the code portion of the line, as well as the relative cursor position
function! jump_from_treesitter#embedded_template#parse_executable_block()
  let l:line = getline(".")
  let [_, l:cursor_line, l:cursor_column, _] = getpos(".")

  let l:chunks = split(getline("."), '<%=\?\zs')
  let l:left_offset = 0

  for chunk in l:chunks
    if l:left_offset + strlen(chunk) >= l:cursor_column
      let l:inner_chunks = split(chunk, '%>')
      let l:code = l:inner_chunks[0]
      let l:relative_col = l:cursor_column - l:left_offset
      return [l:code, l:relative_col]
    end

    let l:left_offset += strlen(chunk)
  endfor
endfunction

function! jump_from_treesitter#embedded_template#parse_token_under_cursor()
  let l:parsed = jump_from_treesitter#embedded_template#parse_executable_block()
  if l:parsed is v:null
    echo "No parsed executable found"
    return
  endif

  let [l:code, l:cursor] = l:parsed
  let [_srow, scol, _erow, ecol] = luaeval("require'jump_from_treesitter'.parse_token_from_string('". l:code ."', ".(l:cursor - 1).")")
  return l:code[(scol-1):(ecol-1)]
endfunction
