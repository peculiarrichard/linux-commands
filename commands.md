# Linux Commands List

## 1. ls
- **Rationale:** Short for "list"; it lists directory contents.
- **Description:** Displays files and directories in the current directory.
- **Options:**
  - `-l` : Long listing format
  - `-a` : Show hidden files
  - `-h` : Human-readable file sizes
  - `-t` : Sort by modification time

## 2. cd
- **Rationale:** Short for "change directory".
- **Description:** Navigates between directories.
- **Options:**
  - `cd ..` : Move up one directory level
  - `cd ~` : Move to the home directory
  - `cd -` : Move to the previous directory

## 3. pwd
- **Rationale:** Stands for "print working directory".
- **Description:** Displays the full path of the current directory.

## 4. mkdir
- **Rationale:** Short for "make directory".
- **Description:** Creates a new directory.
- **Options:**
  - `-p` : Create parent directories if they do not exist

## 5. rmdir
- **Rationale:** Short for "remove directory".
- **Description:** Deletes empty directories.

## 6. rm
- **Rationale:** Short for "remove".
- **Description:** Deletes files or directories.
- **Options:**
  - `-r` : Remove directories and their contents recursively
  - `-f` : Force deletion without confirmation

## 7. touch
- **Rationale:** Touches a file to update timestamps or create a new file.
- **Description:** Creates an empty file or updates its last modified time.

## 8. cp
- **Rationale:** Short for "copy".
- **Description:** Copies files and directories.
- **Options:**
  - `-r` : Copy directories recursively
  - `-v` : Verbose mode (show progress)

## 9. mv
- **Rationale:** Short for "move".
- **Description:** Moves or renames files and directories.
- **Options:**
  - `-i` : Prompt before overwrite
  - `-v` : Verbose mode

## 10. cat
- **Rationale:** Short for "concatenate".
- **Description:** Displays file contents.
- **Options:**
  - `-n` : Show line numbers
  - `-E` : Show end-of-line markers

## 11. head
- **Rationale:** Displays the head (top) of a file.
- **Description:** Shows the first 10 lines of a file by default.
- **Options:**
  - `-n [num]` : Show the first [num] lines

## 12. tail
- **Rationale:** Displays the tail (bottom) of a file.
- **Description:** Shows the last 10 lines of a file by default.
- **Options:**
  - `-n [num]` : Show the last [num] lines
  - `-f` : Follow file updates in real time

## 13. echo
- **Rationale:** Means "repeat" or "echo" a string.
- **Description:** Prints text to the terminal.
- **Options:**
  - `-e` : Enable interpretation of backslash escapes

## 14. grep
- **Rationale:** Stands for "Global Regular Expression Print".
- **Description:** Searches for a pattern in a file.
- **Options:**
  - `-i` : Case insensitive search
  - `-r` : Recursive search

## 15. find
- **Rationale:** Locates files based on conditions.
- **Description:** Searches for files in directories.
- **Options:**
  - `-name` : Search by name
  - `-type` : Search by type (file, directory)

## 16. chmod
- **Rationale:** Stands for "change mode".
- **Description:** Modifies file permissions.
- **Options:**
  - `+x` : Add execute permission
  - `-w` : Remove write permission

## 17. chown
- **Rationale:** Stands for "change owner".
- **Description:** Changes the owner of a file.
- **Options:**
  - `user:group` : Specify new owner and group

## 18. ps
- **Rationale:** Short for "process status".
- **Description:** Displays running processes.
- **Options:**
  - `-aux` : Show all processes
  - `-ef` : Detailed process list

## 19. top
- **Rationale:** Shows the "top" resource-consuming processes.
- **Description:** Displays real-time system usage statistics.

## 20. kill
- **Rationale:** Terminates processes.
- **Description:** Stops a running process.
- **Options:**
  - `-9` : Force kill
  - `-15` : Graceful termination

## 21. wget
- **Rationale:** Stands for "web get".
- **Description:** Downloads files from the internet.
- **Options:**
  - `-c` : Resume a partial download

## 22. curl
- **Rationale:** Stands for "Client URL".
- **Description:** Transfers data from URLs.
- **Options:**
  - `-o [file]` : Save output to a file
  - `-I` : Fetch headers only

## 23. tar
- **Rationale:** Stands for "tape archive".
- **Description:** Archives files.
- **Options:**
  - `-c` : Create an archive
  - `-x` : Extract an archive

## 24. zip
- **Rationale:** Compresses files.
- **Description:** Creates a zip archive.
- **Options:**
  - `-r` : Recursively compress files

## 25. unzip
- **Rationale:** Extracts zip files.
- **Description:** Extracts files from a zip archive.
- **Options:**
  - `-l` : List contents without extracting

## 26. df
- **Rationale:** Stands for "disk free".
- **Description:** Shows available disk space.
- **Options:**
  - `-h` : Human-readable format

## 27. du
- **Rationale:** Stands for "disk usage".
- **Description:** Displays file and directory size usage.
- **Options:**
  - `-h` : Human-readable format

## 28. uname
- **Rationale:** Stands for "Unix name".
- **Description:** Displays system information.
- **Options:**
  - `-a` : Show all system information

## 29. uptime
- **Rationale:** Shows how long the system has been running.
- **Description:** Displays system uptime.

## 30. history
- **Rationale:** Displays command history.
- **Description:** Lists previously executed commands.
- **Options:**
  - `-c` : Clear history

### 31. `man`  
**Rationale**: Short for "manual".  
**Description**: Displays the manual page for a command.  
**Options**:  
- `-k` : Search for a keyword in manual pages  

### 32. `alias`  
**Rationale**: Creates shortcuts for commands.  
**Description**: Defines or displays command aliases.  
**Options**:  
- `alias [name]='[command]'` : Create a new alias  

### 33. `unalias`  
**Rationale**: Removes command shortcuts.  
**Description**: Deletes a previously defined alias.  
**Options**:  
- `-a` : Remove all aliases  

### 34. `clear`  
**Rationale**: Clears the terminal screen.  
**Description**: Resets the terminal display for better readability.  

### 35. `whoami`  
**Rationale**: Stands for "who am I".  
**Description**: Displays the current logged-in user.  

### 36. `id`  
**Rationale**: Displays user ID information.  
**Description**: Shows user ID (UID), group ID (GID), and other details.  

### 37. `df`  
**Rationale**: Stands for "disk free".  
**Description**: Shows available disk space.  
**Options**:  
- `-h` : Human-readable format  

### 38. `scp`  
**Rationale**: Stands for "secure copy".  
**Description**: Transfers files between systems over SSH.  
**Options**:  
- `-r` : Copy directories recursively  
- `-P [port]` : Specify SSH port  

### 39. `nc`  
**Rationale**: Short for "netcat".  
**Description**: A versatile networking tool for debugging and testing.  
**Options**:  
- `-l` : Listen mode  
- `-z` : Scan for open ports  

### 40. `traceroute`  
**Rationale**: Traces the route packets take to a host.  
**Description**: Displays the path and transit delays of packets.  
**Options**:  
- `-n` : Display numeric IP addresses instead of hostnames  
