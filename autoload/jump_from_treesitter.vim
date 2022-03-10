if get(s:, 'loaded')
  finish
endif
let s:loaded = 1

function! jump_from_treesitter#jump()
  let token = luaeval("require'jump-from-treesitter'.get_text()")
  call jump_from_treesitter#jump_to(token)
endfunction

function! jump_from_treesitter#jump_to(token) abort
  let [results, query] = jump_from_treesitter#grep(a:token)
  if len(results) > 0
    call jump_from_treesitter#handle_results(results, query)
  else
    let klass = jump_from_treesitter#parse_class(a:token)
    if klass != ""
      call jump_from_treesitter#jump_to(klass)
    else
      if exists("g:jump_from_treesitter_fallback")
        execute(g:jump_from_treesitter_fallback)
      else
        echo 'No definition found for "'.a:token.'". Set g:jump_from_treesitter_fallback to set a fallback'
      end
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
    return [[], a:query]
  else
    return [lines[2:], a:query]
  end
endfunction

function! jump_from_treesitter#parse_class(text) abort
  if stridx(a:text, "::") >= 0
    return reverse(split(a:text, "::"))[0]
  else
    return ""
  end
endfunction

function! jump_from_treesitter#handle_results(results, query)
  if len(a:results) == 1
    let bits = split(a:results[0], ":")
    let path = bits[0]
    let line_number = bits[1]
    execute("edit +".line_number." ".path)
  else
    call fzf#vim#grep(
      \ 'rg --column --line-number --no-heading --color=always --smart-case -- '.shellescape(a:query), 1,
      \ fzf#vim#with_preview()
      \ )
  end
endfunction
