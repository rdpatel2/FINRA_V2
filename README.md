## SETUP (Run all code blocks in terminal)

### Creating Venv
~~~~~~~~~~~~~~~~~
python -m venv venv
~~~~~~~~~~~~~~~~~

### Installing Dependencies
~~~~~~~~~~~~~~~~~
pip install -r requirements.txt
~~~~~~~~~~~~~~~~~

### Running backend
~~~~~~~~~~~~~~~~~
fastapi run api.py
~~~~~~~~~~~~~~~~~


## DOC
Every weekday main workflow will run @6:30pm est. This will update our database with the new finra short data for the day. No need to do anything from user end, just run application (back and front) new data will be populated automatically.
