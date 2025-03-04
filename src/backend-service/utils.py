import os
import pathlib

def get_file_path(filename):
    """Get the absolute path for a file relative to the current directory"""
    current_dir = pathlib.Path(__file__).parent.absolute()
    return os.path.join(current_dir, filename)

def log_message(message):
    """Log a message with a prefix"""
    print(f"[LOG] {message}")
