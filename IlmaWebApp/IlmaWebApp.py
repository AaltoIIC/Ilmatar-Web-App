import os, json, time
from flask import Flask, render_template, request
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()
currentUser = None
startTime = time.time()

"""Create and configure an instance of the Flask application."""
app = Flask(__name__)
csrf.init_app(app)
# app.run(debug=True)
app.config.from_mapping(
    # A default secret that should be overridden by instance config
    SECRET_KEY="dev",
)

# Index page with available apps found in static/apps
@app.route("/")
def index():
    controlScripts = os.listdir(os.path.join(app.static_folder, "apps/control"))
    monitorScripts = os.listdir(os.path.join(app.static_folder, "apps/monitor"))

    return render_template("index.html", controlScripts=controlScripts, monitorScripts=monitorScripts)

# Control request management
@app.route("/requestcontrol")
def requestControl():
    global currentUser, startTime
    csrf = request.headers.get("X-CSRFToken")
    if csrf:
        if (time.time()-startTime >= 10) or (currentUser == None):
            currentUser = csrf
            startTime = time.time()
            return json.dumps(True)
        elif (currentUser == csrf) and (time.time()-startTime < 10):
            startTime = time.time()
            return json.dumps(True)
    return json.dumps(False)

@app.route("/checkcontrol")
def checkControl():
    global currentUser, startTime
    csrf = request.headers.get("X-CSRFToken")
    if csrf:
        if (csrf == currentUser) and (time.time()-startTime < 10):
            startTime = time.time()
            return json.dumps(True)
    return json.dumps(False)

@app.route("/releasecontrol")
def releaseControl():
    global currentUser
    csrf = request.headers.get("X-CSRFToken")
    if csrf:
        if csrf == currentUser:
            currentUser = None
            return json.dumps(True)
    return json.dumps(False)

@app.route("/resetcontrol")
def resetControl():
    global currentUser
    currentUser = None
    return json.dumps(True)