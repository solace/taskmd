package markdown

import (
	"os"
	"strings"
	"testing"

	"github.com/charmbracelet/lipgloss"
	"github.com/muesli/termenv"
)

func colorRenderer() *lipgloss.Renderer {
	r := lipgloss.NewRenderer(os.Stdout)
	r.SetColorProfile(termenv.ANSI256)
	return r
}

func noColorRenderer() *lipgloss.Renderer {
	r := lipgloss.NewRenderer(os.Stdout)
	r.SetColorProfile(termenv.Ascii)
	return r
}

func TestRender_HeadingH1(t *testing.T) {
	r := colorRenderer()
	out := Render("# Main Heading", r)

	if !strings.Contains(out, "Main Heading") {
		t.Error("Expected heading text in output")
	}
	if strings.Contains(out, "#") {
		t.Error("Expected '#' to be stripped from heading")
	}
	// Should contain ANSI bold+cyan codes
	if !strings.Contains(out, "\x1b[") {
		t.Error("Expected ANSI codes in colored output")
	}
}

func TestRender_HeadingH2(t *testing.T) {
	r := colorRenderer()
	out := Render("## Sub Heading", r)

	if !strings.Contains(out, "Sub Heading") {
		t.Error("Expected heading text in output")
	}
	if strings.Contains(out, "##") {
		t.Error("Expected '##' to be stripped from heading")
	}
}

func TestRender_HeadingH3(t *testing.T) {
	r := colorRenderer()
	out := Render("### Third Level", r)

	if !strings.Contains(out, "Third Level") {
		t.Error("Expected heading text in output")
	}
}

func TestRender_Bold(t *testing.T) {
	r := colorRenderer()
	out := Render("This is **bold** text", r)

	if strings.Contains(out, "**") {
		t.Error("Expected '**' delimiters to be stripped")
	}
	if !strings.Contains(out, "bold") {
		t.Error("Expected 'bold' text in output")
	}
	if !strings.Contains(out, "\x1b[") {
		t.Error("Expected ANSI codes for bold text")
	}
}

func TestRender_BoldUnderscore(t *testing.T) {
	r := colorRenderer()
	out := Render("This is __bold__ text", r)

	if strings.Contains(out, "__") {
		t.Error("Expected '__' delimiters to be stripped")
	}
	if !strings.Contains(out, "bold") {
		t.Error("Expected 'bold' text in output")
	}
}

func TestRender_Italic(t *testing.T) {
	r := colorRenderer()
	out := Render("This is *italic* text", r)

	if !strings.Contains(out, "italic") {
		t.Error("Expected 'italic' text in output")
	}
}

func TestRender_InlineCode(t *testing.T) {
	r := colorRenderer()
	out := Render("Use `fmt.Println` here", r)

	if strings.Contains(out, "`") {
		t.Error("Expected backtick delimiters to be stripped")
	}
	if !strings.Contains(out, "fmt.Println") {
		t.Error("Expected code text in output")
	}
	if !strings.Contains(out, "\x1b[") {
		t.Error("Expected ANSI codes for inline code")
	}
}

func TestRender_InlineCode_NoFormattingInside(t *testing.T) {
	r := colorRenderer()
	out := Render("Run `**not bold**` command", r)

	// The ** should be preserved inside code spans
	if !strings.Contains(out, "**not bold**") {
		t.Error("Expected markdown delimiters preserved inside code span")
	}
}

func TestRender_CodeBlock(t *testing.T) {
	r := colorRenderer()
	input := "Before\n```\ncode line 1\ncode line 2\n```\nAfter"
	out := Render(input, r)

	if strings.Contains(out, "```") {
		t.Error("Expected code fences to be stripped")
	}
	if !strings.Contains(out, "code line 1") {
		t.Error("Expected code block content in output")
	}
	if !strings.Contains(out, "    code line 1") {
		t.Error("Expected code block lines to be indented")
	}
}

func TestRender_CodeBlock_WithLanguage(t *testing.T) {
	r := colorRenderer()
	input := "```go\nfmt.Println(\"hello\")\n```"
	out := Render(input, r)

	if strings.Contains(out, "```") {
		t.Error("Expected code fences to be stripped")
	}
	if !strings.Contains(out, "fmt.Println") {
		t.Error("Expected code content in output")
	}
}

func TestRender_CheckboxUnchecked(t *testing.T) {
	r := colorRenderer()
	out := Render("- [ ] Todo item", r)

	if strings.Contains(out, "- [ ]") {
		t.Error("Expected checkbox syntax to be replaced")
	}
	if !strings.Contains(out, "\u2610") {
		t.Error("Expected unchecked box character")
	}
	if !strings.Contains(out, "Todo item") {
		t.Error("Expected checkbox text in output")
	}
}

