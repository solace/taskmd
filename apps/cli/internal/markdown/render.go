package markdown

import (
	"regexp"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// Render formats markdown text with ANSI terminal styling using the provided renderer.
// When the renderer uses an Ascii color profile, output contains no ANSI codes.
func Render(text string, r *lipgloss.Renderer) string {
	lines := strings.Split(text, "\n")
	var out []string
	inCodeBlock := false

	for _, line := range lines {
		if isCodeFence(line) {
			inCodeBlock = !inCodeBlock
			continue
		}
		if inCodeBlock {
			out = append(out, renderCodeLine(line, r))
			continue
		}
		out = append(out, renderLine(line, r))
	}

	return strings.Join(out, "\n")
}

func isCodeFence(line string) bool {
	trimmed := strings.TrimSpace(line)
	return strings.HasPrefix(trimmed, "```")
}

func renderCodeLine(line string, r *lipgloss.Renderer) string {
	style := r.NewStyle().Foreground(lipgloss.Color("8"))
	return style.Render("    " + line)
}

func renderLine(line string, r *lipgloss.Renderer) string {
	trimmed := strings.TrimSpace(line)

	if trimmed == "" {
		return ""
	}
	if rendered, ok := renderHeading(trimmed, r); ok {
		return rendered
	}
	if rendered, ok := renderHorizontalRule(trimmed); ok {
		return rendered
	}
	if rendered, ok := renderCheckbox(line, r); ok {
		return rendered
	}
	if rendered, ok := renderListItem(line, r); ok {
		return rendered
	}
	return renderInline(line, r)
}

func renderHeading(line string, r *lipgloss.Renderer) (string, bool) {
	level := 0
	for _, ch := range line {
		if ch == '#' {
			level++
		} else {
			break
		}
	}
	if level == 0 || level > 6 || !strings.HasPrefix(line[level:], " ") {
		return "", false
	}

	text := strings.TrimSpace(line[level:])
	if level == 1 {
		style := r.NewStyle().Bold(true).Foreground(lipgloss.Color("6"))
		return style.Render(text), true
	}
	style := r.NewStyle().Bold(true)
	return style.Render(text), true
}

var hrPattern = regexp.MustCompile(`^[-*_]{3,}$`)

func renderHorizontalRule(line string) (string, bool) {
	if hrPattern.MatchString(line) {
		return strings.Repeat("\u2500", 40), true
	}
	return "", false
}

var checkboxUnchecked = regexp.MustCompile(`^(\s*)- \[ \] (.*)`)
var checkboxChecked = regexp.MustCompile(`^(\s*)- \[x\] (.*)`)

func renderCheckbox(line string, r *lipgloss.Renderer) (string, bool) {
	if m := checkboxChecked.FindStringSubmatch(line); m != nil {
		indent := m[1]
		text := renderInline(m[2], r)
		check := r.NewStyle().Foreground(lipgloss.Color("2")).Render("\u2611")
		return indent + check + " " + text, true
	}
	if m := checkboxUnchecked.FindStringSubmatch(line); m != nil {
		indent := m[1]
		text := renderInline(m[2], r)
		return indent + "\u2610 " + text, true
	}
	return "", false
}

var listItemPattern = regexp.MustCompile(`^(\s*)([-*]) (.*)`)

func renderListItem(line string, r *lipgloss.Renderer) (string, bool) {
	m := listItemPattern.FindStringSubmatch(line)
	if m == nil {
		return "", false
	}
	indent := m[1]
	text := renderInline(m[3], r)
	return indent + "\u2022 " + text, true
}

// renderInline applies inline markdown formatting to a line.
// It splits on code spans first to avoid formatting inside them.
func renderInline(line string, r *lipgloss.Renderer) string {
	segments := splitCodeSpans(line)
	var result strings.Builder

	for _, seg := range segments {
		if seg.isCode {
			style := r.NewStyle().Foreground(lipgloss.Color("6"))
			result.WriteString(style.Render(seg.text))
		} else {
			result.WriteString(formatTextSegment(seg.text, r))
		}
	}
	return result.String()
}

type segment struct {
	text   string
	isCode bool
}

func splitCodeSpans(line string) []segment {
	var segments []segment
	for {
		start := strings.Index(line, "`")
		if start == -1 {
			break
		}
		end := strings.Index(line[start+1:], "`")
		if end == -1 {
			break
		}
		end += start + 1

		if start > 0 {
			segments = append(segments, segment{text: line[:start]})
		}
		segments = append(segments, segment{text: line[start+1 : end], isCode: true})
		line = line[end+1:]
	}
	if line != "" {
		segments = append(segments, segment{text: line})
	}
	return segments
}

var (
	boldPattern   = regexp.MustCompile(`\*\*(.+?)\*\*|__(.+?)__`)
	italicPattern = regexp.MustCompile(`\*(.+?)\*|_(.+?)_`)
	linkPattern   = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`)
)

func formatTextSegment(text string, r *lipgloss.Renderer) string {
	// Process links first (before bold/italic to avoid conflicts with brackets)
	text = linkPattern.ReplaceAllStringFunc(text, func(match string) string {
		m := linkPattern.FindStringSubmatch(match)
		dimStyle := r.NewStyle().Foreground(lipgloss.Color("8"))
		return m[1] + " " + dimStyle.Render("("+m[2]+")")
	})

	// Process bold
	text = boldPattern.ReplaceAllStringFunc(text, func(match string) string {
		m := boldPattern.FindStringSubmatch(match)
		content := m[1]
		if content == "" {
			content = m[2]
		}
		return r.NewStyle().Bold(true).Render(content)
	})

	// Process italic
	text = italicPattern.ReplaceAllStringFunc(text, func(match string) string {
		m := italicPattern.FindStringSubmatch(match)
		content := m[1]
		if content == "" {
			content = m[2]
		}
		return r.NewStyle().Italic(true).Render(content)
	})

	return text
}
