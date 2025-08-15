#!/usr/bin/env python3
"""
Format backend code using black and isort
"""
import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Run a command and print the result"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            if result.stdout:
                print(result.stdout)
        else:
            print(f"❌ {description} failed")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error running {description}: {e}")
        return False
    return True

def main():
    """Main formatting function"""
    print("🚀 Starting backend code formatting...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    print(f"📁 Working directory: {backend_dir}")
    
    commands = [
        ("isort app/", "Sorting imports with isort"),
        ("black app/", "Formatting code with black"),
        ("flake8 app/", "Checking code style with flake8"),
    ]
    
    success = True
    for cmd, desc in commands:
        if not run_command(cmd, desc):
            success = False
    
    if success:
        print("\n🎉 All formatting completed successfully!")
    else:
        print("\n⚠️  Some formatting steps failed. Please check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
