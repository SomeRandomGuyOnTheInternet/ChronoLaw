import os
import pathlib

def get_file_path(filename):
    """Get the absolute path for a file relative to the current directory"""
    current_dir = pathlib.Path(__file__).parent.absolute()
    return os.path.join(current_dir, filename)

def log_message(message, prefix=""):
    """Log a message with a prefix"""
    if prefix:
        print(f"[LOG] ========{prefix}========")
        print(f"[LOG] {message}")
        print(f"[LOG] ========{prefix}========")
    else:
        print(f"[LOG] {message}")