func TestRender_CheckboxChecked(t *testing.T) {
	r := colorRenderer()
	out := Render("- [x] Done item", r)

	if strings.Contains(out, "- [x]") {
		t.Error("Expected checkbox syntax to be replaced")
	}
	if !strings.Contains(out, "\u2611") {
		t.Error("Expected checked box character")
	}
	if !strings.Contains(out, "Done item") {
		t.Error("Expected checkbox text in output")
	}
}

func TestRender_ListItem(t *testing.T) {
	r := colorRenderer()
	out := Render("- List entry", r)

	if !strings.Contains(out, "\u2022") {
		t.Error("Expected bullet character")
	}
	if !strings.Contains(out, "List entry") {
		t.Error("Expected list item text in output")
	}
}

func TestRender_ListItemAsterisk(t *testing.T) {
	r := colorRenderer()
	out := Render("* Another item", r)

	if !strings.Contains(out, "\u2022") {
		t.Error("Expected bullet character for asterisk list")
	}
	if !strings.Contains(out, "Another item") {
		t.Error("Expected list item text in output")
	}
}

func TestRender_Link(t *testing.T) {
	r := colorRenderer()
	out := Render("See [docs](https://example.com) for info", r)

	if strings.Contains(out, "[docs]") {
		t.Error("Expected link syntax to be replaced")
	}
	if !strings.Contains(out, "docs") {
		t.Error("Expected link text in output")
	}
	if !strings.Contains(out, "(https://example.com)") {
		t.Error("Expected URL in parentheses")
	}
}

func TestRender_HorizontalRule(t *testing.T) {
	for _, rule := range []string{"---", "***", "___"} {
		out := Render(rule, noColorRenderer())
		if !strings.Contains(out, "\u2500") {
			t.Errorf("Expected horizontal rule character for %q", rule)
		}
	}
}

func TestRender_NoColor(t *testing.T) {
	r := noColorRenderer()
	input := "# Heading\n\n**bold** and `code`"
	out := Render(input, r)

	if strings.Contains(out, "\x1b[") {
		t.Error("Expected no ANSI codes with Ascii renderer")
	}
	if !strings.Contains(out, "Heading") {
		t.Error("Expected heading text preserved")
	}
	if !strings.Contains(out, "bold") {
		t.Error("Expected bold text preserved")
	}
	if !strings.Contains(out, "code") {
		t.Error("Expected code text preserved")
	}
}

func TestRender_PlainText(t *testing.T) {
	r := colorRenderer()
	out := Render("Just plain text", r)

	if out != "Just plain text" {
		t.Errorf("Expected plain text passthrough, got %q", out)
	}
}

func TestRender_EmptyString(t *testing.T) {
	r := colorRenderer()
	out := Render("", r)

	if out != "" {
		t.Errorf("Expected empty string passthrough, got %q", out)
	}
}

func TestRender_MixedDocument(t *testing.T) {
	r := colorRenderer()
	input := `# Project Setup

This is a **bold** statement with *italic* emphasis.

## Tasks

- [ ] First task
- [x] Completed task
- Regular item with ` + "`code`" + `

### Code Example

` + "```go" + `
func main() {
    fmt.Println("hello")
}
` + "```" + `

See [documentation](https://example.com) for details.

---

Done.`

	out := Render(input, r)

	// Verify key transformations
	if strings.Contains(out, "# Project") {
		t.Error("Expected heading markers stripped")
	}
	if strings.Contains(out, "```") {
		t.Error("Expected code fences stripped")
	}
	if strings.Contains(out, "- [ ]") {
		t.Error("Expected checkbox syntax replaced")
	}
	if strings.Contains(out, "- [x]") {
		t.Error("Expected checked checkbox syntax replaced")
	}
	if !strings.Contains(out, "Project Setup") {
		t.Error("Expected heading text preserved")
	}
	if !strings.Contains(out, "fmt.Println") {
		t.Error("Expected code block content preserved")
	}
	if !strings.Contains(out, "\u2500") {
		t.Error("Expected horizontal rule rendered")
	}
}

func TestRender_IndentedCheckbox(t *testing.T) {
	r := colorRenderer()
	out := Render("  - [ ] Indented item", r)

	if !strings.Contains(out, "  ") {
		t.Error("Expected indentation preserved")
	}
	if !strings.Contains(out, "\u2610") {
		t.Error("Expected unchecked box character")
	}
}

func TestRender_IndentedList(t *testing.T) {
	r := colorRenderer()
	out := Render("  - Nested item", r)

	if !strings.HasPrefix(out, "  ") {
		t.Error("Expected indentation preserved for nested list")
	}
	if !strings.Contains(out, "\u2022") {
		t.Error("Expected bullet character for nested list")
	}
}
