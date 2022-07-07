class Token
  def method
    # Example
  end

  scope :a_scope, -> { where(foo: false) }

  def self.self_method
    # Example
  end
end

class Module::Token
end

module SingleModule
end
