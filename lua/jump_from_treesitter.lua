local M = {}

local function resolve_scope(node)
  while node:parent() and node:parent():type() == "scope_resolution" do
    node = node:parent()
  end
  return node
end

-- Equivalent-ish to old ts_utils.get_vim_range
local function get_vim_range(range)
  local start_row, start_col, end_row, end_col = unpack(range)
  return { start_row + 1, start_col + 1, end_row + 1, end_col }
end

function M.parse_token_from_string(text, column)
  local line = 0
  local root_lang_tree = vim.treesitter.get_string_parser(text, "ruby")
  local trees = root_lang_tree:parse()
  local root = trees[1]:root()

  local node = root:named_descendant_for_range(line, column, line, column)
  local scope = resolve_scope(node)

  return get_vim_range({ scope:range() })
end

function M.parse_token_under_cursor()
  local current_node = vim.treesitter.get_node()
  if not current_node then
    return "None"
  end

  local tokens = {}
  local token = vim.treesitter.get_node_text(current_node, 0)
  table.insert(tokens, 1, token)

  local parent = current_node:parent()
  while parent and parent:type() == "scope_resolution" do
    local token = vim.treesitter.get_node_text(parent, 0)
    if line ~= "" and not vim.tbl_contains(tokens, token) then
      table.insert(tokens, 1, token)
    end
    parent = parent:parent()
  end

  return tokens[1]
end

return M
