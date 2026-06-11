import os
import sys

# Fix working directory for Hugging Face
if os.path.exists("/app/backend"):
    os.chdir("/app/backend")
elif os.path.exists("backend"):
    os.chdir("backend")

# Now import main
from main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
