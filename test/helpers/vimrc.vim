set nocompatible
set nobackup
set nowb
set noswapfile

let g:jump_from_treesitter_loaded = 1

let s:plugin = expand('<sfile>:h:h:h')

execute 'set runtimepath+='.s:plugin

execute 'set runtimepath+='.s:plugin.'/node_modules/nvim-treesitter'

execute 'cd '.s:plugin
