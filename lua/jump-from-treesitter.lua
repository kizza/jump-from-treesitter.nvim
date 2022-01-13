local ts_utils = require "nvim-treesitter.ts_utils"

local M = {}

function M.get_text()
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
