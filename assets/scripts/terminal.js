/** @format */

$(document).ready(function () {
  const fileSystem = new FileSystem();
  const cmdProcessor = new CommandProcessor(fileSystem);

  $("#command-input").keydown(function (event) {
    if (event.key === "Enter") {
      if ($("#nano-editor").is(":visible")) {
        event.preventDefault();
        return;
      }
      const input = $(this).val();
      const output = cmdProcessor.processCommand(input);
      const terminalOutput = $("#terminal-output");

      terminalOutput.append("\n" + "> " + input + "\n" + output);
      $(this).val("");

      const terminal = $("#terminal");
      terminal.scrollTop(terminal.prop("scrollHeight"));
    }
  });

  $("#nano-textarea").keydown(function (event) {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      cmdProcessor.toggleNano();
    }
  });
});

class FileSystem {
  constructor() {
    this.currentPath = "/";
    this.files = {
      "/": { "file1.txt": "100B", "file2.txt": "200B", directory1: "Dir" },
      "/directory1": { "file3.txt": "150B" },
    };
  }

  ls(path = this.currentPath, flags = "") {
    const items = this.files[path];
    if (!items) return "No such directory";

    let output = "";
    for (let item in items) {
      if (flags.includes("-l")) {
        output += `${items[item]} ${item}\n`;
      } else {
        output += `${item}\n`;
      }
    }
    return output.trim();
  }

  cd(directoryName) {
    const newPath =
      this.currentPath === "/"
        ? `/${directoryName}`
        : `${this.currentPath}/${directoryName}`;

    if (this.files[newPath]) {
      this.currentPath = newPath;
      return `Changed directory to ${newPath}`;
    } else if (directoryName === "..") {
      if (this.currentPath !== "/") {
        this.currentPath =
          this.currentPath.substring(0, this.currentPath.lastIndexOf("/")) ||
          "/";
        return `Changed directory to ${this.currentPath}`;
      }
      return "No parent directory";
    } else {
      return "Directory does not exist";
    }
  }

  cat(fileName) {
    const filesInCurrentDir = this.files[this.currentPath];
    if (!filesInCurrentDir || !filesInCurrentDir.includes(fileName)) {
      return "File does not exist";
    }
    return `Contents of ${fileName}`;
  }

  pwd() {
    return this.currentPath;
  }
}

class CommandProcessor {
  constructor(fileSystem) {
    this.fileSystem = fileSystem;
  }

  processCommand(command) {
    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case "ls":
        const flags = args.filter((arg) => arg.startsWith("-")).join("");
        return this.fileSystem.ls(this.fileSystem.currentPath, flags);
      case "pwd":
        return this.fileSystem.pwd();
      case "cat":
        if (args.length > 0) {
          return this.fileSystem.cat(args[0]);
        } else {
          return "Filename not specified";
        }
      case "cd":
        if (args.length > 0) {
          return this.fileSystem.cd(args[0]);
        } else {
          return "Directory not specified";
        }
      case "nano":
        this.toggleNano();
        return ""; // Nano doesn't output to terminal directly
      default:
        return "Command not found";
    }
  }

  toggleNano() {
    const editor = $("#nano-editor");
    const isVisible = editor.is(":visible");
    if (isVisible) {
      editor.hide();
      $("#command-input").focus();
    } else {
      editor.show();
      $("#nano-textarea").focus();
    }
  }
}
