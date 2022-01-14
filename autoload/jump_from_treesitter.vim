if get(s:, 'loaded')
  finish
endif
let s:loaded = 1

function! jump_from_treesitter#jump()
  let token = luaeval("require'jump-from-treesitter'.get_text()")
  call jump_from_treesitter#jump_to(token)
endfunction

function! jump_from_treesitter#jump_to(token) abort
  let results = jump_from_treesitter#grep(a:token)
  if len(results) > 0
    call jump_from_treesitter#handle_results(results)
  else
    let klass = jump_from_treesitter#parse_class(a:token)
    if klass != ""
      call jump_from_treesitter#jump_to(klass)
    else
      echo 'No definition found for "'.a:token.'"'
    end
  end
endfunction

function! jump_from_treesitter#grep(token) abort
  if tolower(a:token) ==# a:token
    return jump_from_treesitter#grep_with('^[^\#]*def '.a:token.'(\s|$|\()')
  else
    return jump_from_treesitter#grep_with('^[^\#]*class '.a:token.'(\s|$)')
  end
endfunction

function! jump_from_treesitter#grep_with(query) abort
  let output = execute('silent !rg "'.a:query.'" --vimgrep')
  redraw!
  let lines = split(output, "\n")
  if len(lines) == 4 && lines[3] == "shell returned 1"
    return []
  else
    return lines[2:]
  end
endfunction

function! jump_from_treesitter#parse_class(text) abort
  if stridx(a:text, "::") >= 0
    return reverse(split(a:text, "::"))[0]
  else
    return ""
  end
endfunction

function! jump_from_treesitter#handle_results(results)
  if len(a:results) == 1
    execute("edit ".a:results[0])
  else
    call fzf#run(
      \   fzf#wrap('files', fzf#vim#with_preview({
      \     'source': reverse(a:results)
      \   })
      \ ))
  end
endfunction
