class Aigit < Formula
  desc "AI-powered git commit message generator using Groq"
  homepage "https://github.com/lincolnaleixo/aigit"
  url "https://github.com/lincolnaleixo/aigit/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "<SHA256_HASH_HERE>"
  license "MIT"

  depends_on "bun"

  def install
    system "bun", "install", "--no-save"
    system "bun", "build", "bin/git-groq.ts", "--outfile", "aigit", "--compile"
    bin.install "aigit"
  end

  test do
    # Test that the binary was installed correctly
    system "test", "-f", "#{bin}/aigit"
    
    # Since the tool requires a git repo and Groq API key, we'll just test
    # that it can be executed and shows help/error message
    output = shell_output("#{bin}/aigit 2>&1", 1)
    assert_match(/git/, output.downcase)
  end
end