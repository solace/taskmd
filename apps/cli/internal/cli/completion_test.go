package cli

import (
	"bytes"
	"io"
	"os"
	"testing"
)

func TestCompletion_AllShells(t *testing.T) {
	shells := []string{"bash", "zsh", "fish", "powershell"}

	for _, shell := range shells {
		t.Run(shell, func(t *testing.T) {
			// Capture stdout
			oldStdout := os.Stdout
			r, w, err := os.Pipe()
			if err != nil {
				t.Fatalf("failed to create pipe: %v", err)
			}
			os.Stdout = w

			// Drain the pipe in a goroutine to avoid blocking on large output.
			var buf bytes.Buffer
			done := make(chan struct{})
			go func() {
				io.Copy(&buf, r)
				close(done)
			}()

			err = runCompletion(completionCmd, []string{shell})

			w.Close()
			os.Stdout = oldStdout
			<-done
			r.Close()

			if err != nil {
				t.Fatalf("runCompletion(%q) returned error: %v", shell, err)
			}

			if buf.Len() == 0 {
				t.Errorf("runCompletion(%q) produced no output", shell)
			}
		})
	}
}
