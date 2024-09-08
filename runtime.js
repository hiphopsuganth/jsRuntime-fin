((globalThis) => {
    const core = Deno.core;

    function argsToMessage(...args) {
      return args.map((arg) => JSON.stringify(arg)).join(" ");
    }

    const sarcasticPhrases = [
      "Oh, brilliant idea", 
      "Wow, never heard that one before...", 
      "Oh, how original...",
      "Congratulations, you broke the code!", 
      "Great job, you found a bug!", 
      "Keep up the good work, genius!",
      "Oh, the brilliance is blinding...", 
      "I'm in awe of your coding skills...", 
      "You must be a real expert...",
      "Such a groundbreaking contribution...",
      "You should be a comedian...", 
      "Sarcasm level: expert..."
    ];

    function getCurrentTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    }

    // Preserve existing console methods
    const originalConsole = { ...globalThis.console };

    // Assume DEBUG is a global flag, set from Rust
    const DEBUG = globalThis.DEBUG || false;

    globalThis.console = {
      ...originalConsole,
      log: (...args) => {
        core.print(`[out]: ${argsToMessage(...args)}\n`, false);
      },

      warn: (...args) => {
        const time = getCurrentTime();
        const message = argsToMessage(...args);
        const logMessage = `\x1b[33m[${time}] [WARN]:\x1b[0m ${message}`;
        core.print(`${logMessage}\n`, true);
      },

      error: (...args) => {
        const time = getCurrentTime();
        const message = argsToMessage(...args);
        const logMessage = `\x1b[31m[${time}] [ERROR]:\x1b[0m ${message}`;
        core.print(`${logMessage}\n`, true);
      },

      debug: (...args) => {
        if (DEBUG) {
          const time = getCurrentTime();
          const message = argsToMessage(...args);
          const logMessage = `\x1b[34m[${time}] [DEBUG]:\x1b[0m ${message}`;
          core.print(`${logMessage}\n`, true);
        }
      },

      sarcasm: (...args) => {
        const time = getCurrentTime();
        const sarcasticMessage = sarcasticPhrases[Math.floor(Math.random() * sarcasticPhrases.length)];
        const message = argsToMessage(...args) + ` \n\x1b[1m(${sarcasticMessage})\x1b[0m`;
        const logMessage = `\x1b[1;35m[${time}] [sarcasm]:\x1b[0m ${message}`;
        core.print(`${logMessage}\n`, true);
      },
    };
})(globalThis);
