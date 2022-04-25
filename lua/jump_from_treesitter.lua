local ts_utils = require "nvim-treesitter.ts_utils"

local M = {}

local function resolve_scope(node)
  while node:parent() and node:parent():type() == "scope_resolution" do
    node = node:parent()
  end
  return node
end

function M.parse_token_from_string(text, column)
  local line = 0
  local root_lang_tree = vim.treesitter.get_string_parser(text, "ruby")
  root_lang_tree:parse()

  local root = ts_utils.get_root_for_position(line, column, root_lang_tree)
  local node = root:named_descendant_for_range(line, column, line, column)
  local scope = resolve_scope(node)

  return {ts_utils.get_vim_range({scope:range()})}
end

function M.parse_token_under_cursor()
  local current_node = ts_utils.get_node_at_cursor()
  if not current_node then
    return "None"
  end

  local tokens = {}
  local token = ts_utils.get_node_text(current_node)[1]
  table.insert(tokens, 1, token)

  local parent = current_node:parent()
  while parent and parent:type() == "scope_resolution" do
    local token = ts_utils.get_node_text(parent)[1]
    if line ~= "" and not vim.tbl_contains(tokens, token) then
      table.insert(tokens, 1, token)
    end
    parent = parent:parent()
  end

  return tokens[1]
end

return M
