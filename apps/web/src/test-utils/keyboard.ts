import userEvent from "@testing-library/user-event";

/**
 * Creates a userEvent instance and provides keyboard shortcut helpers.
 *
 * Usage:
 * ```ts
 * const kb = createKeyboardHelper();
 * await kb.press("ArrowDown");
 * await kb.press("Enter");
 * await kb.combo("{Meta>}k{/Meta}"); // Cmd+K
 * ```
 */
export function createKeyboardHelper() {
  const user = userEvent.setup();

  return {
    user,

    /** Press a single key. */
    press: (key: string) => user.keyboard(`{${key}}`),

    /** Type a raw keyboard sequence (userEvent syntax). */
    combo: (sequence: string) => user.keyboard(sequence),

    /** Type text into the focused element. */
    type: (text: string) => user.keyboard(text),

    /** Press ArrowDown n times. */
    arrowDown: async (n = 1) => {
      for (let i = 0; i < n; i++) await user.keyboard("{ArrowDown}");
    },

    /** Press ArrowUp n times. */
    arrowUp: async (n = 1) => {
      for (let i = 0; i < n; i++) await user.keyboard("{ArrowUp}");
    },

    /** Press Escape. */
    escape: () => user.keyboard("{Escape}"),

    /** Press Enter. */
    enter: () => user.keyboard("{Enter}"),

    /** Press Tab. */
    tab: () => user.tab(),
  };
}
